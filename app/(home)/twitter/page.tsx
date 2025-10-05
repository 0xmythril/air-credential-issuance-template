"use client";
import { Spinner } from "@/components/ui/spinner";
import { LoadingState } from "@/components/common/States";
import { useTwitter } from "@/lib/hooks/useTwitter";
import { GetStartedView } from "../_components/GetStartedView";
import { RouteHero } from "@/components/common/RouteHero";

export default function TwitterPage() {
  const twitter = useTwitter();

  if (twitter.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingState title="Loading Twitter session..." />
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
