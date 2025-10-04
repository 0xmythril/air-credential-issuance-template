"use client";
import { Spinner } from "@/components/ui/spinner";
import { LoadingState } from "@/components/common/States";
import { useSpotify } from "@/lib/hooks/useSpotify";
import { GetStartedView } from "../_components/GetStartedView";
import { RouteHero } from "@/components/common/RouteHero";

export default function SpotifyPage() {
  const spotify = useSpotify();

  if (spotify.isLoading) {
    return <LoadingState title="Loading Spotify session..." />;
  }

  return (
    <>
      <div className="pt-4" />
      <RouteHero />
      <div className="pt-4" />
      <GetStartedView />
    </>
  );
}
