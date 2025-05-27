import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceDto } from './CreateSessionDto';

export class UpdateMaintenanceDto extends PartialType(CreateMaintenanceDto) {}
