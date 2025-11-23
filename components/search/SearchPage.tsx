"use client";

import { Input } from "@heroui/input";
import { Music, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SongList } from "@/components/songs/SongList";
import { searchSongs } from "@/lib/data/songs";
import type { Song } from "@/lib/db/schema";

export function SearchPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSongs([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const searchResults = await searchSongs(query);
      setSongs(searchResults);
    } catch (error) {
      console.error("Error searching songs:", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, performSearch]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Songs</h1>
          <p className="text-muted-foreground">
            Discover and explore all songs on the platform
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <Input
            autoFocus
            type="text"
            placeholder="Search by title, artist, or genre..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            startContent={<Search className="w-4 h-4 text-muted-foreground" />}
            size="lg"
            className="max-w-md mx-auto"
            radius="lg"
          />
        </div>

        {/* Results */}
        {!hasSearched ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              Start searching
            </h3>
            <p className="text-muted-foreground">
              Enter a song title, artist name, or genre to find music
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching songs...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No songs found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or check the spelling
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Search Results ({songs.length})
              </h2>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  Searching...
                </div>
              )}
            </div>
            <SongList songs={songs} showUploader={true} />
          </div>
        )}
      </div>
    </div>
  );
}
