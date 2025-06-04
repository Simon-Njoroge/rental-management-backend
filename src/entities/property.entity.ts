import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Booking } from "./booking.entity";
import { Amenity } from "./amenity.entity";
import { Review } from "./review.entity";
import type { Maintenance } from "./maintenance.entity";
import { PropertyImage } from "./property-image.entity";
import { Category } from "./category.entity";
import { Location } from "./location.entity";


@Entity()
export class Property {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column()
  address!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  price!: number;

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  latitude!: number;

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  longitude!: number;

  @Column("int")
  bedrooms!: number;

  @Column("int")
  bathrooms!: number;

  @Column("int")
  squareMeters!: number;

  // @Column({ type: "enum", enum: PropertyType })
  // type!: PropertyType;


  @Column({ default: true })
  isAvailable!: boolean;

  @Column({ default: false })
  isFeatured!: boolean;

  @Column("float", { default: 0 })
  rating!: number;

  @ManyToOne(() => User, (user) => user.properties)
  @JoinColumn({name: "agentId"})
  agent!: User;

  @OneToMany(() => Booking, (booking) => booking.property)
  bookings!: Booking[];

  @OneToMany(() => Review, (review) => review.property)
  reviews!: Review[];

  @OneToMany("Maintenance", "property")
  maintenanceRequests!: Maintenance[];

  @OneToMany(() => PropertyImage, (image) => image.property, {
  cascade: true,
  })
  images!: PropertyImage[];

  @ManyToOne(() => Category, (category) => category.properties, {
  nullable: true,
  })
  @JoinColumn({ name: "categoryId" })
  category!: Category;

  @ManyToOne(() => Location, (location) => location.properties, { eager: true })
  @JoinColumn({ name: "locationId" })
  location!: Location;

  @ManyToMany(() => Amenity)
  @JoinTable()
  amenities!: Amenity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
