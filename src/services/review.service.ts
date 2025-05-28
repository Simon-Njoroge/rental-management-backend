import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Review } from "../entities/review.entity";
import { CreateReviewDto } from "../dtos/review/CreateReviewDto";
import { UserService } from "../services/user.service";
import { PropertyService } from "../services/property.service";
import { BookingService } from "../services/booking.service";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private userService: UserService,
    private propertyService: PropertyService,
    private bookingService: BookingService,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    try {
      const [user, property] = await Promise.all([
        this.userService.findById(createReviewDto.userId),
        this.propertyService.findById(createReviewDto.propertyId),
      ]);

      if (!user) {
        throw new NotFoundException(
          `User with id ${createReviewDto.userId} not found`,
        );
      }
      if (!property) {
        throw new NotFoundException(
          `Property with id ${createReviewDto.propertyId} not found`,
        );
      }

      // Verify user has completed a booking for this property
      const hasBooked = await this.bookingService.hasUserBookedProperty(
        user.id,
        property.id,
      );

      if (!hasBooked) {
        throw new BadRequestException(
          "You must book this property before reviewing",
        );
      }

      // Check if review already exists
      const existingReview = await this.reviewRepository.findOne({
        where: { user: { id: user.id }, property: { id: property.id } },
      });

      if (existingReview) {
        throw new ConflictException("You have already reviewed this property");
      }

      const review = this.reviewRepository.create({
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        user,
        property,
      });

      const savedReview = await this.reviewRepository.save(review);

      // Update property average rating
      await this.updatePropertyRating(property.id);

      return savedReview;
    } catch (error) {
      this.handleError(error, "createReview");
    }
  }

  async findByProperty(propertyId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { property: { id: propertyId } },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { user: { id: userId } },
      relations: ["property"],
      order: { createdAt: "DESC" },
    });
  }

  async delete(reviewId: string, userId: string): Promise<void> {
    // Optionally verify that the review belongs to the user before deleting
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, user: { id: userId } },
    });

    if (!review) {
      throw new NotFoundException(
        "Review not found or not authorized to delete",
      );
    }

    await this.reviewRepository.remove(review);

    // Update property rating after deletion
    await this.updatePropertyRating(review.property.id);
  }

  private async updatePropertyRating(propertyId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder("review")
      .select("AVG(review.rating)", "average")
      .where("review.propertyId = :propertyId", { propertyId })
      .getRawOne();

    const averageRating = parseFloat(result.average) || 0;

    await this.propertyService.updateRating(propertyId, averageRating);
  }

  private handleError(error: any, context: string): never {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }
    // Log the error with context for debugging
    console.error(`Error in ReviewService.${context}:`, error);
    throw new InternalServerErrorException("Internal server error");
  }
}
