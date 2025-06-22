import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
@Entity()
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // @Column()
  // token!: string;

  @Column()
  ipAddress!: string;

  @Column()
  userAgent!: string;

  @Column()
  expiresAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
