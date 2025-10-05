import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import TwitterProvider from "next-auth/providers/twitter";
import DiscordProvider from "next-auth/providers/discord";
import LinkedInProvider from "next-auth/providers/linkedin";
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

// LinkedIn scopes
const linkedinScopes = [
  "openid",
  "profile",
  "email"
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
    LinkedInProvider({
      clientId: env.LINKEDIN_CLIENT_ID || "",
      clientSecret: env.LINKEDIN_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: linkedinScopes,
        },
      },
      wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      token: "https://www.linkedin.com/oauth/v2/accessToken",
      userinfo: "https://api.linkedin.com/v2/userinfo",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
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
          console.log("🐦 [NextAuth JWT] Twitter profile received:", profile);
          console.log("🐦 [NextAuth JWT] Twitter profile keys:", Object.keys(profile));
          
          const twitterProfile = profile as Record<string, unknown>;
          const data = twitterProfile.data as Record<string, unknown>;
          
          console.log("🐦 [NextAuth JWT] Twitter profile.data:", data);
          
          if (data) {
            token.twitterId = data.id as string;
            token.twitterUsername = data.username as string;
            console.log("🐦 [NextAuth JWT] Stored twitterId:", token.twitterId);
            console.log("🐦 [NextAuth JWT] Stored twitterUsername:", token.twitterUsername);
          } else {
            // Fallback: check if data is at root level
            token.twitterId = twitterProfile.id as string;
            token.twitterUsername = twitterProfile.username as string;
            console.log("🐦 [NextAuth JWT] Fallback - Stored twitterId:", token.twitterId);
            console.log("🐦 [NextAuth JWT] Fallback - Stored twitterUsername:", token.twitterUsername);
          }
        }
        
        // Store Discord-specific user data
        if (account.provider === 'discord' && profile) {
          const discordProfile = profile as Record<string, unknown>;
          token.discordId = discordProfile.id as string;
          token.discordUsername = discordProfile.username as string;
          token.discordDiscriminator = discordProfile.discriminator as string;
        }
        
        // Store LinkedIn-specific user data
        if (account.provider === 'linkedin' && profile) {
          console.log("💼 [NextAuth JWT] LinkedIn profile received:", profile);
          console.log("💼 [NextAuth JWT] LinkedIn profile keys:", Object.keys(profile));
          
          const linkedinProfile = profile as Record<string, unknown>;
          token.linkedinId = linkedinProfile.sub as string || linkedinProfile.id as string;
          token.linkedinEmail = linkedinProfile.email as string;
          
          console.log("💼 [NextAuth JWT] Stored linkedinId:", token.linkedinId);
          console.log("💼 [NextAuth JWT] Stored linkedinEmail:", token.linkedinEmail);
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
        console.log("🐦 [NextAuth Session] Processing Twitter session");
        console.log("🐦 [NextAuth Session] twitterId from token:", token.twitterId);
        console.log("🐦 [NextAuth Session] twitterUsername from token:", token.twitterUsername);
        
        if (session.user) {
          (session.user as Record<string, unknown>).id = token.twitterId as string;
          (session.user as Record<string, unknown>).twitterId = token.twitterId as string;
          (session.user as Record<string, unknown>).username = token.twitterUsername as string;
          (session.user as Record<string, unknown>).twitterUsername = token.twitterUsername as string;
          
          console.log("🐦 [NextAuth Session] Updated session.user:", session.user);
        }
      }
      
      if (token.provider === 'discord') {
        if (session.user) {
          (session.user as Record<string, unknown>).id = token.discordId as string;
          (session.user as Record<string, unknown>).username = token.discordUsername as string;
          (session.user as Record<string, unknown>).discriminator = token.discordDiscriminator as string;
        }
      }
      
      if (token.provider === 'linkedin') {
        console.log("💼 [NextAuth Session] Processing LinkedIn session");
        console.log("💼 [NextAuth Session] linkedinId from token:", token.linkedinId);
        console.log("💼 [NextAuth Session] linkedinEmail from token:", token.linkedinEmail);
        
        if (session.user) {
          (session.user as Record<string, unknown>).id = token.linkedinId as string;
          (session.user as Record<string, unknown>).linkedinId = token.linkedinId as string;
          (session.user as Record<string, unknown>).email = token.linkedinEmail as string;
          
          console.log("💼 [NextAuth Session] Updated session.user:", session.user);
        }
      }
      
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};
