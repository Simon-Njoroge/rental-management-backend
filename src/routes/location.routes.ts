// src/routes/location.routes.ts
import { Router } from "express";
import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} from "../controllers/location.controller";

// import { authenticate } from "../middlewares/auth.middleware"; // Optional

const router = Router();

router.get("/", getAllLocations);
router.get("/:id", getLocationById);

// Protected routes
router.post("/", createLocation);
router.put("/:id", updateLocation);
router.delete("/:id", deleteLocation);

export default router;
