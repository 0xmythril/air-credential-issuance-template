"use client";
import { Spinner } from "@/components/ui/spinner";
import { LoadingState } from "@/components/common/States";
import { useAirkit } from "@/lib/hooks/useAirkit";
import { GetStartedView } from "../_components/GetStartedView";
import { RouteHero } from "@/components/common/RouteHero";

export default function AirKitPage() {
  const { isInitialized } = useAirkit();

  if (!isInitialized) {
    return <LoadingState title="Initializing AIR Kit..." />;
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
