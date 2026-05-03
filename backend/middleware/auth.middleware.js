import jwt from "jsonwebtoken";
import { pool } from "../server.js";

// ბრუნებს მომხმარებლის როლს DB role სვეტიდან, fallback — "user".
export const resolveUserRole = (user = {}) => user.role || "user";

// გარდაქმნის DB მომხმარებელს საჯარო ფორმატად.
// შლის password ველს; role უკვე DB-დან მოდის, ცალკე გამოთვლა არ სჭირდება.
export const toPublicUser = (dbUser = {}) => {
  const { password, ...safe } = dbUser;
  return safe;
};

// ამოწმებს ავტორიზაციას accessToken cookie-დან.
// ტოკენის ვალიდაციის შემდეგ პოულობს მომხმარებელს ბაზაში, აყენებს req.user-ს
// და უშვებს მოთხოვნას შემდეგ middleware/controller-ზე.
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    // ტოკენის გარეშე რესურსი დაუშვებელია.
    if (!token) return res.status(401).json({ message: "ავტორიზაცია აუცილებელია" });

    const payload = jwt.verify(token, process.env.JWT_KEY);

    // ვცდილობთ მომხმარებლის იდენტიფიკაციას payload-ის სხვადასხვა ველით
    // (userId / uuid / username), რომ ძველი და ახალი ტოკენები ორივე იმუშაოს.
    let result;
    if (payload.userId) {
      result = await pool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [payload.userId]);
    } else if (payload.uuid) {
      result = await pool.query("SELECT * FROM users WHERE uuid = $1 LIMIT 1", [payload.uuid]);
    } else if (payload.username) {
      result = await pool.query("SELECT * FROM users WHERE username = $1 LIMIT 1", [payload.username]);
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!result || result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!result.rows[0].is_active) {
      return res.status(403).json({ message: "მომხმარებელი არააქტიურია" });
    }

    // req.user-ში ვინახავთ უკვე უსაფრთხო (password-free) ვერსიას.
    req.user = toPublicUser(result.rows[0]);
    return next();
  } catch (err) {
    // აქ მოექცევა არავალიდური/ვადაგასული JWT და სხვა ავტორიზაციის შეცდომები.
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// უშვებს მხოლოდ admin როლის მქონე ავტორიზებულ მომხმარებელს.
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  return next();
};

// უშვებს editor ან admin როლის მქონე ავტორიზებულ მომხმარებელს.
export const requireEditor = (req, res, next) => {
  const role = req.user?.role;
  if (role !== "editor" && role !== "admin") {
    return res.status(403).json({ message: "Editor only" });
  }
  return next();
};
