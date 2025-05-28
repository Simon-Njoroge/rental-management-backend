import { Injectable } from "@nestjs/common";
import { UserService } from "./user.service";
import { EmailService } from "../utils/email/email.service";
import { AuthProviderService } from "./auth-provider.service";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private authProviderService: AuthProviderService,
  ) {}

  async handleGoogleRedirect(googleUser: any) {
    const { id: providerId, email, name } = googleUser;

    // 1. Check if provider ID is already linked
    const existing = await this.authProviderService.findByProviderId(
      "google",
      providerId,
    );
    if (existing) {
      return {
        message: "Login successful",
        user: existing.user,
        token: "jwt-token-here",
      };
    }

    // 2. Find user by email (if already signed up via email/password)
    let user = await this.userService.findByEmail(email);

    // 3. If not, create new user with random password
    if (!user) {
      const randomPassword = randomBytes(8).toString("hex");
      const hashed = await bcrypt.hash(randomPassword, 12);

      user = await this.userService.create({
        email,
        fullName: name,
        password: hashed,
        isVerified: true,
        fromGoogle: true,
        nationalId: "N/A",
        username: "user_" + Date.now(),
        phoneNumber: "0000000000",
        location: "Unknown",
      });

      await this.emailService.sendWelcomeEmail(user.email, name);
      await this.emailService.sendPasswordResetEmail(
        user.email,
        randomPassword,
      );
    }

    // 4. Link Google provider to user
    await this.authProviderService.linkProvider(user.id, "google", providerId);

    return {
      message: "Account linked and signed in",
      user,
      token: "jwt-token-here",
    };
  }

  async completeProfile(userId: string, profileData: any) {
    return this.userService.update(userId, profileData);
  }
}
