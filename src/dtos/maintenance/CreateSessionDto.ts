// dto/maintenance.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import {
  MaintenanceStatus,
  MaintenancePriority,
} from "../../entities/maintenance.entity";

export class CreateMaintenanceDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsOptional()
  resolutionNotes?: object | null;

  @IsNotEmpty()
  userId!: string;
  
  @IsNotEmpty()
  propertyId!: string;
}
