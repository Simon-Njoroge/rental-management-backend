// src/utils/sms/sms.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '../../config/service';

@Injectable()
export class SmsService {
  private logger = new Logger('SmsService');
  private apiUrl = 'https://api.safaricom.co.ke';

  constructor(private configService: ConfigService) {}

  private async getAuthToken(): Promise<string> {
    try {
      const consumerKey = this.configService.get('MPESA_CONSUMER_KEY');
      const consumerSecret = this.configService.get('MPESA_CONSUMER_SECRET');
      
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.apiUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      return response.data.access_token;
    } catch (error:any) {
      this.logger.error('Failed to get SMS auth token', error.stack);
      throw new Error('SMS authentication failed');
    }
  }

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Validate phone number format
      if (!phoneNumber.startsWith('+254')) {
        throw new Error('Invalid Kenyan phone number format');
      }

      const token = await this.getAuthToken();
      const shortCode = this.configService.get('MPESA_SHORTCODE');
      const callbackUrl = this.configService.get('SMS_CALLBACK_URL');

      const response = await axios.post(
        `${this.apiUrl}/safaricom/sendsms`,
        {
          sender: shortCode,
          message,
          recipients: [phoneNumber],
          callback_url: callbackUrl,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      this.logger.log(`SMS sent to ${phoneNumber}: ${response.data.messageId}`);
      return true;
    } catch (error:any) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}`, error.stack);
      throw new Error(`SMS sending failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Common SMS templates
  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    const message = `Your verification code is ${code}. It expires in 10 minutes.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendPaymentConfirmation(phoneNumber: string, amount: number, balance: number): Promise<void> {
    const message = `Payment of KES ${amount} received. New balance: KES ${balance}. Thank you!`;
    await this.sendSms(phoneNumber, message);
  }

  async sendMaintenanceUpdate(phoneNumber: string, propertyTitle: string, status: string): Promise<void> {
    const message = `Maintenance update for ${propertyTitle}: Status changed to ${status}`;
    await this.sendSms(phoneNumber, message);
  }
}