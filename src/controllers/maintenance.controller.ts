import { MaintenanceService } from "../services/maintenance.service";
import { Request, Response } from "express";

const maintenanceService = new MaintenanceService();

// Create a new maintenance request
export const createMaintenanceRequest = async (req: Request, res: Response) => {
  try {
    const maintenanceRequest = await maintenanceService.createMaintenance(req.body);
    res.status(201).json(maintenanceRequest);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get all maintenance requests
export const getAllMaintenanceRequests = async (req: Request, res: Response) => {
  try {
    const maintenanceRequests = await maintenanceService.getAllMaintenances();
    res.status(200).json(maintenanceRequests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a maintenance request by ID
export const getMaintenanceRequestById = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id;
  try {
    const maintenanceRequest = await maintenanceService.getMaintenanceById(id);
    if (!maintenanceRequest) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }
    res.status(200).json(maintenanceRequest);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update a maintenance request
export const updateMaintenanceRequest = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id;
  try {
    const updatedMaintenanceRequest = await maintenanceService.updateMaintenance(id, req.body);
    if (!updatedMaintenanceRequest) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }
    res.status(200).json(updatedMaintenanceRequest);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a maintenance request
export const deleteMaintenanceRequest = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await maintenanceService.deleteMaintenance(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

