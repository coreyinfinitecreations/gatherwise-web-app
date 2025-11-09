import { UserManager, type User } from "./user-manager";

// Development utility to create test accounts
export async function createTestAccounts() {
  const testAccounts = [
    {
      email: "member@gatherwise.com",
      password: "Password123!",
      name: "John Member",
      role: "member" as const,
    },
    {
      email: "youth.pastor@gatherwise.com",
      password: "Password123!",
      name: "Sarah Youth Pastor",
      role: "pastor" as const,
    },
    {
      email: "finance@gatherwise.com",
      password: "Password123!",
      name: "Mike Finance",
      role: "staff" as const,
    },
  ];

  for (const account of testAccounts) {
    try {
      const existingUser = UserManager.getUserByEmail(account.email);
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
export function listAllUsers(): User[] {
  return UserManager.getUsers();
}

// Utility to reset login attempts
export function resetUserLock(email: string): boolean {
  const user = UserManager.getUserByEmail(email);
  if (user) {
    UserManager.updateUser(user.id, {
      loginAttempts: 0,
      lockedUntil: undefined,
    });
    return true;
  }
  return false;
}

// Security audit utility
export function getSecurityReport() {
  const metrics = UserManager.getSecurityMetrics();
  const recentAttempts = UserManager.getLoginAttempts(undefined, 10);

  return {
    ...metrics,
    recentAttempts: recentAttempts.map((attempt) => ({
      email: attempt.email,
      timestamp: attempt.timestamp.toISOString(),
      success: attempt.success,
    })),
  };
}
