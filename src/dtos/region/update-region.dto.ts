import { IsString, IsOptional } from "class-validator";

export class UpdateRegionDto {
  @IsOptional()
  @IsString()
  name?: string;
}