import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity } from '../entities/amenity.entity';
import { Property } from '../entities/property.entity';
import { CreateAmenityDto } from '../dtos/amenity/create-amenity.dto';
import { UpdateAmenityDto } from '../dtos/amenity/update-amenity.dto';
import { PropertyService } from './property.service';
import { AppLogger } from '../utils/app-logger';

@Injectable()
export class AmenityService {
  private logger = new AppLogger('AmenityService');

  constructor(
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
    private propertyService: PropertyService,
  ) {}

  // CREATE
  async create(createAmenityDto: CreateAmenityDto): Promise<Amenity> {
    try {
      const existingAmenity = await this.amenityRepository.findOne({
        where: { name: createAmenityDto.name },
      });

      if (existingAmenity) {
        throw new ConflictException('Amenity with this name already exists');
      }

      const amenity = this.amenityRepository.create(createAmenityDto);
      await this.amenityRepository.save(amenity);
      this.logger.log(`Amenity created: ${amenity.name}`);
      return amenity;
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  // FIND ALL
  async findAll(): Promise<Amenity[]> {
    try {
      return await this.amenityRepository.find({ relations: ['properties'] });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  // FIND BY ID
  async findById(id: string): Promise<Amenity> {
    try {
      const amenity = await this.amenityRepository.findOne({
        where: { id },
        relations: ['properties'],
      });

      if (!amenity) {
        throw new NotFoundException(`Amenity with ID ${id} not found`);
      }

      return amenity;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  // UPDATE
  async update(id: string, updateAmenityDto: UpdateAmenityDto): Promise<Amenity> {
    try {
      const amenity = await this.findById(id);
      const updated = Object.assign(amenity, updateAmenityDto);
      await this.amenityRepository.save(updated);
      this.logger.log(`Amenity updated: ${updated.name}`);
      return updated;
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  // DELETE
  async delete(id: string): Promise<void> {
    try {
      const amenity = await this.findById(id);
      await this.amenityRepository.remove(amenity);
      this.logger.log(`Amenity deleted: ${amenity.name}`);
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  // ADD AMENITY TO PROPERTY
  async addAmenityToProperty(propertyId: string, amenityId: string): Promise<void> {
    try {
      const [property, amenity] = await Promise.all([
        this.propertyService.findById(propertyId),
        this.findById(amenityId),
      ]);

      await this.amenityRepository
        .createQueryBuilder()
        .relation(Property, 'amenities')
        .of(property)
        .add(amenity);

      this.logger.log(`Amenity ${amenityId} added to property ${propertyId}`);
    } catch (error) {
      this.handleError(error, 'addAmenityToProperty');
    }
  }

  // ERROR HANDLER
  private handleError(error: any, context: string): never {
    this.logger.error(`Error in ${context}: ${error.message}`, error.stack);

    if (error instanceof ConflictException || error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `An error occurred in AmenityService [${context}]`,
    );
  }
}
