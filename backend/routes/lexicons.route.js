import express from "express";
import { bulkInsertLexicons, searchLexicons } from "../controllers/lexicons.controller.js";
import { requireAuth, requireEditor, requireAdmin, checkAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/bulk", requireAuth, requireEditor, requireAdmin, bulkInsertLexicons);
router.get("/search", checkAuth, searchLexicons);

export default router;
