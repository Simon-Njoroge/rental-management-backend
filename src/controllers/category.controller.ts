import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";

const categoryService = new CategoryService();

export const createCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.create(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.findAll();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.findById(req.params.id);
    res.json(category);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const updated = await categoryService.update(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.delete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
