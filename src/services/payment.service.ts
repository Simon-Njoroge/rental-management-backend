// Import remains the same
import { Repository } from "typeorm";
import { Booking, BookingStatus } from "../entities/booking.entity";
import { Invoice, InvoiceStatus } from "../entities/invoice.entity";
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "../entities/payment.entity";
import { AppDataSource } from "../config/data-source";
import { Logger } from "../utils/logger";
import { CreatePaymentDto } from "../dtos/payment/CreatePaymentDtos";
import { PaymentResponseDto } from "../dtos/payment/payment-response.dto";
import { MpesaClient } from "../utils/payment/mpesa-client";
import { sendInvoiceEmail } from "../utils/email/invoice";

export class PaymentService {
  private bookingRepo: Repository<Booking>;
  private invoiceRepo: Repository<Invoice>;
  private paymentRepo: Repository<Payment>;

  constructor() {
    this.bookingRepo = AppDataSource.getRepository(Booking);
    this.invoiceRepo = AppDataSource.getRepository(Invoice);
    this.paymentRepo = AppDataSource.getRepository(Payment);
  }

 async initiateMpesaPayment(
  dto: CreatePaymentDto,
  userPhone: string,
  userEmail: string
): Promise<PaymentResponseDto> {
  try {
    if (dto.amount <= 0) throw new Error("Invalid payment amount.");

    const booking = await this.bookingRepo.findOne({
      where: { id: dto.bookingId },
    });
    const invoice = await this.invoiceRepo.findOne({
      where: { booking: { id: dto.bookingId } },
    });

    if (!booking) throw new Error("Booking not found.");
    if (!invoice) throw new Error("No invoice found for this booking.");

    const reference = `MPESA-${booking.id}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // This handles STK push + status query
    const mpesaResponse = await MpesaClient.stkPush(
      userPhone,
      dto.amount,
      reference
    );

    const query = mpesaResponse.queryResult;
    const checkoutId = mpesaResponse.CheckoutRequestID;

    const payment = this.paymentRepo.create({
      amount: dto.amount,
      transactionDate: new Date(),
      reference: checkoutId,
      method: PaymentMethod.MPESA,
      status: PaymentStatus.PENDING, // will be updated by callback
      paymentDetails: JSON.stringify(query),
      booking,
      invoice,
    });

    const savedPayment = await this.paymentRepo.save(payment);

    return this.buildPaymentResponse(savedPayment);
  } catch (err: any) {
    Logger.error("MPESA payment initiation failed", err);
    throw new Error(err.message || "MPESA payment initiation failed.");
  }
}


  async handleMpesaCallback(callbackData: any): Promise<void> {
    try {
      const stkCallback = callbackData.Body?.stkCallback;
      const checkoutRequestId = stkCallback?.CheckoutRequestID;
      const resultCode = stkCallback?.ResultCode;
      const resultDesc = stkCallback?.ResultDesc;

      if (!checkoutRequestId) return;

      const payment = await this.paymentRepo.findOne({
        where: { reference: checkoutRequestId },
        relations: ["booking", "invoice"],
      });

      if (!payment) {
        Logger.error("MPESA Callback: Payment not found", checkoutRequestId);
        return;
      }

      payment.paymentDetails = JSON.stringify(stkCallback);

      if (resultCode === 0) {
        payment.status = PaymentStatus.COMPLETED;
        payment.transactionDate = new Date();

        if (payment.invoice) {
          payment.invoice.status = InvoiceStatus.PAID;
          await this.invoiceRepo.save(payment.invoice);
        }

        if (payment.booking) {
          payment.booking.status = BookingStatus.CONFIRMED;
          await this.bookingRepo.save(payment.booking);
        }

        try {
          await sendInvoiceEmail(
            payment.booking.user?.email || "",
            payment.invoice,
            payment.booking
          );
        } catch (emailErr) {
          Logger.warn("Payment succeeded but invoice email failed", emailErr);
        }
      } else {
        payment.status = PaymentStatus.FAILED;
        Logger.warn(`MPESA Payment failed: [${resultCode}] ${resultDesc}`);
      }

      await this.paymentRepo.save(payment);
    } catch (err: any) {
      Logger.error("Failed to handle MPESA callback", err);
    }
  }

  private buildPaymentResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      amount: payment.amount,
      transactionDate: payment.transactionDate,
      reference: payment.reference,
      method: payment.method,
      status: payment.status,
      paymentDetails: payment.paymentDetails,
      bookingId: payment.booking.id,
      invoiceId: payment.invoice.id,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  /**
   * Helper method to map MPESA ResultCode to readable error messages
   */
  private getMpesaErrorMessage(
    resultCode: string | number,
    resultDesc: string
  ): string {
    switch (String(resultCode)) {
      case "1":
        return "The request was cancelled by the user.";
      case "1032":
        return "Request cancelled by user.";
      case "1037":
        return "Timeout in completing transaction.";
      case "2001":
        return "Insufficient funds in your M-PESA account.";
      case "4002":
        return "Invalid phone number provided.";
      default:
        return resultDesc || "MPESA transaction failed.";
    }
  }
}
