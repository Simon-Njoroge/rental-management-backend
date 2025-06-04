// src/services/property-image.service.ts
import { Repository } from "typeorm";
import { PropertyImage } from "../entities/property-image.entity";
import { AppDataSource } from "../config/data-source";
import { CreatePropertyImageDto, UpdatePropertyImageDto } from "../dtos/properyimage/property-image.dto";
import { createHttpError } from "../utils/errors";
import { Property } from "../entities/property.entity";

export class PropertyImageService {
  private propertyImageRepository: Repository<PropertyImage>;
  private propertyRepository: Repository<Property>;

  constructor() {
    this.propertyImageRepository = AppDataSource.getRepository(PropertyImage);
    this.propertyRepository = AppDataSource.getRepository(Property);
  }

  async create(dto: CreatePropertyImageDto): Promise<PropertyImage> {
    const property = await this.propertyRepository.findOneBy({ id: dto.propertyId });
    if (!property) throw createHttpError(404, "Property not found");

    const propertyImage = this.propertyImageRepository.create({
      url: dto.url,
      altText: dto.altText,
      order: dto.order ?? 0,
      property,
    });

    return await this.propertyImageRepository.save(propertyImage);
  }

  async findById(id: string): Promise<PropertyImage> {
    const image = await this.propertyImageRepository.findOne({
      where: { id },
      relations: ["property"],
    });
    if (!image) throw createHttpError(404, "Property image not found");
    return image;
  }

  async findAllByProperty(propertyId: string): Promise<PropertyImage[]> {
    return this.propertyImageRepository.find({
      where: { property: { id: propertyId } },
      order: { order: "ASC" },
    });
  }

  async update(id: string, dto: UpdatePropertyImageDto): Promise<PropertyImage> {
    const image = await this.findById(id);
    Object.assign(image, dto);
    return await this.propertyImageRepository.save(image);
  }

  async delete(id: string): Promise<void> {
    const result = await this.propertyImageRepository.delete(id);
    if (result.affected === 0) throw createHttpError(404, "Property image not found");
  }
}
