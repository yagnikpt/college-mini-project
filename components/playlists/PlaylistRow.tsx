"use client";

import { User } from "lucide-react";
import Link from "next/link";
import type { Playlist, Song, User as UserType } from "@/lib/db/schema";
import { PlaylistCover } from "./PlaylistCover";

interface PlaylistRowProps {
  playlist: Playlist;
  owner: UserType;
  songsCount: number;
  songs: Song[];
  index: number;
}

export function PlaylistRow({
  playlist,
  owner,
  songsCount,
  songs,
  index,
}: PlaylistRowProps) {
  return (
    <Link
      href={`/playlists/${playlist.id}`}
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      {/* Index */}
      <div className="w-8 text-center text-sm text-muted-foreground">
        {index + 1}
      </div>

      {/* Cover/Icon */}
      <div className="w-12 h-12 ml-12 shrink-0">
        <PlaylistCover songs={songs} size="compact" />
      </div>

      {/* Playlist Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{playlist.name}</h4>
        <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
          <span>Playlist</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {owner ? owner.username : "Unknown"}
          </span>
          <span>•</span>
          <span>{songsCount || 0} songs</span>
        </div>
      </div>
    </Link>
  );
}
