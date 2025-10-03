"use client";
import { Spinner } from "@/components/ui/spinner";
import { useTwitter } from "@/lib/hooks/useTwitter";
import { GetStartedView } from "../_components/GetStartedView";

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

  return <GetStartedView />;
}
