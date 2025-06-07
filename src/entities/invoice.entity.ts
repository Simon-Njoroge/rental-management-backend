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
import { Payment } from "./payment.entity";

export enum InvoiceStatus {
  PENDING = "pending",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  invoiceNumber!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column()
  dueDate!: Date;

  @Column({ type: "enum", enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status!: InvoiceStatus;

  @Column({ nullable: true })
  notes!: string;

  @ManyToOne(() => Booking, (booking) => booking.invoices)
  @JoinColumn({ name: "bookingId" })
  booking!: Booking;

  @OneToOne(() => Payment, (payment) => payment.invoice)
  payment!: Payment;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
