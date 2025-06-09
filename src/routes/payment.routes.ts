import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";

const router = Router();

// Initiate MPESA payment
router.post("/mpesa/initiate", PaymentController.initiateMpesa);

// Handle MPESA callback
router.post("/mpesa/callback", PaymentController.mpesaCallback);

export default router;
