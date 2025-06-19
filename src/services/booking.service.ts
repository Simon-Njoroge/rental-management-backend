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

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ["user", "property", "invoices", "payments"],
    });
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
      amount: Number(savedBooking.totalAmount),
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
  //cancel booking

  async cancel(bookingId: string): Promise<{
  success: boolean;
  message: string;
  booking: Booking;
  timestamp: string;
}> {
  const booking = await this.bookingRepository.findOne({
    where: { id: bookingId },
    relations: ["property", "user"], // Make sure to load related property and user
  });

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw createHttpError(400, "Booking is already cancelled");
  }

  // Mark property as available again
  const property = booking.property;
  if (!property) {
    throw createHttpError(404, "Associated property not found");
  }
  property.isAvailable = true;
  await this.propertyRepository.save(property);

  // Mark invoice as cancelled
  const invoice = await this.invoiceRepository.findOne({
    where: { booking: { id: booking.id } },
  });

  if (invoice) {
    invoice.status = InvoiceStatus.CANCELLED;
    await this.invoiceRepository.save(invoice);
    Logger.info(`Invoice with ID: ${invoice.id} has been cancelled`);
  }

  // Update booking status
  booking.status = BookingStatus.CANCELLED;
  const updatedBooking = await this.bookingRepository.save(booking);

  Logger.info(`Booking with ID: ${updatedBooking.id} has been cancelled`);

  // Send cancellation email
// Send cancellation email only if invoice exists
if (invoice) {
  try {
    await sendInvoiceEmail(booking.user.email, invoice, updatedBooking);
    Logger.info(`Cancellation email sent to ${booking.user.email}`);
  } catch (err: any) {
    Logger.error(
      `Failed to send cancellation email to ${booking.user.email}: ${err.message}`
    );
  }
} else {
  Logger.warn(
    `No invoice found for booking ID: ${booking.id}, skipping cancellation email`
  );
}

  return {
    success: true,
    message: "Booking cancelled successfully",
    booking: updatedBooking,
    timestamp: new Date().toISOString(),
  };
}


// get booking by id
async findById(bookingId: string): Promise<Booking> {
  const booking = await this.bookingRepository.findOne({
    where: { id: bookingId },
    relations: ["user", "property", "invoices", "payments"],
  });

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  return booking;
}

// get bookings by user id
async findByUserId(userId: string): Promise<Booking[]> {
  const user = await this.userRepository.findOneByOrFail({ id: userId });

  const bookings = await this.bookingRepository.find({
    where: { user: { id: user.id } },
    relations: ["property", "invoices", "payments"],
  });

  if (bookings.length === 0) {
    throw createHttpError(404, "No bookings found for this user");
  }

  return bookings;
}

// delete booking
async delete(bookingId: string): Promise<{
  success: boolean;
  message: string;
  booking: Booking | null;
  timestamp: string;
}> {
  const booking = await this.bookingRepository.findOne({
    where: { id: bookingId },
    relations: ["property", "user"],
  });

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  await this.bookingRepository.remove(booking);

  Logger.info(`Booking with ID: ${booking.id} has been deleted`);

  return {
    success: true,
    message: "Booking deleted successfully",
    booking: null,
    timestamp: new Date().toISOString(),
  };
}
  async updateStatus(
    bookingId: string,
    status: BookingStatus
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["property", "user"],
    });

    if (!booking) {
      throw createHttpError(404, "Booking not found");
    }

    booking.status = status;
    const updatedBooking = await this.bookingRepository.save(booking);

    Logger.info(
      `Booking with ID: ${updatedBooking.id} status updated to ${status}`
    );

    return updatedBooking;
  }
}
