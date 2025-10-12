"use client";

import { ListMusic, Play } from "lucide-react";
import Image from "next/image";
import type { Song } from "@/lib/db/schema";

interface PlaylistCoverProps {
  songs: Song[];
  size?: "sm" | "md" | "lg" | "auto";
}

export function PlaylistCover({ songs, size = "auto" }: PlaylistCoverProps) {
  const sizeClasses = {
    sm: "size-16",
    md: "size-48",
    lg: "size-64",
    auto: "size-full",
  };

  const iconSizes = {
    sm: "size-6",
    md: "size-16",
    lg: "size-20",
    auto: "size-20",
  };

  const gridIconSizes = {
    sm: "size-2",
    md: "size-4",
    lg: "size-6",
    auto: "size-full",
  };

  if (songs.length === 0) {
    // No songs - show default icon
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center`}
      >
        <ListMusic className={`${iconSizes[size]} text-white`} />
      </div>
    );
  }

  if (songs.length < 4) {
    // Less than 4 songs - show first song's cover
    const firstSong = songs[0];
    if (firstSong.coverArtUrl) {
      return (
        <div className={`${sizeClasses[size]} rounded-lg overflow-hidden`}>
          <Image
            src={firstSong.coverArtUrl}
            alt={`${firstSong.title} cover`}
            width={size === "sm" ? 64 : size === "md" ? 192 : 256}
            height={size === "sm" ? 64 : size === "md" ? 192 : 256}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      // No cover art - show default with play icon
      return (
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center`}
        >
          <Play className={`${iconSizes[size]} text-white`} />
        </div>
      );
    }
  }

  // 4 or more songs - show 2x2 grid
  return (
    <div
      className={`${sizeClasses[size]} rounded-lg overflow-hidden grid grid-cols-2 gap-0.5`}
    >
      {songs.slice(0, 4).map((song) => (
        <div key={song.id} className="relative aspect-square">
          {song.coverArtUrl ? (
            <Image
              src={song.coverArtUrl}
              alt={`${song.title} cover`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
              <Play className={`${gridIconSizes[size]} text-white`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
