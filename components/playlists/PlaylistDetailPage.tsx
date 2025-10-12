"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Calendar, Clock, Music, Play, Plus, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import { SongList } from "@/components/songs/SongList";
import {
  addSongToPlaylist,
  getUserSongsByClerkId,
  removeSongFromPlaylist,
} from "@/lib/data/user";
import type { User as DbUser, Playlist, Song } from "@/lib/db/schema";
import { usePlayer } from "@/lib/player-context";

interface PlaylistDetailPageProps {
  playlistData: {
    playlist: Playlist;
    songs: Song[];
    user: DbUser;
  };
}

export function PlaylistDetailPage({ playlistData }: PlaylistDetailPageProps) {
  const { playlist, songs, user: playlistUser } = playlistData;
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user } = useUser();
  const { playSong } = usePlayer();
  const router = useRouter();

  const isOwner = user?.id === playlistUser.clerkId;

  const loadUserSongs = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const songs = await getUserSongsByClerkId(user.id);
      // Filter out songs already in the playlist
      const availableSongs = songs.filter(
        (song) =>
          !playlistData.songs.some(
            (playlistSong) => playlistSong.id === song.id,
          ),
      );
      setUserSongs(availableSongs);
    } catch (error) {
      console.error("Error loading user songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async (songId: string) => {
    try {
      const formData = new FormData();
      formData.append("playlistId", playlist.id);
      formData.append("songId", songId);

      await addSongToPlaylist(formData);
      router.refresh();
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      const formData = new FormData();
      formData.append("playlistId", playlist.id);
      formData.append("songId", songId);

      await removeSongFromPlaylist(formData);
      router.refresh();
    } catch (error) {
      console.error("Error removing song from playlist:", error);
    }
  };

  const handlePlaySong = (song: Song) => {
    playSong(song, songs);
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const totalDuration = songs.reduce(
    (total, song) => total + (song.duration || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Playlist Header */}
        <div className="flex flex-col md:flex-row md:items-end md:space-x-6 mb-8">
          {/* Playlist Cover */}
          <div className="relative">
            <PlaylistCover songs={songs} size="md" />
          </div>

          {/* Playlist Info */}
          <div className="flex-1 mt-6 md:mt-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {playlist.name}
                </h1>

                {playlist.description && (
                  <p className="text-muted-foreground mb-4 max-w-2xl">
                    {playlist.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Created by {playlistUser.username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Music className="w-4 h-4" />
                    <span>{songs.length} songs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(playlist.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 ml-4">
                {songs.length > 0 && (
                  <Button
                    color="primary"
                    startContent={<Play className="w-4 h-4" />}
                    onPress={() => handlePlaySong(songs[0])}
                  >
                    Play All
                  </Button>
                )}

                {isOwner && (
                  <Button
                    variant="flat"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={() => {
                      setIsAddModalOpen(true);
                      loadUserSongs();
                    }}
                  >
                    Add Songs
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div>
          {songs.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No songs in this playlist yet
              </h3>
              <p className="text-sm text-muted-foreground">
                {isOwner
                  ? "Add some songs to get started!"
                  : "This playlist is empty."}
              </p>
            </div>
          ) : (
            <SongList
              songs={songs}
              showUploader={false}
              playlistId={playlist.id}
              onRemoveFromPlaylist={isOwner ? handleRemoveSong : undefined}
            />
          )}
        </div>

        {/* Add Songs Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          size="lg"
        >
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-semibold">Add Songs to Playlist</h3>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading your songs...
                  </p>
                </div>
              ) : userSongs.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No songs available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All your songs are already in this playlist, or you haven't
                    uploaded any songs yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {song.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artist}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Plus className="w-3 h-3" />}
                        onPress={() => handleAddSong(song.id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
