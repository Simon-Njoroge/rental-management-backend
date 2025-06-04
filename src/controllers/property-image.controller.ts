// src/controllers/property-image.controller.ts
import { Request, Response } from "express";
import { PropertyImageService } from "../services/property-image.service";

const propertyImageService = new PropertyImageService();

export const createPropertyImage = async (req: Request, res: Response) => {
  try {
    const image = await propertyImageService.create(req.body);
    res.status(201).json(image);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getPropertyImageById = async (req: Request, res: Response) => {
  try {
    const image = await propertyImageService.findById(req.params.id);
    res.json(image);
  } catch (error: any) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

export const getPropertyImagesByProperty = async (req: Request, res: Response) => {
  try {
    const images = await propertyImageService.findAllByProperty(req.params.propertyId);
    res.json(images);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePropertyImage = async (req: Request, res: Response) => {
  try {
    const updated = await propertyImageService.update(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

export const deletePropertyImage = async (req: Request, res: Response) => {
  try {
    await propertyImageService.delete(req.params.id);
    res.json({ message: "Property image deleted successfully" });
  } catch (error: any) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
