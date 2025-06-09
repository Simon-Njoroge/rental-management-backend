import { Router } from "express";
import { createBooking ,cancelBooking,getAllBookings} from "../controllers/booking.controller";

const router = Router();

router.get("/", getAllBookings);
router.post("/", createBooking);
router.put("/cancelbooking/:id", cancelBooking);

export default router;
