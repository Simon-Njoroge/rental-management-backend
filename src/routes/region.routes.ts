// src/routes/region.routes.ts
import { Router } from "express";
import {
  createRegion,
  getAllRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
} from "../controllers/region.controller";

// import { authenticate } from "../middlewares/auth.middleware"; // optional auth middleware

const router = Router();

router.get("/", getAllRegions);
router.get("/:id", getRegionById);

router.post("/", createRegion);
router.put("/:id", updateRegion);
router.delete("/:id", deleteRegion);

export default router;
