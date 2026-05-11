import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { AdminUserDocument, AdminUserRole } from "@/types/admin-user";
import { getDatabase } from "./mongodb";

const collectionName = "admin_users";

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, expectedHash] = passwordHash.split(":");

  if (!salt || !expectedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const actualBuffer = Buffer.from(derivedKey, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

async function getAdminUsersCollection() {
  const database = await getDatabase();
  return database.collection<AdminUserDocument>(collectionName);
}

let cachedHasRegisteredAdminUsers: boolean | null = null;

export async function hasRegisteredAdminUsers() {
  if (cachedHasRegisteredAdminUsers === true) {
    return true;
  }
  const collection = await getAdminUsersCollection();
  const count = await collection.countDocuments({}, { limit: 1 });
  const hasUsers = count > 0;
  if (hasUsers) {
    cachedHasRegisteredAdminUsers = true;
  }
  return hasUsers;
}

export async function hasAdminUsers() {
  const collection = await getAdminUsersCollection();
  const count = await collection.countDocuments(
    {
      $or: [{ role: "admin" }, { role: { $exists: false } }],
    },
    { limit: 1 },
  );
  return count > 0;
}

export async function findAdminUserByUsername(username: string) {
  const collection = await getAdminUsersCollection();
  return collection.findOne({
    username: username.trim().toLowerCase(),
  });
}

export function getAdminUserRole(user: AdminUserDocument | null) {
  if (!user) {
    return null;
  }

  return user.role ?? "admin";
}

export function getAdminUserBalance(user: AdminUserDocument | null) {
  if (!user || typeof user.balance !== "number" || Number.isNaN(user.balance)) {
    return 0;
  }

  return user.balance;
}

export async function createAdminUser(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const existingUser = await findAdminUserByUsername(normalizedUsername);

  if (existingUser) {
    return {
      success: false as const,
      message: "Username da ton tai",
    };
  }

  const isFirstUser = !(await hasRegisteredAdminUsers());
  const now = new Date();
  const collection = await getAdminUsersCollection();

  await collection.insertOne({
    username: normalizedUsername,
    passwordHash: hashPassword(password),
    role: isFirstUser ? "admin" : "user",
    balance: 0,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true as const };
}

export async function verifyAdminCredentials(username: string, password: string) {
  const user = await findAdminUserByUsername(username);

  if (!user) {
    return false;
  }

  return verifyPassword(password, user.passwordHash);
}

export async function deductAdminUserBalance(username: string, amount: number) {
  if (amount <= 0) {
    return false;
  }

  const collection = await getAdminUsersCollection();
  const result = await collection.updateOne(
    {
      username: username.trim().toLowerCase(),
      balance: { $gte: amount },
    },
    {
      $inc: { balance: -amount },
      $set: { updatedAt: new Date() },
    },
  );

  return result.modifiedCount === 1;
}

export async function refundAdminUserBalance(username: string, amount: number) {
  if (amount <= 0) return false;
  const collection = await getAdminUsersCollection();
  const result = await collection.updateOne(
    { username: username.trim().toLowerCase() },
    {
      $inc: { balance: amount },
      $set: { updatedAt: new Date() },
    },
  );
  return result.modifiedCount === 1;
}

export async function listAdminUsers() {
  const collection = await getAdminUsersCollection();
  const users = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return users;
}

export async function updateAdminUserBalance(username: string, balance: number) {
  const collection = await getAdminUsersCollection();
  const result = await collection.updateOne(
    { username: username.trim().toLowerCase() },
    {
      $set: {
        balance,
        updatedAt: new Date(),
      },
    },
  );
  return result.modifiedCount === 1;
}

export async function updateAdminUserRole(username: string, role: AdminUserRole) {
  const collection = await getAdminUsersCollection();
  const result = await collection.updateOne(
    { username: username.trim().toLowerCase() },
    {
      $set: {
        role,
        updatedAt: new Date(),
      },
    },
  );
  return result.modifiedCount === 1;
}

export async function deleteAdminUser(username: string) {
  const collection = await getAdminUsersCollection();
  const result = await collection.deleteOne({
    username: username.trim().toLowerCase(),
  });
  return result.deletedCount === 1;
}
