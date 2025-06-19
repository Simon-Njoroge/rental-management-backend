import { SupportTicketService } from "../services/support-ticket.service";
import { Request, Response } from "express";
const supportTicketService = new SupportTicketService();

//get all support tickets
export const getAllSupportTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await supportTicketService.findAll();
    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
};

//get support ticket by id
export const getSupportTicketById = async (req: Request, res: Response) =>
{
  const ticketId = req.params.id;
  try {
    const ticket = await supportTicketService.findById(ticketId);
    if (!ticket) {
      res.status(404).json({ message: "Support ticket not found" });
      return;
    }
    res.status(200).json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
};

//get support tickets by user id
export const getSupportTicketsByUserId = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    const tickets = await supportTicketService.findByUserId(userId);
    if (!tickets || tickets.length === 0) {
      res.status(404).json({ message: "No support tickets found for this user" });
      return;
    }
    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
};

//create support ticket
export const createSupportTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await supportTicketService.create(req.body);
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

//update support ticket status
export const updateSupportTicketStatus = async (req: Request, res: Response) => {
    const ticketId = req.params.id;
    const { status } = req.body;
    try {
        const updatedTicket = await supportTicketService.updateStatus(ticketId, status);
        res.status(200).json(updatedTicket);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

//delete support ticket
export const deleteSupportTicket = async (req: Request, res: Response) => {
  const ticketId = req.params.id;
  try {
    await supportTicketService.delete(ticketId);
    res.status(200).json({ message: "Support ticket deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
};

