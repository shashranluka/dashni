import express from "express";
import { listPrivateWords, upsertPrivateWord } from "../controllers/privateWords.controller.js";
import { requireAuth, requirePrivateContributor } from "../middleware/auth.middleware.js";

const router = express.Router();

// private სიტყვების სია (მიმდინარე მომხმარებლის)
router.get("/", requireAuth, requirePrivateContributor, listPrivateWords);

// private სიტყვის დამატება/განახლება (private_contributor ან admin)
router.post("/", requireAuth, requirePrivateContributor, upsertPrivateWord);

export default router;
