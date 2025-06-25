import express from "express";
import {
  createText,
  // deleteText,
  // getText,
  getTexts,
  // updateText
} from "../controllers/text.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createText);
// router.delete("/:id", verifyToken, deleteText);
// router.get("/single/:id", getText);
router.get("/", getTexts);
// router.put("/single/:id", updateText);

export default router;
