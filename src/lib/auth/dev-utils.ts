import { UserManager, type User } from "./user-manager";
import { prisma } from "@/lib/prisma";

// Development utility to create test accounts
export async function createTestAccounts() {
  const testAccounts = [
    {
      email: "member@gatherwise.com",
      password: "Password123!",
      name: "John Member",
      role: "MEMBER" as const,
    },
    {
      email: "youth.pastor@gatherwise.com",
      password: "Password123!",
      name: "Sarah Youth Pastor",
      role: "PASTOR" as const,
    },
    {
      email: "finance@gatherwise.com",
      password: "Password123!",
      name: "Mike Finance",
      role: "LEADER" as const,
    },
  ];

  for (const account of testAccounts) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: account.email },
      });

      if (!existingUser) {
        await UserManager.createUser(account);
        console.log(`✅ Created test account: ${account.email}`);
      } else {
        console.log(`ℹ️  Account already exists: ${account.email}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create account ${account.email}:`, error);
    }
  }
}

// Utility to get all users for debugging
export async function listAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany();
  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as User["role"],
    campusId: user.campusId,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    loginAttempts: user.loginAttempts,
    lockedUntil: user.lockedUntil,
    createdAt: user.createdAt,
  }));
}

// Utility to reset login attempts
export async function resetUserLock(email: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { email },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });
    return true;
  } catch {
    return false;
  }
}

// Security audit utility
export async function getSecurityReport() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      loginAttempts: true,
      lockedUntil: true,
      lastLogin: true,
      isActive: true,
    },
  });

  const lockedUsers = users.filter(
    (u) => u.lockedUntil && u.lockedUntil > new Date()
  ).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;
  const totalUsers = users.length;

  return {
    totalUsers,
    activeUsers: totalUsers - inactiveUsers,
    inactiveUsers,
    lockedUsers,
    users: users.map((u) => ({
      email: u.email,
      loginAttempts: u.loginAttempts,
      isLocked: u.lockedUntil ? u.lockedUntil > new Date() : false,
      lastLogin: u.lastLogin?.toISOString(),
      isActive: u.isActive,
    })),
  };
}
