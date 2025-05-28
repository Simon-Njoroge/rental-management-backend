import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthProvider } from "../entities/auth-provider.entity";
import { User } from "../entities/user.entity";

@Injectable()
export class AuthProviderService {
  constructor(
    @InjectRepository(AuthProvider)
    private authProviderRepository: Repository<AuthProvider>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async linkProvider(
    userId: string,
    provider: "google" | "safaricom",
    providerId: string,
  ): Promise<AuthProvider> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const existing = await this.authProviderRepository.findOne({
      where: { provider, providerId },
    });

    if (existing) return existing;

    const newProvider = this.authProviderRepository.create({
      provider,
      providerId,
      user,
    });

    return this.authProviderRepository.save(newProvider);
  }

  async findByProviderId(
    provider: "google" | "safaricom",
    providerId: string,
  ): Promise<AuthProvider | null> {
    return this.authProviderRepository.findOne({
      where: { provider, providerId },
      relations: ["user"],
    });
  }

  async getUserProviders(userId: string): Promise<AuthProvider[]> {
    return this.authProviderRepository.find({
      where: { user: { id: userId } },
    });
  }
}
