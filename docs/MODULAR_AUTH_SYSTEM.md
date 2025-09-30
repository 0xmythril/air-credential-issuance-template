# Modular Authentication System

This guide covers the new modular authentication system that makes it easy to add and manage multiple authentication providers.

## 🏗️ Architecture Overview

The modular auth system consists of several key components:

### Core Components

1. **AuthProvider Interface** - Standardized interface for all auth providers
2. **AuthProviderFactory** - Factory pattern for creating and managing providers  
3. **BaseAuthProvider** - Base class with common functionality
4. **DataTransformers** - Convert provider-specific data to standard format
5. **useAuth Hook** - Unified React hook for authentication

### File Structure

```
lib/
├── auth/
│   ├── types.ts              # Core interfaces and types
│   ├── factory.ts            # Provider factory implementation
│   ├── index.ts              # Main exports
│   ├── providers/
│   │   ├── base.ts           # Base provider class
│   │   ├── spotify.ts        # Spotify implementation
│   │   ├── wallet.ts         # Wallet implementation
│   │   ├── airkit.ts         # AIR Kit implementation
│   │   └── index.ts          # Provider registration
│   └── transformers/
│       └── index.ts          # Data transformation system
└── hooks/
    └── useAuth.ts            # Unified auth hook
```

## 🔌 Adding New Auth Providers

### Step 1: Create Provider Class

Create a new provider that extends `BaseAuthProvider`:

```typescript
// lib/auth/providers/twitter.ts
import { BaseAuthProvider } from './base';
import { AuthUser } from '../types';

export class TwitterAuthProvider extends BaseAuthProvider {
  readonly name = 'twitter';
  readonly displayName = 'Twitter/X';

  constructor(config: Record<string, unknown> = {}) {
    super(config);
  }

  async signIn(): Promise<void> {
    return this.handleAsyncOperation(async () => {
      // Twitter OAuth implementation
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
      // Fetch Twitter user data
      return {
        user_type: "twitter",
        twitter_id: this.user?.id,
        username: this.user?.name,
        // Add Twitter-specific data
      };
    }, 'Failed to fetch Twitter user data');
  }

  // Update session from React hook
  public updateSession(session: any, status: string): void {
    // Implementation similar to SpotifyAuthProvider
  }
}
```

### Step 2: Register Provider

Add to the provider registration:

```typescript
// lib/auth/providers/index.ts
import { TwitterAuthProvider } from './twitter';

// Register the new provider
AuthProviderFactory.register('twitter', TwitterAuthProvider);

// Add to provider configs
export const PROVIDER_CONFIGS = {
  // ... existing providers
  twitter: {
    name: 'twitter',
    displayName: 'Twitter/X', 
    description: 'Sign in with your Twitter account',
    icon: '🐦',
    requiresOAuth: true,
  },
} as const;
```

### Step 3: Add Data Transformer

Create a transformer for the provider's data:

```typescript
// lib/auth/transformers/index.ts
class TwitterDataTransformer implements DataTransformer {
  readonly name = 'twitter';

  transform(data: Record<string, unknown>): Record<string, unknown> {
    // Transform Twitter data to credential format
    return {
      twitter_username: data.username,
      twitter_id: data.twitter_id,
      // ... other transformations
    };
  }
}

// Register the transformer
transformerRegistry.register(new TwitterDataTransformer());
```

### Step 4: Update Environment Configuration

Add the new auth method to the environment schema:

```typescript
// lib/env/index.ts
NEXT_PUBLIC_AUTH_METHOD: z.enum([
  "wallet", "airkit", "spotify", "twitter", "facebook", "github"
]).default("wallet"),
```

### Step 5: Configure NextAuth (if OAuth)

For OAuth providers, add to NextAuth configuration:

```typescript
// lib/auth.ts
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions: NextAuthOptions = {
  providers: [
    // ... existing providers
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
    }),
  ],
  // ... rest of config
};
```

## 🎯 Using the Auth System

### Basic Usage

```typescript
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { 
    isAuthenticated, 
    user, 
    signIn, 
    signOut, 
    getUserData,
    error 
  } = useAuth();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isAuthenticated) {
    return <button onClick={signIn}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Getting User Data

```typescript
import { useAuth, transformForCredential } from '@/lib/auth';

function CredentialComponent() {
  const { getUserData, provider } = useAuth();
  
  const handleIssueCredential = async () => {
    try {
      const rawData = await getUserData();
      const credentialData = transformForCredential(provider.name, rawData);
      
      // Use credentialData for AIR Kit issuance
      await issueCredential(credentialData);
    } catch (error) {
      console.error('Failed to issue credential:', error);
    }
  };

  return (
    <button onClick={handleIssueCredential}>
      Issue Credential
    </button>
  );
}
```

### Provider-Specific Operations

```typescript
import { useAuth, AuthProviderFactory } from '@/lib/auth';
import { SpotifyAuthProvider } from '@/lib/auth/providers/spotify';

function SpotifySpecific() {
  const { provider } = useAuth();
  
  // Type-safe access to provider-specific methods
  if (provider instanceof SpotifyAuthProvider) {
    const handleGetTopArtists = async () => {
      const artists = await provider.getTopArtists();
      console.log('Top artists:', artists);
    };
  }
}
```

## 🔄 Migration Guide

### From Legacy to Modular System

1. **Replace Direct Hook Usage**:
   ```typescript
   // Before
   const spotify = useSpotify();
   const { isConnected } = useAccount();
   
   // After
   const { isAuthenticated, user, signIn } = useAuth();
   ```

2. **Update Component Logic**:
   ```typescript
   // Before
   const isSpotifyLogin = env.NEXT_PUBLIC_AUTH_METHOD === "spotify";
   if (isSpotifyLogin && !spotify.isAuthenticated) {
     spotify.signIn();
   }
   
   // After
   if (!isAuthenticated) {
     signIn();
   }
   ```

3. **Migrate Data Fetching**:
   ```typescript
   // Before
   const response = await fetch("/api/user/user-data", {
     headers: { Authorization: `Bearer ${accessToken}` },
   });
   
   // After
   const userData = await getUserData();
   const credentialData = transformForCredential(provider.name, userData);
   ```

## 🧪 Testing

### Testing Auth Providers

```typescript
import { AuthProviderFactory } from '@/lib/auth';
import { TwitterAuthProvider } from '@/lib/auth/providers/twitter';

describe('TwitterAuthProvider', () => {
  let provider: TwitterAuthProvider;

  beforeEach(() => {
    provider = AuthProviderFactory.create('twitter') as TwitterAuthProvider;
  });

  it('should sign in successfully', async () => {
    await provider.signIn();
    expect(provider.isAuthenticated).toBe(true);
  });
});
```

### Testing Data Transformers

```typescript
import { transformForCredential } from '@/lib/auth';

describe('Data Transformation', () => {
  it('should transform Twitter data correctly', () => {
    const input = { user_type: 'twitter', username: 'johndoe' };
    const output = transformForCredential('twitter', input);
    
    expect(output.twitter_username).toBe('johndoe');
  });
});
```

## 🛠️ Configuration

### Environment Variables

Each provider may require specific environment variables:

```bash
# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Twitter (future)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Facebook (future)
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Auth method selection
NEXT_PUBLIC_AUTH_METHOD=spotify
```

### Provider-Specific Configuration

Providers can accept custom configuration:

```typescript
const provider = AuthProviderFactory.create('spotify', {
  scopes: ['user-read-email', 'user-top-read'],
  redirectUri: 'https://yourapp.com/callback',
});
```

## 🔒 Security Considerations

1. **Token Management**: All providers use secure token storage
2. **Error Handling**: Comprehensive error handling with typed errors
3. **State Management**: Centralized state management prevents inconsistencies
4. **Type Safety**: Full TypeScript support prevents runtime errors

## 📈 Benefits

1. **🔌 Extensible**: Easy to add new auth providers
2. **🧪 Testable**: Each provider can be tested in isolation
3. **📦 Maintainable**: Clear separation of concerns
4. **🔄 Consistent**: Unified interface for all auth methods
5. **🎯 Type-Safe**: Full TypeScript support
6. **📚 Discoverable**: Auto-registration and provider discovery

## 🚀 Supported & Future Providers

The system is designed to easily support additional providers:

- ✅ Spotify (implemented)
- ✅ Wallet (implemented) 
- ✅ AIR Kit (implemented)
- ✅ Twitter/X (implemented)
- 🔄 Facebook
- 🔄 GitHub
- 🔄 Discord
- 🔄 Apple ID
- 🔄 Google
- 🔄 Custom OAuth providers

Each new provider follows the same pattern, making the system highly scalable and maintainable.
