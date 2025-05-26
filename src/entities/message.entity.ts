import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  content!: string;

  @Column({ default: false })
  isFromBot!: boolean;

  @Column({ default: false })
  isRead!: boolean;

  @ManyToOne(() => User, (user) => user.messagesSent)
  sender!: User;

  @ManyToOne(() => User, (user) => user.messagesReceived)
  receiver!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
