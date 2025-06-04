import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
// import { authenticate } from "../middlewares/auth.middleware"; // add if you want protected routes

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protect creation/update/deletion routes if needed
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
