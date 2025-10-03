"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "../../lib/hooks/useSession";
import { useAirProvider } from "../../lib/hooks/useAirProvider";
import { useSpotify } from "../../lib/hooks/useSpotify";
import { useTwitter } from "../../lib/hooks/useTwitter";
import { useDiscord } from "../../lib/hooks/useDiscord";
import { Search, Menu, Home } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SessionsSidebar } from "./SessionsSidebar";
import { ThemeToggle } from "./ThemeToggle";

// Safe wrappers to prevent SessionProvider errors
function useSafeSpotify() {
  try {
    return useSpotify();
  } catch {
    return { isAuthenticated: false, user: null };
  }
}

function useSafeTwitter() {
  try {
    return useTwitter();
  } catch {
    return { isAuthenticated: false, user: null };
  }
}

function useSafeDiscord() {
  try {
    return useDiscord();
  } catch {
    return { isAuthenticated: false, user: null };
  }
}

export const Header = () => {
  const pathname = usePathname();
  const sessionStore = useSession();
  const airProvider = useAirProvider();
  const spotify = useSafeSpotify();
  const twitter = useSafeTwitter();
  const discord = useSafeDiscord();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isHomePage = pathname === "/";

  // Check if any accounts are connected
  const hasConnections = 
    (discord.isAuthenticated && !!sessionStore.sessions.discord.accessToken) ||
    (twitter.isAuthenticated && !!sessionStore.sessions.twitter.accessToken) ||
    (spotify.isAuthenticated && !!sessionStore.sessions.spotify.accessToken) ||
    !!sessionStore.sessions.wallet.accessToken ||
    airProvider.isLoggedIn;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center mx-auto">
          {/* Logo - acts as home button */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity ml-4"
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="h-7 w-auto dark:invert dark:grayscale"
            />
          </Link>

          {/* Spacer left */}
          <div className="flex-1" />

          {/* Center Navigation - Home and Explore */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                aria-current={pathname === "/" ? "page" : undefined}
                className={pathname === "/" ? "bg-accent/50" : undefined}
              >
                Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                variant="ghost"
                size="sm"
                aria-current={pathname === "/explore" ? "page" : undefined}
                className={pathname === "/explore" ? "bg-accent/50" : undefined}
              >
                Explore
              </Button>
            </Link>
          </div>

          {/* Spacer right */}
          <div className="flex-1" />
          
          {/* Right side - Theme + Account Dashboard Button */}
          <div className="flex items-center gap-2 mr-4">
            <ThemeToggle />
            {hasConnections && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2"
              >
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">Accounts</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Sessions Sidebar */}
      <SessionsSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
};