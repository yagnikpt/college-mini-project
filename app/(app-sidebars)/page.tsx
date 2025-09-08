import { auth } from "@clerk/nextjs/server";
import Nav from "@/components/nav";
import { SongList } from "@/components/songs/SongList";
import { getAllSongs } from "@/lib/data/user";

export const metadata = {
  title: "Discover New Music | Music Player",
  description:
    "Explore the latest songs uploaded to our music platform. Discover new artists and add songs to your playlists.",
};

export default async function Home() {
  // Check if user is authenticated (for playlist functionality)
  await auth();

  // Fetch latest songs from all users
  const songs = await getAllSongs();

  // Sort by creation date (newest first) and limit to recent uploads
  const latestSongs = songs
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 20); // Show latest 20 songs

  return (
    <div className="min-h-dvh bg-background">
      <Nav />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Discover New Music</h1>
            <p className="text-muted-foreground">
              Explore the latest songs uploaded to the platform
            </p>
          </div>

          {/* Latest Songs */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Latest Uploads</h2>
              <span className="text-sm text-muted-foreground">
                {latestSongs.length} songs
              </span>
            </div>

            {latestSongs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-xl font-medium text-muted-foreground mb-2">
                  No songs yet
                </h3>
                <p className="text-muted-foreground">
                  Be the first to upload a song and share your music!
                </p>
              </div>
            ) : (
              <SongList songs={latestSongs} showUploader={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
