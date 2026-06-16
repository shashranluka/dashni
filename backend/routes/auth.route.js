import express from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { getUsers, updateUserPermissions } from "../controllers/users.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import rateLimit from 'express-rate-limit';
import { logSecurity } from "../services/securityLog.service.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 წუთი
  max: 5, // მაქს 5 მცდელობა
  handler: async (req, res) => {
    await logSecurity('rate_limited', 'high', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { email: req.body?.email }
    });
    res.status(429).json({ message: 'ძალიან ბევრი მცდელობა, სცადე 15 წუთში' });
  }
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.get("/users", requireAuth, requireAdmin, getUsers);
router.patch("/users/:id/permissions", requireAuth, requireAdmin, updateUserPermissions);

export default router;
