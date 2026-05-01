import express from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { getUsers, updateUserPermissions } from "../controllers/users.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.get("/users", requireAuth, requireAdmin, getUsers);
router.patch("/users/:id/permissions", requireAuth, requireAdmin, updateUserPermissions);

export default router;
