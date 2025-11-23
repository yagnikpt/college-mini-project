"use client";

import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useCallback, useEffect, useState } from "react";
import Nav from "@/components/nav";
import { SongList } from "@/components/songs/SongList";
import { getSongsPaginated } from "@/lib/data/songs";
import type { Song } from "@/lib/db/schema";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalSongs, setTotalSongs] = useState(0);

  const loadInitialSongs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSongsPaginated(0, 20);
      setSongs(result.songs);
      setHasMore(result.hasMore);
      setTotalSongs(result.total);
    } catch (error) {
      console.error("Error loading songs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreSongs = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const result = await getSongsPaginated(songs.length, 20);
      setSongs((prev) => [...prev, ...result.songs]);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading more songs:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitialSongs();
  }, [loadInitialSongs]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Nav />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Discover New Music</h1>
              <p className="text-muted-foreground">
                Explore the latest songs uploaded to the platform
              </p>
            </div>
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                {songs.length} of {totalSongs} songs
              </span>
            </div>

            {songs.length === 0 ? (
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
              <>
                <SongList songs={songs} showUploader={true} />

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <Button
                      onPress={loadMoreSongs}
                      isLoading={loadingMore}
                      disabled={loadingMore}
                      size="lg"
                      variant="bordered"
                    >
                      {loadingMore ? "Loading..." : "Load More Songs"}
                    </Button>
                  </div>
                )}

                {/* End of results message */}
                {!hasMore && songs.length > 0 && (
                  <div className="text-center pt-6">
                    <p className="text-muted-foreground">
                      You've seen all {totalSongs} songs!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
