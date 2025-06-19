import { Repository } from "typeorm";
import { Logger } from "../utils/logger";
import { Review } from "../entities/review.entity";
import { AppDataSource } from "../config/data-source";
import { CreateReviewDto } from "../dtos/review/CreateReviewDto";

export class ReviewService {
  private reviewRepository: Repository<Review>;
 

  constructor() {
    this.reviewRepository = AppDataSource.getRepository(Review);
  }

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
   try{
      const { userId, propertyId, rating, comment } = createReviewDto;

      // Create a new review instance
      const review = this.reviewRepository.create({
        user: { id: userId },
        property: { id: propertyId },
        rating,
        comment,
      });

      // Save the review to the database
      return await this.reviewRepository.save(review);
    } catch (error) {
      Logger.error("Error creating review", error);
      throw new Error("Failed to create review");
   }
  }

  async findReviewsByProperty(propertyId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { property: { id: propertyId } },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  async findReviewsByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { user: { id: userId } },
      relations: ["property"],
      order: { createdAt: "DESC" },
    });
  }

  async updateReview(
    reviewId: string,
    userId: string,
    updateData: Partial<CreateReviewDto>
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, user: { id: userId } },
    });

    if (!review) {
      return Promise.reject(new Error("Review not found or you do not have permission to update it"));
    }

    // Update the review properties
    Object.assign(review, updateData);

    // Save the updated review
    return await this.reviewRepository.save(review);
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, user: { id: userId } },
    });

    if (!review) {
      return Promise.reject(new Error("Review not found or you do not have permission to delete it")) ;
    }

    await this.reviewRepository.remove(review);
  }
}
