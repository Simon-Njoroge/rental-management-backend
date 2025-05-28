import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./user.entity";
import { Property } from "./property.entity";

export enum MaintenanceStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum MaintenancePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  EMERGENCY = "emergency",
}

@Entity()
export class Maintenance {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column({
    type: "enum",
    enum: MaintenanceStatus,
    default: MaintenanceStatus.PENDING,
  })
  status!: MaintenanceStatus;

  @Column({
    type: "enum",
    enum: MaintenancePriority,
    default: MaintenancePriority.MEDIUM,
  })
  priority!: MaintenancePriority;

  @Column({ type: "jsonb", nullable: true })
  resolutionNotes!: object | null;

  @ManyToOne(() => User, (user) => user.maintenanceRequests)
  user!: User;

  @ManyToOne(() => Property, (property) => property.maintenanceRequests)
  property!: Property;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
