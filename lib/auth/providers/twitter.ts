import { signIn, signOut } from "next-auth/react";
import { BaseAuthProvider } from './base';
import { AuthUser } from '../types';

// Twitter API v2 User interface
export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  description?: string;
  verified?: boolean;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  created_at?: string;
  location?: string;
  url?: string;
}

export class TwitterAuthProvider extends BaseAuthProvider {
  readonly name = 'twitter';
  readonly displayName = 'Twitter/X';

  private session: Record<string, unknown> | null = null;

  constructor(config: Record<string, unknown> = {}) {
    super(config);
  }

  public updateSession(session: Record<string, unknown> | null, status: string): void {
    this.session = session;
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && !!session?.accessToken;

    this.setLoading(isLoading);

    if (isAuthenticated && session?.user) {
      this.setAuthenticated(true);
      this.setAccessToken(session.accessToken as string);
      this.setUser(this.transformUser(session.user as Record<string, unknown>));
    } else {
      this.setAuthenticated(false);
      this.setAccessToken(null);
      this.setUser(null);
    }
  }

  private transformUser(sessionUser: Record<string, unknown>): AuthUser {
    return {
      id: (sessionUser.id as string) || (sessionUser.email as string) || 'unknown',
      name: sessionUser.name as string,
      email: sessionUser.email as string,
      avatar: sessionUser.image as string,
      metadata: {
        twitterId: sessionUser.id,
        username: sessionUser.username,
        provider: 'twitter'
      }
    };
  }

  async signIn(): Promise<void> {
    return this.handleAsyncOperation(async () => {
      await signIn("twitter");
    }, 'Failed to sign in with Twitter');
  }

  async signOut(): Promise<void> {
    return this.handleAsyncOperation(async () => {
      await signOut();
      this.setAuthenticated(false);
      this.setAccessToken(null);
      this.setUser(null);
    }, 'Failed to sign out from Twitter');
  }

  async getUserData(): Promise<Record<string, unknown>> {
    return this.handleAsyncOperation(async () => {
      if (!this.accessToken) {
        throw new Error('Twitter not authenticated');
      }

      // Fetch user profile from Twitter API v2
      const response = await fetch('https://api.twitter.com/2/users/me?user.fields=created_at,description,id,location,name,profile_image_url,public_metrics,url,username,verified', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data as Record<string, unknown>;
    }, 'Failed to fetch Twitter user data');
  }

  public async getTwitterAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  public getSession(): Record<string, unknown> | null {
    return this.session;
  }
}
