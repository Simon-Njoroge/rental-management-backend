// src/controllers/amenity.controller.ts
import { Request, Response } from "express";
import { AmenityService } from "../services/amenity.service";

const amenityService = new AmenityService();

export const createAmenity = async (req: Request, res: Response) => {
  try {
    const result = await amenityService.create(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getAllAmenities = async (_req: Request, res: Response) => {
  try {
    const amenities = await amenityService.findAll();
    res.json(amenities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAmenityById = async (req: Request, res: Response) => {
  try {
    const amenity = await amenityService.findById(req.params.id);
    res.json(amenity);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateAmenity = async (req: Request, res: Response) => {
  try {
    const updated = await amenityService.update(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteAmenity = async (req: Request, res: Response) => {
  try {
    await amenityService.delete(req.params.id);
    res.json({ message: "Amenity deleted successfully" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
