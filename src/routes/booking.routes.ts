import { Router } from "express";
import { createBooking ,cancelBooking,getAllBookings,getBookingById,getBookingByUserId,updateBookingStatus,deleteBooking} from "../controllers/booking.controller";

const router = Router();

router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.get("/user/:userId", getBookingByUserId);
router.post("/", createBooking);
router.put("/cancelbooking/:id", cancelBooking);
router.put("/:id/status", updateBookingStatus);
router.delete("/:id", deleteBooking);

export default router;
