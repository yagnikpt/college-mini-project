"use client";

import { Calendar } from "lucide-react";
import Image from "next/image";
import { SongUpload } from "@/components/song-upload";
import type { User } from "@/lib/db/schema";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="relative px-6 pb-6 max-w-6xl mx-auto pt-20">
      <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
        {/* Avatar */}
        <div className="relative">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.username}
              width={120}
              height={120}
              className="rounded-full border-4 border-background shadow-lg"
            />
          ) : (
            <div className="w-30 h-30 bg-muted rounded-full border-4 border-background shadow-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 mt-4 md:mt-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {user.username}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Upload Button - only show for own profile */}
            {isOwnProfile && (
              <div className="ml-4">
                <SongUpload />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
