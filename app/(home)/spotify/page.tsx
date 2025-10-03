"use client";
import { Spinner } from "@/components/ui/spinner";
import { useSpotify } from "@/lib/hooks/useSpotify";
import { GetStartedView } from "../_components/GetStartedView";

export default function SpotifyPage() {
  const spotify = useSpotify();

  if (spotify.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-1">
        <Spinner size="medium" />
        <p className="text-sm text-muted-foreground">
          Loading Spotify session...
        </p>
      </div>
    );
  }

  return <GetStartedView />;
}
