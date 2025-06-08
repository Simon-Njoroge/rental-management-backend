import { Router } from "express";
import { createBooking ,cancelBooking} from "../controllers/booking.controller";

const router = Router();

router.post("/", createBooking);
router.put("/cancelbooking/:id", cancelBooking);

export default router;
