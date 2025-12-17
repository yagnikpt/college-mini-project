import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { getUserPlaylistsWithSongsByClerkId } from "@/lib/data/playlists";
import { getUserSongsByClerkId } from "@/lib/data/songs";
import { getUserByUsername } from "@/lib/data/users";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const { userId: currentUserId } = await auth();
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const isOwnProfile = currentUserId === user.clerkId;

  const [songs, playlists] = await Promise.all([
    getUserSongsByClerkId(user.clerkId),
    getUserPlaylistsWithSongsByClerkId(user.clerkId, isOwnProfile),
  ]);

  return (
    <div className="h-dvh bg-background">
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
      <ProfileTabs user={user} songs={songs} playlists={playlists} />
    </div>
  );
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;

  try {
    const user = await getUserByUsername(username);

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
