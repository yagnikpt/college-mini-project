import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PlaylistsPage } from "@/components/playlists/PlaylistsPage";

export default async function Playlists() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <PlaylistsPage />;
}

export async function generateMetadata() {
  return {
    title: "Playlists | Music Player",
    description: "Create and manage your music playlists",
  };
}
