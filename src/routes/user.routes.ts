// routes/user.routes.ts
import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  completeProfile,
  getLoggedInProfile,
} from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Public route
router.post("/", createUser);

// Protected routes
router.get("/", authenticateJWT, getAllUsers);
router.get("/me/profile", authenticateJWT, getLoggedInProfile);
router.get("/:id", authenticateJWT, getUserById);
router.patch("/:id", authenticateJWT, updateUser);
router.delete("/:id", authenticateJWT, deleteUser);
router.patch("/complete-profile/:id", authenticateJWT, completeProfile);

export default router;
