import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { useAirkit } from "@/lib/hooks/useAirkit";
import { useSession } from "@/lib/hooks/useSession";
import { getNameFromAccessToken } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useUserData } from "../../hooks";
import { transformForCredential, getHeadline } from "./utils";
import { SpotifyPreview, TwitterPreview, WalletPreview } from "./DataPreview";
import { InfoMessages } from "./InfoMessages";
import { useAuthHandlers, useCredentialIssuance } from "./hooks";
import type { SpotifyUserData } from "./types";

export function IssuanceModal() {
  const { airService, isInitialized } = useAirkit();
  const { isConnected } = useAccount();
  const { data: userData, isError, isLoading: isUserDataLoading, refetch } = useUserData();
  const { accessToken, setAccessToken } = useSession();

  const { handleAuth, isSpotifyLogin, isTwitterLogin, isWalletLogin, spotify, twitter } =
    useAuthHandlers({
      accessToken,
      setAccessToken,
      isConnected,
      refetch,
    });

  const { issueCredential, isWidgetLoading, setIsWidgetLoading, isSuccess } =
    useCredentialIssuance({ airService });

  const isAirKitLogin = env.NEXT_PUBLIC_AUTH_METHOD === "airkit";

  const onContinue = async () => {
    setIsWidgetLoading(true);
    try {
      // Handle authentication
      const authSuccess = await handleAuth();
      if (!authSuccess) {
        // Redirect happened, stop processing
        setIsWidgetLoading(false);
        return;
      }

      // AIR Kit login is required for all authentication methods
      while (!airService.isLoggedIn) {
        await airService.login();
      }
      console.log("✅ AIR Kit login complete");

      // Handle AIR Kit specific token creation
      if (isAirKitLogin && !accessToken) {
        const airkitToken = await airService.getAccessToken();
        const name = (await airService.getUserInfo())?.user?.email;

        const verifyRes = await fetch("/api/auth/airkit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${airkitToken.token}`,
          },
          body: JSON.stringify({ name }),
        });

        const data = (await verifyRes.json()) as {
          accessToken: string;
          walletAddress: string;
        };

        if (!data.accessToken) {
          throw new Error("Invalid login");
        }
        setAccessToken(data.accessToken);

        const result = await refetch();
        if (!result.data) {
          throw new Error("Failed to fetch user data after AIR Kit authentication");
        }
      }

      // Final check for user data availability
      let finalUserData = userData;
      if (!finalUserData || !finalUserData.response || !finalUserData.jwt) {
        console.log("🔄 Final refetch attempt...");
        const finalResult = await refetch();
        finalUserData = finalResult.data;

        if (!finalUserData || !finalUserData.response || !finalUserData.jwt) {
          console.error("Final user data check failed:", {
            finalUserData,
            userData,
            accessToken,
            isSpotifyLogin,
          });
          throw new Error("User data is not available. Please try signing out and signing in again.");
        }
      }

      const { response, jwt } = finalUserData;

      // Transform response data for AIR Kit credential format
      const transformedResponse = transformForCredential(
        response as SpotifyUserData | Record<string, unknown>
      );

      // Issue credential with transformed data
      await issueCredential({
        response: transformedResponse,
        jwt: jwt,
      });
    } catch (error) {
      console.error("❌ Error in credential issuance process:", error);
      throw error;
    } finally {
      setIsWidgetLoading(false);
    }
  };

  // Computed values
  const isLoading = isWidgetLoading || !isInitialized;
  const loadingText = !isInitialized ? "Initializing..." : "Loading...";
  const response = userData?.response;

  const name = isSpotifyLogin
    ? ((spotify.user as Record<string, unknown>)?.display_name as string) ||
      ((spotify.user as Record<string, unknown>)?.id as string) ||
      "Spotify User"
    : isTwitterLogin
    ? ((twitter.user as Record<string, unknown>)?.name as string) ||
      ((twitter.user as Record<string, unknown>)?.username as string) ||
      "Twitter User"
    : getNameFromAccessToken(accessToken);

  const buttonText = isLoading
    ? loadingText
    : accessToken
    ? "Store Data"
    : isSpotifyLogin
    ? spotify.isAuthenticated
      ? "Get My Music Data"
      : "Sign in with Spotify"
    : isTwitterLogin
    ? twitter.isAuthenticated
      ? "Get My Profile Data"
      : "Sign in with Twitter"
    : isWalletLogin
    ? "Connect Wallet"
    : "Login";

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-[420px] text-sm text-center">
        🎉 Congrats! You have successfully stored your data securely.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="text-2xl font-bold">{getHeadline()}</div>

      {isError ? (
        <div className="w-full max-w-[420px] text-sm text-destructive text-center">
          Failed to load user data. Please try again.
        </div>
      ) : isUserDataLoading ? (
        <div className="w-full max-w-[420px] text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <div className="text-sm text-muted-foreground">Fetching your data...</div>
          <div className="text-xs text-muted-foreground">
            This may take a moment while we gather your data.
          </div>
        </div>
      ) : (
        <>
          {/* Info messages when no data yet */}
          {!response && (
            <InfoMessages
              isSpotifyLogin={isSpotifyLogin}
              isTwitterLogin={isTwitterLogin}
              spotifyAuthenticated={spotify.isAuthenticated}
              twitterAuthenticated={twitter.isAuthenticated}
              hasAccessToken={!!accessToken}
            />
          )}

          {/* Data preview */}
          {response && (
            <>
              <div className="text-sm text-muted-foreground">
                {name && <>Welcome, {name}!</>}
              </div>
              <div className="space-y-2 text-center max-w-md">
                {isSpotifyLogin ? (
                  <SpotifyPreview
                    credentialData={transformForCredential(
                      response as SpotifyUserData | Record<string, unknown>
                    )}
                  />
                ) : isTwitterLogin ? (
                  <TwitterPreview
                    credentialData={transformForCredential(response as Record<string, unknown>)}
                  />
                ) : (
                  <WalletPreview response={response as Record<string, unknown>} />
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Action button */}
      {isError ? (
        <Button className="w-full max-w-[200px]" size="lg" onClick={() => refetch()}>
          Retry
        </Button>
      ) : (
        <Button
          className="w-full max-w-[200px]"
          size="lg"
          onClick={onContinue}
          isLoading={isLoading}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}
