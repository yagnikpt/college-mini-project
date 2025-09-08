"use client";

import { HeroUIProvider } from "@heroui/react";
import { PlayerProvider } from "@/lib/player-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <PlayerProvider>{children}</PlayerProvider>
    </HeroUIProvider>
  );
}
