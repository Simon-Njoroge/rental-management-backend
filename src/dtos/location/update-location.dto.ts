import { IsString, IsOptional, IsUUID } from "class-validator";

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;
}