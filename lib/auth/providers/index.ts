/**
 * Auth provider registration and exports
 * This file auto-registers all available auth providers
 */

import { AuthProviderFactory } from '../factory';
import { SpotifyAuthProvider } from './spotify';
import { WalletAuthProvider } from './wallet';
import { AirKitAuthProvider } from './airkit';
import { TwitterAuthProvider } from './twitter';

// Register all available providers
AuthProviderFactory.register('spotify', SpotifyAuthProvider);
AuthProviderFactory.register('wallet', WalletAuthProvider); 
AuthProviderFactory.register('airkit', AirKitAuthProvider);
AuthProviderFactory.register('twitter', TwitterAuthProvider);

// Export providers for direct usage if needed
export { SpotifyAuthProvider } from './spotify';
export { WalletAuthProvider } from './wallet';
export { AirKitAuthProvider } from './airkit';
export { TwitterAuthProvider } from './twitter';
export { BaseAuthProvider } from './base';

// Export factory for convenience
export { AuthProviderFactory } from '../factory';

// Export provider configurations
export const PROVIDER_CONFIGS = {
  spotify: {
    name: 'spotify',
    displayName: 'Spotify',
    description: 'Sign in with your Spotify account',
    icon: '🎵',
    requiresOAuth: true,
  },
  twitter: {
    name: 'twitter',
    displayName: 'Twitter/X',
    description: 'Sign in with your Twitter account',
    icon: '𝕏',
    requiresOAuth: true,
  },
  wallet: {
    name: 'wallet',
    displayName: 'Crypto Wallet',
    description: 'Connect your crypto wallet',
    icon: '👛',
    requiresOAuth: false,
  },
  airkit: {
    name: 'airkit',
    displayName: 'AIR Kit',
    description: 'Sign in with AIR Kit',
    icon: '🆔',
    requiresOAuth: false,
  },
} as const;

// Helper function to get provider config
export function getProviderConfig(name: string) {
  return PROVIDER_CONFIGS[name as keyof typeof PROVIDER_CONFIGS];
}

// Helper function to get all available provider names
export function getAvailableProviders(): string[] {
  return AuthProviderFactory.getAvailable();
}

// Helper function to check if a provider is available
export function isProviderAvailable(name: string): boolean {
  return AuthProviderFactory.isRegistered(name);
}
