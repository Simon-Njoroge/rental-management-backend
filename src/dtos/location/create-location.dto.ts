import { IsString, IsNotEmpty, IsUUID } from "class-validator";

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  regionId!: string;
}