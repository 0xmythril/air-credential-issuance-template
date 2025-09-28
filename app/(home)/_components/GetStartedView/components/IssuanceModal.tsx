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

  // Interfaces for type safety
  interface SpotifyArtist {
    name: string;
    genres?: string[];
  }
  
  interface SpotifyTrack {
    name: string;
    artists?: string[];
  }
  
  interface MusicTasteSummary {
    music_diversity_score?: number;
    top_genres?: string[];
    total_followed_artists?: number;
  }
  
  interface SpotifyUserData {
    user_type?: string;
    spotify_id?: string;
    display_name?: string;
    followed_artists?: SpotifyArtist[] | unknown[];
    top_artists?: SpotifyArtist[] | unknown[];
    top_tracks?: SpotifyTrack[] | unknown[];
    music_taste_summary?: MusicTasteSummary | Record<string, unknown>;
  }

  // Transform data to be AIR Kit credential compatible (single level, objects with numbered keys)
  const transformForCredential = (data: SpotifyUserData | Record<string, unknown>): Record<string, string | number | boolean | object> => {
    const transformed: Record<string, string | number | boolean | object> = {};
    
    // Helper function to convert array to numbered object with prefixed keys (limit to 3 items)
    const arrayToNumberedObject = (arr: unknown[], prefix: string, getName: (item: unknown) => string) => {
      const obj: Record<string, string> = {};
      const items = arr.slice(0, 3); // Limit to 3 items
      items.forEach((item, index) => {
        obj[`${prefix}_${index + 1}`] = getName(item);
      });
      return obj;
    };
    
    // Handle Spotify data
    if (data.user_type === "spotify") {
      // Basic user info (exclude user_type and display_name as requested)
      if (data.spotify_id) transformed.spotify_id = data.spotify_id;
      
      // Transform arrays to numbered objects with prefixed keys (top 3 only)
      if (Array.isArray(data.followed_artists) && data.followed_artists.length > 0) {
        transformed.followed_artists = arrayToNumberedObject(
          data.followed_artists,
          'followed_artists',
          (artist: unknown) => {
            if (typeof artist === 'string') return artist;
            const artistObj = artist as SpotifyArtist;
            return artistObj.name || 'Unknown Artist';
          }
        );
      }
      if (Array.isArray(data.top_artists) && data.top_artists.length > 0) {
        transformed.top_artists = arrayToNumberedObject(
          data.top_artists,
          'top_artists',
          (artist: unknown) => {
            if (typeof artist === 'string') return artist;
            const artistObj = artist as SpotifyArtist;
            return artistObj.name || 'Unknown Artist';
          }
        );
      }
      if (Array.isArray(data.top_tracks) && data.top_tracks.length > 0) {
        transformed.top_tracks = arrayToNumberedObject(
          data.top_tracks,
          'top_tracks',
          (track: unknown) => {
            if (typeof track === 'string') return track;
            const trackObj = track as SpotifyTrack;
            return trackObj.name || 'Unknown Track';
          }
        );
      }
      
      // Flatten music_taste_summary into individual fields
      if (data.music_taste_summary && typeof data.music_taste_summary === 'object') {
        const summary = data.music_taste_summary as MusicTasteSummary;
        if (typeof summary.music_diversity_score === 'number') {
          transformed.music_diversity_score = summary.music_diversity_score;
        }
        if (Array.isArray(summary.top_genres) && summary.top_genres.length > 0) {
          transformed.top_genres = arrayToNumberedObject(
            summary.top_genres,
            'top_genres',
            (genre: unknown) => typeof genre === 'string' ? genre : String(genre)
          );
        }
        if (typeof summary.total_followed_artists === 'number') {
          transformed.total_followed_artists = summary.total_followed_artists;
        }
        // Exclude total_top_artists and total_top_tracks as requested
      }
    } else {
      // Handle wallet/other data (keep existing logic)
      for (const [key, value] of Object.entries(data)) {
        if (key === "is_test_address") continue; // Skip test address
        if (value != null) {
          transformed[key] = value as string | number | boolean | object;
        }
      }
    }
    
    return transformed;
  };

  const issueCredential = async ({
    response,
    jwt,
  }: {
    response: Record<string, string | number | boolean | object>;
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
      const transformedResponse = transformForCredential(response as SpotifyUserData | Record<string, unknown>);
      
      console.log("🔄 Data transformation:", {
        original: response,
        transformed: transformedResponse
      });
      console.log("📋 Transformed credential structure:", JSON.stringify(transformedResponse, null, 2));

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
                  ℹ️ You&apos;re signed in to Spotify. Click &ldquo;Get My Music Data&rdquo; to fetch your listening history and create a credential.
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
                        const credentialData = transformForCredential(response as SpotifyUserData | Record<string, unknown>);
                        return (
                          <div className="space-y-3">
                            {/* Basic Info */}
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Profile:</div>
                              <div className="pl-2 space-y-1 text-xs">
                                {credentialData.spotify_id && (
                                  <div><span className="font-medium">Spotify ID:</span> {String(credentialData.spotify_id)}</div>
                                )}
                              </div>
                            </div>

                            {/* Music Data */}
                            {(() => {
                              const hasFollowedArtists = credentialData.followed_artists && typeof credentialData.followed_artists === 'object' && Object.keys(credentialData.followed_artists).length > 0;
                              const hasTopArtists = credentialData.top_artists && typeof credentialData.top_artists === 'object' && Object.keys(credentialData.top_artists).length > 0;
                              const hasTopTracks = credentialData.top_tracks && typeof credentialData.top_tracks === 'object' && Object.keys(credentialData.top_tracks).length > 0;
                              
                              if (!hasFollowedArtists && !hasTopArtists && !hasTopTracks) return null;
                              
                              return (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Music Data:</div>
                                  <div className="pl-2 space-y-1 text-xs">
                                    {hasFollowedArtists && (
                                      <div>
                                        <span className="font-medium">Top 3 Followed Artists:</span>
                                        <div className="text-muted-foreground mt-1">
                                          {Object.values(credentialData.followed_artists as Record<string, string>).join(", ")}
                                        </div>
                                        <div className="text-xs text-muted-foreground/70 mt-1">
                                          Keys: {Object.keys(credentialData.followed_artists as Record<string, string>).join(", ")}
                                        </div>
                                      </div>
                                    )}
                                    {hasTopArtists && (
                                      <div>
                                        <span className="font-medium">Top 3 Artists:</span>
                                        <div className="text-muted-foreground mt-1">
                                          {Object.values(credentialData.top_artists as Record<string, string>).join(", ")}
                                        </div>
                                        <div className="text-xs text-muted-foreground/70 mt-1">
                                          Keys: {Object.keys(credentialData.top_artists as Record<string, string>).join(", ")}
                                        </div>
                                      </div>
                                    )}
                                    {hasTopTracks && (
                                      <div>
                                        <span className="font-medium">Top 3 Tracks:</span>
                                        <div className="text-muted-foreground mt-1">
                                          {Object.values(credentialData.top_tracks as Record<string, string>).join(", ")}
                                        </div>
                                        <div className="text-xs text-muted-foreground/70 mt-1">
                                          Keys: {Object.keys(credentialData.top_tracks as Record<string, string>).join(", ")}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Music Analytics */}
                            {(() => {
                              const hasTopGenres = credentialData.top_genres && typeof credentialData.top_genres === 'object' && Object.keys(credentialData.top_genres).length > 0;
                              const hasDiversityScore = credentialData.music_diversity_score !== undefined;
                              const hasTotalFollowed = credentialData.total_followed_artists !== undefined;
                              
                              if (!hasTopGenres && !hasDiversityScore && !hasTotalFollowed) return null;
                              
                              return (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Music Analytics:</div>
                                  <div className="pl-2 space-y-1 text-xs">
                                    {hasTopGenres && (
                                      <div>
                                        <span className="font-medium">Top 3 Genres:</span>
                                        <div className="text-muted-foreground">{Object.values(credentialData.top_genres as Record<string, string>).join(", ")}</div>
                                        <div className="text-xs text-muted-foreground/70 mt-1">
                                          Keys: {Object.keys(credentialData.top_genres as Record<string, string>).join(", ")}
                                        </div>
                                      </div>
                                    )}
                                    {hasDiversityScore && (
                                      <div><span className="font-medium">Music Diversity Score:</span> {String(credentialData.music_diversity_score)}</div>
                                    )}
                                    {hasTotalFollowed && (
                                      <div><span className="font-medium">Total Followed Artists:</span> {String(credentialData.total_followed_artists)}</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
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
