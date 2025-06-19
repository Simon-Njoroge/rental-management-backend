import { Router } from "express";
import {getReviwewsByPropertyId,getReviewsByUserId,createReview,updateReview,deleteReview} from "../controllers/review.controller";

const router = Router();
// Create a new review
router.post("/", createReview);

// Get reviews by property ID
router.get("/property/:propertyId", getReviwewsByPropertyId);

// Get reviews by user ID
router.get("/user/:userId", getReviewsByUserId);

// Update a review
router.put("/:id/user/:userId", updateReview);

// Delete a review
router.delete("/:id/user/:userId", deleteReview);

export default router;