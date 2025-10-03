"use client";

import React, { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { env } from "@/lib/env";
import type { AuthMethod } from "./AuthMethodContext";

interface IssuanceProgramContextType {
  programId: string;
  authMethod: AuthMethod;
}

const IssuanceProgramContext = createContext<IssuanceProgramContextType | undefined>(
  undefined
);

// Get program ID for a specific auth method/route
function getProgramIdForAuthMethod(authMethod: AuthMethod): string {
  console.log(`🔍 [IssuanceProgram] Looking for program ID for auth method: ${authMethod}`);
  
  // Get the route-specific program ID based on auth method
  let programId: string | undefined;
  let envVarName: string;

  switch (authMethod) {
    case "spotify":
      envVarName = "NEXT_PUBLIC_SPOTIFY_PROGRAM_ID";
      programId = env.NEXT_PUBLIC_SPOTIFY_PROGRAM_ID;
      console.log(`  📋 ${envVarName}:`, programId);
      break;
    case "twitter":
      envVarName = "NEXT_PUBLIC_TWITTER_PROGRAM_ID";
      programId = env.NEXT_PUBLIC_TWITTER_PROGRAM_ID;
      console.log(`  📋 ${envVarName}:`, programId);
      break;
    case "discord":
      envVarName = "NEXT_PUBLIC_DISCORD_PROGRAM_ID";
      programId = env.NEXT_PUBLIC_DISCORD_PROGRAM_ID;
      console.log(`  📋 ${envVarName}:`, programId);
      break;
    case "wallet":
      // Check both WALLET and ETHOS variants
      envVarName = "NEXT_PUBLIC_WALLET_PROGRAM_ID or NEXT_PUBLIC_ETHOS_PROGRAM_ID";
      programId = env.NEXT_PUBLIC_WALLET_PROGRAM_ID || env.NEXT_PUBLIC_ETHOS_PROGRAM_ID;
      console.log(`  📋 NEXT_PUBLIC_WALLET_PROGRAM_ID:`, env.NEXT_PUBLIC_WALLET_PROGRAM_ID);
      console.log(`  📋 NEXT_PUBLIC_ETHOS_PROGRAM_ID:`, env.NEXT_PUBLIC_ETHOS_PROGRAM_ID);
      console.log(`  📋 Selected:`, programId);
      break;
    case "airkit":
      envVarName = "NEXT_PUBLIC_AIRKIT_PROGRAM_ID";
      programId = env.NEXT_PUBLIC_AIRKIT_PROGRAM_ID;
      console.log(`  📋 ${envVarName}:`, programId);
      break;
  }

  // Validate that program ID exists and is not empty
  if (!programId || programId.trim() === "") {
    console.error(`❌ [IssuanceProgram] No program ID found for ${authMethod} route!`);
    console.error(`   Please set: ${envVarName}`);
    throw new Error(`Missing required environment variable: ${envVarName}`);
  }
  
  console.log(`✅ [IssuanceProgram] Using program ID for ${authMethod}:`, programId);
  return programId;
}

export function IssuanceProgramProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { programId, authMethod } = useMemo(() => {
    // Extract auth method from URL path
    // Pattern: /:authMethod
    // Examples: /spotify, /twitter, /discord, /ethos
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0] || "wallet";
    
    // Map URL segment to AuthMethod (handle ethos -> wallet mapping)
    let authMethod: AuthMethod;
    if (firstSegment === "spotify") {
      authMethod = "spotify";
    } else if (firstSegment === "twitter") {
      authMethod = "twitter";
    } else if (firstSegment === "discord") {
      authMethod = "discord";
    } else if (firstSegment === "ethos" || firstSegment === "wallet") {
      authMethod = "wallet";
    } else if (firstSegment === "airkit") {
      authMethod = "airkit";
    } else {
      authMethod = "wallet"; // default
    }

    console.log(`🔍 [IssuanceProgram] URL segment: "${firstSegment}" → Auth method: "${authMethod}"`);

    // Get the program ID for this route
    const programId = getProgramIdForAuthMethod(authMethod);
    
    return {
      programId,
      authMethod,
    };
  }, [pathname]);

  return (
    <IssuanceProgramContext.Provider value={{ programId, authMethod }}>
      {children}
    </IssuanceProgramContext.Provider>
  );
}

export function useIssuanceProgram() {
  const context = useContext(IssuanceProgramContext);
  if (context === undefined) {
    throw new Error("useIssuanceProgram must be used within IssuanceProgramProvider");
  }
  return context;
}

