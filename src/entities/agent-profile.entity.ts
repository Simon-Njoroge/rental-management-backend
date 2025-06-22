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

  @OneToOne(() => User)
  @JoinColumn({name: 'userId'})
  user!: User;
}