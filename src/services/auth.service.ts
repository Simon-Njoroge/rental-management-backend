import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";
import { Session } from "../entities/session.entity";
import { createHttpError } from "../utils/errors";
import { Logger } from "../utils/logger";
import * as bcrypt from "bcryptjs";
import { Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { LoginDto } from "../dtos/users/auth.dto";
import jwt from "jsonwebtoken";
import { sendNewSigninEmail } from "../utils/email/newsignin";
import { AuthProvider } from "../entities/auth-provider.entity";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export class AuthService {
  private userRepository: Repository<User>;
  private sessionRepository: Repository<Session>;
  private authProviderRepository: Repository<AuthProvider>;
 
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.sessionRepository = AppDataSource.getRepository(Session);
    this.authProviderRepository = AppDataSource.getRepository(AuthProvider);
  }

  //verify google token
  async verifyGoogleToken(token: string): Promise<User> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw createHttpError(401, "Invalid Google token");
    }
    const {sub:googleId, email, name,picture} = payload;

    let authProvider = await this.authProviderRepository.findOne({
      where: { providerId: googleId, provider: "google" },
      relations: ["user"],
    });
    if(authProvider && authProvider.user) {
      
      return authProvider.user;
    } 

    // If no user found, create a new one
    let user = await this.userRepository.findOne({
      where: { email },
      select: ["id", "email", "role", "isVerified"],
    });
    if (!user) {
      user = this.userRepository.create({
       firstname: name || "Google",
        email,
        isVerified: true,
        profileImage: picture || "",
      });
     user.role = "user" as User["role"]; 
     user = await this.userRepository.save(user);
    }
    authProvider = this.authProviderRepository.create({
      provider: "google",
      providerId: googleId,
      user,
    });
    await this.authProviderRepository.save(authProvider);
    Logger.info(`User ${user.email} logged in with Google. AuthProvider: ${authProvider.id}`);
    //token generation
 
    return user;
  }

  private generateTokens(
    user: User,
    sessionId: string
  ): { accessToken: string; refreshToken: string } {
    const payload = { sub: user.id, sessionId, role: user.role };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  }

  async login(
    loginDto: LoginDto,
    req: Request,
    res: Response
  ): Promise<{
    success: boolean;
    message: string;
    requiresConfirmation?: boolean;
  }> {
    const user = await this.userRepository.findOneOrFail({
      where: { email: loginDto.email },
      select: ["id", "email", "password", "isVerified", "role"],
    });

    if (!user?.email) {
      throw createHttpError(401, "user with email not found");
    }

    if (!user.password) {
      throw createHttpError(401, "User password not set");
    }

    // const isPasswordValid = await bcrypt.compare(
    //   loginDto.password,
    //   user.password
    // );

    // if (!isPasswordValid) {
    //   throw createHttpError(401, "Invalid  password");
    // }
    // console.log('Password valid:', isPasswordValid);
    // if (!user.isVerified) {
    //   throw createHttpError(403, "User is not verified");
    // }

    //check if user is logged in another device
    const existingSession = await this.sessionRepository.findOne({
      where: { user: { id: user.id } },
      relations: ["user"],
    });

   
    const forceLogin = req.body.forceLogin === true;

    if (existingSession && !forceLogin) {
      // Do NOT remove session or create a new one yet
      return {
        success: false,
        message:
          "You are already logged in on another device. Do you want to continue here and log out from the other device?",
        requiresConfirmation: true,
      };
    }
     
    if (existingSession) {
      // If user is already logged in, remove the existing session
      await this.sessionRepository.remove(existingSession);
      Logger.info(
        `User ${user.email} logged in from a new device. Previous session removed.`
      );

      // Optionally, you can also clear cookies or perform other actions here
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      // If you want to return a message indicating the previous session was removed
      // you can do so here
      // but in this case, we just return a success message
      // and proceed to create a new session
      //create a new session
      const session = await this.sessionRepository.create({
        id: uuidv4(),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      session.user = user;
      await this.sessionRepository.save(session);
      await sendNewSigninEmail(user.email, user, session);
      const { accessToken, refreshToken } = this.generateTokens(
        user,
        session.id
      );

      res.cookie("acessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("resfreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        success: true,
        message: existingSession
          ? "User logged in from a new device. Previous session removed and new session created."
          : "User logged in and session created.",
      };
    }

    const session = await this.sessionRepository.create({
      id: uuidv4(),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    session.user = user;
    await this.sessionRepository.save(session);

    const { accessToken, refreshToken } = this.generateTokens(user, session.id);

    res.cookie("acessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("resfreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    Logger.info(`User ${user.email} logged in. Session: ${session.id}`);
    return {
      success: true,
      message: "login succesful",
    };
  }

  async logout(sessionId: string, res: Response): Promise<{ message: string }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (session) {
      await this.sessionRepository.remove(session);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    Logger.info(`User logged out. Session: ${sessionId}`);
    return {
      message: "Logout successful",
    };
  }

  async refreshTokens(
    req: Request,
    res: Response
  ): Promise<{ success: boolean; message: string }> {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken) {
      throw createHttpError(401, "Refresh token is missing");
    }
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      throw createHttpError(401, "Invalid refresh token");
    }
    const session = await this.sessionRepository.findOne({
      where: { id: payload.sessionId },
      relations: ["user"],
    });
    if (!session) {
      throw createHttpError(401, "Session not found");
    }
    const user = session.user;
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
      user,
      session.id
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    Logger.info(`User ${user.email} refreshed tokens. Session: ${session.id}`);
    return {
      success: true,
      message: "Tokens refreshed successfully",
    };
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["id", "email", "role", "isVerified"],
      relations: [
        "bookings",
        "properties",
        "reviews",
        "supportTickets",
        "maintenanceRequests",
        "notifications",
      ],
    });

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    return user;
  }
}
