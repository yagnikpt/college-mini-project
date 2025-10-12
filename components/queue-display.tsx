"use client";

import { Button } from "@heroui/button";
import { List, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { usePlayer } from "@/lib/player-context";

export function QueueDisplay() {
  const [isOpen, setIsOpen] = useState(false);
  const { queue, currentIndex, removeFromQueue } = usePlayer();

  if (queue.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onPress={() => setIsOpen(true)}
        className="text-muted-foreground"
      >
        <List className="w-4 h-4" />
      </Button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          aria-label="Close queue sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l border-zinc-400 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-hide ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          boxShadow: isOpen ? "-4px 0 20px rgba(0, 0, 0, 0.1)" : "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-400 top-0 sticky bg-background z-10">
          <h3 className="text-lg font-semibold">Queue</h3>
          <div className="flex items-center gap-2">
            {/* <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={clearQueue}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button> */}
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => setIsOpen(false)}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {queue
              .filter((_, i) => i >= currentIndex)
              .map((song, index) => (
                <div
                  key={`${song.id}-${index}`}
                  className={`group flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    index === 0
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex-shrink-0 w-8 text-center">
                    {index === 0 ? (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse mx-3" />
                    ) : song.coverArtUrl ? (
                      <Image
                        src={song.coverArtUrl}
                        alt={`${song.title} cover art`}
                        width={32}
                        height={32}
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse mx-3" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {song.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  </div>

                  {index !== 0 && (
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={() => removeFromQueue(currentIndex + index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
          </div>

          {queue.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No songs in queue</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
