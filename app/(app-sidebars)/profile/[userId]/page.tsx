import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import {
  getUserByClerkId,
  getUserPlaylistsByClerkId,
  getUserSongsByClerkId,
} from "@/lib/data/user";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const { userId: currentUserId } = await auth();
  const user = await getUserByClerkId(userId);

  if (!user) {
    notFound();
  }

  const [songs, playlists] = await Promise.all([
    getUserSongsByClerkId(user.clerkId),
    getUserPlaylistsByClerkId(user.clerkId),
  ]);

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="h-dvh bg-background">
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
      <ProfileTabs user={user} songs={songs} playlists={playlists} />
    </div>
  );
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { userId } = await params;

  try {
    const user = await getUserByClerkId(userId);

    if (!user) {
      return {
        title: "Profile Not Found",
      };
    }

    return {
      title: `${user.username} | Music Player`,
      description: `Listen to ${user.username}'s music and playlists`,
    };
  } catch {
    return {
      title: "Profile",
    };
  }
}
