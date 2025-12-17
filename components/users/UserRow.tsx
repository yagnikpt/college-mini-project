"use client";

import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { User as UserType } from "@/lib/db/schema";

interface UserRowProps {
  user: UserType;
  index: number;
}

export function UserRow({ user, index }: UserRowProps) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      {/* Index */}
      <div className="w-8 text-center text-sm text-muted-foreground">
        {index + 1}
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 shrink-0 ml-12">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={`${user.username} avatar`}
            width={48}
            height={48}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{user.username}</h4>
        <p className="text-sm text-muted-foreground truncate">User</p>
      </div>
    </Link>
  );
}
