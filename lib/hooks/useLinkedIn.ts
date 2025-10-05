import { useSession, signIn, signOut } from "next-auth/react";
import { LinkedInUser } from "../auth/providers/linkedin";

export interface UseLinkedInReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Record<string, unknown> | null;
  accessToken: string | null;
  error: string | null;
  signIn: () => void;
  signOut: () => void;
  getCurrentUser: () => Promise<LinkedInUser | null>;
}

export function useLinkedIn(): UseLinkedInReturn {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated" && !!session?.accessToken;
  const isLoading = status === "loading";
  const accessToken = (session?.accessToken as string) || null;
  const user = session?.user as Record<string, unknown> | null;

  const handleSignIn = () => {
    signIn("linkedin");
  };

  const handleSignOut = () => {
    signOut();
  };

  const getCurrentUser = async (): Promise<LinkedInUser | null> => {
    console.log("💼 [useLinkedIn] getCurrentUser called");
    console.log("💼 [useLinkedIn] Session exists:", !!session);
    console.log("💼 [useLinkedIn] Session user exists:", !!session?.user);
    
    if (!session?.user) {
      console.log("💼 [useLinkedIn] No session user, returning null");
      return null;
    }

    // Return user data from session (NextAuth already fetched this during OAuth)
    const sessionUser = session.user as Record<string, unknown>;
    
    console.log("💼 [useLinkedIn] Session user data:", sessionUser);
    console.log("💼 [useLinkedIn] Session user keys:", Object.keys(sessionUser));
    
    // Map NextAuth session user to LinkedInUser format
    const linkedinUser = {
      id: (sessionUser.id as string) || (sessionUser.linkedinId as string) || '',
      name: (sessionUser.name as string) || '',
      email: (sessionUser.email as string) || '',
      picture: sessionUser.image as string | undefined,
    } as LinkedInUser;
    
    console.log("💼 [useLinkedIn] Mapped LinkedIn user:", linkedinUser);
    
    return linkedinUser;
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

