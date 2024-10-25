import express from "express";
import { deleteUser, getUser, getUsers, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.delete("/:id", verifyToken, deleteUser);
router.get("/:id", getUser);
router.get("/", getUser);
router.put("/single/:id", updateUser);

export default router;
