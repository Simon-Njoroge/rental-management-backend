import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    // Load environment variables from .env file located at the project root
    const envFilePath = path.resolve(process.cwd(), '.env');
    const result = dotenv.config({ path: envFilePath });

    if (result.error) {
      throw result.error;
    }

    this.envConfig = result.parsed || {};
  }

  get(key: string): string | undefined {
    // First check if it's set in process.env, else fallback to .env config
    return process.env[key] || this.envConfig[key];
  }

  // Optional: Typed getters for frequently used configs

  getEmailHost(): string {
    return this.get('EMAIL_HOST') || 'localhost';
  }

  getEmailPort(): number {
    return Number(this.get('EMAIL_PORT') || 587);
  }

  getEmailUser(): string {
    return this.get('EMAIL_USER') || '';
  }

  getEmailPassword(): string {
    return this.get('EMAIL_PASSWORD') || '';
  }

  getMpesaConsumerKey(): string {
    return this.get('MPESA_CONSUMER_KEY') || '';
  }

  getMpesaConsumerSecret(): string {
    return this.get('MPESA_CONSUMER_SECRET') || '';
  }

  getMpesaShortcode(): string {
    return this.get('MPESA_SHORTCODE') || '';
  }

  getSmsCallbackUrl(): string {
    return this.get('SMS_CALLBACK_URL') || '';
  }

  getAppUrl(): string {
    return this.get('APP_URL') || 'http://localhost:3000';
  }

  // Add more getters as needed
}
