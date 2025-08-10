import express from "express";


import {
    getTranslationFromGoogle,
    getSupportedLanguages,
    detectLanguage
} from "../controllers/translation.controller.js";
// import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();


router.get("/google", getTranslationFromGoogle);
router.get("/languages", getSupportedLanguages);
router.post("/detect", detectLanguage);
// router.post("/", verifyToken, createVideoData);
// router.delete("/:id", verifyToken, deleteVideoData);
// router.get("/single/:id", getVideoData);
// router.get("/", getVideoDatas);

export default router;
