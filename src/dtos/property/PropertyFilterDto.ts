import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { PropertyType } from '../../entities/property.entity';

export class PropertyFilterDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;
}
