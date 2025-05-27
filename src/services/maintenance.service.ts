import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance, MaintenanceStatus, MaintenancePriority } from '../entities/maintenance.entity';
import { CreateMaintenanceDto } from '../dtos/maintenance/CreateSessionDto';
import { UpdateMaintenanceDto } from '../dtos/maintenance/UpdateDto';
import { UserService } from './user.service';
import { PropertyService } from './property.service';
import { NotificationService } from './notification.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    private readonly userService: UserService,
    private readonly propertyService: PropertyService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto,userId: string,
  propertyId: string): Promise<Maintenance> {
    try {
      const [user, property] = await Promise.all([
        this.userService.findById(userId),
        this.propertyService.findById(propertyId),
      ]);

      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!property) {
        throw new NotFoundException('Property not found');
      }

      const maintenance = this.maintenanceRepository.create({
        ...createMaintenanceDto,
        user,
        property,
        status: MaintenanceStatus.PENDING,
        priority: createMaintenanceDto.priority || MaintenancePriority.MEDIUM,
      });

      await this.maintenanceRepository.save(maintenance);

      // Notify property agent
      if (property.agent?.id) {
        await this.notificationService.sendNotification(
          property.agent.id,
          'New Maintenance Request',
          `New request for ${property.title}: ${createMaintenanceDto.title}`,
           NotificationType.MAINTENANCE
        );
      }

      return maintenance;
    } catch (error) {
      this.handleError(error, 'createMaintenance');
    }
  }

  async updateStatus(
    id: string,
    status: MaintenanceStatus,
    resolutionNotes?: Record<string, any>,
  ): Promise<Maintenance> {
    try {
      const maintenance = await this.maintenanceRepository.findOne({
        where: { id },
        relations: ['user', 'property'],
      });

      if (!maintenance) {
        throw new NotFoundException('Maintenance request not found');
      }

      maintenance.status = status;
      if (resolutionNotes) {
        maintenance.resolutionNotes = resolutionNotes;
      }

      await this.maintenanceRepository.save(maintenance);

      // Notify tenant/user
      if (maintenance.user?.id) {
        await this.notificationService.sendNotification(
          maintenance.user.id,
          'Maintenance Update',
          `Your request for ${maintenance.property.title} is now ${status}`,
           NotificationType.MAINTENANCE
        );
      }

      return maintenance;
    } catch (error) {
      this.handleError(error, 'updateMaintenanceStatus');
    }
  }

  private handleError(error: unknown, context: string): never {
    console.error(`Error in MaintenanceService.${context}:`, error);
    throw new InternalServerErrorException('An error occurred. Please try again later.');
  }

  async findAll(): Promise<Maintenance[]> {
  try {
    return await this.maintenanceRepository.find({
      relations: ['user', 'property'],
      order: { createdAt: 'DESC' },
    });
  } catch (error) {
    this.handleError(error, 'findAll');
  }
}

async findByProperty(propertyId: string): Promise<Maintenance[]> {
  try {
    return await this.maintenanceRepository.find({
      where: { property: { id: propertyId } },
      relations: ['user', 'property'],
      order: { createdAt: 'DESC' },
    });
  } catch (error) {
    this.handleError(error, 'findByProperty');
  }
}

async findByUser(userId: string): Promise<Maintenance[]> {
  try {
    return await this.maintenanceRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'property'],
      order: { createdAt: 'DESC' },
    });
  } catch (error) {
    this.handleError(error, 'findByUser');
  }
}

}
