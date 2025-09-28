"use client";
import { Spinner } from "@/components/ui/spinner";
import { useAccount } from "wagmi";
import { useSpotify } from "@/lib/hooks/useSpotify";
import { env } from "@/lib/env";
import { GetStartedView } from "./_components/GetStartedView";

export default function Home() {
  const { isReconnecting } = useAccount();
  const spotify = useSpotify();
  
  const isWalletLogin = env.NEXT_PUBLIC_AUTH_METHOD === "wallet";
  const isSpotifyLogin = env.NEXT_PUBLIC_AUTH_METHOD === "spotify";

  // Show loading for wallet reconnection or Spotify loading
  if ((isWalletLogin && isReconnecting) || (isSpotifyLogin && spotify.isLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-1">
        <Spinner size="medium" />
        <p className="text-sm text-muted-foreground">
          {isSpotifyLogin ? "Loading Spotify session..." : "Retrieving your data..."}
        </p>
      </div>
    );
  }

  return <GetStartedView />;
}
