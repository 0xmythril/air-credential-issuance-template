"use client";
import { Spinner } from "@/components/ui/spinner";
import { useAccount } from "wagmi";
import { GetStartedView } from "../_components/GetStartedView";
import { RouteHero } from "@/components/common/RouteHero";

export default function EthosPage() {
  const { isReconnecting } = useAccount();

  if (isReconnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-1">
        <Spinner size="medium" />
        <p className="text-sm text-muted-foreground">
          Retrieving your data...
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
