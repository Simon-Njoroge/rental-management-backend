import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Region } from "./region.entity";
import { Property } from "./property.entity";

@Entity()
export class Location {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Region, (region) => region.locations)
  @JoinColumn({ name: "regionId" })
  region!: Region;

  @OneToMany(() => Property, (property) => property.location)
  properties!: Property[];
}