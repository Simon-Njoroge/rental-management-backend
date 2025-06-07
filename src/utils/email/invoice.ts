import { EmailService } from "../email/email.service"; 
import { ConfigService } from "../../config/service"; 
import { Invoice } from "../../entities/invoice.entity";
import { Booking } from "../../entities/booking.entity";

const configService = new ConfigService();
const emailService = new EmailService(configService);

export async function sendInvoiceEmail(
  email: string,
  invoice: Invoice,
  booking: Booking,
): Promise<void> {
  try {
    await emailService.sendInvoiceWithAttachment(email, invoice, booking);
  } catch (err) {
    console.error(`Failed to send invoice email to ${email}:`, err);
  }
}
