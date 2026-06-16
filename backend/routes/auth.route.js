import express from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { getUsers, updateUserPermissions } from "../controllers/users.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 წუთი
  max: 10, // მაქს 10 მცდელობა
  message: { message: 'ძალიან ბევრი მცდელობა, სცადე 15 წუთში' }
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.get("/users", requireAuth, requireAdmin, getUsers);
router.patch("/users/:id/permissions", requireAuth, requireAdmin, updateUserPermissions);

export default router;
