/**
 * Unified authentication hook
 * Provides a consistent interface for all auth methods
 */

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAirkit } from './useAirkit';
import { env } from '@/lib/env';
import { AuthProviderFactory } from '../auth/providers';
import { UseAuthReturn, AuthError } from '../auth/types';
import { SpotifyAuthProvider } from '../auth/providers/spotify';
import { WalletAuthProvider } from '../auth/providers/wallet';
import { AirKitAuthProvider } from '../auth/providers/airkit';

export function useAuth(): UseAuthReturn {
  const [error, setError] = useState<AuthError | null>(null);
  // Default to wallet for legacy code (this hook is deprecated - use route-based auth)
  const currentMethod: "wallet" | "airkit" | "spotify" | "twitter" | "discord" = "wallet";

  // Hook dependencies based on auth method
  const spotifySession = useSession();
  const walletAccount = useAccount();
  const { disconnect: walletDisconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const airkit = useAirkit();

  // Get the provider instance
  const provider = useMemo(() => {
    try {
      return AuthProviderFactory.create(currentMethod);
    } catch (error) {
      setError(error as AuthError);
      // Return a dummy provider to prevent crashes
      return AuthProviderFactory.create('wallet');
    }
  }, [currentMethod]);

  // Update provider state based on the current auth method
  useEffect(() => {
    try {
      if (provider instanceof SpotifyAuthProvider) {
        provider.updateSession(spotifySession.data as Record<string, unknown> | null, spotifySession.status);
      } else if (provider instanceof WalletAuthProvider) {
        provider.updateWalletState(
          walletAccount.address || null,
          walletAccount.isConnected,
          walletAccount.chainId
        );
      } else if (provider instanceof AirKitAuthProvider) {
        provider.updateAirKitState(airkit.airService, airkit.airService?.isLoggedIn || false);
      }
    } catch (error) {
      setError(new AuthError('Failed to update provider state', currentMethod, 'STATE_UPDATE_FAILED', error as Error));
    }
  }, [
    provider,
    currentMethod,
    spotifySession.data,
    spotifySession.status,
    walletAccount.address,
    walletAccount.isConnected,
    walletAccount.chainId,
    airkit.airService,
    airkit.airService?.isLoggedIn
  ]);

  // Custom sign-in that handles provider-specific logic
  const signIn = async (): Promise<void> => {
    try {
      setError(null);
      
      if (provider instanceof SpotifyAuthProvider) {
        await provider.signIn();
      } else if (provider instanceof WalletAuthProvider) {
        // For wallet, we use the connect modal
        openConnectModal?.();
      } else if (provider instanceof AirKitAuthProvider) {
        await provider.signIn();
      } else {
        await provider.signIn();
      }
    } catch (error) {
      const authError = new AuthError(
        'Sign-in failed',
        currentMethod,
        'SIGNIN_FAILED',
        error as Error
      );
      setError(authError);
      throw authError;
    }
  };

  // Custom sign-out that handles provider-specific logic
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      
      if (provider instanceof SpotifyAuthProvider) {
        await provider.signOut();
      } else if (provider instanceof WalletAuthProvider) {
        // For wallet, we use the wagmi disconnect
        walletDisconnect();
      } else if (provider instanceof AirKitAuthProvider) {
        await provider.signOut();
      } else {
        await provider.signOut();
      }
    } catch (error) {
      const authError = new AuthError(
        'Sign-out failed',
        currentMethod,
        'SIGNOUT_FAILED',
        error as Error
      );
      setError(authError);
      throw authError;
    }
  };

  // Get user data with error handling
  const getUserData = async (): Promise<Record<string, unknown>> => {
    try {
      setError(null);
      return await provider.getUserData();
    } catch (error) {
      const authError = new AuthError(
        'Failed to get user data',
        currentMethod,
        'GET_USER_DATA_FAILED',
        error as Error
      );
      setError(authError);
      throw authError;
    }
  };

  return {
    provider,
    isAuthenticated: provider.isAuthenticated,
    isLoading: provider.isLoading,
    user: provider.user,
    signIn,
    signOut,
    getUserData,
    error: error || provider.error,
  };
}

// Legacy compatibility exports - these can be removed once migration is complete
export function useSpotifyCompat() {
  const auth = useAuth();
  
  // DEPRECATED: This check is removed - use route-based auth instead
  
  const spotifyProvider = auth.provider as SpotifyAuthProvider;
  
  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    accessToken: auth.provider.accessToken,
    signIn: auth.signIn,
    signOut: auth.signOut,
    getCurrentUser: () => spotifyProvider.getCurrentUser(),
    getFollowedArtists: (limit?: number) => spotifyProvider.getFollowedArtists(limit),
    getTopArtists: (timeRange?: "short_term" | "medium_term" | "long_term", limit?: number) => 
      spotifyProvider.getTopArtists(timeRange, limit),
    getTopTracks: (timeRange?: "short_term" | "medium_term" | "long_term", limit?: number) => 
      spotifyProvider.getTopTracks(timeRange, limit),
  };
}
