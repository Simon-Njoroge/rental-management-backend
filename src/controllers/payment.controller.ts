import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";
import { CreatePaymentDto } from "../dtos/payment/CreatePaymentDtos";
import { validateOrReject } from "class-validator";

const paymentService = new PaymentService();

export class PaymentController {
  static async initiateMpesa(req: Request, res: Response): Promise<any> {
    try {
      const dto = Object.assign(new CreatePaymentDto(), req.body);
      await validateOrReject(dto);

      const { phone, email } = req.body;

      const payment = await paymentService.initiateMpesaPayment(dto, phone, email);
      return res.status(201).json({ success: true, message: "MPESA STK push sent", data: payment });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Invalid request." });
    }
  }

  static async mpesaCallback(req: Request, res: Response): Promise<any> {
    try {
      await paymentService.handleMpesaCallback(req.body);
      return res.status(200).json({ success: true, message: "Callback processed" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Callback error" });
    }
  }
}
