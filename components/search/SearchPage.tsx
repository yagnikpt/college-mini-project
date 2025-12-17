"use client";

import { useUser } from "@clerk/nextjs";
import { Input } from "@heroui/input";
import { Music, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PlaylistRow } from "@/components/playlists/PlaylistRow";
import { SongRow } from "@/components/songs/SongList";
import { UserRow } from "@/components/users/UserRow";
import {
  addSongToPlaylist,
  getUserPlaylistsByClerkId,
  searchPlaylists,
} from "@/lib/data/playlists";
import { deleteSong, searchSongs } from "@/lib/data/songs";
import { getUserByClerkId, searchUsers } from "@/lib/data/users";
import type { Playlist, Song, User as UserType } from "@/lib/db/schema";
import { usePlayer } from "@/lib/player-context";

interface ExtendedSong extends Song {
  username?: string;
  avatarUrl?: string;
}
const calculateScore = (text: string | null, query: string): number => {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerText === lowerQuery) return 100;
  if (lowerText.startsWith(lowerQuery)) return 80;
  if (lowerText.includes(lowerQuery)) return 50;
  return 0;
};

export function SearchPage() {
  const [results, setResults] = useState<
    Array<
      | { type: "song"; data: ExtendedSong }
      | { type: "user"; data: UserType }
      | {
          type: "playlist";
          data: {
            playlist: Playlist;
            user: UserType;
            songsCount: number;
            songs: Song[];
          };
        }
    >
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { user } = useUser();
  const { playSong, addToQueue } = usePlayer();
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [currentUserDbId, setCurrentUserDbId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      if (userPlaylists.length === 0) {
        setLoadingPlaylists(true);
        getUserPlaylistsByClerkId(user.id)
          .then(setUserPlaylists)
          .catch((e) => console.error(e))
          .finally(() => setLoadingPlaylists(false));
      }

      if (!currentUserDbId) {
        getUserByClerkId(user.id).then((userData) => {
          if (userData) {
            setCurrentUserDbId(userData.id);
          }
        });
      }
    }
  }, [user?.id, userPlaylists.length, currentUserDbId]);

  const handleAddToPlaylist = async (songId: string, playlistId: string) => {
    try {
      const formData = new FormData();
      formData.append("songId", songId);
      formData.append("playlistId", playlistId);
      await addSongToPlaylist(formData);
    } catch (error) {
      console.error("Error adding song:", error);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteSong(songId);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const [songs, users, playlists] = await Promise.all([
        searchSongs(query),
        searchUsers(query),
        searchPlaylists(query),
      ]);

      const mixedResults = [
        ...songs.map((song) => ({
          type: "song" as const,
          data: song as ExtendedSong,
          score: Math.max(
            calculateScore(song.title, query),
            calculateScore(song.artist, query) * 0.8,
          ),
        })),
        ...users.map((user) => ({
          type: "user" as const,
          data: user,
          score: calculateScore(user.username, query),
        })),
        ...playlists.map((playlistData) => ({
          type: "playlist" as const,
          data: playlistData,
          score: Math.max(
            calculateScore(playlistData.playlist.name, query),
            calculateScore(playlistData.playlist.description, query) * 0.8,
          ),
        })),
      ];

      mixedResults.sort((a, b) => b.score - a.score);

      setResults(mixedResults);
    } catch (error) {
      console.error("Error searching:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, performSearch]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground">
            Find songs, artists, and playlists
          </p>
        </div>

        <div className="mb-8">
          <Input
            autoFocus
            type="text"
            placeholder="Search for songs, users, or playlists..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            startContent={<Search className="w-4 h-4 text-muted-foreground" />}
            size="lg"
            className="max-w-md mx-auto"
            radius="lg"
          />
        </div>

        {!hasSearched ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              Start searching
            </h3>
            <p className="text-muted-foreground">
              Enter keywords to search across the entire platform
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No results found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Search Results ({results.length})
              </h2>
            </div>
            <div className="space-y-2">
              {results.map((item, index) => {
                if (item.type === "song") {
                  return (
                    <SongRow
                      key={`song-${item.data.id}-${index}`}
                      song={item.data}
                      index={index}
                      playSong={(s) =>
                        playSong(
                          s,
                          results
                            .filter((r) => r.type === "song")
                            .map((r) => r.data as ExtendedSong),
                        )
                      }
                      addToQueue={addToQueue}
                      currentUserDbId={currentUserDbId}
                      showUploader={true}
                      handleDeleteSong={handleDeleteSong}
                      userPlaylists={userPlaylists}
                      loadingPlaylists={loadingPlaylists}
                      handleAddToPlaylist={handleAddToPlaylist}
                      user={user}
                    />
                  );
                } else if (item.type === "user") {
                  return (
                    <UserRow
                      key={`user-${item.data.id}-${index}`}
                      user={item.data}
                      index={index}
                    />
                  );
                } else if (item.type === "playlist") {
                  return (
                    <PlaylistRow
                      key={`playlist-${item.data.playlist.id}-${index}`}
                      playlist={item.data.playlist}
                      owner={item.data.user}
                      songsCount={item.data.songsCount}
                      songs={item.data.songs}
                      index={index}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
