// create-user.dto.ts
import { IsString, IsEmail, IsOptional, IsBoolean } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  fromGoogle?: boolean; 
}
