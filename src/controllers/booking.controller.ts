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

// get booking by id
export const getBookingById = async (req:Request,res:Response)=>{
  const bookingId=req.params.id;
  try{
    const booking = await bookingService.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
  
}

// get bookings by user id
export const getBookingByUserId = async (req:Request,res:Response)=>{
  const userId =req.params.userId;
  try{
    const bookings = await bookingService.findByUserId(userId);
    if (!bookings || bookings.length === 0) {
      res.status(404).json({ message: "No bookings found for this user" });
      return;
    }
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
}

//create booking
export const createBooking = async (req: Request, res: Response) => {
try {
    const booking = await bookingService.create(req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }

};

//update booking status
export const updateBookingStatus = async (req:Request,res:Response)=>{
  const bokingId = req.params.id;
  const{status}= req.body;
  try{
    const updatedBooking =await bookingService.updateStatus(bokingId, status);
    if (!updatedBooking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.status(200).json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
}

  // delete booking
 export const deleteBooking = async (req:Request,res:Response)=>{
    const bookingId = req.params.id;
    try {
      const result = await bookingService.delete(bookingId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An unexpected error occurred" });
    }
  }





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
