import { Repository } from "typeorm";
import { Property } from "../entities/property.entity";
import { AppDataSource } from "../config/data-source";
import { CreatePropertyDto } from "../dtos/property/CreatePropertyDto";
import { createHttpError } from "../utils/errors";
import { User } from "../entities/user.entity";
import { Amenity } from "../entities/amenity.entity";
import { Category } from "../entities/category.entity";
import { Location } from "../entities/location.entity";
import { Logger } from "../utils/logger";
import { In } from "typeorm";
export class PropertyService {
  private propertyRepository: Repository<Property>;
  private userRepository: Repository<User>;
  private amenityRepository: Repository<Amenity>;
  private categoryRepository: Repository<Category>;
  private locationRepository: Repository<Location>;

  constructor() {
    this.propertyRepository = AppDataSource.getRepository(Property);
    this.userRepository = AppDataSource.getRepository(User);
    this.amenityRepository = AppDataSource.getRepository(Amenity);
    this.categoryRepository = AppDataSource.getRepository(Category);
    this.locationRepository = AppDataSource.getRepository(Location);
  }

 // src/services/property.service.ts

async create(dto: CreatePropertyDto, agent: User): Promise<{ success: boolean; message: string; property: Property, timestamp: string }> {
  const {
    title,
    description,
    address,
    price,
    latitude,
    longitude,
    bedrooms,
    bathrooms,
    squareMeters,
    isAvailable,
    isFeatured,
    rating,
    categoryId,
    locationId,
    amenities: amenityIds = [],
  } = dto;

  // Fetch relations
  const location = await this.locationRepository.findOneByOrFail({ id: locationId });
  const category = categoryId ? await this.categoryRepository.findOneBy({ id: categoryId }) : null;
  const amenities = amenityIds.length
    ? await this.amenityRepository.findBy({ id: In(amenityIds) })
    : [];

  const property = this.propertyRepository.create({
    title,
    description,
    address,
    price,
    latitude,
    longitude,
    bedrooms,
    bathrooms,
    squareMeters,
    isAvailable,
    isFeatured,
    rating,
  });

  property.agent = agent;
  property.location = location;
  if (category) property.category = category;
  if (amenities.length) property.amenities = amenities;

  const saveProperty= await this.propertyRepository.save(property);
  return{
    success: true,
    message: "Property created successfully",
    property: saveProperty,
    timestamp: new Date().toISOString(),
  }
}

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find({
      relations: [
        "agent",
        "location",
        "amenities",
        "category",
        "bookings",
        "reviews",
        "images",
      ],
    });
  }

  async findById(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: [
        "agent",
        "location",
        "amenities",
        "category",
        "bookings",
        "reviews",
        "images",
      ],
    });

    if (!property) {
      throw createHttpError(404, "Property not found");
    }

    return property;
  }

  async update(
    id: string,
    updateDto: Partial<CreatePropertyDto>
  ): Promise<Property> {
    const existing = await this.propertyRepository.findOne({ where: { id } });
    if (!existing) throw createHttpError(404, "Property not found");

    if (updateDto.agentId) {
      const agent = await this.userRepository.findOne({
        where: { id: updateDto.agentId },
      });
      if (!agent) throw createHttpError(404, "Agent not found");
      existing.agent = agent;
    }

    if (updateDto.locationId) {
      const location = await this.locationRepository.findOne({
        where: { id: updateDto.locationId },
      });
      if (!location) throw createHttpError(404, "Location not found");
      existing.location = location;
    }

    if (updateDto.amenities?.length) {
      const amenities = await this.amenityRepository.findByIds(
        updateDto.amenities
      );
      existing.amenities = amenities;
    }

    if (updateDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateDto.categoryId },
      });
      if (!category) throw createHttpError(404, "Category not found");
      existing.category = category;
    }

    Object.assign(existing, updateDto);
    const updated = await this.propertyRepository.save(existing);

    Logger.info(`Property updated with ID: ${updated.id}`);

    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.propertyRepository.delete(id);
    if (result.affected === 0) {
      throw createHttpError(404, "Property not found");
    }

    Logger.info(`Property deleted with ID: ${id}`);
  }
}
