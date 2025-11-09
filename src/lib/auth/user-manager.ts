import bcrypt from "bcryptjs";
import { PasskeyManager } from "./passkey-manager";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "CHURCH_ADMIN" | "PASTOR" | "LEADER" | "MEMBER";
  campusId?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
  loginAttempts: number;
  lockedUntil?: Date | null;
  createdAt: Date;
}

export interface LoginAttempt {
  email: string;
  timestamp: Date;
  success: boolean;
  ip?: string;
}

export interface SecurityValidation {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export function validatePassword(password: string): SecurityValidation {
  const errors: string[] = [];
  let strength: "weak" | "medium" | "strong" = "weak";

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  if (errors.length === 0) {
    strength = "strong";
  } else if (errors.length <= 2) {
    strength = "medium";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

export class UserManager {
  static async authenticateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    console.log("[UserManager] authenticateUser called for email:", email);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log(
      "[UserManager] User lookup result:",
      user ? `Found user: ${user.email}` : "User not found"
    );

    if (!user || !user.passwordHash) {
      console.log("[UserManager] No user or no password hash");
      return null;
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      console.log("[UserManager] Account is locked");
      throw new Error(
        `Account locked until ${user.lockedUntil.toLocaleString()}`
      );
    }

    if (!user.isActive) {
      console.log("[UserManager] Account is not active");
      throw new Error("Account is deactivated");
    }

    console.log("[UserManager] Comparing password with hash...");
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log("[UserManager] Password comparison result:", isValidPassword);

    if (!isValidPassword) {
      console.log(
        "[UserManager] Invalid password - incrementing login attempts"
      );
      await this.incrementLoginAttempts(user.id);
      return null;
    }

    console.log(
      "[UserManager] Authentication successful - resetting login attempts"
    );
    await this.resetLoginAttempts(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      name: user.name || "",
      role: user.role as User["role"],
    };
  }

  static async authenticateUserWithPasskey(
    email?: string
  ): Promise<User | null> {
    try {
      const result = await PasskeyManager.startAuthentication(email);

      if (result.success && result.user) {
        const user = await prisma.user.findUnique({
          where: { email: result.user.email },
        });

        if (user && user.isActive) {
          await this.resetLoginAttempts(user.id);
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          const { passwordHash, ...userWithoutPassword } = user;
          return {
            ...userWithoutPassword,
            name: user.name || "",
            role: user.role as User["role"],
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Passkey authentication error:", error);
      return null;
    }
  }

  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role:
      | "SUPER_ADMIN"
      | "CHURCH_ADMIN"
      | "PASTOR"
      | "LEADER"
      | "MEMBER"
      | "admin"
      | "pastor"
      | "staff"
      | "member";
    campusId?: string;
    organizationId?: string;
    organizationName?: string;
  }): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    let organizationId = userData.organizationId;

    if (!organizationId) {
      organizationId = await this.generateUniqueOrganizationId();
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);

    let role: UserRole = UserRole.MEMBER;
    if (userData.role === "admin" || userData.role === "SUPER_ADMIN") {
      role = UserRole.SUPER_ADMIN;
    } else if (userData.role === "CHURCH_ADMIN") {
      role = UserRole.CHURCH_ADMIN;
    } else if (userData.role === "pastor" || userData.role === "PASTOR") {
      role = UserRole.PASTOR;
    } else if (userData.role === "staff" || userData.role === "LEADER") {
      role = UserRole.LEADER;
    }

    const newUser = await prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        passwordHash,
        name: userData.name,
        role,
        campusId: userData.campusId,
        organizationId,
        organizationName: userData.organizationName,
        isActive: true,
        loginAttempts: 0,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return {
      ...userWithoutPassword,
      name: newUser.name || "",
      role: newUser.role as User["role"],
    };
  }

  private static async generateUniqueOrganizationId(): Promise<string> {
    const year = new Date().getFullYear();
    let orgId: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      const random = Math.random().toString(36).substr(2, 9).toUpperCase();
      orgId = `GW-${year}-${random}`;
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error("Unable to generate unique organization ID");
      }

      const existing = await prisma.user.findFirst({
        where: { organizationId: orgId },
      });

      if (!existing) break;
    } while (true);

    return orgId;
  }

  static async updateUser(
    userId: string,
    updates: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<User | null> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updates as any,
    });

    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      name: user.name || "",
      role: user.role as User["role"],
    };
  }

  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      return false;
    }

    const isValidOldPassword = await bcrypt.compare(
      oldPassword,
      user.passwordHash
    );

    if (!isValidOldPassword) {
      return false;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return true;
  }

  static async getUserById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      name: user.name || "",
      role: user.role as User["role"],
    };
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      name: user.name || "",
      role: user.role as User["role"],
    };
  }

  private static async incrementLoginAttempts(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const newAttempts = user.loginAttempts + 1;
    const maxAttempts = 5;

    const updateData: any = {
      loginAttempts: newAttempts,
    };

    if (newAttempts >= maxAttempts) {
      const lockDuration = 30 * 60 * 1000;
      updateData.lockedUntil = new Date(Date.now() + lockDuration);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  private static async resetLoginAttempts(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  static getRecentLoginAttempts(email: string, minutes: number = 15): number {
    return 0;
  }

  private static recordLoginAttempt(
    email: string,
    success: boolean,
    ip?: string
  ): void {}
}
