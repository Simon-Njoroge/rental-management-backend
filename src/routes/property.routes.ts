// src/routes/property.routes.ts
import { Router } from "express";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "../controllers/propery.controller";
// import { authenticate } from "../middlewares/auth.middleware"; 

const router = Router();

router.get("/", getAllProperties);
router.get("/:id", getPropertyById);
router.post("/", createProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

export default router;
