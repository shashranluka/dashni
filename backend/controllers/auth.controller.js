import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../server.js";
import { toPublicUser } from "../middleware/auth.middleware.js";

// bcrypt-ის cost. ყოველი ერთეული აორმაგებს გამოთვლის დროს, ანუ 12 ნიშნავს
// 5-თან შედარებით 128-ჯერ მეტ სამუშაოს პაროლის გამოცნობის მცდელობაზე.
const BCRYPT_COST = 12;

// არარსებულ მომხმარებელზეც რომ იმდენივე დრო დაიხარჯოს, რამდენიც არსებულზე.
// ამის გარეშე პასუხის სიჩქარე ამჟღავნებს, დარეგისტრირებულია თუ არა email.
const TIMING_DUMMY_HASH = bcrypt.hashSync("timing-equalizer", BCRYPT_COST);

// ერთი და იგივე შეტყობინება ორივე შემთხვევისთვის.
const INVALID_CREDENTIALS_MESSAGE = "ელ-ფოსტა ან პაროლი არასწორია";

// წარმატებული შესვლისას ძველი, სუსტი cost-ით შენახული hash ჩუმად ნახლდება —
// პაროლი ზუსტად ამ მომენტშია ხელში. მომხმარებელი ვერაფერს ამჩნევს.
const upgradeHashIfWeak = async (user, plainPassword) => {
  try {
    if (bcrypt.getRounds(user.password) >= BCRYPT_COST) return;

    const strongerHash = await bcrypt.hash(plainPassword, BCRYPT_COST);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [strongerHash, user.id]);
  } catch (err) {
    // წარუმატებელმა განახლებამ შესვლა არ უნდა ჩაშალოს.
    console.error('Password rehash error:', err);
  }
};

const logAuth = async (event_type, { user_id = null, email = null, reason = null, userAgent = null }) => {
  try {
    await pool.query(
      'INSERT INTO auth_log (user_id, email, event_type, reason, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [user_id, email, event_type, reason, userAgent]
    );
  } catch (err) {
    console.error('Auth log error:', err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "ყველა ველი სავალდებულოა" });
    }

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "მომხმარებელი უკვე არსებობს" });
    }

    // Hash password. async ვერსია აუცილებელია — hashSync cost 12-ზე ~300ms-ით
    // ბლოკავს Node-ის ერთადერთ ძაფს და ამ დროს სერვერი სხვას ვერავის პასუხობს.
    const hash = await bcrypt.hash(password, BCRYPT_COST);

    // Insert new user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, uuid, username, email, created_at',
      [username, email, hash]
    );

    const { uuid, username: newUsername, email: newEmail, created_at } = newUser.rows[0];
    await logAuth('register', { user_id: newUser.rows[0].id, email, userAgent: req.headers['user-agent'] });
    res.status(201).json({
      message: "რეგისტრაცია წარმატებით დასრულდა!",
      user: { uuid, username: newUsername, email: newEmail, created_at }
    });
  } catch (err) {
    console.error('Registration error:', err);
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // არარსებულ მომხმარებელზე და არასწორ პაროლზე პასუხი იდენტური უნდა იყოს —
    // როგორც ტექსტი, ისე სტატუსი და დახარჯული დრო. წინააღმდეგ შემთხვევაში
    // პაროლის ცოდნის გარეშე შეიძლება გაირკვეს, ვინ არის დარეგისტრირებული.
    if (user.rows.length === 0) {
      await bcrypt.compare(password ?? "", TIMING_DUMMY_HASH);
      await logAuth('login_failed', { email, reason: 'user_not_found', userAgent: req.headers['user-agent'] });
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    const foundUser = user.rows[0];

    // Check password
    const isCorrect = await bcrypt.compare(password ?? "", foundUser.password);
    if (!isCorrect) {
      await logAuth('login_failed', { user_id: foundUser.id, email, reason: 'invalid_password', userAgent: req.headers['user-agent'] });
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    if (!foundUser.is_active) {
      await logAuth('login_failed', { user_id: foundUser.id, email, reason: 'user_inactive', userAgent: req.headers['user-agent'] });
      return res.status(403).json({ message: "მომხმარებელი არააქტიურია" });
    }

    // Generate JWT token (uuid-only) with expiration
    const token = jwt.sign(
      {
        uuid: foundUser.uuid
      },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    await upgradeHashIfWeak(foundUser, password);

    await logAuth('login_success', { user_id: foundUser.id, email: foundUser.email, userAgent: req.headers['user-agent'] });
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      })
      .status(200)
      .json(toPublicUser(foundUser));
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
};

export const me = (req, res) => res.status(200).json(req.user);

export const logout = async (req, res) => {
  await logAuth('logout', { userAgent: req.headers['user-agent'] });
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    })
    .status(200)
    .json({ message: "გასვლა წარმატებით შესრულდა" });
};
