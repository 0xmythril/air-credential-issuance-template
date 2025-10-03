"use client";
import { Spinner } from "@/components/ui/spinner";
import { useDiscord } from "@/lib/hooks/useDiscord";
import { GetStartedView } from "../_components/GetStartedView";

export default function DiscordPage() {
  const discord = useDiscord();

  if (discord.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-1">
        <Spinner size="medium" />
        <p className="text-sm text-muted-foreground">
          Loading Discord session...
        </p>
      </div>
    );
  }

  return <GetStartedView />;
}
