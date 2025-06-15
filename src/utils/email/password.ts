import { EmailService } from "../email/email.service"; 
import { ConfigService } from "../../config/service"; 
import handlebars from "handlebars";
const configService = new ConfigService();
const emailService = new EmailService(configService);

export async function sendAccountCreationEmail(
  email: string,
  password: string,
): Promise<void> {
  try {
    await emailService.sendAccountCreationEmail(email, password);
  } catch (err) {
    console.error(`Failed to send account creation email to ${email}:`, err);
  }
}
