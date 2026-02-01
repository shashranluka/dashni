import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../server.js";

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

    // Hash password
    const hash = bcrypt.hashSync(password, 5);

    // Insert new user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hash]
    );

    res.status(201).json({
      message: "რეგისტრაცია წარმატებით დასრულდა!",
      user: newUser.rows[0]
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

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
    }

    const foundUser = user.rows[0];

    // Check password
    const isCorrect = bcrypt.compareSync(password, foundUser.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "პაროლი არასწორია" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: foundUser.id,
        username: foundUser.username
      },
      process.env.JWT_KEY
    );

    const { password: userPassword, ...info } = foundUser;

    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .json(info);
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json({ message: "გასვლა წარმატებით შესრულდა" });
};
