
import { IsEnum, IsDateString, IsOptional, IsString, IsUUID, IsNumber } from 'class-validator';
import { BookingStatus } from '../../entities/booking.entity';

export class CreateBookingDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsUUID()
  userId!: string;

  @IsUUID()
  propertyId!: string;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;
}
