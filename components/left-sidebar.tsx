import { auth } from "@clerk/nextjs/server";
import { Home, ListMusic, Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUserByClerkId } from "@/lib/data/users";

export default async function LeftSidebar() {
  const { userId } = await auth();
  const user = userId ? await getUserByClerkId(userId) : null;

  return (
    <div className="w-64 h-full bg-background p-4 border-r border-zinc-400">
      <div className="flex items-center">
        <Image
          className="rounded-lg"
          src="/logo.png"
          alt="Music Player Logo"
          width={32}
          height={32}
        />
        <p className="font-bold text-inherit ml-2">Harmony</p>
      </div>
      <nav className="space-y-2 mt-8">
        <Link
          href="/"
          className={`flex items-center text-muted-foreground hover:text-foreground py-2 hover:bg-zinc-200/50 rounded-lg px-2 transition-colors`}
        >
          <Home className="size-5 mr-2" />
          Discover
        </Link>
        <Link
          href="/search"
          className={`flex items-center text-muted-foreground hover:text-foreground py-2 hover:bg-zinc-200/50 rounded-lg px-2 transition-colors`}
        >
          <Search className="size-5 mr-2" />
          Search
        </Link>
        <Link
          href="/playlists"
          className={`flex items-center text-muted-foreground hover:text-foreground py-2 hover:bg-zinc-200/50 rounded-lg px-2 transition-colors`}
        >
          <ListMusic className="size-5 mr-2" />
          Playlists
        </Link>
        {user && (
          <Link
            href={`/profile/${user.username}`}
            className={`flex items-center text-muted-foreground hover:text-foreground py-2 hover:bg-zinc-200/50 rounded-lg px-2 transition-colors`}
          >
            <User className="size-5 mr-2" />
            Profile
          </Link>
        )}
      </nav>
    </div>
  );
}
