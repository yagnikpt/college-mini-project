import { Home, ListMusic, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LeftSidebar() {
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
        <p className="font-bold text-inherit ml-2">Music Player</p>
      </div>
      <nav className="space-y-2 mt-8 px-2">
        <Link
          href="/"
          className={`flex items-center text-muted-foreground hover:text-foreground py-2`}
        >
          <Home className="size-5 mr-2" />
          Home
        </Link>
        <Link
          href="/search"
          className={`flex items-center text-muted-foreground hover:text-foreground py-2`}
        >
          <Search className="size-5 mr-2" />
          Search
        </Link>
        <Link
          href="/playlists"
          className={`flex items-center text-muted-foreground hover:text-foreground py-2`}
        >
          <ListMusic className="size-5 mr-2" />
          Playlists
        </Link>
      </nav>
    </div>
  );
}
