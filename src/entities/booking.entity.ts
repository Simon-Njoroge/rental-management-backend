import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Property } from "./property.entity";
import { Invoice } from "./invoice.entity";
import { Payment } from "./payment.entity";

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "enum", enum: BookingStatus, default: BookingStatus.PENDING })
  status!: BookingStatus;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column("decimal", { precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ nullable: true })
  specialRequests!: string;

  @ManyToOne(() => User, (user) => user.bookings)
  user!: User;

  @ManyToOne(() => Property, (property) => property.bookings)
  property!: Property;

  @OneToMany(() => Invoice, (invoice) => invoice.booking)
  invoices!: Invoice[];

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments!: Payment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
