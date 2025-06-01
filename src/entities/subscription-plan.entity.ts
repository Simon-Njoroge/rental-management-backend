import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class SubscriptionPlan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column("decimal")
  price!: number;

  @Column()
  durationInDays!: number;

//   @OneToMany(() => User, (user) => user.subscriptionPlan)
//   users!: User[];
}