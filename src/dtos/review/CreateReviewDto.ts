import { IsUUID, IsInt, Min, Max, IsNotEmpty, IsString } from "class-validator";

export class CreateReviewDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsNotEmpty()
  @IsString()
  comment!: string;

  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsNotEmpty()
  @IsUUID()
  propertyId!: string;
}
