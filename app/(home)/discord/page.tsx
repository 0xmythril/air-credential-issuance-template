"use client";
import { Spinner } from "@/components/ui/spinner";
import { LoadingState } from "@/components/common/States";
import { useDiscord } from "@/lib/hooks/useDiscord";
import { GetStartedView } from "../_components/GetStartedView";
import { RouteHero } from "@/components/common/RouteHero";

export default function DiscordPage() {
  const discord = useDiscord();

  if (discord.isLoading) {
    return <LoadingState title="Loading Discord session..." />;
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
