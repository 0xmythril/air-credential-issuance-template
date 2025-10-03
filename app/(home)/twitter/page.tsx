"use client";
import { Spinner } from "@/components/ui/spinner";
import { useTwitter } from "@/lib/hooks/useTwitter";
import { GetStartedView } from "../_components/GetStartedView";
import { RouteHero } from "@/components/common/RouteHero";

export default function TwitterPage() {
  const twitter = useTwitter();

  if (twitter.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-1">
        <Spinner size="medium" />
        <p className="text-sm text-muted-foreground">
          Loading Twitter session...
        </p>
      </div>
    );
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
