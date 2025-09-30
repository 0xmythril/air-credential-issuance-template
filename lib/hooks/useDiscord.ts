import { useSession, signIn, signOut } from "next-auth/react";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  verified?: boolean;
  email?: string;
  image?: string;
}

export interface UseDiscordReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Record<string, unknown> | null;
  accessToken: string | null;
  error: string | null;
  signIn: () => void;
  signOut: () => void;
  getCurrentUser: () => Promise<DiscordUser | null>;
}

export function useDiscord(): UseDiscordReturn {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated" && !!session?.accessToken;
  const isLoading = status === "loading";
  const accessToken = (session?.accessToken as string) || null;
  const user = session?.user as Record<string, unknown> | null;

  const handleSignIn = () => {
    signIn("discord");
  };

  const handleSignOut = () => {
    signOut();
  };

  const getCurrentUser = async (): Promise<DiscordUser | null> => {
    if (!session?.user) return null;

    const sessionUser = session.user as Record<string, unknown>;
    
    return {
      id: (sessionUser.id as string) || '',
      username: (sessionUser.username as string) || (sessionUser.name as string) || '',
      discriminator: (sessionUser.discriminator as string) || '0',
      global_name: sessionUser.global_name as string | undefined,
      email: sessionUser.email as string | undefined,
      verified: sessionUser.verified as boolean | undefined,
      image: sessionUser.image as string | undefined,
    } as DiscordUser;
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
