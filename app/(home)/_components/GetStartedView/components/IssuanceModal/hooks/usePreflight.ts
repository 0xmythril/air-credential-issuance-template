"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthMethod } from "@/lib/contexts/AuthMethodContext";
import { useIssuanceProgram } from "@/lib/contexts/IssuanceProgramContext";
import { useAirkit } from "@/lib/hooks/useAirkit";
import { useAccount } from "wagmi";
import { useSession } from "@/lib/hooks/useSession";

export type PreflightItemKey =
  | "programId"
  | "airkitInitialized"
  | "networkOnline"
  | "walletConnected"
  | "sessionToken";

export interface PreflightItem {
  key: PreflightItemKey;
  label: string;
  passed: boolean;
  fix?: () => Promise<void> | void;
}

// Deprecated: preflight checks moved into onContinue to avoid blocking the CTA.
export function usePreflight(_opts?: { onFixAuth?: () => Promise<void> | void }) {
  const { authMethod } = useAuthMethod();
  const { programId } = useIssuanceProgram();
  const { isInitialized } = useAirkit();
  const { isConnected } = useAccount();
  const sessionStore = useSession();

  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    const update = () => setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const needsWallet = authMethod === ("wallet" as any) || authMethod === ("ethos" as any);
  const needsSession =
    authMethod === ("spotify" as any) ||
    authMethod === ("twitter" as any) ||
    authMethod === ("discord" as any) ||
    authMethod === ("airkit" as any);
  const session = sessionStore.getSession(authMethod as any);

  const items: PreflightItem[] = [
    {
      key: "programId",
      label: "Program ID set",
      passed: Boolean(programId),
    },
    {
      key: "airkitInitialized",
      label: "AIR Kit ready",
      passed: isInitialized,
    },
    {
      key: "networkOnline",
      label: "Network online",
      passed: online,
    },
    {
      key: "walletConnected",
      label: "Wallet connected",
      passed: needsWallet ? isConnected : true,
    },
    {
      key: "sessionToken",
      label: "Session available",
      passed: needsSession ? Boolean(session?.accessToken) : true,
    },
  ];

  const passed = true;

  return {
    items,
    passed,
  };
}


