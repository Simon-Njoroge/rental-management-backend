
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { AuthProviderService } from './auth-provider.service';
import {  AppLogger  } from '../utils/app-logger';

@Injectable()
export class UserService {
  private logger = new AppLogger('UserService');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authProviderService: AuthProviderService,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: createUserDto.email },
          { phoneNumber: createUserDto.phoneNumber },
        ],
      });

      if (existingUser) {
        throw new ConflictException('User with this email or phone already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password!, 12);

      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        isVerified: false,
      });

      await this.userRepository.save(newUser);

      this.logger.log(`User created: ${newUser.email}`);
      return newUser;
    } catch (error) {
      this.handleError(error, 'createUser');
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['authProviders', 'properties', 'bookings'],
      });

      if (!user) throw new NotFoundException('User not found');

      return user;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        relations: ['authProviders', 'properties', 'bookings'],
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  /**
   * Update user info
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findById(id);

      // Prevent email or phone duplication
      if (updateUserDto.email || updateUserDto.phoneNumber) {
        const existing = await this.userRepository.findOne({
          where: [
            { email: updateUserDto.email },
            { phoneNumber: updateUserDto.phoneNumber },
          ],
        });

        if (existing && existing.id !== id) {
          throw new ConflictException('Email or phone already in use');
        }
      }

      // If updating password, hash it
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
      }

      await this.userRepository.update(id, updateUserDto);
      this.logger.log(`User updated: ${id}`);
      return this.findById(id);
    } catch (error) {
      this.handleError(error, 'updateUser');
    }
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('User not found');
      }

      this.logger.log(`User deleted: ${id}`);
    } catch (error) {
      this.handleError(error, 'deleteUser');
    }
  }

  /**
   * Internal error handler
   */
  private handleError(error: any, context: string): never {
    this.logger.error(`Error in ${context}: ${error.message}`, error.stack);

    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    if (error.code === '23505') {
      throw new ConflictException('Duplicate record in database');
    }

    throw new InternalServerErrorException('Something went wrong');
  }
}
