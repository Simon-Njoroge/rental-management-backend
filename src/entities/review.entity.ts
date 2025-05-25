import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne
} from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int')
  rating!: number;

  @Column('text')
  comment!: string;

  @ManyToOne(() => User, user => user.reviews)
  user!: User;

  @ManyToOne(() => Property, property => property.reviews)
  property!: Property;

  @CreateDateColumn()
  createdAt!: Date;
}