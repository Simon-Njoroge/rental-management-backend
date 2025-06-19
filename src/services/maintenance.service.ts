import { Repository } from "typeorm";
import { Maintenance } from "../entities/maintenance.entity";
import { CreateMaintenanceDto } from "../dtos/maintenance/CreateSessionDto";
import { AppDataSource } from "../config/data-source";
import { UpdateMaintenanceDto } from "../dtos/maintenance/UpdateDto";
import { User } from "../entities/user.entity";
import { Property } from "../entities/property.entity";
import { Logger } from "../utils/logger";


export class MaintenanceService {
  private maintenanceRepository: Repository<Maintenance>;

  constructor() {
    this.maintenanceRepository = AppDataSource.getRepository(Maintenance);
  }

  async createMaintenance(
    createMaintenanceDto: CreateMaintenanceDto
  ): Promise<Maintenance> {
    try {
      const user = await AppDataSource.getRepository(User).findOneBy({ id: createMaintenanceDto.userId });
      if (!user) {
        throw new Error("User not found");
      }
      const property = await AppDataSource.getRepository(Property).findOneBy({ id: createMaintenanceDto.propertyId });
      if (!property) {
        throw new Error("Property not found");
      }
      const maintenance = this.maintenanceRepository.create(createMaintenanceDto);
      maintenance.user = user;
      maintenance.property = property;
      return await this.maintenanceRepository.save(maintenance);
    } catch (error) {
      Logger.error("Error creating maintenance request", error);
      throw new Error("Failed to create maintenance request");
    }
  }

  async getAllMaintenances(): Promise<Maintenance[]> {
    try {
      return await this.maintenanceRepository.find({
        relations: ["user", "property"],
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      Logger.error("Error fetching all maintenance requests", error);
      throw new Error("Failed to fetch maintenance requests");
    }
  }

  async getMaintenanceById(id: string): Promise<Maintenance | null> {
    try {
      return await this.maintenanceRepository.findOneBy({ id });
    } catch (error) {
      Logger.error("Error fetching maintenance request", error);
      throw new Error("Failed to fetch maintenance request");
    }
  }

  async updateMaintenance(
    id: string,
    updateMaintenanceDto: UpdateMaintenanceDto
  ): Promise<Maintenance | null> {
    try {
      const existingMaintenance = await this.getMaintenanceById(id);
      if (!existingMaintenance) {
        throw new Error("Maintenance request not found");
      }
      if (updateMaintenanceDto.userId) {
        const user = await AppDataSource.getRepository(User).findOneBy({ id: updateMaintenanceDto.userId });
        if (!user) {
          throw new Error("User not found");
        }
        existingMaintenance.user = user;
      }
      if (updateMaintenanceDto.propertyId) {
        const property = await AppDataSource.getRepository(Property).findOneBy({ id: updateMaintenanceDto.propertyId });
        if (!property) {
          throw new Error("Property not found");
        }
        existingMaintenance.property = property;
      }
      await this.maintenanceRepository.update(id, updateMaintenanceDto);
      return this.getMaintenanceById(id);
    } catch (error) {
      Logger.error("Error updating maintenance request", error);
      throw new Error("Failed to update maintenance request");
    }
  }

  async deleteMaintenance(id: string): Promise<void> {
    try {
      await this.maintenanceRepository.delete(id);
    } catch (error) {
      Logger.error("Error deleting maintenance request", error);
      throw new Error("Failed to delete maintenance request");
    }
  }
}