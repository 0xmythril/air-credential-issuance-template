import { useState } from "react";
import { env } from "@/lib/env";
import type { AirService } from "@mocanetwork/airkit";
import type { CredentialData } from "../types";

interface UseCredentialIssuanceProps {
  airService: AirService;
}

export const useCredentialIssuance = ({ airService }: UseCredentialIssuanceProps) => {
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
      const credentialSubject = { ...response };
      for (const key in credentialSubject) {
        if (credentialSubject[key] == null) {
          delete credentialSubject[key];
        }
      }

      // Issue credential with AIR Kit
      const issueResult = await airService.issueCredential({
        authToken: jwt,
        issuerDid: env.NEXT_PUBLIC_ISSUER_DID,
        credentialId: env.NEXT_PUBLIC_ISSUE_PROGRAM_ID,
        credentialSubject,
      });

      console.log("✅ Credential issued successfully:", issueResult);
      setIsSuccess(true);
    } catch (error) {
      console.error("❌ Error issuing credential:", error);
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
