"use client";

import { useUser } from "@clerk/nextjs";
import { ListMusic } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserPlaylistsWithSongsByClerkId } from "@/lib/data/playlists";
import type { Playlist, Song } from "@/lib/db/schema";
import PlaylistCard from "./PlaylistCard";

interface PlaylistWithSongs {
  playlist: Playlist;
  songs: Song[];
  songsCount: number;
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
      {playlists.map(({ playlist, songs, songsCount }) => (
        <PlaylistCard
          playlist={playlist}
          songs={songs}
          songsCount={songsCount}
          key={playlist.id}
        />
      ))}
    </div>
  );
}
