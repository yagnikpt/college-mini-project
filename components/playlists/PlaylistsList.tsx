"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Calendar, ListMusic, Play, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserPlaylistsByClerkId } from "@/lib/data/user";
import type { Playlist } from "@/lib/db/schema";

export function PlaylistsList() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!user?.id) return;

      try {
        const userPlaylists = await getUserPlaylistsByClerkId(user.id);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="bg-card rounded-lg p-6 group hover:shadow-lg transition-shadow"
        >
          {/* Playlist Cover */}
          <div className="aspect-square bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ListMusic className="w-12 h-12 text-white" />
          </div>

          {/* Playlist Info */}
          <h3 className="text-lg font-semibold mb-2 truncate">
            {playlist.name}
          </h3>

          {playlist.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {playlist.description}
            </p>
          )}

          {/* Playlist Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{playlist.isPublic ? "Public" : "Private"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(playlist.createdAt)}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            as={Link}
            href={`/playlists/${playlist.id}`}
            color="primary"
            variant="flat"
            size="sm"
            className="w-full"
            startContent={<Play className="w-3 h-3" />}
          >
            View Playlist
          </Button>
        </div>
      ))}
    </div>
  );
}
