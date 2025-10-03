import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { toast } from "sonner";
import { useDisconnect } from "wagmi";
import { useSession } from "../hooks/useSession";
import { useAuthMethod } from "../contexts/AuthMethodContext";

export const ErrorHandler = ({ children }: { children: React.ReactNode }) => {
  const { disconnect } = useDisconnect();
  const sessionStore = useSession();
  const { authMethod } = useAuthMethod();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleError = (error: Error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        // Clear the session for current auth method
        sessionStore.clearSession(authMethod);
        
        // Only disconnect wallet if on wallet route
        if (authMethod === "wallet") {
          disconnect();
          toast.error("Session expired, please connect your wallet again");
        } else {
          // For OAuth methods, show appropriate message
          const methodName = authMethod.charAt(0).toUpperCase() + authMethod.slice(1);
          toast.error(`Session expired, please sign in with ${methodName} again`);
        }
      }
    };

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === "updated" &&
        event.query.state.error instanceof Error
      ) {
        handleError(event.query.state.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [disconnect, sessionStore, authMethod, queryClient]);

  return <>{children}</>;
};
