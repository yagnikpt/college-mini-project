"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { NewUser, Playlist, Song, User } from "@/lib/db/schema";
import { playlistSongs, playlists, songs, users } from "@/lib/db/schema";

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
 * Get all playlists created by a user
 */
export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
  try {
    const result = await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(playlists.createdAt);

    return result;
  } catch (error) {
    console.error("Error getting user playlists:", error);
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
 * Get user playlists by Clerk ID
 */
export async function getUserPlaylistsByClerkId(
  clerkId: string,
): Promise<Playlist[]> {
  try {
    const user = await getUserByClerkId(clerkId);
    if (!user) return [];

    return await getUserPlaylists(user.id);
  } catch (error) {
    console.error("Error getting user playlists by Clerk ID:", error);
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
        duration: duration || undefined,
        genre: genre || undefined,
        userId: user.id,
      })
      .returning();

    revalidatePath(`/profile/${user.clerkId}`);

    return result[0];
  } catch (error) {
    console.error("Error creating song:", error);
    throw new Error("Failed to create song");
  }
}

/**
 * Create a new playlist (server action)
 */
export async function createPlaylist(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("isPublic") === "true";

  if (!name) {
    throw new Error("Playlist name is required");
  }

  // Get the user from database
  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = await db
      .insert(playlists)
      .values({
        name,
        description: description || undefined,
        isPublic,
        userId: user.id,
      })
      .returning();

    revalidatePath("/playlists");

    return result[0];
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw new Error("Failed to create playlist");
  }
}

/**
 * Get playlist with songs
 */
export async function getPlaylistWithSongs(playlistId: string): Promise<{
  playlist: Playlist;
  songs: Song[];
  user: User;
} | null> {
  try {
    // Get playlist with user info
    const playlistResult = await db
      .select({
        playlist: playlists,
        user: users,
      })
      .from(playlists)
      .innerJoin(users, eq(playlists.userId, users.id))
      .where(eq(playlists.id, playlistId))
      .limit(1);

    if (!playlistResult[0]) {
      return null;
    }

    // Get songs in playlist
    const songsResult = await db
      .select({
        song: songs,
        addedAt: playlistSongs.addedAt,
      })
      .from(playlistSongs)
      .innerJoin(songs, eq(playlistSongs.songId, songs.id))
      .where(eq(playlistSongs.playlistId, playlistId))
      .orderBy(playlistSongs.addedAt);

    return {
      playlist: playlistResult[0].playlist,
      user: playlistResult[0].user,
      songs: songsResult.map((item) => item.song),
    };
  } catch (error) {
    console.error("Error getting playlist with songs:", error);
    return null;
  }
}

/**
 * Add song to playlist (server action)
 */
export async function addSongToPlaylist(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const playlistId = formData.get("playlistId") as string;
  const songId = formData.get("songId") as string;

  if (!playlistId || !songId) {
    throw new Error("Playlist ID and Song ID are required");
  }

  // Get the user from database
  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify playlist belongs to user
  const playlist = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, playlistId))
    .limit(1);

  if (!playlist[0] || playlist[0].userId !== user.id) {
    throw new Error("Playlist not found or access denied");
  }

  try {
    const result = await db
      .insert(playlistSongs)
      .values({
        playlistId,
        songId,
      })
      .returning();

    revalidatePath(`/playlists/${playlistId}`);

    return result[0];
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    throw new Error("Failed to add song to playlist");
  }
}

/**
 * Remove song from playlist (server action)
 */
export async function removeSongFromPlaylist(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const playlistId = formData.get("playlistId") as string;
  const songId = formData.get("songId") as string;

  if (!playlistId || !songId) {
    throw new Error("Playlist ID and Song ID are required");
  }

  // Get the user from database
  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify playlist belongs to user
  const playlist = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, playlistId))
    .limit(1);

  if (!playlist[0] || playlist[0].userId !== user.id) {
    throw new Error("Playlist not found or access denied");
  }

  try {
    await db
      .delete(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, playlistId),
          eq(playlistSongs.songId, songId),
        ),
      );

    revalidatePath(`/playlists/${playlistId}`);

    return { success: true };
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    throw new Error("Failed to remove song from playlist");
  }
}

/**
 * Get all public playlists
 */
export async function getPublicPlaylists(): Promise<Playlist[]> {
  try {
    const result = await db
      .select()
      .from(playlists)
      .where(eq(playlists.isPublic, true))
      .orderBy(playlists.createdAt);

    return result;
  } catch (error) {
    console.error("Error getting public playlists:", error);
    return [];
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
