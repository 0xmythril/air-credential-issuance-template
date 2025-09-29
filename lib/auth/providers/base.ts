/**
 * Base authentication provider class
 * Provides common functionality for all auth providers
 */

import { AuthProvider, AuthUser, AuthError } from '../types';

export abstract class BaseAuthProvider implements AuthProvider {
  abstract readonly name: string;
  abstract readonly displayName: string;
  
  protected _isAuthenticated = false;
  protected _isLoading = false;
  protected _user: AuthUser | null = null;
  protected _accessToken: string | null = null;
  protected _error: AuthError | null = null;

  // Event listeners for state changes
  private listeners: Array<(event: { type: string; data?: unknown }) => void> = [];

  constructor(protected config: Record<string, unknown> = {}) {}

  // Getters
  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get user(): AuthUser | null {
    return this._user;
  }

  get accessToken(): string | null {
    return this._accessToken;
  }

  get error(): AuthError | null {
    return this._error;
  }

  // Abstract methods that must be implemented by subclasses
  abstract signIn(): Promise<void> | void;
  abstract signOut(): Promise<void> | void;
  abstract getUserData(): Promise<Record<string, unknown>>;

  // Optional method for token refresh
  async refreshToken?(): Promise<void>;

  // Protected methods for state management
  protected setAuthenticated(value: boolean): void {
    if (this._isAuthenticated !== value) {
      this._isAuthenticated = value;
      this.emit(value ? 'signIn' : 'signOut', { user: this._user });
    }
  }

  protected setLoading(value: boolean): void {
    if (this._isLoading !== value) {
      this._isLoading = value;
      this.emit('loadingChange', { isLoading: value });
    }
  }

  protected setUser(user: AuthUser | null): void {
    if (this._user !== user) {
      this._user = user;
      this.emit('userUpdate', { user });
    }
  }

  protected setAccessToken(token: string | null): void {
    this._accessToken = token;
  }

  protected setError(error: AuthError | null): void {
    if (this._error !== error) {
      this._error = error;
      if (error) {
        this.emit('error', { error });
      }
    }
  }

  // Event system
  protected emit(type: string, data?: unknown): void {
    const event = { type, data };
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        // Auth event listener error - continuing
      }
    });
  }

  public addEventListener(listener: (event: { type: string; data?: unknown }) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Utility methods
  protected createAuthError(message: string, code?: string, originalError?: Error): AuthError {
    return new AuthError(message, this.name, code, originalError);
  }

  protected async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    this.setLoading(true);
    this.setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (error) {
      const authError = this.createAuthError(
        errorMessage,
        'OPERATION_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
      this.setError(authError);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  // Cleanup method
  public destroy(): void {
    this.listeners = [];
    this._user = null;
    this._accessToken = null;
    this._error = null;
    this._isAuthenticated = false;
    this._isLoading = false;
  }
}
