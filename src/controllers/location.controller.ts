// src/controllers/location.controller.ts
import { Request, Response } from "express";
import { LocationService } from "../services/location.service";

const locationService = new LocationService();

export const createLocation = async (req: Request, res: Response) => {
  try {
    const location = await locationService.create(req.body);
    res.status(201).json(location);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getAllLocations = async (_req: Request, res: Response) => {
  try {
    const locations = await locationService.findAll();
    res.json(locations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const location = await locationService.findById(req.params.id);
    res.json(location);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const updated = await locationService.update(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    await locationService.delete(req.params.id);
    res.json({ message: "Location deleted successfully" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
