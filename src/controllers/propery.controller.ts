// src/controllers/property.controller.ts
import { Request, Response } from "express";
import { PropertyService } from "../services/property.service";
import { User } from "../entities/user.entity";

const propertyService = new PropertyService();

export const createProperty = async (req: Request, res: Response) => {
  try {
    const agent = req.user as User; 
    const result = await propertyService.create(req.body, agent);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getAllProperties = async (_req: Request, res: Response) => {
  try {
    const properties = await propertyService.findAll();
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const property = await propertyService.findById(req.params.id);
    res.json(property);
  } catch (error: any) {
    res.status(error.statusCode || 404).json({ message: error.message });
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const updated = await propertyService.update(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    await propertyService.delete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (error: any) {
    res.status(error.statusCode || 404).json({ message: error.message });
  }
};