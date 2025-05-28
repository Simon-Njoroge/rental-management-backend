// property-image.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { Property } from "./property.entity";

@Entity()
export class PropertyImage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  altText?: string;

  @Column({ default: 0 })
  order!: number;

  @ManyToOne(() => Property, (property) => property.images, {
    onDelete: "CASCADE",
  })
  property!: Property;
}
