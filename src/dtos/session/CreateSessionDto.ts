// src/dtos/CreateSessionDto.ts
import { IsUUID, IsString, IsDateString, IsNotEmpty } from "class-validator";

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsString()
  ipAddress!: string;

  @IsNotEmpty()
  @IsString()
  userAgent!: string;

  @IsNotEmpty()
  @IsDateString()
  expiresAt!: Date;

  @IsNotEmpty()
  @IsUUID()
  userId!: string;
}
