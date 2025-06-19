// create-user.dto.ts
import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  firstname!: string;

  @IsString()
  middlename!: string;

  @IsString()
  lastname!: string;

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

  @IsUUID()
  @IsOptional()
  subscriptionPlanId?: string;
}
