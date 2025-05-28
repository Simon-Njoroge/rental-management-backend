import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class AgentProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  bio!: string;

  @Column({ nullable: true })
  profileImage!: string;

  @OneToOne(() => User)
  @JoinColumn()
  user!: User;
}