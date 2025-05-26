import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class AuthProvider {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  provider!: "google" | "safaricom"; // Add other providers as needed

  @Column()
  providerId!: string; // Unique ID from provider

  @ManyToOne(() => User, (user) => user.authProviders)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
