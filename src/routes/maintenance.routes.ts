import { Router } from "express";
import { createMaintenanceRequest, getAllMaintenanceRequests, getMaintenanceRequestById, updateMaintenanceRequest, deleteMaintenanceRequest } from "../controllers/maintenance.controller";

const router = Router();

router.post("/", createMaintenanceRequest);
router.get("/", getAllMaintenanceRequests);
router.get("/:id", getMaintenanceRequestById);
router.put("/:id", updateMaintenanceRequest);
router.delete("/:id", deleteMaintenanceRequest);

export default router;
