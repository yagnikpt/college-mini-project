"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { Playlist, Song, User } from "@/lib/db/schema";
import { playlistSongs, playlists, songs, users } from "@/lib/db/schema";
import { getUserByClerkId } from "./users";

// Helper function to get user playlists (internal or exported if needed elsewhere)
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
 * Get user playlists by Clerk ID with first 4 songs for cover display
 */
export async function getUserPlaylistsWithSongsByClerkId(
  clerkId: string,
): Promise<
  Array<{
    playlist: Playlist;
    songs: Song[];
    songsCount: number;
  }>
> {
  try {
    const user = await getUserByClerkId(clerkId);
    if (!user) return [];

    const playlists = await getUserPlaylists(user.id);

    // For each playlist, get the first 4 songs
    const playlistsWithSongs = await Promise.all(
      playlists.map(async (playlist) => {
        const songsCount = await db.$count(
          playlistSongs,
          eq(playlistSongs.playlistId, playlist.id),
        );

        const songsResult = await db
          .select({
            song: songs,
            addedAt: playlistSongs.addedAt,
          })
          .from(playlistSongs)
          .innerJoin(songs, eq(playlistSongs.songId, songs.id))
          .where(eq(playlistSongs.playlistId, playlist.id))
          .orderBy(playlistSongs.addedAt)
          .limit(4);

        return {
          playlist,
          songs: songsResult.map((item) => item.song),
          songsCount,
        };
      }),
    );

    return playlistsWithSongs;
  } catch (error) {
    console.error(
      "Error getting user playlists with songs by Clerk ID:",
      error,
    );
    return [];
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
 * Delete a playlist (server action)
 */
export async function deletePlaylist(playlistId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
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
    // Delete playlist (cascade will handle playlist_songs)
    await db.delete(playlists).where(eq(playlists.id, playlistId));

    revalidatePath("/playlists");
    revalidatePath(`/profile/${user.username}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting playlist:", error);
    throw new Error("Failed to delete playlist");
  }
}

/**
 * Update a playlist (server action)
 */
export async function updatePlaylist(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const playlistId = formData.get("playlistId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("isPublic") === "true";

  console.log(description);

  if (!playlistId || !name) {
    throw new Error("Playlist ID and name are required");
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
      .update(playlists)
      .set({
        name,
        description: description || null,
        isPublic,
        updatedAt: new Date(),
      })
      .where(eq(playlists.id, playlistId))
      .returning();

    revalidatePath("/playlists");
    revalidatePath(`/playlists/${playlistId}`);
    revalidatePath(`/profile/${user.username}`);

    return result[0];
  } catch (error) {
    console.error("Error updating playlist:", error);
    throw new Error("Failed to update playlist");
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
 * Get user playlists by Clerk ID (without songs for efficiency)
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
