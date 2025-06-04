// src/services/location.service.ts
import { Repository } from "typeorm";
import { Location } from "../entities/location.entity";
import { Region } from "../entities/region.entity";
import { AppDataSource } from "../config/data-source";
import { CreateLocationDto } from "../dtos/location/create-location.dto";
import { UpdateLocationDto } from "../dtos/location/update-location.dto";
import { createHttpError } from "../utils/errors";
import { Logger } from "../utils/logger";

export class LocationService {
  private locationRepository: Repository<Location>;
  private regionRepository: Repository<Region>;

  constructor() {
    this.locationRepository = AppDataSource.getRepository(Location);
    this.regionRepository = AppDataSource.getRepository(Region);
  }

  async create(dto: CreateLocationDto): Promise<Location> {
    const region = await this.regionRepository.findOneBy({ id: dto.regionId });
    if (!region) throw createHttpError(404, "Region not found");

    const location = this.locationRepository.create({
      name: dto.name,
      region,
    });

    const savedLocation = await this.locationRepository.save(location);
    Logger.info(`Location created with ID: ${savedLocation.id}`);

    return savedLocation;
  }

  async findAll(): Promise<Location[]> {
    return this.locationRepository.find({
      relations: ["region", "properties"],
    });
  }

  async findById(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ["region", "properties"],
    });
    if (!location) throw createHttpError(404, "Location not found");
    return location;
  }

  async update(id: string, dto: UpdateLocationDto): Promise<Location> {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) throw createHttpError(404, "Location not found");

    if (dto.regionId) {
      const region = await this.regionRepository.findOneBy({ id: dto.regionId });
      if (!region) throw createHttpError(404, "Region not found");
      location.region = region;
    }

    if (dto.name !== undefined) {
      location.name = dto.name;
    }

    const updated = await this.locationRepository.save(location);
    Logger.info(`Location updated with ID: ${updated.id}`);

    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.locationRepository.delete(id);
    if (result.affected === 0) {
      throw createHttpError(404, "Location not found");
    }
    Logger.info(`Location deleted with ID: ${id}`);
  }
}
