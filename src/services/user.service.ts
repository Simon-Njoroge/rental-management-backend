import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../dtos/users/create-user.dto";
import { UpdateUserDto } from "../dtos/users/update-user.dto";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source";
import { createHttpError } from "../utils/errors";
import { sendAccountCreationEmail } from "../utils/email/password";
import { generateRandomPassword } from '../utils/password-generator'; 
import { Logger } from "../utils/logger";
export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

async create(createUserDto: CreateUserDto): Promise<{ success: boolean; message: string; user: User ,timestamp: string }> {
  const existingUser = await this.userRepository.findOne({
    where: [
      { email: createUserDto.email },
      { phoneNumber: createUserDto.phoneNumber },
    ],
  });

  if (existingUser) {
    throw createHttpError(
      409,
      "User with this email or phone already exists",
    );
  }

const generatedPassword =generateRandomPassword();

if (!generatedPassword) {
  throw new Error("Password generation failed");
 
}

console.log("Generated password:", generatedPassword);
const hashedPassword = await bcrypt.hash(generatedPassword, 12);


  const newUser = this.userRepository.create({
    ...createUserDto,
    password: hashedPassword,
    isVerified: false,
    passwordChanged: false,
  });

  const savedUser = await this.userRepository.save(newUser);

  await sendAccountCreationEmail(savedUser.email, generatedPassword);

  Logger.info(`User created with ID: ${savedUser.id}`);
  Logger.info(`Account creation email sent to: ${savedUser.email}`);

  return {
    success: true,
    message: "User created successfully",
    user: savedUser,
    timestamp: new Date().toISOString(),
  };
}
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["authProviders", "properties", "bookings"],
    });

    if (!user) throw createHttpError(404, "User not found");

    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ["authProviders", "properties", "bookings"],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email || updateUserDto.phoneNumber) {
      const existing = await this.userRepository.findOne({
        where: [
          { email: updateUserDto.email },
          { phoneNumber: updateUserDto.phoneNumber },
        ],
      });

      if (existing && existing.id !== id) {
        throw createHttpError(409, "Email or phone already in use");
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw createHttpError(404, "User not found");
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
