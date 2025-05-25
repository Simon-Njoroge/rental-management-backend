import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany
} from 'typeorm';
import { Property } from './property.entity';

@Entity()
export class Amenity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  icon!: string;

  @ManyToMany(() => Property, property => property.amenities)
  properties!: Property[];
}