"use client";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Skeleton } from "@heroui/skeleton";
import Link from "next/link";

export default function Nav() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <Navbar maxWidth="2xl" className="w-full">
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
              />
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
