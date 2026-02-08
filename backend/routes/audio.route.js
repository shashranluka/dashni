import express from "express";
import { getAudioData } from "../controllers/audio.controller.js";

const router = express.Router();

router.get("/", getAudioData);

export default router;