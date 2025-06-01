import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  getRepository,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { Booking } from "./booking.entity";
import { Message } from "./message.entity";
import { Review } from "./review.entity";
import { Maintenance } from "./maintenance.entity";
import { Property } from "./property.entity";
import { Notification } from "./notification.entity";
import { AuthProvider } from "./auth-provider.entity";
import { Session } from "./session.entity";
import { SubscriptionPlan } from "./subscription-plan.entity";
import { SupportTicket } from "./support-ticket.entity";

export enum UserRole {
  TENANT = "tenant",
  AGENT = "agent",
  ADMIN = "admin",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
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

  @Column("text", { nullable: true })
  password!: string | null;

  // OAuth Identifiers
  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column({ nullable: true, unique: true })
  safaricomId?: string;

  // Verification
  @Column({ default: false })
  isVerified!: boolean;

  @Column({ default: false })
  passwordChanged!: boolean;

  @Column({ type: "text", nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: "text", nullable: true })
  passwordResetExpires!: Date | null;

  @Column({ type: "enum", enum: UserRole, default: UserRole.TENANT })
  role!: UserRole;

  @Column({ type: "text", nullable: true })
  profileImage!: string | null | undefined;

  // Relationships
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings!: Booking[];

  @OneToMany(() => Message, (message) => message.sender)
  messagesSent!: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  messagesReceived!: Message[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];

  @OneToMany(() => Maintenance, (maintenance) => maintenance.user)
  maintenanceRequests!: Maintenance[];

  @OneToMany(() => Property, (property) => property.agent)
  properties!: Property[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => AuthProvider, (provider) => provider.user)
  authProviders!: AuthProvider[];

  // @OneToMany(() => Session, (session) => session.user)
  // sessions!: Session[];

  // @ManyToOne(() => SubscriptionPlan, (plan) => plan.users, { nullable: true, eager: true })
  // subscriptionPlan?: SubscriptionPlan;

  // @OneToMany(() => SupportTicket, (ticket) => ticket.user)
  // tickets!: SupportTicket[];

  // Timestamps
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // Methods
  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password!);
  }

  // OAuth methods
  static async findOrCreateFromGoogle(googleUser: GoogleUser): Promise<User> {
    const userRepository = getRepository(User);
    let user = await userRepository.findOne({
      where: { googleId: googleUser.sub },
    });

    if (!user) {
      user = new User();
      user.googleId = googleUser.sub;
      user.email = googleUser.email;
      user.fullName = googleUser.name;
      user.profileImage = googleUser.picture;
      user.isVerified = true;
      await userRepository.save(user);
    }
    return user;
  }

  static async findOrCreateFromSafaricom(
    phone: string,
    safaricomId: string,
  ): Promise<User> {
    const userRepository = getRepository(User);
    let user = await userRepository.findOne({ where: { phoneNumber: phone } });

    if (!user) {
      user = new User();
      user.safaricomId = safaricomId;
      user.phoneNumber = phone;
      user.isVerified = true;
      await userRepository.save(user);
    }
    return user;
  }
}

interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

