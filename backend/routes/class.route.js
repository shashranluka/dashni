import express from "express";
import {
  createLearningClass,
  deleteLearningClass,
  getLearningClass,
  getLearningClasses,
  updateLearningClass
} from "../controllers/learningClass.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createLearningClass);
router.delete("/:id", verifyToken, deleteLearningClass);
router.get("/single/:id", getLearningClass);
router.get("/", getLearningClasses);
router.put("/single/:id", updateLearningClass);

export default router;
