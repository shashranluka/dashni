import express from "express";
import { bulkInsertLexicons, searchLexicons, updateLexiconShowToUsers } from "../controllers/lexicons.controller.js";
import { requireAuth, requireEditor, requireAdmin, checkAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/bulk", requireAuth, requireEditor, requireAdmin, bulkInsertLexicons);
router.get("/search", checkAuth, searchLexicons);

// PATCH /lexicons/:id — მხოლოდ admin-ს შეუძლია შეცვალოს show_to_users
router.patch(
	"/:id",
	requireAuth,
	requireAdmin,
	updateLexiconShowToUsers
);

export default router;
