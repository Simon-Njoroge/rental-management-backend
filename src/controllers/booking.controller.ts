import { Request, Response } from "express";
import { BookingService } from "../services/booking.service";



const bookingService = new BookingService();

export const createBooking = async (req: Request, res: Response) => {
try {
    const booking = await bookingService.create(req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
