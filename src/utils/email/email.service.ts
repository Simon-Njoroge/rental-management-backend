import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../../config/service';
import { compile } from 'handlebars';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;
  private readonly templateCache = new Map<string, Handlebars.TemplateDelegate>();

  constructor(private readonly configService: ConfigService) {
    this.initializeTransport();
  }

  private initializeTransport() {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('EMAIL_HOST'),
        port: parseInt(this.configService.get('EMAIL_PORT') || '587'),
        secure: this.configService.get('EMAIL_SECURE') === 'true',
        auth: {
          user: this.configService.get('EMAIL_USER'),
          pass: this.configService.get('EMAIL_PASSWORD'),
        },
        tls: {
          rejectUnauthorized: this.configService.get('EMAIL_SECURE') === 'true',
        },
      });

      this.transporter.verify((error:any) => {
        if (error) {
          this.logger.error('Email transport verification failed', error.stack || error.message);
        } else {
          this.logger.log('Email transport successfully verified and ready');
        }
      });
    } catch (err:any) {
      this.logger.error('Error initializing email transporter', err.stack || err.message);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    content: string | { template: string; context: Record<string, any> },
    attachments?: Array<{ filename: string; path: string }>
  ): Promise<boolean> {
    try {
      let html: string;

      if (typeof content === 'string') {
        html = content;
      } else {
        html = await this.renderTemplate(content.template, content.context);
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${this.configService.get('EMAIL_FROM_NAME')}" <${this.configService.get('EMAIL_FROM_ADDRESS')}>`,
        to,
        subject,
        html,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to} | Message ID: ${info.messageId}`);
      return true;
    } catch (error:any) {
      this.logger.error(`Failed to send email to ${to}`, error.stack || error.message);
      return false;
    }
  }

  private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    try {
      if (!this.templateCache.has(templateName)) {
        const templatePath = path.resolve(__dirname, 'templates', `${templateName}.hbs`);
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const compiledTemplate = compile(templateContent);
        this.templateCache.set(templateName, compiledTemplate);
      }

      const template = this.templateCache.get(templateName);
      return template!(context);
    } catch (error:any) {
      this.logger.error(`Failed to render template: ${templateName}`, error.stack || error.message);
      throw new Error(`Template rendering failed: ${templateName}`);
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${token}`;

    await this.sendEmail(email, 'Password Reset Request', {
      template: 'password-reset',
      context: {
        name: email.split('@')[0],
        resetUrl,
        expiryHours: 1,
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail(email, 'Welcome to Our Platform', {
      template: 'welcome',
      context: {
        name,
        loginUrl: `${this.configService.get('APP_URL')}/login`,
      },
    });
  }
}
