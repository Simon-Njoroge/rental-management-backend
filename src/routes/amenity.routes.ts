// src/routes/amenity.routes.ts
import { Router } from "express";
import {
  createAmenity,
  getAllAmenities,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
} from "../controllers/amenity.controller";

// import { authenticate } from "../middlewares/auth.middleware"; // optional auth

const router = Router();

router.get("/", getAllAmenities);
router.get("/:id", getAmenityById);

// Protected routes
router.post("/", createAmenity);
router.put("/:id", updateAmenity);
router.delete("/:id", deleteAmenity);

export default router;
