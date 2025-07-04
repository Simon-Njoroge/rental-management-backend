import * as nodemailer from "nodemailer";
import { ConfigService } from "../../config/service";
import { Invoice } from "../../entities/invoice.entity";
import { Booking } from "../../entities/booking.entity";
import { generateInvoicePdf } from '../generateInoicePdf';
import { Session } from "../../entities/session.entity";
import path from "path";
import fs from 'fs';
import handlebars from 'handlebars';
import { User } from "../../entities/user.entity";
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getEmailHost(),
      port: this.configService.getEmailPort(),
      secure: false, // For Gmail TLS on port 587
      auth: {
        user: this.configService.getEmailUser(),
        pass: this.configService.getEmailPassword(),
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error("Email transport verification failed:", error);
      } else {
        console.log("Email service is ready.");
      }
    });
  }

  // General method to send any email with html content
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string
  ): Promise<void> {
    const fromName = this.configService.getEmailFromName();
    const fromAddress = this.configService.getEmailFromAddress();

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`Email sent to ${to} with subject "${subject}"`);
  }

  // Send account creation email
  async sendAccountCreationEmail(email: string, password: string): Promise<void> {
    const appUrl = this.configService.getAppUrl();
    const templatePath = path.join(__dirname, 'templates', 'account-creation.hbs');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    const html = template({
      email,
      password,
      loginUrl: `${appUrl}/login`,
      year: new Date().getFullYear(),
    });

    await this.sendEmail(email, "Your New Account", html);
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const appUrl = this.configService.getAppUrl();

    const html = `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for joining our platform.</p>
      <p><a href="${appUrl}/login">Login here</a></p>
    `;

    await this.sendEmail(email, "Welcome to Our Platform", html);
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const appUrl = this.configService.getAppUrl();
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await this.sendEmail(email, "Password Reset Request", html);
  }

  //new signin alert
  async sendNewSigninNotification(email:string,user:User,session:Session):Promise<void>{
    const appUrl = this.configService.getAppUrl();
    const templatePath = path.join(__dirname, 'templates', 'signin.hbs');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    const html = template({
      email,
      name:user.username,
      device:session.userAgent,
      location:"location not found",
      dateTime: new Date().toLocaleString(),
      reseturl: `${appUrl}/login`,
      expiryHours: "2hrs",
      
    });

    await this.sendEmail(email, "New Device Sign-in Alert", html);

  }

  async sendInvoiceWithAttachment(email: string, invoice: Invoice, booking: Booking): Promise<void> {

  const fileName =`Invoice-${invoice.invoiceNumber}.pdf`;
  const savedPath=path.join(__dirname, 'invoices', fileName);
  // Generate PDF and save it to the specified path
  if (!fs.existsSync(path.join(__dirname, 'invoices'))) {
    fs.mkdirSync(path.join(__dirname, 'invoices'), { recursive: true });
  }

  const pdfBuffer = await  generateInvoicePdf(invoice, booking,savedPath);

  const templatePath = path.join(__dirname, 'templates', 'invoice-email.hbs');
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);

  // Prepare data for the template
  const html = template({
    customerName: booking.user?.firstname || email,
    invoiceNumber: invoice.invoiceNumber,
    bookingReference: booking.id || booking.id,
    amount: invoice.amount,
    
    date: new Date().toLocaleDateString(),
    year: new Date().getFullYear(),
  });
  await this.transporter.sendMail({
    from: '"rhms" <no-reply@bookingapp.com>',
    to: email,
    subject: "Your Booking Invoice",
    html,
    attachments: [
      {
        filename: `Invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

}
