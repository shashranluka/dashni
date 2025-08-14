import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { 
  createWord, 
  getWords, 
  translateWords, 
  saveTranslations 
} from "../controllers/word.controller.js";

const router = express.Router();

// ✅ არსებული routes
router.post("/", verifyToken, createWord);
router.get("/", getWords);

// ✅ ახალი routes
router.get("/translate", translateWords);
router.post("/save-translations", verifyToken, saveTranslations);

export default router;
