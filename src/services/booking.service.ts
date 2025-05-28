import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, Repository } from "typeorm";
import { Booking, BookingStatus } from "../entities/booking.entity";
import { CreateBookingDto } from "../dtos/booking/booking.dto";
import { PropertyService } from "../services/property.service";
import { UserService } from "../services/user.service";
import { InvoiceService } from "./invoice.service";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly propertyService: PropertyService,
    private readonly userService: UserService,
    private invoiceService: InvoiceService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    this.logger.log("Creating booking...");
    const {
      propertyId,
      userId,
      startDate,
      endDate,
      totalAmount,
      specialRequests,
    } = createBookingDto;

    if (new Date(endDate) <= new Date(startDate)) {
      this.logger.warn("End date must be after start date");
      throw new BadRequestException("End date must be after start date");
    }

    try {
      const [property, user] = await Promise.all([
        this.propertyService.findById(propertyId),
        this.userService.findById(userId),
      ]);

      if (!property) {
        this.logger.warn(`Property with id ${propertyId} not found`);
        throw new NotFoundException("Property not found");
      }

      if (!user) {
        this.logger.warn(`User with id ${userId} not found`);
        throw new NotFoundException("User not found");
      }

      // Check for conflicting bookings in the same period
      const conflictingBooking = await this.bookingRepository.findOne({
        where: {
          property: { id: property.id },
          startDate: Between(new Date(startDate), new Date(endDate)),
          status: In([BookingStatus.CONFIRMED, BookingStatus.ACTIVE]),
        },
      });

      if (conflictingBooking) {
        this.logger.warn(
          `Property ${property.id} is not available for selected dates`,
        );
        throw new BadRequestException(
          "Property not available for selected dates",
        );
      }

      const booking = this.bookingRepository.create({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount,
        specialRequests,
        property,
        user,
        status: BookingStatus.PENDING,
      });

      const savedBooking = await this.bookingRepository.save(booking);
      this.logger.log(`Booking created with id ${savedBooking.id}`);

      await this.invoiceService.generateMonthlyInvoices(savedBooking);
      this.logger.log(
        `Monthly invoices generated for booking id ${savedBooking.id}`,
      );

      return savedBooking;
    } catch (error: any) {
      this.logger.error(`Failed to create booking: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Booking[]> {
    this.logger.log("Fetching all bookings...");
    try {
      return await this.bookingRepository.find({
        relations: ["property", "user", "invoices", "payments"],
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      this.handleError(error, "findAllBookings");
    }
  }

  async findById(id: string): Promise<Booking> {
    this.logger.log(`Fetching booking by id: ${id}`);
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ["property", "user", "invoices", "payments"],
      });

      if (!booking) {
        this.logger.warn(`Booking with id ${id} not found`);
        throw new NotFoundException("Booking not found");
      }
      return booking;
    } catch (error) {
      this.handleError(error, "findBookingById");
    }
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    this.logger.log(
      `Updating booking status to ${status} for booking id: ${id}`,
    );
    try {
      const booking = await this.findById(id);

      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException(
          "Cannot update status of a cancelled booking",
        );
      }

      // Optional: add more complex business logic on status transitions

      booking.status = status;
      await this.bookingRepository.save(booking);

      this.logger.log(
        `Booking status updated to ${status} for booking id: ${id}`,
      );
      return booking;
    } catch (error) {
      this.handleError(error, "updateBookingStatus");
    }
  }

  async cancelBooking(id: string): Promise<Booking> {
    this.logger.log(`Cancelling booking with id: ${id}`);
    try {
      const booking = await this.findById(id);

      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException("Booking is already cancelled");
      }

      booking.status = BookingStatus.CANCELLED;
      await this.bookingRepository.save(booking);

      this.logger.log(`Booking cancelled with id: ${id}`);

      // Optionally notify user, update invoices/payments, etc.

      return booking;
    } catch (error) {
      this.handleError(error, "cancelBooking");
    }
  }

  async hasUserBookedProperty(
    userId: string,
    propertyId: string,
  ): Promise<boolean> {
    const count = await this.bookingRepository.count({
      where: {
        user: { id: userId },
        property: { id: propertyId },
        // optionally, check for completed booking status if you have such a field
        // status: 'completed'
      },
    });

    return count > 0;
  }

  private handleError(error: any, context: string): never {
    this.logger.error(`[${context}] - ${error.message}`, error.stack);
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }
    throw new InternalServerErrorException("Internal server error");
  }
}
