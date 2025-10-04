import { useState } from "react";
import { env } from "@/lib/env";
import type { AirService } from "@mocanetwork/airkit";
import type { CredentialData } from "../types";
import { useIssuanceProgram } from "@/lib/contexts/IssuanceProgramContext";

interface UseCredentialIssuanceProps {
  airService: AirService;
}

export const useCredentialIssuance = ({ airService }: UseCredentialIssuanceProps) => {
  const { programId } = useIssuanceProgram();
  const [isWidgetLoading, setIsWidgetLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const issueCredential = async ({
    response,
    jwt,
  }: {
    response: CredentialData;
    jwt: string;
  }) => {
    setIsWidgetLoading(true);
    try {
      // QA mock mode: short-circuit issuance to test success screen
      if (env.NEXT_PUBLIC_MOCK_ISSUANCE) {
        console.warn("[QA] Mock issuance enabled - skipping AIR Kit SDK call");
        await new Promise((r) => setTimeout(r, 300));
        setIsSuccess(true);
        return;
      }
      console.log("🎯 [Credential Issuance] ===== PREPARING CREDENTIAL =====");
      console.log("🎯 [Credential Issuance] Program ID:", programId);
      console.log("🎯 [Credential Issuance] Issuer DID:", env.NEXT_PUBLIC_ISSUER_DID);
      console.log("🎯 [Credential Issuance] Raw response data:", JSON.stringify(response, null, 2));
      
      const credentialSubject = { ...response };
      for (const key in credentialSubject) {
        if (credentialSubject[key] == null) {
          delete credentialSubject[key];
        }
      }

      console.log("🎯 [Credential Issuance] ===== FINAL CREDENTIAL SUBJECT =====");
      console.log("🎯 [Credential Issuance] Fields to be sent:", Object.keys(credentialSubject).join(', '));
      console.log("🎯 [Credential Issuance] credentialSubject:", JSON.stringify(credentialSubject, null, 2));
      console.log("🎯 [Credential Issuance] Field count:", Object.keys(credentialSubject).length);

      // Issue credential with AIR Kit (uses program ID from env based on route)
      console.log("🎯 [Credential Issuance] Sending to AIR Kit...");
      const issueResult = await airService.issueCredential({
        authToken: jwt,
        issuerDid: env.NEXT_PUBLIC_ISSUER_DID,
        credentialId: programId,
        credentialSubject,
      });

      console.log("✅ [Credential Issuance] ===== SUCCESS =====");
      console.log("✅ [Credential Issuance] Credential issued successfully!");
      console.log("✅ [Credential Issuance] Result:", issueResult);
      setIsSuccess(true);
    } catch (error) {
      console.error("❌ [Credential Issuance] ===== ERROR =====");
      console.error("❌ [Credential Issuance] Failed to issue credential:", error);
      throw error;
    } finally {
      setIsWidgetLoading(false);
    }
  };

  return {
    issueCredential,
    isWidgetLoading,
    setIsWidgetLoading,
    isSuccess,
  };
};
