import { Request, Response } from "express";
import { BookingService } from "../services/booking.service";



const bookingService = new BookingService();

export const getAllBookings = async (req: Request, res: Response) => {
  try { 
    const bookings = await bookingService.findAll();
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
};

export const createBooking = async (req: Request, res: Response) => {
try {
    const booking = await bookingService.create(req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }

};

// controllers/bookingController.ts
export const cancelBooking = async (req: Request, res: Response):Promise<any> => {
  try {
    const bookingId = req.params.id;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const result = await bookingService.cancel(bookingId);
    return res.status(200).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "An unexpected error occurred";
    return res.status(status).json({ message });
  }
};
