import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Booking } from './booking.entity';
import { Message } from './message.entity';
import { Review } from './review.entity';
import { Maintenance } from './maintenance.entity';
import { Property } from './property.entity';
import { Notification } from './notification.entity'; 

export enum UserRole {
  TENANT = 'tenant',
  AGENT = 'agent',
  ADMIN = 'admin'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  nationalId!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  phoneNumber!: string;

  @Column()
  location!: string;

  @Column({ nullable: true })
  password!: string | null;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ default: false })
  passwordChanged!: boolean;

  @Column({ nullable: true })
  passwordResetToken!: string | null;

  @Column({ nullable: true })
  passwordResetExpires!: Date | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TENANT })
  role!: UserRole;

  @Column({ nullable: true })
  profileImage!: string | null;

  // Relationships
  @OneToMany(() => Booking, booking => booking.user)
  bookings!: Booking[];

  @OneToMany(() => Message, message => message.sender)
  messagesSent!: Message[];

  @OneToMany(() => Message, message => message.receiver)
  messagesReceived!: Message[];

  @OneToMany(() => Review, review => review.user)
  reviews!: Review[];

  @OneToMany(() => Maintenance, maintenance => maintenance.user)
  maintenanceRequests!: Maintenance[];

  @OneToMany(() => Property, property => property.agent)
  properties!: Property[];

  // Add this relationship
  @OneToMany(() => Notification, notification => notification.user)
  notifications!: Notification[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password!);
  }
}