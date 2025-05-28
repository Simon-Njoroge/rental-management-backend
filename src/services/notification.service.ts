import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "../entities/notification.entity";
import { User } from "../entities/user.entity";
import { EmailService } from "../utils/email/email.service";
import { SmsService } from "../utils/sms/sms.service";
import { UserService } from "./user.service";
import { NotificationType } from "../entities/notification.entity";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private emailService: EmailService,
    private smsService: SmsService,
    private userService: UserService,
  ) {}

  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
  ): Promise<Notification> {
    try {
      // Create notification entity
      const notification = this.notificationRepository.create({
        user: { id: userId },
        title,
        message,
        type,
      });

      // Save notification in DB
      const savedNotification =
        await this.notificationRepository.save(notification);

      // Fetch user to get email and phone number
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Send email if available
      if (user.email) {
        try {
          await this.emailService.sendEmail(user.email, title, message);
        } catch (emailError) {
          // Log error but don't fail the whole flow
          this.handleError(emailError, "sendEmail");
        }
      }

      // Send SMS if available
      if (user.phoneNumber) {
        try {
          await this.smsService.sendSms(
            user.phoneNumber,
            `${title}: ${message}`,
          );
        } catch (smsError) {
          // Log error but don't fail the whole flow
          this.handleError(smsError, "sendSMS");
        }
      }

      return savedNotification;
    } catch (error) {
      this.handleError(error, "sendNotification");
    }
  }

  private handleError(error: any, context: string): never {
    console.error(
      `Error in ${context}:`,
      error.stack || error.message || error,
    );
    throw new InternalServerErrorException(`Failed in ${context}`);
  }
}
