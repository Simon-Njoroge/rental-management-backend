// src/services/amenity.service.ts
import { Repository } from "typeorm";
import { Amenity } from "../entities/amenity.entity";
import { AppDataSource } from "../config/data-source";
import { CreateAmenityDto } from "../dtos/amenity/create-amenity.dto";
import { UpdateAmenityDto } from "../dtos/amenity/update-amenity.dto";
import { createHttpError } from "../utils/errors";
import { Logger } from "../utils/logger";

export class AmenityService {
  private amenityRepository: Repository<Amenity>;

  constructor() {
    this.amenityRepository = AppDataSource.getRepository(Amenity);
  }

  async create(dto: CreateAmenityDto): Promise<{ success: boolean; message: string; amenity: Amenity; timestamp: string }> {
    try {
      const existing = await this.amenityRepository.findOneBy({ name: dto.name });
      if (existing) {
        throw createHttpError(409, "Amenity with this name already exists");
      }

      const amenity = this.amenityRepository.create(dto);
      const savedAmenity = await this.amenityRepository.save(amenity);

      Logger.info(`Amenity created with ID: ${savedAmenity.id}`);

      return {
        success: true,
        message: "Amenity created successfully",
        amenity: savedAmenity,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      Logger.error(`Error creating amenity: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Amenity[]> {
    return this.amenityRepository.find();
  }

  async findById(id: string): Promise<Amenity> {
    const amenity = await this.amenityRepository.findOneBy({ id });
    if (!amenity) throw createHttpError(404, "Amenity not found");
    return amenity;
  }

  async update(id: string, dto: UpdateAmenityDto): Promise<Amenity> {
    const amenity = await this.amenityRepository.findOneBy({ id });
    if (!amenity) throw createHttpError(404, "Amenity not found");

    if (dto.name && dto.name !== amenity.name) {
      const existing = await this.amenityRepository.findOneBy({ name: dto.name });
      if (existing && existing.id !== id) {
        throw createHttpError(409, "Amenity with this name already exists");
      }
    }

    Object.assign(amenity, dto);
    const updated = await this.amenityRepository.save(amenity);

    Logger.info(`Amenity updated with ID: ${updated.id}`);

    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.amenityRepository.delete(id);
    if (result.affected === 0) {
      throw createHttpError(404, "Amenity not found");
    }
    Logger.info(`Amenity deleted with ID: ${id}`);
  }
}
