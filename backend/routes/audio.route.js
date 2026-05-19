import express from "express";
import {
	getAudioData,
	updateAudioSegmentText,
	updateWordEntry,
} from "../controllers/audio.controller.js";
import { requireAuth, requireEditor } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAudioData);
router.put("/segments/:id", requireAuth, requireEditor, updateAudioSegmentText);
router.put("/words/:id", requireAuth, requireEditor, updateWordEntry);

export default router;