import { IsString, IsOptional, IsUUID, IsInt, Min } from "class-validator";

export class CreatePropertyImageDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsUUID()
  propertyId!: string; 
}

export class UpdatePropertyImageDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
