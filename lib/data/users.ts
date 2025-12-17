"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import type { NewUser, User } from "@/lib/db/schema";
import { users } from "@/lib/db/schema";

/**
 * Get a user by their Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error getting user by Clerk ID:", error);
    return null;
  }
}

/**
 * Get a user by their database ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

/**
 * Create a new user (used by webhook)
 */
export async function createUser(userData: NewUser): Promise<User | null> {
  try {
    const result = await db.insert(users).values(userData).returning();
    return result[0] || null;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

/**
 * Update user information
 */
export async function updateUser(
  clerkId: string,
  updates: Partial<Omit<User, "id" | "clerkId" | "createdAt">>,
): Promise<User | null> {
  try {
    const result = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.clerkId, clerkId))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

/**
 * Search users by username
 */
export async function searchUsers(query: string): Promise<User[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    const result = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.username}) LIKE ${searchTerm}`)
      .orderBy(users.username)
      .limit(20);

    return result;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

/**
 * Get a user by their username
 */
export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error getting user by username:", error);
    return null;
  }
}
