"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Song } from "@/lib/db/schema";

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
}

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    queue: [],
    currentIndex: -1,
  });

  // Audio event listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = playerState.volume;

      // Audio event listeners
      audioRef.current.addEventListener("loadedmetadata", () => {
        setPlayerState((prev) => ({
          ...prev,
          duration: audioRef.current?.duration || 0,
        }));
      });

      audioRef.current.addEventListener("timeupdate", () => {
        setPlayerState((prev) => ({
          ...prev,
          currentTime: audioRef.current?.currentTime || 0,
        }));
      });

      audioRef.current.addEventListener("ended", () => {
        setPlayerState((prev) => {
          if (
            prev.queue.length > 0 &&
            prev.currentIndex < prev.queue.length - 1
          ) {
            const nextIndex = prev.currentIndex + 1;
            const nextSong = prev.queue[nextIndex];
            if (nextSong && audioRef.current) {
              audioRef.current.src = nextSong.fileUrl;
              audioRef.current.play().catch((error) => {
                if (!error.message.includes("interrupted")) {
                  console.error(error);
                }
              });
              return {
                ...prev,
                currentSong: nextSong,
                currentIndex: nextIndex,
                isPlaying: true,
              };
            }
          }
          return { ...prev, isPlaying: false };
        });
      });

      audioRef.current.addEventListener("play", () => {
        setPlayerState((prev) => ({ ...prev, isPlaying: true }));
      });

      audioRef.current.addEventListener("pause", () => {
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playerState.volume]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = playerState.volume;
    }
  }, [playerState.volume]);

  const playSong = (song: Song, queue: Song[] = []) => {
    if (!audioRef.current) return;

    const newQueue = queue.length > 0 ? queue : [song];
    const songIndex = newQueue.findIndex((s) => s.id === song.id);

    setPlayerState((prev) => ({
      ...prev,
      currentSong: song,
      queue: newQueue,
      currentIndex: songIndex >= 0 ? songIndex : 0,
      isPlaying: true,
    }));

    audioRef.current.src = song.fileUrl;
    audioRef.current.play().catch((error) => {
      if (!error.message.includes("interrupted")) {
        console.error(error);
      }
    });
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resumeSong = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        if (!error.message.includes("interrupted")) {
          console.error(error);
        }
      });
    }
  };

  const nextSong = () => {
    if (playerState.queue.length === 0 || playerState.currentIndex === -1)
      return;

    const nextIndex = (playerState.currentIndex + 1) % playerState.queue.length;
    const nextSong = playerState.queue[nextIndex];

    if (nextSong) {
      playSong(nextSong, playerState.queue);
    }
  };

  const previousSong = () => {
    if (playerState.queue.length === 0 || playerState.currentIndex === -1)
      return;

    const prevIndex =
      playerState.currentIndex === 0
        ? playerState.queue.length - 1
        : playerState.currentIndex - 1;
    const prevSong = playerState.queue[prevIndex];

    if (prevSong) {
      playSong(prevSong, playerState.queue);
    }
  };

  const setVolume = (volume: number) => {
    setPlayerState((prev) => ({
      ...prev,
      volume: Math.max(0, Math.min(1, volume)),
    }));
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState((prev) => ({ ...prev, currentTime: time }));
    }
  };

  const addToQueue = (song: Song) => {
    setPlayerState((prev) => ({
      ...prev,
      queue: [...prev.queue, song],
    }));
  };

  const removeFromQueue = (index: number) => {
    setPlayerState((prev) => {
      const newQueue = prev.queue.filter((_, i) => i !== index);
      let newIndex = prev.currentIndex;

      if (index < prev.currentIndex) {
        newIndex = Math.max(0, prev.currentIndex - 1);
      } else if (index === prev.currentIndex) {
        // If removing current song, play next or stop
        if (newQueue.length > 0) {
          newIndex = Math.min(newIndex, newQueue.length - 1);
        } else {
          newIndex = -1;
        }
      }

      return {
        ...prev,
        queue: newQueue,
        currentIndex: newIndex,
        currentSong: newIndex >= 0 ? newQueue[newIndex] || null : null,
      };
    });
  };

  const clearQueue = () => {
    setPlayerState((prev) => ({
      ...prev,
      queue: [],
      currentIndex: -1,
      currentSong: null,
      isPlaying: false,
    }));

    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const contextValue: PlayerContextType = {
    ...playerState,
    playSong,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    setVolume,
    seekTo,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
