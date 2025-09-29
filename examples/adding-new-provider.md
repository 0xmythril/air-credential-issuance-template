# Example: Adding Twitter/X Authentication

This example demonstrates how to add Twitter/X authentication to the modular auth system.

## 1. Create the Provider Class

```typescript
// lib/auth/providers/twitter.ts
import { signIn, signOut, useSession } from "next-auth/react";
import { BaseAuthProvider } from './base';
import { AuthUser } from '../types';

export class TwitterAuthProvider extends BaseAuthProvider {
  readonly name = 'twitter';
  readonly displayName = 'Twitter/X';

  private session: any = null;

  constructor(config: Record<string, unknown> = {}) {
    super(config);
  }

  // Method to update session from React hook
  public updateSession(session: any, status: string): void {
    this.session = session;
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && !!session?.accessToken;
    
    this.setLoading(isLoading);
    
    if (isAuthenticated && session?.user) {
      this.setAuthenticated(true);
      this.setAccessToken(session.accessToken as string);
      this.setUser(this.transformUser(session.user));
    } else {
      this.setAuthenticated(false);
      this.setAccessToken(null);
      this.setUser(null);
    }
  }

  private transformUser(sessionUser: any): AuthUser {
    return {
      id: sessionUser.id || sessionUser.email || 'unknown',
      name: sessionUser.name,
      email: sessionUser.email,
      avatar: sessionUser.image,
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
    }, 'Failed to sign out from Twitter');
  }

  async getUserData(): Promise<Record<string, unknown>> {
    return this.handleAsyncOperation(async () => {
      if (!this.isAuthenticated || !this.user) {
        throw new Error('Not authenticated with Twitter');
      }

      // In a real implementation, you'd fetch additional Twitter data here
      // using the Twitter API v2
      
      return {
        user_type: "twitter",
        twitter_id: this.user.metadata?.twitterId,
        username: this.user.metadata?.username,
        display_name: this.user.name,
        email: this.user.email,
        // Additional Twitter-specific data:
        // followers_count: await getFollowersCount(),
        // tweets_count: await getTweetsCount(),
        // verified: await getVerificationStatus(),
      };
    }, 'Failed to fetch Twitter user data');
  }

  // Twitter-specific methods
  async getFollowersCount(): Promise<number> {
    // Implementation would use Twitter API v2
    return 0;
  }

  async getTweetsCount(): Promise<number> {
    // Implementation would use Twitter API v2
    return 0;
  }
}
```

## 2. Register the Provider

```typescript
// lib/auth/providers/index.ts
import { TwitterAuthProvider } from './twitter';

// Register the provider
AuthProviderFactory.register('twitter', TwitterAuthProvider);

// Add to provider configs
export const PROVIDER_CONFIGS = {
  spotify: {
    name: 'spotify',
    displayName: 'Spotify',
    description: 'Sign in with your Spotify account',
    icon: '🎵',
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
  twitter: {
    name: 'twitter',
    displayName: 'Twitter/X',
    description: 'Sign in with your Twitter account',
    icon: '🐦',
    requiresOAuth: true,
  },
} as const;

// Export the new provider
export { TwitterAuthProvider } from './twitter';
```

## 3. Add Data Transformer

```typescript
// lib/auth/transformers/index.ts

// Add Twitter data transformer
class TwitterDataTransformer implements DataTransformer {
  readonly name = 'twitter';

  transform(data: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};
    
    if (data.user_type === "twitter") {
      // Basic user info
      if (data.twitter_id) transformed.twitter_id = data.twitter_id;
      if (data.username) transformed.username = data.username;
      if (data.display_name) transformed.display_name = data.display_name;
      
      // Twitter-specific metrics
      if (typeof data.followers_count === 'number') {
        transformed.followers_count = data.followers_count;
      }
      if (typeof data.tweets_count === 'number') {
        transformed.tweets_count = data.tweets_count;
      }
      if (typeof data.verified === 'boolean') {
        transformed.verified = data.verified;
      }
    } else {
      // Pass through other data
      for (const [key, value] of Object.entries(data)) {
        if (key === "user_type" || key === "is_test_address") continue;
        if (value != null) {
          transformed[key] = value;
        }
      }
    }
    
    return transformed;
  }

  validate(data: Record<string, unknown>): boolean {
    return typeof data === 'object' && data !== null;
  }
}

// Register the transformer
transformerRegistry.register(new TwitterDataTransformer());
```

## 4. Update NextAuth Configuration

```typescript
// lib/auth.ts
import TwitterProvider from "next-auth/providers/twitter";

const scopes = [
  "tweet.read",
  "users.read", 
  "follows.read"
].join(" ");

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      authorization: { params: { scope: spotifyScopes } },
    }),
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: "2.0", // Use Twitter API v2
      authorization: { params: { scope: scopes } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token as string;
        token.refreshToken = account.refresh_token as string;
        token.expiresAt = account.expires_at as number;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      session.provider = token.provider as string;
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};
```

## 5. Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_AUTH_METHOD=twitter
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

```typescript
// lib/env/index.ts
export const env = createEnv({
  server: {
    // ... existing server vars
    TWITTER_CLIENT_ID: z.string(),
    TWITTER_CLIENT_SECRET: z.string(),
  },
  client: {
    // ... existing client vars  
    NEXT_PUBLIC_TWITTER_CLIENT_ID: z.string().optional(),
  },
  runtimeEnv: {
    // ... existing runtime env
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    NEXT_PUBLIC_TWITTER_CLIENT_ID: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
  },
});
```

## 6. Update useAuth Hook

```typescript
// lib/hooks/useAuth.ts
import { TwitterAuthProvider } from '../auth/providers/twitter';

export function useAuth(): UseAuthReturn {
  // ... existing code
  
  // Update provider state based on the current auth method
  useEffect(() => {
    try {
      if (provider instanceof SpotifyAuthProvider) {
        provider.updateSession(spotifySession.data, spotifySession.status);
      } else if (provider instanceof TwitterAuthProvider) {
        provider.updateSession(spotifySession.data, spotifySession.status);
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
    // ... other dependencies
  ]);
  
  // ... rest of hook
}
```

## 7. Usage in Components

```typescript
// components/TwitterProfile.tsx
import { useAuth } from '@/lib/auth';
import { TwitterAuthProvider } from '@/lib/auth/providers/twitter';

export function TwitterProfile() {
  const { provider, isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please sign in with Twitter</div>;
  }

  // Access Twitter-specific data
  if (provider instanceof TwitterAuthProvider) {
    const handleGetFollowers = async () => {
      const count = await provider.getFollowersCount();
      console.log('Followers:', count);
    };
  }

  return (
    <div>
      <h2>Twitter Profile</h2>
      <p>Username: @{user?.metadata?.username}</p>
      <p>Name: {user?.name}</p>
      <button onClick={handleGetFollowers}>Get Followers</button>
    </div>
  );
}
```

## 8. Credential Issuance

```typescript
// components/TwitterCredential.tsx
import { useAuth, transformForCredential } from '@/lib/auth';

export function TwitterCredential() {
  const { getUserData, provider } = useAuth();
  
  const handleIssueCredential = async () => {
    try {
      const rawData = await getUserData();
      const credentialData = transformForCredential(provider.name, rawData);
      
      console.log('Twitter credential data:', credentialData);
      // Output:
      // {
      //   twitter_id: "123456789",
      //   username: "johndoe", 
      //   display_name: "John Doe",
      //   followers_count: 150,
      //   tweets_count: 89,
      //   verified: false
      // }
      
      // Issue credential with AIR Kit
      await issueCredential(credentialData);
    } catch (error) {
      console.error('Failed to issue Twitter credential:', error);
    }
  };

  return (
    <button onClick={handleIssueCredential}>
      Issue Twitter Credential
    </button>
  );
}
```

## 9. Testing

```typescript
// __tests__/twitter-auth.test.ts
import { AuthProviderFactory } from '@/lib/auth';
import { TwitterAuthProvider } from '@/lib/auth/providers/twitter';

describe('TwitterAuthProvider', () => {
  let provider: TwitterAuthProvider;

  beforeEach(() => {
    provider = AuthProviderFactory.create('twitter') as TwitterAuthProvider;
  });

  it('should be registered correctly', () => {
    expect(AuthProviderFactory.isRegistered('twitter')).toBe(true);
  });

  it('should have correct display properties', () => {
    expect(provider.name).toBe('twitter');
    expect(provider.displayName).toBe('Twitter/X');
  });

  it('should transform user data correctly', async () => {
    // Mock authenticated state
    const mockUser = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    };
    
    provider.updateSession({ user: mockUser, accessToken: 'mock-token' }, 'authenticated');
    
    const userData = await provider.getUserData();
    expect(userData.user_type).toBe('twitter');
    expect(userData.display_name).toBe('John Doe');
  });
});
```

This example shows how easy it is to add a new authentication provider to the modular system. The same pattern can be followed for any OAuth provider or custom authentication method.
