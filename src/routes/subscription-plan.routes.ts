import { Router } from "express";
import {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../controllers/subscription-plan.controller";

const router = Router();

router.post("/", createSubscriptionPlan);
router.get("/", getAllSubscriptionPlans);
router.get("/:id", getSubscriptionPlanById);
router.put("/:id", updateSubscriptionPlan);
router.delete("/:id", deleteSubscriptionPlan);

export default router;
