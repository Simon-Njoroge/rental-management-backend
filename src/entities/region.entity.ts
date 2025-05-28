import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { Location } from "./location.entity";

@Entity()
export class Region {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Location, (location) => location.region)
  locations!: Location[];
}