import { IsString, IsNotEmpty } from 'class-validator';
export class CreateSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
