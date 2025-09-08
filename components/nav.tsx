"use client";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Skeleton } from "@heroui/skeleton";
import { Home, ListMusic, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  return (
    <Navbar maxWidth="2xl" className="w-full">
      <NavbarContent justify="start">
        <NavbarItem>
          <Button
            variant="light"
            as={Link}
            href="/"
            startContent={<Home className="w-4 h-4" />}
          >
            Discover
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            variant="light"
            as={Link}
            href="/search"
            startContent={<Search className="w-4 h-4" />}
          >
            Search
          </Button>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          {isLoaded ? (
            isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      width: 32,
                      height: 32,
                    },
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    labelIcon={<ListMusic className="size-4" />}
                    onClick={() => router.push("/playlists")}
                    label="Playlists"
                  />
                  <UserButton.Action
                    labelIcon={<UserRound className="size-4" />}
                    onClick={() =>
                      user?.id && router.push(`/profile/${user.id}`)
                    }
                    label="Profile"
                  />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <Button variant="ghost" as={Link} href="/sign-in">
                Sign in
              </Button>
            )
          ) : (
            <Skeleton className="size-8 rounded-full" />
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
