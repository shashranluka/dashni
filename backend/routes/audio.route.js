import express from "express";
import {
	getAudioData,
	updateAudioSegmentText,
	updateWordEntry,
} from "../controllers/audio.controller.js";
import { checkAuth, requireAuth, requireEditor } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", checkAuth, getAudioData);
router.put("/segments/:id", requireAuth, requireEditor, updateAudioSegmentText);
router.put("/words/:id", requireAuth, requireEditor, updateWordEntry);

export default router;