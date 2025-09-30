import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import TwitterProvider from "next-auth/providers/twitter";
import DiscordProvider from "next-auth/providers/discord";
import { env } from "./env";

const spotifyScopes = [
  "user-read-email",
  "user-read-private", 
  "user-top-read",
  "user-follow-read",
  "playlist-read-private",
  "user-read-recently-played"
].join(" ");

// Twitter API v2 scopes
const twitterScopes = [
  "tweet.read",
  "users.read",
  "follows.read",
  "offline.access"
].join(" ");

// Discord scopes
const discordScopes = [
  "identify",
  "email",
  "guilds",
  "connections"
].join(" ");

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID || "",
      clientSecret: env.SPOTIFY_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: spotifyScopes,
        },
      },
    }),
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID || "",
      clientSecret: env.TWITTER_CLIENT_SECRET || "",
      version: "2.0", // Use Twitter API v2
      authorization: {
        params: {
          scope: twitterScopes,
        },
      },
    }),
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID || "",
      clientSecret: env.DISCORD_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: discordScopes,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token as string;
        token.refreshToken = account.refresh_token as string;
        token.expiresAt = account.expires_at as number;
        token.provider = account.provider as string;
        
        // Store Twitter-specific user data
        if (account.provider === 'twitter' && profile) {
          const twitterProfile = profile as Record<string, unknown>;
          const data = twitterProfile.data as Record<string, unknown>;
          if (data) {
            token.twitterId = data.id as string;
            token.twitterUsername = data.username as string;
          }
        }
        
        // Store Discord-specific user data
        if (account.provider === 'discord' && profile) {
          const discordProfile = profile as Record<string, unknown>;
          token.discordId = discordProfile.id as string;
          token.discordUsername = discordProfile.username as string;
          token.discordDiscriminator = discordProfile.discriminator as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      
      // Add provider-specific data to session
      if (token.provider === 'twitter') {
        if (session.user) {
          (session.user as Record<string, unknown>).id = token.twitterId as string;
          (session.user as Record<string, unknown>).username = token.twitterUsername as string;
        }
      }
      
      if (token.provider === 'discord') {
        if (session.user) {
          (session.user as Record<string, unknown>).id = token.discordId as string;
          (session.user as Record<string, unknown>).username = token.discordUsername as string;
          (session.user as Record<string, unknown>).discriminator = token.discordDiscriminator as string;
        }
      }
      
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};
