/**
 * Main auth system exports
 * Central export point for the modular authentication system
 */

// Core types and interfaces
export * from './types';

// Factory and provider system
export { AuthProviderFactory } from './factory';
export * from './providers';

// Data transformers
export * from './transformers';

// Main hook
export { useAuth, useSpotifyCompat } from '../hooks/useAuth';

// Utility functions
export { transformForCredential } from './transformers';
export { 
  getProviderConfig, 
  getAvailableProviders, 
  isProviderAvailable,
  PROVIDER_CONFIGS 
} from './providers';

// Re-export commonly used types for convenience
export type { 
  AuthUser, 
  AuthProvider, 
  UseAuthReturn, 
  AuthMethod, 
  AuthError 
} from './types';
