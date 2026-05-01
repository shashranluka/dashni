import express from "express";
import { getAudioData, updateAudioSegmentText } from "../controllers/audio.controller.js";
import { requireAuth, requireEditor } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAudioData);
router.put("/segments/:id", requireAuth, requireEditor, updateAudioSegmentText);

export default router;