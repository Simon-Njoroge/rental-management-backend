import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  CLOSED = "closed",
}

@Entity()
export class SupportTicket {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  subject!: string;

  @Column("text")
  message!: string;

  @Column({ type: "enum", enum: TicketStatus, default: TicketStatus.OPEN })
  status!: TicketStatus;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: "userId" })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
