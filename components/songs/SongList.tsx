"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Clock, MoreVertical, Play, Plus, User } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  addSongToPlaylist,
  deleteSong,
  getUserByClerkId,
  getUserPlaylistsByClerkId,
} from "@/lib/data/user";
import type { Playlist, Song } from "@/lib/db/schema";
import { usePlayer } from "@/lib/player-context";

interface ExtendedSong extends Song {
  username?: string;
  avatarUrl?: string;
}

interface SongListProps {
  songs: ExtendedSong[];
  showUploader?: boolean;
  playlistId?: string; // For playlist detail pages
  onRemoveFromPlaylist?: (songId: string) => void; // For playlist detail pages
}

export function SongList({
  songs,
  showUploader = false,
  playlistId,
  onRemoveFromPlaylist,
}: SongListProps) {
  const { user } = useUser();
  const { playSong, addToQueue } = usePlayer();
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [currentUserDbId, setCurrentUserDbId] = useState<string | null>(null);

  const loadUserPlaylists = useCallback(async () => {
    if (!user?.id || userPlaylists.length > 0) return;

    setLoadingPlaylists(true);
    try {
      const playlists = await getUserPlaylistsByClerkId(user.id);
      setUserPlaylists(playlists);
    } catch (error) {
      console.error("Error loading playlists:", error);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [user?.id, userPlaylists.length]);

  useEffect(() => {
    // Auto-load playlists when component mounts if user is logged in
    if (user?.id && userPlaylists.length === 0) {
      loadUserPlaylists();
    }

    // Load current user database ID
    if (user?.id && !currentUserDbId) {
      getUserByClerkId(user.id).then((userData) => {
        if (userData) {
          setCurrentUserDbId(userData.id);
        }
      });
    }
  }, [user?.id, userPlaylists.length, loadUserPlaylists, currentUserDbId]);

  const handleAddToPlaylist = async (songId: string, playlistId: string) => {
    try {
      const formData = new FormData();
      formData.append("songId", songId);
      formData.append("playlistId", playlistId);

      await addSongToPlaylist(formData);
      // Could add toast notification here
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this song? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteSong(songId);
      // Refresh the page or update the list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("Failed to delete song. Please try again.");
    }
  };

  const getDropdownItems = (song: ExtendedSong) => {
    const items = [
      <DropdownItem key="play-now" onPress={() => playSong(song, songs)}>
        Play Now
      </DropdownItem>,
      <DropdownItem key="add-queue" onPress={() => addToQueue(song)}>
        Add to Queue
      </DropdownItem>,
    ];

    // Add delete option if user owns this song
    if (currentUserDbId && song.userId === currentUserDbId) {
      items.push(
        <DropdownItem
          key="delete-song"
          onPress={() => handleDeleteSong(song.id)}
          color="danger"
        >
          Delete Song
        </DropdownItem>,
      );
    }

    // Add playlist items if user is logged in
    if (user?.id) {
      if (loadingPlaylists) {
        items.push(
          <DropdownItem key="loading-playlists" isDisabled>
            Loading playlists...
          </DropdownItem>,
        );
      } else if (userPlaylists.length > 0) {
        items.push(
          <DropdownItem key="playlist-header" isDisabled>
            <div className="font-medium text-foreground">Add to Playlist</div>
          </DropdownItem>,
        );
        userPlaylists.forEach((playlist) => {
          items.push(
            <DropdownItem
              key={`playlist-${playlist.id}`}
              onPress={() => handleAddToPlaylist(song.id, playlist.id)}
              className="pl-6"
            >
              {playlist.name}
            </DropdownItem>,
          );
        });
      }
    }

    // Add remove from playlist option if applicable
    if (onRemoveFromPlaylist && playlistId) {
      items.push(
        <DropdownItem
          key="remove-playlist"
          onPress={() => onRemoveFromPlaylist(song.id)}
          color="danger"
        >
          Remove from Playlist
        </DropdownItem>,
      );
    }

    return items;
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (songs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No songs to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {songs.map((song, index) => (
        <div
          key={`${song.id}-${index}`}
          className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
        >
          {/* Song Number/Index */}
          <div className="w-8 text-center text-sm text-muted-foreground">
            {index + 1}
          </div>

          {/* Play Button */}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => playSong(song, songs)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-4 h-4" />
          </Button>

          {/* Cover Art */}
          <div className="w-12 h-12 flex-shrink-0">
            {song.coverArtUrl ? (
              <Image
                src={song.coverArtUrl}
                alt={`${song.title} cover art`}
                width={48}
                height={48}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                <Play className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{song.title}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {song.artist}
              {song.genre && ` • ${song.genre}`}
            </p>
            {showUploader && song.username && (
              <div className="flex items-center gap-1 mt-1">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {song.username}
                </span>
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(song.duration)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Add to Queue */}
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => addToQueue(song)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </Button>

            {/* More Options Dropdown */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>{getDropdownItems(song)}</DropdownMenu>
            </Dropdown>
          </div>
        </div>
      ))}
    </div>
  );
}
