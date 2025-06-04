// src/controllers/region.controller.ts
import { Request, Response } from "express";
import { RegionService } from "../services/region.service";

const regionService = new RegionService();

export const createRegion = async (req: Request, res: Response) => {
  try {
    const region = await regionService.create(req.body);
    res.status(201).json(region);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getAllRegions = async (_req: Request, res: Response) => {
  try {
    const regions = await regionService.findAll();
    res.json(regions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRegionById = async (req: Request, res: Response) => {
  try {
    const region = await regionService.findById(req.params.id);
    res.json(region);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateRegion = async (req: Request, res: Response) => {
  try {
    const updated = await regionService.update(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteRegion = async (req: Request, res: Response) => {
  try {
    await regionService.delete(req.params.id);
    res.json({ message: "Region deleted successfully" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
