import { IsUUID, IsInt, Min, Max, IsNotEmpty, IsString,IsDecimal } from "class-validator";

export class CreateReviewDto {
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '0,2' })
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
