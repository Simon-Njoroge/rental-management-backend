// src/routes/property-image.routes.ts
import { Router } from "express";
import {
  createPropertyImage,
  getPropertyImageById,
  getPropertyImagesByProperty,
  updatePropertyImage,
  deletePropertyImage,
} from "../controllers/property-image.controller";

const router = Router();

// POST /api/property-images
router.post("/", createPropertyImage);

// GET /api/property-images/:id
router.get("/:id", getPropertyImageById);

// GET /api/property-images/property/:propertyId
router.get("/property/:propertyId", getPropertyImagesByProperty);

// PUT /api/property-images/:id
router.put("/:id", updatePropertyImage);

// DELETE /api/property-images/:id
router.delete("/:id", deletePropertyImage);

export default router;
