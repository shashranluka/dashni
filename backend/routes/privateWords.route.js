import express from "express";
import { upsertPrivateWord } from "../controllers/privateWords.controller.js";
import { requireAuth, requirePrivateContributor } from "../middleware/auth.middleware.js";

const router = express.Router();

// private სიტყვის დამატება/განახლება (private_contributor ან admin)
router.post("/", requireAuth, requirePrivateContributor, upsertPrivateWord);

export default router;
