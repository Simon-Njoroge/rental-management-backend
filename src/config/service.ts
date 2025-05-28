// src/services/configService.ts
import * as dotenv from "dotenv";
import * as path from "path";

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    const envFilePath = path.resolve(process.cwd(), ".env");
    const result = dotenv.config({ path: envFilePath });

    if (result.error) {
      throw result.error;
    }

    this.envConfig = result.parsed || {};
  }

  get(key: string): string | undefined {
    return process.env[key] || this.envConfig[key];
  }

  getEmailHost(): string {
    return this.get("SMTP_HOST") || "smtp.gmail.com";
  }

  getEmailPort(): number {
    return Number(this.get("SMTP_PORT") || 587);
  }

  getEmailSecure(): boolean {
    const secure = this.get("SMTP_SECURE");
    return secure === "true";
  }

  getEmailUser(): string {
    return this.get("SMTP_USERNAME") || "";
  }

  getEmailPassword(): string {
    return this.get("SMTP_PASSWORD") || "";
  }

  getEmailFromName(): string {
    return this.get("SMTP_FROM_NAME") || "Your App";
  }

  getEmailFromAddress(): string {
    return this.get("EMAIL_FROM") || this.getEmailUser();
  }

  getAppUrl(): string {
    return this.get("FRONTEND_URL") || "http://localhost:3000";
  }
}
