import express from "express";
import { bulkInsertLexicons, searchLexicons } from "../controllers/lexicons.controller.js";
import { requireAuth, requireEditor } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/bulk", requireAuth, requireEditor, bulkInsertLexicons);
router.get("/search", requireAuth, requireEditor, searchLexicons);

export default router;
