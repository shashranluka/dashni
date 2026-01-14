import express from "express";
import {
  createAudioData,
  deleteAudioData,
  getAudioData,
  getAudioDatas
} from "../controllers/audioData.controller.js";
import { verifyToken } from "../middleware/jwt.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", verifyToken, upload.single("audio"), createAudioData);
router.delete("/:id", verifyToken, deleteAudioData);
router.get("/single/:id", getAudioData);
router.get("/", getAudioDatas);

export default router;