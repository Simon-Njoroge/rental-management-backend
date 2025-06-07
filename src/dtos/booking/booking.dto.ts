import {
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsObject
} from "class-validator";
import { BookingStatus } from "../../entities/booking.entity";

export class CreateBookingDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  propertyId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  totalAmount!: number;

 @IsOptional()
 @IsObject()
 specialRequests?: Record<string, any>;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
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
