import { Repository } from "typeorm";
import { Booking, BookingStatus } from "../entities/booking.entity"; // make sure BookingStatus is exported
import { Property } from "../entities/property.entity";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/data-source";
import { CreateBookingDto } from "../dtos/booking/booking.dto";
import { createHttpError } from "../utils/errors";
import { Logger } from "../utils/logger";
import { generateInvoicePdf } from "../utils/generateInoicePdf";
import { Invoice } from "../entities/invoice.entity";
import { InvoiceStatus } from "../entities/invoice.entity";
import { v4 as uuidv4 } from "uuid";
import  {sendInvoiceEmail} from "../utils/email/invoice";
export class BookingService {
  private bookingRepository: Repository<Booking>;
  private propertyRepository: Repository<Property>;
  private userRepository: Repository<User>;
  private invoiceRepository: Repository<Invoice>;

  constructor() {
    this.bookingRepository = AppDataSource.getRepository(Booking);
    this.propertyRepository = AppDataSource.getRepository(Property);
    this.userRepository = AppDataSource.getRepository(User);
    this.invoiceRepository = AppDataSource.getRepository(Invoice);
  }

  async create(dto: CreateBookingDto): Promise<{
    success: boolean;
    message: string;
    booking: Booking;
    timestamp: string;
  }> {
    const {
      userId,
      propertyId,
      startDate,
      endDate,
      totalAmount,
      specialRequests,
    } = dto;
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const property = await this.propertyRepository.findOneByOrFail({
      id: propertyId,
    });

    // Check property availability
    if (property.isAvailable === false) {
      throw createHttpError(
        400,
        "Property is currently unavailable for booking"
      );
    }

    // Create booking entity
    const booking = this.bookingRepository.create({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalAmount: totalAmount,
      specialRequests: specialRequests ?? null,
      status: BookingStatus.PENDING,
    });

    // Set relations properly
    booking.user = user;
    booking.property = property;

    // Save booking
    const savedBooking = await this.bookingRepository.save(booking);

    // Generate invoice PDF

    // Mark property as unavailable
    property.isAvailable = false;
    await this.propertyRepository.save(property);

    const invoice = this.invoiceRepository.create({
      invoiceNumber: `INV-${uuidv4().slice(0, 8).toUpperCase()}`,
      amount: savedBooking.totalAmount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: InvoiceStatus.PENDING,
      notes: "Auto-generated invoice for booking",
      booking: savedBooking,
    });

    await this.invoiceRepository.save(invoice);

    
    try {
      await sendInvoiceEmail(
        user.email,
        invoice,
        savedBooking
      );
      Logger.info(`Invoice emailed to ${user.email}`);
    } catch (err:any) {
      Logger.error(`Failed to email invoice to ${user.email}: ${err.message}`);
    }

    Logger.info(
      `Booking created with ID: ${savedBooking.id} for property ${property.id}`
    );

    return {
      success: true,
      message: "Booking created successfully",
      booking: savedBooking,
      timestamp: new Date().toISOString(),
    };
  }
}
