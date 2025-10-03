import { useSession, signIn, signOut } from "next-auth/react";
import { TwitterUser } from "../auth/providers/twitter";

export interface UseTwitterReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Record<string, unknown> | null;
  accessToken: string | null;
  error: string | null;
  signIn: () => void;
  signOut: () => void;
  getCurrentUser: () => Promise<TwitterUser | null>;
}

export function useTwitter(): UseTwitterReturn {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated" && !!session?.accessToken;
  const isLoading = status === "loading";
  const accessToken = (session?.accessToken as string) || null;
  const user = session?.user as Record<string, unknown> | null;

  const handleSignIn = () => {
    signIn("twitter");
  };

  const handleSignOut = () => {
    signOut();
  };

  const getCurrentUser = async (): Promise<TwitterUser | null> => {
    console.log("🐦 [useTwitter] getCurrentUser called");
    console.log("🐦 [useTwitter] Session exists:", !!session);
    console.log("🐦 [useTwitter] Session user exists:", !!session?.user);
    
    if (!session?.user) {
      console.log("🐦 [useTwitter] No session user, returning null");
      return null;
    }

    // Return user data from session (NextAuth already fetched this during OAuth)
    const sessionUser = session.user as Record<string, unknown>;
    
    console.log("🐦 [useTwitter] Session user data:", sessionUser);
    console.log("🐦 [useTwitter] Session user keys:", Object.keys(sessionUser));
    
    // Map NextAuth session user to TwitterUser format
    const twitterUser = {
      id: (sessionUser.id as string) || (sessionUser.twitterId as string) || '',
      name: (sessionUser.name as string) || '',
      username: (sessionUser.username as string) || (sessionUser.twitterUsername as string) || (sessionUser.name as string) || '',
      profile_image_url: sessionUser.image as string | undefined,
      verified: false, // NextAuth doesn't provide this by default
      public_metrics: undefined, // Will be fetched from API in user-data route
    } as TwitterUser;
    
    console.log("🐦 [useTwitter] Mapped Twitter user:", twitterUser);
    
    return twitterUser;
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    accessToken,
    error: null,
    signIn: handleSignIn,
    signOut: handleSignOut,
    getCurrentUser,
  };
}
