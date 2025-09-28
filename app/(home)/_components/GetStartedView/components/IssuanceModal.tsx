import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { useAirkit } from "@/lib/hooks/useAirkit";
import { useSession } from "@/lib/hooks/useSession";
import { useSpotify } from "@/lib/hooks/useSpotify";
import { formatKey, formatValue, getNameFromAccessToken } from "@/lib/utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useUserData } from "../hooks";

export function IssuanceModal() {
  const { airService, isInitialized } = useAirkit();
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const { data: userData, isError, isLoading: isUserDataLoading, refetch } = useUserData();
  const { accessToken, setAccessToken } = useSession();
  const spotify = useSpotify();
  const [isWidgetLoading, setIsWidgetLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  let name = getNameFromAccessToken(accessToken);
  const isWalletLogin = env.NEXT_PUBLIC_AUTH_METHOD === "wallet";
  const isAirKitLogin = env.NEXT_PUBLIC_AUTH_METHOD === "airkit";
  const isSpotifyLogin = env.NEXT_PUBLIC_AUTH_METHOD === "spotify";

  // Transform data to be AIR Kit credential compatible (single level, primitive values only)
  const transformForCredential = (data: any): Record<string, string | number | boolean | string[]> => {
    const transformed: Record<string, string | number | boolean | string[]> = {};
    
    // Handle Spotify data
    if (data.user_type === "spotify") {
      // Basic user info (exclude user_type as requested)
      if (data.spotify_id) transformed.spotify_id = data.spotify_id;
      if (data.display_name) transformed.display_name = data.display_name;
      
      // Transform arrays to simple string arrays (names only)
      if (data.followed_artists?.length) {
        transformed.followed_artists = data.followed_artists.map((artist: any) => 
          typeof artist === 'string' ? artist : artist.name || 'Unknown Artist'
        );
      }
      if (data.top_artists?.length) {
        transformed.top_artists = data.top_artists.map((artist: any) => 
          typeof artist === 'string' ? artist : artist.name || 'Unknown Artist'
        );
      }
      if (data.top_tracks?.length) {
        transformed.top_tracks = data.top_tracks.map((track: any) => 
          typeof track === 'string' ? track : track.name || 'Unknown Track'
        );
      }
      
      // Flatten music_taste_summary into individual fields
      if (data.music_taste_summary) {
        const summary = data.music_taste_summary;
        if (summary.music_diversity_score !== undefined) {
          transformed.music_diversity_score = summary.music_diversity_score;
        }
        if (summary.top_genres?.length) {
          transformed.top_genres = summary.top_genres;
        }
        if (summary.total_followed_artists !== undefined) {
          transformed.total_followed_artists = summary.total_followed_artists;
        }
        // Exclude total_top_artists and total_top_tracks as requested
      }
    } else {
      // Handle wallet/other data (keep existing logic)
      for (const [key, value] of Object.entries(data)) {
        if (key === "is_test_address") continue; // Skip test address
        if (value != null) {
          transformed[key] = value as string | number | boolean | string[];
        }
      }
    }
    
    return transformed;
  };

  const issueCredential = async ({
    response,
    jwt,
  }: {
    response: Record<string, string | number | boolean | string[]>;
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
      
      console.log("🚀 Issuing credential with AIR Kit:", {
        authToken: jwt ? "present" : "missing",
        credentialId: env.NEXT_PUBLIC_ISSUE_PROGRAM_ID,
        credentialSubject: credentialSubject,
        issuerDid: env.NEXT_PUBLIC_ISSUER_DID,
      });
      
      await airService.issueCredential({
        authToken: jwt,
        credentialId: env.NEXT_PUBLIC_ISSUE_PROGRAM_ID,
        credentialSubject,
        issuerDid: env.NEXT_PUBLIC_ISSUER_DID,
      });
      
      console.log("✅ Credential issued successfully!");
      setIsSuccess(true);
    } catch (error) {
      console.error("❌ Error issuing credential:", error);
      throw error;
    } finally {
      setIsWidgetLoading(false);
    }
  };

  const onContinue = async () => {
    setIsWidgetLoading(true);
    try {
      // Handle different authentication methods
      if (isSpotifyLogin) {
        if (!spotify.isAuthenticated) {
          setIsWidgetLoading(false); // Reset loading since we're redirecting
          spotify.signIn();
          return;
        }
        
        // For Spotify users, create internal session if not exists
        if (!accessToken) {
          try {
            const spotifyUser = await spotify.getCurrentUser();
            if (!spotifyUser) {
              throw new Error("Failed to get Spotify user");
            }

            const verifyRes = await fetch("/api/auth/spotify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${spotify.accessToken}`,
              },
              body: JSON.stringify({ 
                spotifyId: spotifyUser.id,
                name: spotifyUser.display_name,
                email: spotifyUser.email 
              }),
            });

            const data = (await verifyRes.json()) as {
              accessToken: string;
              spotifyId: string;
            };

            if (!data.accessToken) {
              throw new Error("Invalid Spotify login");
            }
            setAccessToken(data.accessToken);
            
            // Wait for user data to be fetched before proceeding
            console.log("🔄 Refetching user data after Spotify auth...");
            const result = await refetch();
            console.log("📊 Refetch result:", result);
            if (!result.data) {
              throw new Error("Failed to fetch user data after Spotify authentication");
            }
          } catch (error) {
            console.error(error);
            throw error;
          }
        }
      } else if (isWalletLogin) {
        if (!accessToken || !isConnected) {
          openConnectModal?.();
          return;
        }
      }

      // AIR Kit login is required for all authentication methods
      console.log("🔑 Checking AIR Kit login status:", airService.isLoggedIn);
      while (!airService.isLoggedIn) {
        console.log("🔑 Logging into AIR Kit...");
        await airService.login();
      }
      console.log("✅ AIR Kit login complete");

      // Handle AIR Kit specific token creation
      if (isAirKitLogin && !accessToken) {
        try {
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
          
          // Wait for user data to be fetched before proceeding
          const result = await refetch();
          if (!result.data) {
            throw new Error("Failed to fetch user data after AIR Kit authentication");
          }
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      name = isSpotifyLogin 
        ? spotify.user?.display_name || spotify.user?.id || "Spotify User"
        : getNameFromAccessToken(accessToken);

      // Final check for user data availability
      console.log("Debug - checking user data:", { 
        userData: userData, 
        accessToken: accessToken,
        isSpotifyLogin: isSpotifyLogin,
        spotifyAuth: spotify.isAuthenticated,
        isError: isError,
        isUserDataLoading: isUserDataLoading
      });
      
      // If we still don't have userData, try one more refetch
      let finalUserData = userData;
      if (!finalUserData || !finalUserData.response || !finalUserData.jwt) {
        console.log("🔄 Final refetch attempt...");
        const finalResult = await refetch();
        finalUserData = finalResult.data;
        
        if (!finalUserData || !finalUserData.response || !finalUserData.jwt) {
          console.error("Final user data check failed:", { finalUserData, userData, accessToken, isSpotifyLogin });
          throw new Error("User data is not available. Please try signing out and signing in again.");
        }
      }

      const { response, jwt } = finalUserData;

      // Transform response data for AIR Kit credential format
      const transformedResponse = transformForCredential(response as any);
      
      console.log("🔄 Data transformation:", {
        original: response,
        transformed: transformedResponse
      });

      console.log("🎯 About to issue credential with:", { credentialResponse: transformedResponse, jwt: jwt ? "present" : "missing" });
      await issueCredential({ response: transformedResponse, jwt });
      console.log("🎉 Credential issuance process completed!");
    } catch (error) {
      console.error("❌ Error in credential issuance process:", error);
      // Re-throw the error so user sees it
      throw error;
    } finally {
      setIsWidgetLoading(false);
    }
  };

  const isLoading = isWidgetLoading || !isInitialized;
  const loadingText = !isInitialized ? "Initializing..." : "Loading...";
  const response = userData?.response;

  if (isSuccess) {
    return (
      <div className="w-full max-w-[420px] text-sm text-center">
        🎉 Congrats! You have successfully stored your data securely.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="text-2xl font-bold">{env.NEXT_PUBLIC_HEADLINE}</div>

      {isError ? (
        <div className="w-full max-w-[420px] text-sm text-destructive text-center">
          Failed to load user data. Please try again.
        </div>
      ) : isUserDataLoading ? (
        <div className="w-full max-w-[420px] text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <div className="text-sm text-muted-foreground">
            Fetching your data...
          </div>
          <div className="text-xs text-muted-foreground">
            This may take a moment while we gather your data.
          </div>
        </div>
      ) : (
        <>
          {/* Show info message when no data yet */}
          {!response && isSpotifyLogin && (
            <div className="text-sm text-muted-foreground max-w-md space-y-2">
              {!spotify.isAuthenticated ? (
                <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-3">
                  🎵 Connect your Spotify account to create a credential based on your music taste
                </div>
              ) : !accessToken ? (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                  ℹ️ You're signed in to Spotify. Click "Get My Music Data" to fetch your listening history and create a credential.
                </div>
              ) : null}
            </div>
          )}
          
          {response && (
            <>
              <div className="text-sm text-muted-foreground">
                {name && <>Welcome, {name}!</>}
              </div>
              <div className="space-y-2 text-center max-w-md">
                {isSpotifyLogin ? (
                  // Spotify-specific display showing credential data structure
                  <div className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
                      <div className="text-center">
                        <h3 className="font-semibold text-sm">🎵 Your Music Credential Data</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          This is what will be stored as your verifiable credential
                        </p>
                      </div>
                      
                      {/* Transform and display the credential data */}
                      {(() => {
                        const credentialData = transformForCredential(response as any);
                        return (
                          <div className="space-y-3">
                            {/* Basic Info */}
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Profile:</div>
                              <div className="pl-2 space-y-1 text-xs">
                                {credentialData.display_name && (
                                  <div><span className="font-medium">Name:</span> {credentialData.display_name}</div>
                                )}
                                {credentialData.spotify_id && (
                                  <div><span className="font-medium">Spotify ID:</span> {credentialData.spotify_id}</div>
                                )}
                              </div>
                            </div>

                            {/* Music Data */}
                            {(Array.isArray(credentialData.followed_artists) && credentialData.followed_artists.length > 0) || 
                             (Array.isArray(credentialData.top_artists) && credentialData.top_artists.length > 0) || 
                             (Array.isArray(credentialData.top_tracks) && credentialData.top_tracks.length > 0) ? (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Music Data:</div>
                                <div className="pl-2 space-y-1 text-xs">
                                  {Array.isArray(credentialData.followed_artists) && credentialData.followed_artists.length > 0 && (
                                    <div>
                                      <span className="font-medium">Followed Artists ({credentialData.followed_artists.length}):</span>
                                      <div className="text-muted-foreground mt-1">
                                        {credentialData.followed_artists.slice(0, 3).join(", ")}
                                        {credentialData.followed_artists.length > 3 && ` +${credentialData.followed_artists.length - 3} more`}
                                      </div>
                                    </div>
                                  )}
                                  {Array.isArray(credentialData.top_artists) && credentialData.top_artists.length > 0 && (
                                    <div>
                                      <span className="font-medium">Top Artists ({credentialData.top_artists.length}):</span>
                                      <div className="text-muted-foreground mt-1">
                                        {credentialData.top_artists.slice(0, 3).join(", ")}
                                        {credentialData.top_artists.length > 3 && ` +${credentialData.top_artists.length - 3} more`}
                                      </div>
                                    </div>
                                  )}
                                  {Array.isArray(credentialData.top_tracks) && credentialData.top_tracks.length > 0 && (
                                    <div>
                                      <span className="font-medium">Top Tracks ({credentialData.top_tracks.length}):</span>
                                      <div className="text-muted-foreground mt-1">
                                        {credentialData.top_tracks.slice(0, 3).join(", ")}
                                        {credentialData.top_tracks.length > 3 && ` +${credentialData.top_tracks.length - 3} more`}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null}

                            {/* Music Analytics */}
                            {(Array.isArray(credentialData.top_genres) && credentialData.top_genres.length > 0) || 
                             credentialData.music_diversity_score !== undefined || 
                             credentialData.total_followed_artists !== undefined ? (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Music Analytics:</div>
                                <div className="pl-2 space-y-1 text-xs">
                                  {Array.isArray(credentialData.top_genres) && credentialData.top_genres.length > 0 && (
                                    <div>
                                      <span className="font-medium">Top Genres:</span>
                                      <div className="text-muted-foreground">{credentialData.top_genres.join(", ")}</div>
                                    </div>
                                  )}
                                  {credentialData.music_diversity_score !== undefined && (
                                    <div><span className="font-medium">Music Diversity Score:</span> {credentialData.music_diversity_score}</div>
                                  )}
                                  {credentialData.total_followed_artists !== undefined && (
                                    <div><span className="font-medium">Total Followed Artists:</span> {credentialData.total_followed_artists}</div>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-xs text-muted-foreground text-center bg-green-50 dark:bg-green-950 rounded p-2">
                      ✅ This data will be stored as a tamper-proof, verifiable credential on the blockchain
                    </div>
                  </div>
                ) : (
                  // Original wallet/other display
                  Object.entries(response).map(([key, value]) => {
                    // Skip the is_test_address field from display
                    if (key === "is_test_address") return null;
                    
                    const isTestAddress = Boolean((response as Record<string, unknown>).is_test_address);
                    const isAddressField = key === "address";
                    
                    return (
                      <div key={key} className={isAddressField && isTestAddress ? "text-orange-600 font-semibold" : ""}>
                        {formatKey(key, isTestAddress)}: {formatValue(key, value)}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </>
      )}

      {isError ? (
        <Button
          className="w-full max-w-[200px]"
          size="lg"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      ) : (
        <Button
          className="w-full max-w-[200px]"
          size="lg"
          onClick={onContinue}
          isLoading={isLoading}
        >
          {isLoading
            ? loadingText
            : accessToken
            ? "Store Data"
            : isSpotifyLogin
            ? (spotify.isAuthenticated 
                ? "Get My Music Data" 
                : "Sign in with Spotify")
            : isWalletLogin
            ? "Connect Wallet"
            : "Login"}
        </Button>
      )}
    </div>
  );
}
