import { env } from "@/lib/env";
import { useSpotify } from "@/lib/hooks/useSpotify";
import { useTwitter } from "@/lib/hooks/useTwitter";
import { useDiscord } from "@/lib/hooks/useDiscord";
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

export const useAuthHandlers = ({
  accessToken,
  setAccessToken,
  isConnected,
  refetch,
}: UseAuthHandlersProps) => {
  const spotify = useSpotify();
  const twitter = useTwitter();
  const discord = useDiscord();
  const { openConnectModal } = useConnectModal();

  const isWalletLogin = env.NEXT_PUBLIC_AUTH_METHOD === "wallet";
  const isSpotifyLogin = env.NEXT_PUBLIC_AUTH_METHOD === "spotify";
  const isTwitterLogin = env.NEXT_PUBLIC_AUTH_METHOD === "twitter";
  const isDiscordLogin = env.NEXT_PUBLIC_AUTH_METHOD === "discord";

  const handleSpotifyAuth = async (): Promise<boolean> => {
    if (!spotify.isAuthenticated) {
      spotify.signIn();
      return false; // Indicate redirect happened
    }

    if (!accessToken) {
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
          email: spotifyUser.email,
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

      const result = await refetch();
      if (!result.data) {
        throw new Error("Failed to fetch user data after Spotify authentication");
      }
    }
    return true;
  };

  const handleTwitterAuth = async (): Promise<boolean> => {
    if (!twitter.isAuthenticated) {
      twitter.signIn();
      return false; // Indicate redirect happened
    }

    if (!accessToken) {
      const twitterUser = await twitter.getCurrentUser();
      if (!twitterUser) {
        throw new Error("Failed to get Twitter user");
      }

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
        throw new Error("Invalid Twitter login");
      }
      setAccessToken(data.accessToken);

      const result = await refetch();
      if (!result.data) {
        throw new Error("Failed to fetch user data after Twitter authentication");
      }
    }
    return true;
  };

  const handleDiscordAuth = async (): Promise<boolean> => {
    if (!discord.isAuthenticated) {
      discord.signIn();
      return false; // Indicate redirect happened
    }

    if (!accessToken) {
      const discordUser = await discord.getCurrentUser();
      if (!discordUser) {
        throw new Error("Failed to get Discord user");
      }

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
        throw new Error("Invalid Discord login");
      }
      setAccessToken(data.accessToken);

      const result = await refetch();
      if (!result.data) {
        throw new Error("Failed to fetch user data after Discord authentication");
      }
    }
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
    isWalletLogin,
    spotify,
    twitter,
    discord,
  };
};
