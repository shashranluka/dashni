import express from "express";
import { saveWordStatus, getWordStatus } from "../controllers/results.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST: შენახავს მომხმარებლის ნასწავლი/სასწავლი სიტყვებს
router.post("/word-status", requireAuth, saveWordStatus);

// GET: იღებს მომხმარებლის ნასწავლი/სასწავლი სიტყვებს
router.get("/word-status", requireAuth, getWordStatus);

export default router;
