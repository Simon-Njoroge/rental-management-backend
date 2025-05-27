import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dtos/property/CreatePropertyDto';
import { UpdatePropertyDto } from '../dtos/property/UpdatePropertyDto';
import { PropertyFilterDto } from '../dtos/property/PropertyFilterDto';  
import { UserService } from '../services/user.service';
import { AppLogger } from '../utils/app-logger';

@Injectable()
export class PropertyService {
  private logger = new AppLogger('PropertyService');

  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private userService: UserService,
  ) {}

async create(createPropertyDto: CreatePropertyDto, agentId: string): Promise<Property> {
  try {
    const agent = await this.userService.findById(agentId);
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }


    const amenities = createPropertyDto.amenities?.map(id => ({ id })) ?? [];

    const propertyData: DeepPartial<Property> = {
      ...createPropertyDto,
      agent,
      amenities,
    };

    const property = this.propertyRepository.create(propertyData);
    await this.propertyRepository.save(property);

    this.logger.log(`Property created: ${property.title}`);
    return property;
  } catch (error) {
    this.handleError(error, 'createProperty');
  }
}


  async findAll(filter: PropertyFilterDto): Promise<Property[]> {
    try {
      const query = this.propertyRepository
        .createQueryBuilder('property')
        .leftJoinAndSelect('property.agent', 'agent')
        .where('property.isAvailable = :available', { available: true });

      if (filter.location) {
        query.andWhere('property.address ILIKE :location', {
          location: `%${filter.location}%`,
        });
      }

      if (filter.minPrice) {
        query.andWhere('property.price >= :minPrice', {
          minPrice: filter.minPrice,
        });
      }

      if (filter.maxPrice) {
        query.andWhere('property.price <= :maxPrice', {
          maxPrice: filter.maxPrice,
        });
      }

      if (filter.type) {
        query.andWhere('property.type = :type', {
          type: filter.type,
        });
      }

      return await query.getMany();
    } catch (error) {
      this.handleError(error, 'findProperties');
    }
  }

  async findById(id: string): Promise<Property> {
    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
        relations: ['agent', 'bookings', 'reviews', 'amenities'],
      });

      if (!property) {
        throw new NotFoundException(`Property with ID ${id} not found`);
      }
      return property;
    } catch (error) {
      this.handleError(error, 'findPropertyById');
    }
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    try {
      const property = await this.findById(id);

      Object.assign(property, updatePropertyDto);

      await this.propertyRepository.save(property);
      this.logger.log(`Property updated: ${property.title}`);

      return property;
    } catch (error) {
      this.handleError(error, 'updateProperty');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.propertyRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Property with ID ${id} not found`);
      }
      this.logger.log(`Property deleted with ID: ${id}`);
    } catch (error) {
      this.handleError(error, 'removeProperty');
    }
  }

  async updateRating(propertyId: string, newRating: number): Promise<Property> {
    try {
      const property = await this.propertyRepository.findOne({
        where: { id: propertyId },
      });

      if (!property) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
      }

      property.rating = newRating;

      const updatedProperty = await this.propertyRepository.save(property);

      this.logger.log(
        `Property rating updated for ID ${propertyId} to ${newRating}`,
      );

      return updatedProperty;
    } catch (error: any) {
      this.logger.error(
        `Failed to update rating for property ${propertyId}`,
        error.stack || error.message || error,
      );
      throw new InternalServerErrorException(
        'Failed to update property rating',
      );
    }
  }

  private handleError(error: any, context: string): never {
    this.logger.error(`Error in ${context}`, error.stack || error.message || error);

    if (error instanceof NotFoundException) {
      throw error; // rethrow not found errors
    }

    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
