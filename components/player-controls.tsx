"use client";

import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Slider } from "@heroui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { usePlayer } from "@/lib/player-context";
import { QueueDisplay } from "./queue-display";

export function PlayerControls() {
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    setVolume,
    seekTo,
  } = usePlayer();

  if (!currentSong) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  const handleProgressChange = (value: number | number[]) => {
    const newTime = Array.isArray(value) ? value[0] : value;
    seekTo((newTime / 100) * duration);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-none border-x-0 border-b-0">
      <div className="flex items-center gap-4 p-4">
        {/* Current Song Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {currentSong.fileUrl ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Image
                  src={"/headphone.svg"}
                  alt="Album art"
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">
              {currentSong.title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-muted-foreground"
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={previousSong}
              isDisabled={queue.length <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              isIconOnly
              color="primary"
              size="sm"
              onPress={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={nextSong}
              isDisabled={queue.length <= 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-muted-foreground"
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              size="sm"
              value={[progressPercentage]}
              onChange={handleProgressChange}
              maxValue={100}
              minValue={0}
              className="flex-1"
              aria-label="Progress"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <QueueDisplay />
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => setVolume(volume > 0 ? 0 : 0.7)}
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
