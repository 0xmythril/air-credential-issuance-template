"use client";

import Image from "next/image";
import { useAuthMethod } from "@/lib/contexts/AuthMethodContext";
import { env } from "@/lib/env";

function getHeroForMethod(method: string): string | null {
  switch (method) {
    case "twitter":
      return (process.env.NEXT_PUBLIC_TWITTER_HERO as string) || null;
    case "spotify":
      return (process.env.NEXT_PUBLIC_SPOTIFY_HERO as string) || null;
    case "discord":
      return (process.env.NEXT_PUBLIC_DISCORD_HERO as string) || null;
    case "wallet":
    case "ethos":
      return (process.env.NEXT_PUBLIC_ETHOS_HERO as string) || null;
    case "airkit":
      return (process.env.NEXT_PUBLIC_AIRKIT_HERO as string) || null;
    default:
      return null;
  }
}

export function RouteHero() {
  const { authMethod } = useAuthMethod();
  const src = getHeroForMethod(authMethod);
  if (!src) return null;
  return (
    <div className="w-full flex justify-center">
      <div className="relative w-full max-w-5xl aspect-[16/6] rounded-xl overflow-hidden border bg-muted">
        <Image src={src} alt="Route hero" fill className="object-cover" priority />
      </div>
    </div>
  );
}


