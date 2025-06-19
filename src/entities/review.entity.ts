import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Property } from "./property.entity";

@Entity()
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({type: "decimal", precision: 2, scale: 1})
  rating!: number;

  @Column("text")
  comment!: string;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Property, (property) => property.reviews)
  @JoinColumn({ name: "propertyId" })
  property!: Property;

  @CreateDateColumn()
  createdAt!: Date;
}
