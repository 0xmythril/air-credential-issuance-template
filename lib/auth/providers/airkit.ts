/**
 * AIR Kit authentication provider implementation
 */

import { BaseAuthProvider } from './base';
import { AuthUser } from '../types';

export class AirKitAuthProvider extends BaseAuthProvider {
  readonly name = 'airkit';
  readonly displayName = 'AIR Kit';

  private airService: unknown = null;
  private userInfo: unknown = null;

  constructor(config: Record<string, unknown> = {}) {
    super(config);
  }

  // Method to update AIR Kit state from React hook
  public updateAirKitState(airService: unknown, isLoggedIn: boolean): void {
    this.airService = airService;
    this.setAuthenticated(isLoggedIn);
    
    if (isLoggedIn && airService) {
      this.initializeUser();
    } else {
      this.setUser(null);
      this.setAccessToken(null);
      this.userInfo = null;
    }
  }

  private async initializeUser(): Promise<void> {
    try {
      if (!this.airService) return;
      
      const userInfo = await (this.airService as { getUserInfo: () => Promise<unknown> }).getUserInfo();
      this.userInfo = userInfo;
      
      if ((userInfo as Record<string, unknown>)?.user) {
        this.setUser(this.transformUser((userInfo as Record<string, unknown>).user as Record<string, unknown>));
        
        // Get access token
        const token = await (this.airService as { getAccessToken: () => Promise<unknown> }).getAccessToken();
        this.setAccessToken((token as Record<string, unknown>)?.token as string || null);
      }
    } catch (error) {
      console.error('Failed to initialize AIR Kit user: Authentication error');
      this.setError(this.createAuthError('Failed to initialize AIR Kit user', 'AIRKIT_INIT_FAILED', error as Error));
    }
  }

  private transformUser(airkitUser: Record<string, unknown>): AuthUser {
    return {
      id: (airkitUser.email as string) || (airkitUser.id as string) || 'unknown',
      name: (airkitUser.name as string) || (airkitUser.email as string),
      email: airkitUser.email as string,
      avatar: (airkitUser.avatar as string) || null,
      metadata: {
        airkitId: airkitUser.id,
        provider: 'airkit'
      }
    };
  }

  async signIn(): Promise<void> {
    return this.handleAsyncOperation(async () => {
      if (!this.airService) {
        throw new Error('AIR Kit service not initialized');
      }
      
      await (this.airService as { login: () => Promise<void> }).login();
      await this.initializeUser();
    }, 'Failed to sign in with AIR Kit');
  }

  async signOut(): Promise<void> {
    return this.handleAsyncOperation(async () => {
      if (!this.airService) {
        throw new Error('AIR Kit service not initialized');
      }
      
      await (this.airService as { logout: () => Promise<void> }).logout();
      this.userInfo = null;
    }, 'Failed to sign out from AIR Kit');
  }

  async getUserData(): Promise<Record<string, unknown>> {
    return this.handleAsyncOperation(async () => {
      if (!this.airService || !this.isAuthenticated) {
        throw new Error('AIR Kit not authenticated');
      }

      const userInfo = this.userInfo || await (this.airService as { getUserInfo: () => Promise<unknown> }).getUserInfo();
      
      const user = (userInfo as Record<string, unknown>)?.user as Record<string, unknown>;
      return {
        user_type: "airkit",
        airkit_id: user?.id,
        email: user?.email,
        name: user?.name,
        // Additional AIR Kit-specific data would go here
      };
    }, 'Failed to fetch AIR Kit user data');
  }

  // Additional AIR Kit-specific methods
  public async getAccessToken(): Promise<string | null> {
    if (!this.airService) return null;
    
    try {
      const token = await (this.airService as { getAccessToken: () => Promise<unknown> }).getAccessToken();
      return (token as Record<string, unknown>)?.token as string || null;
    } catch (error) {
      console.error('Failed to get AIR Kit access token: Authentication service error');
      return null;
    }
  }

  public async getUserInfo(): Promise<unknown> {
    if (!this.airService) return null;
    
    try {
      return await (this.airService as { getUserInfo: () => Promise<unknown> }).getUserInfo();
    } catch (error) {
      console.error('Failed to get AIR Kit user info: User data service error');
      return null;
    }
  }

  public getAirService(): unknown {
    return this.airService;
  }
}
