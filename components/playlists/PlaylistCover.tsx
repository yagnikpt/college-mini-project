"use client";

import { cn } from "@heroui/theme";
import { ListMusic, Play } from "lucide-react";
import Image from "next/image";
import type { Song } from "@/lib/db/schema";

interface PlaylistCoverProps {
  songs: Song[];
  size?: "compact" | "auto";
}

export function PlaylistCover({ songs, size = "auto" }: PlaylistCoverProps) {
  const sizeClasses = {
    compact: "size-12",
    auto: "size-full",
  };

  const iconSizes = {
    compact: "size-6",
    auto: "size-full",
  };

  const gridIconSizes = {
    compact: "size-2",
    auto: "size-full",
  };

  if (songs.length === 0) {
    // No songs - show default icon
    return (
      <div
        className={cn(
          `${sizeClasses[size]} bg-linear-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center aspect-square`,
        )}
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
            width={size === "compact" ? 48 : size === "auto" ? 192 : 256}
            height={size === "compact" ? 48 : size === "auto" ? 192 : 256}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      // No cover art - show default with play icon
      return (
        <div
          className={`${sizeClasses[size]} bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center`}
        >
          <Play className={`${iconSizes[size]} text-white`} />
        </div>
      );
    }
  }

  // 4 or more songs - show 2x2 grid
  return (
    <div
      className={cn(
        `${sizeClasses[size]} overflow-hidden grid grid-cols-2`,
        size === "compact" ? "gap-0.25 rounded" : "gap-0.5 rounded-lg",
      )}
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
            <div className="w-full h-full bg-linear-to-br from-gray-400 to-gray-600 flex items-center justify-center">
              <Play className={`${gridIconSizes[size]} text-white`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
