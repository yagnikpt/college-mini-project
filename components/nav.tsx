"use client";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Skeleton } from "@heroui/skeleton";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserByClerkId } from "@/lib/data/users";
import type { User } from "@/lib/db/schema";

export default function Nav() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [dbUser, setDbUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (clerkUser?.id) {
        const user = await getUserByClerkId(clerkUser.id);
        setDbUser(user);
      }
    };
    fetchUser();
  }, [clerkUser?.id]);

  return (
    <Navbar maxWidth="2xl" className="w-full">
      {/* <NavbarContent justify="start">
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
      </NavbarContent> */}
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
                    labelIcon={<UserRound className="size-4" />}
                    onClick={() =>
                      dbUser?.username &&
                      router.push(`/profile/${dbUser.username}`)
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
