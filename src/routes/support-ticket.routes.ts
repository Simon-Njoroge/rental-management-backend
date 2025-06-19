import { Router } from "express";
import {getAllSupportTickets, getSupportTicketById, getSupportTicketsByUserId, createSupportTicket, updateSupportTicketStatus,deleteSupportTicket} from "../controllers/support-ticket.controller";

const router = Router();
// Get all support tickets
router.get("/", getAllSupportTickets);

// Get support ticket by ID
router.get("/:id", getSupportTicketById);

// Get support tickets by user ID
router.get("/user/:userId", getSupportTicketsByUserId);

// Create support ticket
router.post("/", createSupportTicket);

// Update support ticket status
router.patch("/:id/status", updateSupportTicketStatus);

// Delete support ticket
router.delete("/:id", deleteSupportTicket);

export default router;