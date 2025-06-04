// src/services/region.service.ts
import { Repository } from "typeorm";
import { Region } from "../entities/region.entity";
import { AppDataSource } from "../config/data-source";
import { CreateRegionDto } from "../dtos/region/create-region.dto";
import { UpdateRegionDto } from "../dtos/region/update-region.dto";
import { createHttpError } from "../utils/errors";
import { Logger } from "../utils/logger";

export class RegionService {
  private regionRepository: Repository<Region>;

  constructor() {
    this.regionRepository = AppDataSource.getRepository(Region);
  }

  async create(dto: CreateRegionDto): Promise<Region> {
    const existing = await this.regionRepository.findOneBy({ name: dto.name });
    if (existing) throw createHttpError(400, "Region name already exists");

    const region = this.regionRepository.create({ name: dto.name });
    const savedRegion = await this.regionRepository.save(region);

    Logger.info(`Region created with ID: ${savedRegion.id}`);

    return savedRegion;
  }

  async findAll(): Promise<Region[]> {
    return this.regionRepository.find({ relations: ["locations"] });
  }

  async findById(id: string): Promise<Region> {
    const region = await this.regionRepository.findOne({
      where: { id },
      relations: ["locations"],
    });
    if (!region) throw createHttpError(404, "Region not found");
    return region;
  }

  async update(id: string, dto: UpdateRegionDto): Promise<Region> {
    const region = await this.regionRepository.findOneBy({ id });
    if (!region) throw createHttpError(404, "Region not found");

    if (dto.name !== undefined) {
      // Check for uniqueness
      const existing = await this.regionRepository.findOneBy({ name: dto.name });
      if (existing && existing.id !== id) {
        throw createHttpError(400, "Region name already exists");
      }
      region.name = dto.name;
    }

    const updated = await this.regionRepository.save(region);
    Logger.info(`Region updated with ID: ${updated.id}`);

    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.regionRepository.delete(id);
    if (result.affected === 0) {
      throw createHttpError(404, "Region not found");
    }
    Logger.info(`Region deleted with ID: ${id}`);
  }
}
