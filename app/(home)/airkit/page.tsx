"use client";
import { Spinner } from "@/components/ui/spinner";
import { useAirkit } from "@/lib/hooks/useAirkit";
import { GetStartedView } from "../_components/GetStartedView";

export default function AirKitPage() {
  const { isInitialized } = useAirkit();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-1">
        <Spinner size="medium" />
        <p className="text-sm text-muted-foreground">
          Initializing AIR Kit...
        </p>
      </div>
    );
  }

  return <GetStartedView />;
}
