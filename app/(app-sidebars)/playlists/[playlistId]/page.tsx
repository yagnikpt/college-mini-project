import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { PlaylistDetailPage } from "@/components/playlists/PlaylistDetailPage";
import { getPlaylistWithSongs } from "@/lib/data/playlists";

interface PlaylistPageProps {
  params: Promise<{ playlistId: string }>;
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { userId } = await auth();
  const { playlistId } = await params;

  if (!userId) {
    notFound();
  }

  const playlistData = await getPlaylistWithSongs(playlistId);

  if (!playlistData) {
    notFound();
  }

  return <PlaylistDetailPage playlistData={playlistData} />;
}

export async function generateMetadata({ params }: PlaylistPageProps) {
  const { playlistId } = await params;

  try {
    const playlistData = await getPlaylistWithSongs(playlistId);

    if (!playlistData) {
      return {
        title: "Playlist Not Found",
      };
    }

    return {
      title: `${playlistData.playlist.name} | Music Player`,
      description:
        playlistData.playlist.description ||
        `Listen to ${playlistData.playlist.name} playlist`,
    };
  } catch {
    return {
      title: "Playlist",
    };
  }
}
