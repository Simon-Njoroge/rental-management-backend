import { Entity,PrimaryGeneratedColumn,Column,OneToMany} from "typeorm";
import { Property } from "./property.entity";
@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  iconUrl?: string;

  @OneToMany(() => Property, (property) => property.category)
  properties!: Property[];
}
