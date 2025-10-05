"use client";
import { LoadingState } from "@/components/common/States";
import { useLinkedIn } from "@/lib/hooks/useLinkedIn";
import { GetStartedView } from "../_components/GetStartedView";
import { RouteHero } from "@/components/common/RouteHero";

export default function LinkedInPage() {
  const linkedin = useLinkedIn();

  if (linkedin.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingState title="Loading LinkedIn session..." />
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

