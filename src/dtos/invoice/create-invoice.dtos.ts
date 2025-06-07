import { IsUUID, IsNumber, IsOptional, IsEnum, IsDateString, IsString } from "class-validator";
import { InvoiceStatus } from "../../entities/invoice.entity";

export class CreateInvoiceDto {
  @IsUUID()
  bookingId!: string;

  @IsString()
  invoiceNumber!: string;

  @IsNumber()
  amount!: number;

  @IsDateString()
  dueDate!: Date;

  @IsEnum(InvoiceStatus)
  status!: InvoiceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
