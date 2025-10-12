"use client";

import { ListMusic, Music } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import { SongList } from "@/components/songs/SongList";
import type { Playlist, Song, User } from "@/lib/db/schema";

interface PlaylistWithSongs {
  playlist: Playlist;
  songs: Song[];
}

interface ProfileTabsProps {
  user: User;
  songs: Song[];
  playlists: PlaylistWithSongs[];
}

export function ProfileTabs({ user, songs, playlists }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"tracks" | "playlists">("tracks");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("tracks")}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === "tracks"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Music className="w-4 h-4" />
          Tracks ({songs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("playlists")}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === "playlists"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListMusic className="w-4 h-4" />
          Playlists ({playlists.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tracks" && (
        <div>
          {songs.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No tracks yet
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.username} hasn't uploaded any tracks yet.
              </p>
            </div>
          ) : (
            <SongList songs={songs} showUploader={false} />
          )}
        </div>
      )}

      {activeTab === "playlists" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ListMusic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No playlists yet
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.username} hasn't created any playlists yet.
              </p>
            </div>
          ) : (
            playlists.map(({ playlist, songs }) => (
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
