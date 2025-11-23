"use server";

import { auth } from "@clerk/nextjs/server";
import { eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import type { Song } from "@/lib/db/schema";
import { songs, users } from "@/lib/db/schema";
import { getUserByClerkId } from "./users";

/**
 * Get all songs uploaded by a user
 */
export async function getUserSongs(userId: string): Promise<Song[]> {
  try {
    const result = await db
      .select()
      .from(songs)
      .where(eq(songs.userId, userId))
      .orderBy(songs.createdAt);

    return result;
  } catch (error) {
    console.error("Error getting user songs:", error);
    return [];
  }
}

/**
 * Get user songs by Clerk ID
 */
export async function getUserSongsByClerkId(clerkId: string): Promise<Song[]> {
  try {
    const user = await getUserByClerkId(clerkId);
    if (!user) return [];

    return await getUserSongs(user.id);
  } catch (error) {
    console.error("Error getting user songs by Clerk ID:", error);
    return [];
  }
}

/**
 * Create a new song (server action)
 */
export async function createSong(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const artist = formData.get("artist") as string;
  const description = formData.get("description") as string;
  const genre = formData.get("genre") as string;
  const fileUrl = formData.get("fileUrl") as string;
  const fileKey = formData.get("fileKey") as string;
  const coverArtUrl = formData.get("coverArtUrl") as string;
  const coverArtKey = formData.get("coverArtKey") as string;
  const duration = parseInt(formData.get("duration") as string, 10);

  if (!title || !artist || !fileUrl || !fileKey) {
    throw new Error("Missing required fields");
  }

  // Get the user from database
  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = await db
      .insert(songs)
      .values({
        title: title || "Untitled",
        artist: artist || "Unknown Artist",
        description: description || undefined,
        fileUrl,
        fileKey,
        coverArtUrl: coverArtUrl || undefined,
        coverArtKey: coverArtKey || undefined,
        duration: duration || undefined,
        genre: genre || undefined,
        userId: user.id,
      })
      .returning();

    revalidatePath(`/profile/${user.username}`);

    return result[0];
  } catch (error) {
    console.error("Error creating song:", error);
    throw new Error("Failed to create song");
  }
}

/**
 * Delete a song (server action)
 */
export async function deleteSong(songId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the user from database
  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Get the song to verify ownership and get file keys
  const song = await db
    .select()
    .from(songs)
    .where(eq(songs.id, songId))
    .limit(1);

  if (!song[0]) {
    throw new Error("Song not found");
  }

  if (song[0].userId !== user.id) {
    throw new Error("Access denied");
  }

  try {
    const utapi = new UTApi();

    // Delete files from UploadThing
    const filesToDelete = [];
    if (song[0].fileKey) {
      filesToDelete.push(song[0].fileKey);
    }
    if (song[0].coverArtKey) {
      filesToDelete.push(song[0].coverArtKey);
    }

    if (filesToDelete.length > 0) {
      await utapi.deleteFiles(filesToDelete);
      console.log("Deleted files from UploadThing:", filesToDelete);
    }

    // Delete from database (cascade will handle playlist_songs and likes)
    await db.delete(songs).where(eq(songs.id, songId));

    revalidatePath(`/profile/${user.username}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error deleting song:", error);
    throw new Error("Failed to delete song");
  }
}

/**
 * Get all songs on the platform (for search)
 */
export async function getAllSongs(): Promise<Song[]> {
  try {
    const result = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        description: songs.description,
        fileUrl: songs.fileUrl,
        fileKey: songs.fileKey,
        coverArtUrl: songs.coverArtUrl,
        coverArtKey: songs.coverArtKey,
        duration: songs.duration,
        genre: songs.genre,
        userId: songs.userId,
        createdAt: songs.createdAt,
        updatedAt: songs.updatedAt,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(songs)
      .innerJoin(users, eq(songs.userId, users.id))
      .orderBy(songs.createdAt);

    return result;
  } catch (error) {
    console.error("Error getting all songs:", error);
    return [];
  }
}

/**
 * Get paginated songs for home page
 */
export async function getSongsPaginated(
  offset: number = 0,
  limit: number = 20,
): Promise<{
  songs: Song[];
  hasMore: boolean;
  total: number;
}> {
  try {
    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(songs);

    const total = totalResult[0]?.count || 0;

    // Get paginated songs
    const result = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        description: songs.description,
        fileUrl: songs.fileUrl,
        fileKey: songs.fileKey,
        coverArtUrl: songs.coverArtUrl,
        coverArtKey: songs.coverArtKey,
        duration: songs.duration,
        genre: songs.genre,
        userId: songs.userId,
        createdAt: songs.createdAt,
        updatedAt: songs.updatedAt,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(songs)
      .innerJoin(users, eq(songs.userId, users.id))
      .orderBy(sql`${songs.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    const hasMore = offset + limit < total;

    return {
      songs: result,
      hasMore,
      total,
    };
  } catch (error) {
    console.error("Error getting paginated songs:", error);
    return {
      songs: [],
      hasMore: false,
      total: 0,
    };
  }
}

/**
 * Search songs by title, artist, or genre
 */
export async function searchSongs(query: string): Promise<Song[]> {
  try {
    if (!query.trim()) {
      return await getAllSongs();
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    const result = await db
      .select({
        id: songs.id,
        title: songs.title,
        artist: songs.artist,
        description: songs.description,
        fileUrl: songs.fileUrl,
        fileKey: songs.fileKey,
        coverArtUrl: songs.coverArtUrl,
        coverArtKey: songs.coverArtKey,
        duration: songs.duration,
        genre: songs.genre,
        userId: songs.userId,
        createdAt: songs.createdAt,
        updatedAt: songs.updatedAt,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(songs)
      .innerJoin(users, eq(songs.userId, users.id))
      .where(
        or(
          sql`LOWER(${songs.title}) LIKE ${searchTerm}`,
          sql`LOWER(${songs.artist}) LIKE ${searchTerm}`,
          sql`LOWER(${songs.genre}) LIKE ${searchTerm}`,
        ),
      )
      .orderBy(songs.createdAt);

    return result;
  } catch (error) {
    console.error("Error searching songs:", error);
    return [];
  }
}
