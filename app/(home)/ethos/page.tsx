"use client";
import { Spinner } from "@/components/ui/spinner";
import { LoadingState } from "@/components/common/States";
import { useAccount } from "wagmi";
import { GetStartedView } from "../_components/GetStartedView";
import { RouteHero } from "@/components/common/RouteHero";

export default function EthosPage() {
  const { isReconnecting } = useAccount();

  if (isReconnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingState title="Retrieving your data..." />
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
