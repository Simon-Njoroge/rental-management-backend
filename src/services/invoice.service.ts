import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Invoice, InvoiceStatus } from "../entities/invoice.entity";
import { Booking } from "../entities/booking.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  /**
   * Generates a single invoice for a given booking.
   * In a real app, you might want to generate multiple invoices (e.g. monthly).
   */
  async generateInvoice(booking: Booking): Promise<Invoice> {
    // Generate a unique invoice number - customize as needed
    const invoiceNumber = `INV-${uuidv4().slice(0, 8).toUpperCase()}`;

    // For demo, set due date 30 days from now or from booking startDate
    const dueDate = new Date(booking.startDate);
    dueDate.setMonth(dueDate.getMonth() + 1);

    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      amount: booking.totalAmount,
      dueDate,
      status: InvoiceStatus.PENDING,
      booking,
      notes: "Monthly rent invoice",
    });

    return this.invoiceRepository.save(invoice);
  }

  /**
   * If you want to generate invoices for each month during booking duration,
   * you can add more complex logic here.
   */
  async generateMonthlyInvoices(booking: Booking): Promise<Invoice[]> {
    const invoices: Invoice[] = [];

    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);

    // Calculate total months between start and end
    let current = new Date(start);

    while (current < end) {
      const invoiceNumber = `INV-${uuidv4().slice(0, 8).toUpperCase()}`;

      const dueDate = new Date(current);
      dueDate.setMonth(dueDate.getMonth() + 1);

      const invoice = this.invoiceRepository.create({
        invoiceNumber,
        amount: booking.totalAmount / this.monthDiff(start, end), // divide totalAmount by months
        dueDate,
        status: InvoiceStatus.PENDING,
        booking,
        notes: "Monthly rent invoice",
      });

      invoices.push(await this.invoiceRepository.save(invoice));

      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }

    return invoices;
  }

  private monthDiff(d1: Date, d2: Date) {
    return (
      d2.getFullYear() * 12 +
      d2.getMonth() -
      (d1.getFullYear() * 12 + d1.getMonth())
    );
  }
}
