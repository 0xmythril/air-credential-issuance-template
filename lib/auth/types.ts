/**
 * Common authentication interfaces and types for the modular auth system
 */

// Standard user interface that all auth providers should conform to
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  metadata?: Record<string, unknown>;
}

// Core authentication provider interface
export interface AuthProvider {
  readonly name: string;
  readonly displayName: string;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly user: AuthUser | null;
  readonly accessToken: string | null;
  readonly error: AuthError | null;
  
  signIn(): Promise<void> | void;
  signOut(): Promise<void> | void;
  getUserData(): Promise<Record<string, unknown>>;
  refreshToken?(): Promise<void>;
}

// Configuration for each auth provider
export interface AuthConfig {
  provider: string;
  enabled: boolean;
  displayName: string;
  config: Record<string, unknown>;
}

// Auth method types supported by the system
export type AuthMethod = 'wallet' | 'airkit' | 'spotify' | 'twitter' | 'facebook' | 'github';

// Provider factory interface
export interface AuthProviderFactory {
  register(name: string, factory: AuthProviderConstructor): void;
  create(name: string): AuthProvider;
  getAvailable(): string[];
  isRegistered(name: string): boolean;
}

// Constructor type for auth providers
export type AuthProviderConstructor = new (config?: Record<string, unknown>) => AuthProvider;

// Data transformer interface for converting provider-specific data
export interface DataTransformer {
  readonly name: string;
  transform(data: Record<string, unknown>): Record<string, unknown>;
  validate?(data: Record<string, unknown>): boolean;
}

// Error types for auth operations
export class AuthError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthProviderNotFoundError extends AuthError {
  constructor(provider: string) {
    super(`Authentication provider "${provider}" not found`, provider, 'PROVIDER_NOT_FOUND');
    this.name = 'AuthProviderNotFoundError';
  }
}

export class AuthenticationFailedError extends AuthError {
  constructor(provider: string, originalError?: Error) {
    super(`Authentication failed for provider "${provider}"`, provider, 'AUTH_FAILED', originalError);
    this.name = 'AuthenticationFailedError';
  }
}

// Hook return types
export interface UseAuthReturn {
  provider: AuthProvider;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  signIn: () => Promise<void> | void;
  signOut: () => Promise<void> | void;
  getUserData: () => Promise<Record<string, unknown>>;
  error: AuthError | null;
}

export interface UseAuthDataReturn {
  data: Record<string, unknown> | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Event types for auth state changes
export interface AuthEvent {
  type: 'signIn' | 'signOut' | 'userUpdate' | 'error';
  provider: string;
  user?: AuthUser | null;
  error?: AuthError;
  timestamp: number;
}

// Auth context value
export interface AuthContextValue {
  currentProvider: AuthProvider | null;
  availableProviders: string[];
  switchProvider: (providerName: string) => Promise<void>;
  addEventListener: (listener: (event: AuthEvent) => void) => () => void;
}
