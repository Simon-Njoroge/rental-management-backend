import { IsString, IsDecimal, IsInt, Min } from 'class-validator';
export class CreateSubscriptionPlanDto {
  @IsString()
  name!: string;
  @IsDecimal()
  @Min(0)
  price!: number;
  @IsInt()
  @Min(1)
  durationInDays!: number;
}
