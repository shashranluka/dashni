import { pool } from "../server.js";
import { toPublicUser } from "../middleware/auth.middleware.js";

// აბრუნებს ყველა მომხმარებელს id-ის ზრდადობით.
// ჯერ კითხულობს ბაზიდან სრულ ჩანაწერებს, შემდეგ თითოეულს ატარებს toPublicUser-ზე,
// რათა მგრძნობიარე ველები (მაგ. password) პასუხში არ მოხვდეს.
export const getUsers = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
    return res.status(200).json(result.rows.map(toPublicUser));
  } catch (err) {
    return next(err);
  }
};

// ცვლის კონკრეტული მომხმარებლის ადმინისტრაციულ უფლებებს.
// endpoint იღებს user id-ს params-დან და body-დან is_active და/ან role-ს.
// update კეთდება დინამიურად მხოლოდ იმ ველებზე, რომლებიც რეალურად გადმოიცა,
// self-modification იბლოკება, ბოლოს ბრუნდება განახლებული მომხმარებლის safe ვერსია.
export const updateUserPermissions = async (req, res, next) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    // ვამოწმებთ, რომ id იყოს ვალიდური დადებითი მთელი რიცხვი.
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    // ადმინს საკუთარ თავზე უფლების შეცვლა არ შეუძლია.
    if (req.user?.id === userId) {
      return res.status(403).json({ message: "Cannot modify own permissions" });
    }

    const { is_active, role } = req.body;
    // მოთხოვნა უნდა შეიცავდეს მინიმუმ ერთ მართვად ველს.
    if (is_active === undefined && role === undefined) {
      return res.status(400).json({ message: "Provide is_active or role" });
    }
    // role მხოლოდ დაშვებულ მნიშვნელობებს უნდა შეიცავდეს.
    const ALLOWED_ROLES = ["user", "editor", "admin"];
    if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Allowed: user, editor, admin" });
    }

    const fields = [];
    const values = [];

    if (typeof is_active === "boolean") {
      values.push(is_active);
      fields.push(`is_active = $${values.length}`);
    }
    if (role !== undefined) {
      values.push(role);
      fields.push(`role = $${values.length}`);
    }
    // უფლებების ცვლილებასთან ერთად ვინახავთ update დროსაც.
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(toPublicUser(result.rows[0]));
  } catch (err) {
    return next(err);
  }
};
