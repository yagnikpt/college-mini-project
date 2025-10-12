"use client";

import { useUser } from "@clerk/nextjs";
import { ListMusic } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserPlaylistsWithSongsByClerkId } from "@/lib/data/user";
import type { Playlist, Song } from "@/lib/db/schema";
import { PlaylistCover } from "./PlaylistCover";

interface PlaylistWithSongs {
  playlist: Playlist;
  songs: Song[];
}

export function PlaylistsList() {
  const [playlists, setPlaylists] = useState<PlaylistWithSongs[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!user?.id) return;

      try {
        const userPlaylists = await getUserPlaylistsWithSongsByClerkId(user.id);
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error("Error loading playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, [user?.id]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {["a", "b", "c", "d", "e", "f"].map((key) => (
          <div
            key={`playlist-skeleton-${key}`}
            className="bg-card rounded-lg p-6 animate-pulse"
          >
            <div className="w-full h-32 bg-muted rounded-lg mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12">
        <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium text-muted-foreground mb-2">
          No playlists yet
        </h3>
        <p className="text-muted-foreground mb-6">
          Create your first playlist to start organizing your music
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {playlists.map(({ playlist, songs }) => (
        <Link
          href={`/playlists/${playlist.id}`}
          key={playlist.id}
          className="group bg-card rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
        >
          {/* Playlist Cover */}
          <div className="mb-4">
            <PlaylistCover songs={songs} />
          </div>

          {/* Playlist Info */}
          <h3 className="font-medium text-foreground mb-1 truncate">
            {playlist.name}
          </h3>
          {playlist.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {playlist.description}
            </p>
          )}

          {/* Playlist Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{playlist.isPublic ? "Public" : "Private"}</span>
            <span>{formatDate(playlist.createdAt)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
