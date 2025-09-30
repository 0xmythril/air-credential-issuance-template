"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getNameFromAccessToken } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useDisconnect } from "wagmi";
import { useAirkit } from "../../lib/hooks/useAirkit";
import { useSession } from "../../lib/hooks/useSession";
import { useAirProvider } from "../../lib/hooks/useAirProvider";
import { useSpotify } from "../../lib/hooks/useSpotify";
import { useTwitter } from "../../lib/hooks/useTwitter";
import { env } from "@/lib/env";

export const Header = () => {
  const { accessToken, setAccessToken } = useSession();
  const { airService } = useAirkit();
  const airProvider = useAirProvider();
  const spotify = useSpotify();
  const twitter = useTwitter();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const isWalletLogin = env.NEXT_PUBLIC_AUTH_METHOD === "wallet";
  const isAirKitLogin = env.NEXT_PUBLIC_AUTH_METHOD === "airkit";
  const isSpotifyLogin = env.NEXT_PUBLIC_AUTH_METHOD === "spotify";
  const isTwitterLogin = env.NEXT_PUBLIC_AUTH_METHOD === "twitter";

  const logout = async () => {
    if (isWalletLogin) {
      await wagmiDisconnect();
    }
    if (isAirKitLogin) {
      if (airService.isLoggedIn) {
        await airService.logout();
      }
    }
    if (isSpotifyLogin) {
      spotify.signOut();
    }
    if (isTwitterLogin) {
      twitter.signOut();
    }
    setAccessToken(null);
  };

  const logoutAirServices = async () => {
    try {
      if (airProvider.isLoggedIn) {
        await airService.logout();
        // Only logout from AIR Services, don't clear the access token
        // This preserves the wallet connection and session
        
        // Force a small delay to allow state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Failed to logout from AIR Services:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto">
        <Link
          href="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={28}
            height={28}
            className={`h-7 w-auto ml-4 dark:invert dark:grayscale`}
          />
        </Link>
        <div className="flex items-center gap-2 mr-4">
          {(accessToken || (isSpotifyLogin && spotify.isAuthenticated) || (isTwitterLogin && twitter.isAuthenticated)) && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {isSpotifyLogin 
                    ? "Manage Spotify Account"
                    : isTwitterLogin
                    ? "Manage Twitter Account"
                    : String(getNameFromAccessToken(accessToken))
                  }
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[300px]">
                <DialogHeader>
                  <DialogTitle>Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isSpotifyLogin ? "Spotify ID" : isTwitterLogin ? "Twitter Username" : "Address"}
                    </p>
                    <p className="font-mono text-sm">
                      {isSpotifyLogin 
                        ? String((spotify.user as Record<string, unknown>)?.id || 'Unknown')
                        : isTwitterLogin
                        ? String((twitter.user as Record<string, unknown>)?.username || 'Unknown')
                        : String(getNameFromAccessToken(accessToken))
                      }
                    </p>
                  </div>
                  {isSpotifyLogin && !!(spotify.user as Record<string, unknown>)?.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm">{String((spotify.user as Record<string, unknown>).email)}</p>
                    </div>
                  )}
                  {isTwitterLogin && !!(twitter.user as Record<string, unknown>)?.name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-sm">{String((twitter.user as Record<string, unknown>).name)}</p>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => logout()}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {airProvider.isLoggedIn && airProvider.userEmail && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  title={`AIR User: ${airProvider.userEmail}, Address=${airProvider.address}`}
                >
                  {"AIR: "}
                  {airProvider.userEmail}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[300px]">
                <DialogHeader>
                  <DialogTitle>AIR Services Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">{airProvider.userEmail}</p>
                  </div>
                  {airProvider.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-mono text-xs break-all">{airProvider.address}</p>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    onClick={logoutAirServices}
                    className="w-full"
                  >
                    Logout from AIR Services
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
};
