import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  transactionDate!: Date;

  @IsString()
  @IsNotEmpty()
  reference!: string;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus = PaymentStatus.PENDING;

  @IsString()
  @IsOptional()
  paymentDetails?: string;

  @IsUUID()
  bookingId!: string;

  @IsUUID()
  @IsOptional()
  invoiceId?: string;
}
