"use client";

import { Card, CardFooter } from "@heroui/card";
import { useRouter } from "next/navigation";
import type { Playlist, Song } from "@/lib/db/schema";
import { PlaylistCover } from "./PlaylistCover";

export default function PlaylistCard({
  playlist,
  songs,
  songsCount,
}: {
  playlist: Playlist;
  songs: Song[];
  songsCount: number;
}) {
  const router = useRouter();
  return (
    <Card
      key={playlist.id}
      isFooterBlurred
      className="border-none"
      radius="lg"
      isPressable
      disableRipple
      onPress={() => router.push(`/playlists/${playlist.id}`)}
    >
      <div className="p-2">
        <PlaylistCover songs={songs} />
      </div>
      <CardFooter className="justify-between gap-4 px-3 pt-1">
        <h3 className="font-medium text-foreground truncate">
          {playlist.name}
        </h3>
        <span className="text-sm text-muted-foreground shrink-0 text-nowrap whitespace-nowrap">
          {songsCount} songs
        </span>
      </CardFooter>
    </Card>
  );
}
