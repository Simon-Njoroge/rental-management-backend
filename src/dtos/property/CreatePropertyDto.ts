// src/dtos/property.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUUID,
  ArrayNotEmpty,
} from "class-validator";
import { PropertyType } from "../../entities/property.entity";

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsInt()
  bedrooms!: number;

  @IsInt()
  bathrooms!: number;

  @IsInt()
  squareMeters!: number;

  @IsEnum(PropertyType)
  type!: PropertyType;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  images!: string[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsUUID()
  agentId!: string;

  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  amenities?: string[];

  @IsOptional()
  rating?:number
}
