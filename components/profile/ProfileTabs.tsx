"use client";

import { Tab, Tabs } from "@heroui/react";
import { ListMusic, Music } from "lucide-react";
import { SongList } from "@/components/songs/SongList";
import type { Playlist, Song, User } from "@/lib/db/schema";
import PlaylistCard from "../playlists/PlaylistCard";

interface PlaylistWithSongs {
  playlist: Playlist;
  songs: Song[];
  songsCount: number;
}

interface ProfileTabsProps {
  user: User;
  songs: Song[];
  playlists: PlaylistWithSongs[];
}

export function ProfileTabs({ user, songs, playlists }: ProfileTabsProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 pb-24">
      {/* Tab Navigation */}
      <Tabs aria-label="Profile Tabs" radius="lg" size="lg">
        <Tab
          key="tracks"
          title={
            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4" />
              <span>Tracks ({songs.length})</span>
            </div>
          }
        >
          <div>
            {songs.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No tracks yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user.username} hasn't uploaded any tracks yet.
                </p>
              </div>
            ) : (
              <SongList songs={songs} showUploader={false} />
            )}
          </div>
        </Tab>
        <Tab
          key="playlists"
          title={
            <div className="flex items-center space-x-2">
              <ListMusic className="w-4 h-4" />
              <span>Playlists ({playlists.length})</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <ListMusic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No playlists yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user.username} hasn't created any playlists yet.
                </p>
              </div>
            ) : (
              playlists.map(({ playlist, songs, songsCount }) => (
                <PlaylistCard
                  playlist={playlist}
                  songs={songs}
                  songsCount={songsCount}
                  key={playlist.id}
                />
              ))
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
