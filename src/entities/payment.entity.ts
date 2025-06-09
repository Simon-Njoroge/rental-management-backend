import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Booking } from "./booking.entity";
import { Invoice } from "./invoice.entity";

export enum PaymentMethod {
  MPESA = "mpesa",
  STRIPE = "stripe",
  BANK_TRANSFER = "bank_transfer",
  CASH = "cash",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column()
  transactionDate!: Date;

  @Column({ unique: true })
  reference!: string;

  @Column({ type: "enum", enum: PaymentMethod })
  method!: PaymentMethod;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ nullable: true })
  paymentDetails!: string;

  @ManyToOne(() => Booking, (booking) => booking.payments)
  @JoinColumn({ name: "bookingId" })
  booking!: Booking;

  @OneToOne(() => Invoice, (invoice) => invoice.payment)
  @JoinColumn({ name: "invoiceId" })
  invoice!: Invoice;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
