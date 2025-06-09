import { PaymentMethod, PaymentStatus } from '../../entities/payment.entity';

export class PaymentResponseDto {
  id!: string;
  amount!: number;
  transactionDate!: Date;
  reference!: string;
  method!: PaymentMethod;
  status!: PaymentStatus;
  paymentDetails?: string;
  bookingId!: string;
  invoiceId?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
