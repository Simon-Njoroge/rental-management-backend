import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./user.entity";

export enum NotificationType {
  BOOKING = "booking",
  PAYMENT = "payment",
  MAINTENANCE = "maintenance",
  SYSTEM = "system",
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  message!: string;

  @Column({ type: "enum", enum: NotificationType })
  type!: NotificationType;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ type: "text", nullable: true })
  actionUrl!: string | null;

  @ManyToOne(() => User, (user) => user.notifications)
  
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
