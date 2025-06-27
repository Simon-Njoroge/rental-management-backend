import { Repository } from "typeorm";
import { AuthProvider } from "../entities/auth-provider.entity";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";

export class AuthProviderService {
  private providerRepository = AppDataSource.getRepository(AuthProvider);

  async createProvider(
    user: User,
    provider: "google" | "safaricom",
    providerId: string,
  ): Promise<AuthProvider> {
    const authProvider = this.providerRepository.create({
      user,
      provider,
      providerId,
    });

    return await this.providerRepository.save(authProvider);
  }

  async findByProviderId(provider: "google" | "safaricom", providerId: string) {
    return this.providerRepository.findOne({
      where: { provider, providerId },
      relations: ["user"],
    });
  }

  async getProvidersForUser(userId: string): Promise<AuthProvider[]> {
    return this.providerRepository.find({
      where: { user: { id: userId } },
    });
  }
}
