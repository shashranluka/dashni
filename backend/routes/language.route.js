import express from "express";
import { 
  getLanguagesBasic, 
  getLanguageDetails,
  addLanguage,
  updateLanguage,
  deleteLanguage,
  getAllLanguagesAdmin
} from "../controllers/language.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// საჯარო როუტები
router.get("/basic", getLanguagesBasic);
router.get("/:code/details", getLanguageDetails);

// დაცული როუტები (მხოლოდ ადმინისტრატორისთვის)
router.get("/admin/all", verifyToken, getAllLanguagesAdmin);
router.post("/", verifyToken, addLanguage);
router.put("/:code", verifyToken, updateLanguage);
router.delete("/:code", verifyToken, deleteLanguage);

export default router;