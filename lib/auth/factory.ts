/**
 * Authentication provider factory implementation
 * Manages registration and creation of auth providers
 */

import { 
  AuthProvider, 
  AuthProviderFactory as IAuthProviderFactory, 
  AuthProviderConstructor,
  AuthProviderNotFoundError 
} from './types';

class AuthProviderFactoryImpl implements IAuthProviderFactory {
  private providers = new Map<string, AuthProviderConstructor>();
  private instances = new Map<string, AuthProvider>();

  /**
   * Register a new auth provider
   */
  register(name: string, factory: AuthProviderConstructor): void {
    if (this.providers.has(name)) {
      // Provider already registered, overwriting...
    }
    this.providers.set(name, factory);
    // Clear cached instance if it exists
    this.instances.delete(name);
  }

  /**
   * Create or get cached instance of an auth provider
   */
  create(name: string, config?: Record<string, unknown>): AuthProvider {
    // Return cached instance if no config is provided and instance exists
    if (!config && this.instances.has(name)) {
      return this.instances.get(name)!;
    }

    const ProviderClass = this.providers.get(name);
    if (!ProviderClass) {
      throw new AuthProviderNotFoundError(name);
    }

    try {
      const instance = new ProviderClass(config);
      
      // Cache the instance if no config was provided (default configuration)
      if (!config) {
        this.instances.set(name, instance);
      }
      
      return instance;
    } catch (error) {
      throw new Error(`Failed to create auth provider "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get list of available provider names
   */
  getAvailable(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is registered
   */
  isRegistered(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Unregister a provider (useful for testing)
   */
  unregister(name: string): boolean {
    const removed = this.providers.delete(name);
    this.instances.delete(name);
    return removed;
  }

  /**
   * Clear all providers (useful for testing)
   */
  clear(): void {
    this.providers.clear();
    this.instances.clear();
  }

  /**
   * Get provider metadata
   */
  getProviderInfo(name: string): { name: string; registered: boolean; hasInstance: boolean } {
    return {
      name,
      registered: this.providers.has(name),
      hasInstance: this.instances.has(name),
    };
  }
}

// Export singleton instance
export const AuthProviderFactory = new AuthProviderFactoryImpl();

// Export the class for testing
export { AuthProviderFactoryImpl };
