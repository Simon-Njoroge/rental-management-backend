import { EmailService } from "../email/email.service"; 
import { ConfigService } from "../../config/service"; 
import { User } from "../../entities/user.entity";
import { Session } from "../../entities/session.entity";

const configService = new ConfigService();
const emailService = new EmailService(configService);

export async function sendNewSigninEmail(
  email: string,
  user: User,
  session: Session,
): Promise<void> {
  try {
    await emailService.sendNewSigninNotification(email,user, session);
  } catch (err) {
    console.error(`Failed to send new sign-in email to ${user.email}:`, err);
  }
}