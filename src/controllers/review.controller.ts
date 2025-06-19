import { Request,Response } from "express";
import { ReviewService } from "../services/review.service";

const reviewService = new ReviewService();

//create review
export const createReview = async (req: Request, res: Response) => {
  try {
    const review = await reviewService.createReview(req.body);
    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// get reviews by property id
export  const getReviwewsByPropertyId = async (req: Request, res: Response) => {
  const propertyId = req.params.propertyId;
  try {
    const reviews = await reviewService.findReviewsByProperty(propertyId);
    if (!reviews || reviews.length === 0) {
      res.status(404).json({ message: "No reviews found for this property" });
      return;
    }
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
};

export const getReviewsByUserId = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    const reviews = await reviewService.findReviewsByUser(userId);
    if (!reviews || reviews.length === 0) {
      res.status(404).json({ message: "No reviews found for this user" });
      return;
    }
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }
};

//update review
export const updateReview = async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.params.userId; 
  try {
    const updatedReview = await reviewService.updateReview(reviewId, userId, req.body);
    res.status(200).json(updatedReview);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// delete review
export const deleteReview = async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.params.userId; 
  try {
    await reviewService.deleteReview(reviewId, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};