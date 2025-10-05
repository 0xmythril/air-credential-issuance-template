import { useAuthMethod } from "@/lib/contexts/AuthMethodContext";
import { useSpotify } from "@/lib/hooks/useSpotify";
import { useTwitter } from "@/lib/hooks/useTwitter";
import { useDiscord } from "@/lib/hooks/useDiscord";
import { useLinkedIn } from "@/lib/hooks/useLinkedIn";
import { useSession, SessionType } from "@/lib/hooks/useSession";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

interface UseAuthHandlersProps {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  isConnected: boolean;
  refetch: () => Promise<{
    data:
      | {
          response: object;
          jwt: string;
        }
      | undefined;
  }>;
}

// Safe wrappers for OAuth hooks
function useSafeSpotify() {
  try {
    return useSpotify();
  } catch {
    return { 
      isAuthenticated: false, 
      user: null, 
      signIn: () => {}, 
      signOut: () => {},
      getCurrentUser: async () => null,
      accessToken: null 
    };
  }
}

function useSafeTwitter() {
  try {
    return useTwitter();
  } catch {
    return { 
      isAuthenticated: false, 
      user: null, 
      signIn: () => {}, 
      signOut: () => {},
      getCurrentUser: async () => null,
      accessToken: null 
    };
  }
}

function useSafeDiscord() {
  try {
    return useDiscord();
  } catch {
    return { 
      isAuthenticated: false, 
      user: null, 
      signIn: () => {}, 
      signOut: () => {},
      getCurrentUser: async () => null,
      accessToken: null 
    };
  }
}

function useSafeLinkedIn() {
  try {
    return useLinkedIn();
  } catch {
    return { 
      isAuthenticated: false, 
      user: null, 
      signIn: () => {}, 
      signOut: () => {},
      getCurrentUser: async () => null,
      accessToken: null 
    };
  }
}

export const useAuthHandlers = ({
  accessToken,
  setAccessToken,
  isConnected,
  refetch,
}: UseAuthHandlersProps) => {
  const { authMethod } = useAuthMethod();
  const sessionStore = useSession();
  const spotify = useSafeSpotify();
  const twitter = useSafeTwitter();
  const discord = useSafeDiscord();
  const linkedin = useSafeLinkedIn();
  const { openConnectModal } = useConnectModal();

  const isWalletLogin = authMethod === "wallet";
  const isSpotifyLogin = authMethod === "spotify";
  const isTwitterLogin = authMethod === "twitter";
  const isDiscordLogin = authMethod === "discord";
  const isLinkedInLogin = authMethod === "linkedin";
  const isAirKitLogin = authMethod === "airkit";

  const handleSpotifyAuth = async (): Promise<boolean> => {
    console.log("🎵 [Spotify Auth] Starting Spotify authentication flow");
    console.log("🎵 [Spotify Auth] isAuthenticated:", spotify.isAuthenticated);
    console.log("🎵 [Spotify Auth] Current accessToken:", accessToken ? "exists" : "null");
    
    if (!spotify.isAuthenticated) {
      console.log("🎵 [Spotify Auth] User not authenticated, initiating sign-in");
      spotify.signIn();
      return false; // Indicate redirect happened
    }

    if (!accessToken) {
      console.log("🎵 [Spotify Auth] No internal access token, fetching Spotify user data");
      let spotifyUser;
      try {
        spotifyUser = await spotify.getCurrentUser();
        console.log("🎵 [Spotify Auth] Successfully retrieved Spotify user:", spotifyUser);
      } catch (error) {
        // Token expired or invalid - clear session and prompt re-auth
        console.error("🎵 [Spotify Auth] ❌ Error fetching current user:", error);
        
        // Check both error message and error object structure
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorString = JSON.stringify(error);
        
        console.log("🎵 [Spotify Auth] Error message:", errorMessage);
        console.log("🎵 [Spotify Auth] Error string:", errorString);
        
        // Check if it's a token expiry error
        const isTokenError = 
          errorMessage.toLowerCase().includes("bad or expired token") ||
          errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("token") ||
          errorString.toLowerCase().includes("bad or expired token");
        
        console.log("🎵 [Spotify Auth] Is token error?", isTokenError);
        
        if (isTokenError) {
          console.log("🎵 [Spotify Auth] 🔄 Clearing expired Spotify session");
          sessionStore.clearSession("spotify");
          spotify.signOut();
          throw new Error("Spotify session expired. Please sign in again.");
        }
        throw error;
      }

      if (!spotifyUser) {
        console.error("🎵 [Spotify Auth] ❌ No user data returned");
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
          email: spotifyUser.email,
        }),
      });

      const data = (await verifyRes.json()) as {
        accessToken: string;
        spotifyId: string;
      };

      if (!data.accessToken) {
        console.error("🎵 [Spotify Auth] ❌ No access token in response");
        throw new Error("Invalid Spotify login");
      }
      
      console.log("🎵 [Spotify Auth] ✅ Received internal access token:", data.accessToken.substring(0, 20) + "...");
      setAccessToken(data.accessToken);

      // Verify the token was set in the store
      console.log("🎵 [Spotify Auth] 🔍 Verifying token in store...");
      const verifySession = sessionStore.getSession("spotify");
      console.log("🎵 [Spotify Auth] Token in store:", !!verifySession.accessToken);

      // Wait for state to update and propagate
      console.log("🎵 [Spotify Auth] ⏱️ Waiting for state sync...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("🎵 [Spotify Auth] 🔄 Refetching user data...");
      const result = await refetch();
      console.log("🎵 [Spotify Auth] Refetch result:", result);
      if (!result.data) {
        console.error("🎵 [Spotify Auth] ❌ No data after refetch");
        throw new Error("Failed to fetch user data after Spotify authentication");
      }
      console.log("🎵 [Spotify Auth] ✅ User data fetched successfully:", result.data);
    }
    console.log("🎵 [Spotify Auth] ✅ Spotify authentication complete");
    return true;
  };

  const handleTwitterAuth = async (): Promise<boolean> => {
    console.log("🐦 [Twitter Auth] Starting Twitter authentication flow");
    console.log("🐦 [Twitter Auth] isAuthenticated:", twitter.isAuthenticated);
    console.log("🐦 [Twitter Auth] Current accessToken:", accessToken ? "exists" : "null");
    console.log("🐦 [Twitter Auth] Twitter session user:", twitter.user);
    
    if (!twitter.isAuthenticated) {
      console.log("🐦 [Twitter Auth] User not authenticated, initiating sign-in");
      twitter.signIn();
      return false; // Indicate redirect happened
    }

    if (!accessToken) {
      console.log("🐦 [Twitter Auth] No internal access token, fetching Twitter user data");
      let twitterUser;
      try {
        twitterUser = await twitter.getCurrentUser();
        console.log("🐦 [Twitter Auth] Successfully retrieved Twitter user:", twitterUser);
      } catch (error) {
        // Token expired or invalid - clear session and prompt re-auth
        console.error("🐦 [Twitter Auth] ❌ Error fetching current user:", error);
        
        // Check both error message and error object structure
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorString = JSON.stringify(error);
        
        console.log("🐦 [Twitter Auth] Error message:", errorMessage);
        console.log("🐦 [Twitter Auth] Error string:", errorString);
        
        // Check if it's a token expiry error
        const isTokenError = 
          errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("401") ||
          errorMessage.toLowerCase().includes("token") ||
          errorString.toLowerCase().includes("expired");
        
        console.log("🐦 [Twitter Auth] Is token error?", isTokenError);
        
        if (isTokenError) {
          console.log("🐦 [Twitter Auth] 🔄 Clearing expired Twitter session");
          sessionStore.clearSession("twitter");
          twitter.signOut();
          throw new Error("Twitter session expired. Please sign in again.");
        }
        throw error;
      }

      if (!twitterUser) {
        console.error("🐦 [Twitter Auth] ❌ No user data returned");
        throw new Error("Failed to get Twitter user");
      }

      console.log("🐦 [Twitter Auth] Twitter user details:");
      console.log("🐦 [Twitter Auth] - ID:", twitterUser.id);
      console.log("🐦 [Twitter Auth] - Username:", twitterUser.username);
      console.log("🐦 [Twitter Auth] - Name:", twitterUser.name);
      
      if (!twitterUser.id) {
        console.error("🐦 [Twitter Auth] ❌ Twitter user ID is missing!");
        throw new Error("Twitter user ID is required but missing from session");
      }

      console.log("🐦 [Twitter Auth] Creating internal access token via /api/auth/twitter");
      const verifyRes = await fetch("/api/auth/twitter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterId: twitterUser.id,
          username: twitterUser.username,
          name: twitterUser.name,
          twitterAccessToken: twitter.accessToken,
        }),
      });

      const data = (await verifyRes.json()) as {
        accessToken: string;
        twitterId: string;
      };

      if (!data.accessToken) {
        console.error("🐦 [Twitter Auth] ❌ No access token in response");
        throw new Error("Invalid Twitter login");
      }
      
      console.log("🐦 [Twitter Auth] ✅ Received internal access token:", data.accessToken.substring(0, 20) + "...");
      setAccessToken(data.accessToken);

      // Verify the token was set in the store
      console.log("🐦 [Twitter Auth] 🔍 Verifying token in store...");
      const verifySession = sessionStore.getSession("twitter");
      console.log("🐦 [Twitter Auth] Token in store:", !!verifySession.accessToken);

      // Wait for state to update and propagate
      console.log("🐦 [Twitter Auth] ⏱️ Waiting for state sync...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("🐦 [Twitter Auth] 🔄 Refetching user data...");
      const result = await refetch();
      console.log("🐦 [Twitter Auth] Refetch result:", result);
      if (!result.data) {
        console.error("🐦 [Twitter Auth] ❌ No data after refetch");
        throw new Error("Failed to fetch user data after Twitter authentication");
      }
      console.log("🐦 [Twitter Auth] ✅ User data fetched successfully:", result.data);
    }
    console.log("🐦 [Twitter Auth] ✅ Twitter authentication complete");
    return true;
  };

  const handleDiscordAuth = async (): Promise<boolean> => {
    console.log("💬 [Discord Auth] Starting Discord authentication flow");
    console.log("💬 [Discord Auth] isAuthenticated:", discord.isAuthenticated);
    console.log("💬 [Discord Auth] Current accessToken:", accessToken ? "exists" : "null");
    
    if (!discord.isAuthenticated) {
      console.log("💬 [Discord Auth] User not authenticated, initiating sign-in");
      discord.signIn();
      return false; // Indicate redirect happened
    }

    if (!accessToken) {
      console.log("💬 [Discord Auth] No internal access token, fetching Discord user data");
      let discordUser;
      try {
        discordUser = await discord.getCurrentUser();
        console.log("💬 [Discord Auth] Successfully retrieved Discord user:", discordUser);
      } catch (error) {
        // Token expired or invalid - clear session and prompt re-auth
        console.error("💬 [Discord Auth] ❌ Error fetching current user:", error);
        
        // Check both error message and error object structure
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorString = JSON.stringify(error);
        
        console.log("💬 [Discord Auth] Error message:", errorMessage);
        console.log("💬 [Discord Auth] Error string:", errorString);
        
        // Check if it's a token expiry error
        const isTokenError = 
          errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("401") ||
          errorMessage.toLowerCase().includes("token") ||
          errorString.toLowerCase().includes("expired");
        
        console.log("💬 [Discord Auth] Is token error?", isTokenError);
        
        if (isTokenError) {
          console.log("💬 [Discord Auth] 🔄 Clearing expired Discord session");
          sessionStore.clearSession("discord");
          discord.signOut();
          throw new Error("Discord session expired. Please sign in again.");
        }
        throw error;
      }

      if (!discordUser) {
        console.error("💬 [Discord Auth] ❌ No user data returned");
        throw new Error("Failed to get Discord user");
      }

      console.log("💬 [Discord Auth] Creating internal access token via /api/auth/discord");
      const verifyRes = await fetch("/api/auth/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discordId: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          email: discordUser.email,
          discordAccessToken: discord.accessToken,
        }),
      });

      const data = (await verifyRes.json()) as {
        accessToken: string;
        discordId: string;
      };

      if (!data.accessToken) {
        console.error("💬 [Discord Auth] ❌ No access token in response");
        throw new Error("Invalid Discord login");
      }
      
      console.log("💬 [Discord Auth] ✅ Received internal access token:", data.accessToken.substring(0, 20) + "...");
      setAccessToken(data.accessToken);

      // Verify the token was set in the store
      console.log("💬 [Discord Auth] 🔍 Verifying token in store...");
      const verifySession = sessionStore.getSession("discord");
      console.log("💬 [Discord Auth] Token in store:", !!verifySession.accessToken);

      // Wait for state to update and propagate
      console.log("💬 [Discord Auth] ⏱️ Waiting for state sync...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("💬 [Discord Auth] 🔄 Refetching user data...");
      const result = await refetch();
      console.log("💬 [Discord Auth] Refetch result:", result);
      if (!result.data) {
        console.error("💬 [Discord Auth] ❌ No data after refetch");
        throw new Error("Failed to fetch user data after Discord authentication");
      }
      console.log("💬 [Discord Auth] ✅ User data fetched successfully:", result.data);
    }
    console.log("💬 [Discord Auth] ✅ Discord authentication complete");
    return true;
  };

  const handleLinkedInAuth = async (): Promise<boolean> => {
    console.log("💼 [LinkedIn Auth] Starting LinkedIn authentication flow");
    console.log("💼 [LinkedIn Auth] isAuthenticated:", linkedin.isAuthenticated);
    console.log("💼 [LinkedIn Auth] Current accessToken:", accessToken ? "exists" : "null");
    
    if (!linkedin.isAuthenticated) {
      console.log("💼 [LinkedIn Auth] User not authenticated, initiating sign-in");
      linkedin.signIn();
      return false; // Indicate redirect happened
    }

    if (!accessToken) {
      console.log("💼 [LinkedIn Auth] No internal access token, fetching LinkedIn user data");
      let linkedinUser;
      try {
        linkedinUser = await linkedin.getCurrentUser();
        console.log("💼 [LinkedIn Auth] Successfully retrieved LinkedIn user:", linkedinUser);
      } catch (error) {
        // Token expired or invalid - clear session and prompt re-auth
        console.error("💼 [LinkedIn Auth] ❌ Error fetching current user:", error);
        
        // Check both error message and error object structure
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorString = JSON.stringify(error);
        
        console.log("💼 [LinkedIn Auth] Error message:", errorMessage);
        console.log("💼 [LinkedIn Auth] Error string:", errorString);
        
        // Check if it's a token expiry error
        const isTokenError = 
          errorMessage.toLowerCase().includes("expired") ||
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("401") ||
          errorMessage.toLowerCase().includes("token") ||
          errorString.toLowerCase().includes("expired");
        
        console.log("💼 [LinkedIn Auth] Is token error?", isTokenError);
        
        if (isTokenError) {
          console.log("💼 [LinkedIn Auth] 🔄 Clearing expired LinkedIn session");
          sessionStore.clearSession("linkedin");
          linkedin.signOut();
          throw new Error("LinkedIn session expired. Please sign in again.");
        }
        throw error;
      }

      if (!linkedinUser) {
        console.error("💼 [LinkedIn Auth] ❌ No user data returned");
        throw new Error("Failed to get LinkedIn user");
      }

      console.log("💼 [LinkedIn Auth] Creating internal access token via /api/auth/linkedin");
      const verifyRes = await fetch("/api/auth/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkedinId: linkedinUser.id,
          name: linkedinUser.name,
          email: linkedinUser.email,
          linkedinAccessToken: linkedin.accessToken,
        }),
      });

      const data = (await verifyRes.json()) as {
        accessToken: string;
        linkedinId: string;
      };

      if (!data.accessToken) {
        console.error("💼 [LinkedIn Auth] ❌ No access token in response");
        throw new Error("Invalid LinkedIn login");
      }
      
      console.log("💼 [LinkedIn Auth] ✅ Received internal access token:", data.accessToken.substring(0, 20) + "...");
      setAccessToken(data.accessToken);

      // Verify the token was set in the store
      console.log("💼 [LinkedIn Auth] 🔍 Verifying token in store...");
      const verifySession = sessionStore.getSession("linkedin");
      console.log("💼 [LinkedIn Auth] Token in store:", !!verifySession.accessToken);

      // Wait for state to update and propagate
      console.log("💼 [LinkedIn Auth] ⏱️ Waiting for state sync...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("💼 [LinkedIn Auth] 🔄 Refetching user data...");
      const result = await refetch();
      console.log("💼 [LinkedIn Auth] Refetch result:", result);
      if (!result.data) {
        console.error("💼 [LinkedIn Auth] ❌ No data after refetch");
        throw new Error("Failed to fetch user data after LinkedIn authentication");
      }
      console.log("💼 [LinkedIn Auth] ✅ User data fetched successfully:", result.data);
    }
    console.log("💼 [LinkedIn Auth] ✅ LinkedIn authentication complete");
    return true;
  };

  const handleWalletAuth = (): boolean => {
    if (!accessToken || !isConnected) {
      openConnectModal?.();
      return false;
    }
    return true;
  };

  const handleAuth = async (): Promise<boolean> => {
    if (isSpotifyLogin) {
      return handleSpotifyAuth();
    } else if (isTwitterLogin) {
      return handleTwitterAuth();
    } else if (isDiscordLogin) {
      return handleDiscordAuth();
    } else if (isLinkedInLogin) {
      return handleLinkedInAuth();
    } else if (isWalletLogin) {
      return handleWalletAuth();
    }
    return true;
  };

  return {
    handleAuth,
    isSpotifyLogin,
    isTwitterLogin,
    isDiscordLogin,
    isLinkedInLogin,
    isWalletLogin,
    isAirKitLogin,
    spotify,
    twitter,
    discord,
    linkedin,
  };
};
