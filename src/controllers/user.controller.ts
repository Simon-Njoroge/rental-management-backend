// controllers/user.controller.ts
import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.findAll();
  res.json(users);
};

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const user = await userService.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const updated = await userService.update(req.params.id, req.body);
  res.json(updated);
};

export const deleteUser = async (req: Request, res: Response) => {
  await userService.delete(req.params.id);
  res.json({ message: "User deleted successfully" });
};

export const completeProfile = async (req: Request, res: Response) => {
  const updated = await userService.update(req.params.id, req.body);
  res.json(updated);
};

export const getLoggedInProfile = async (
  req: any,
  res: Response,
): Promise<any> => {
  const user = await userService.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};
