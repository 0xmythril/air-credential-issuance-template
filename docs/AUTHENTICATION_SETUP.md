# Authentication Methods Setup Guide

This guide covers setup for different authentication methods supported by the AIR Credential Issuance Template.

## 🔗 Wallet Authentication (Default)

**Use Case**: Web3 applications, DeFi, NFT projects  
**Configuration**: `NEXT_PUBLIC_AUTH_METHOD=wallet`

### Setup Steps

1. **Configure Reown (WalletConnect)**
   ```bash
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
   ```

2. **Required Environment Variables**
   ```bash
   NEXT_PUBLIC_AUTH_METHOD=wallet
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
   ```

3. **User Flow**
   - User clicks "Connect Wallet"
   - WalletConnect modal appears
   - User connects via MetaMask, WalletConnect, etc.
   - Wallet address becomes user identifier

---

## 🆔 AIR Kit Authentication

**Use Case**: Direct AIR Kit integration, existing AIR Kit users  
**Configuration**: `NEXT_PUBLIC_AUTH_METHOD=airkit`

### Setup Steps

1. **No additional configuration required**
   - Uses AIR Kit's built-in authentication
   - User ID is managed by AIR Kit

2. **Required Environment Variables**
   ```bash
   NEXT_PUBLIC_AUTH_METHOD=airkit
   ```

3. **User Flow**
   - User authenticates directly with AIR Kit
   - AIR Kit user ID becomes identifier
   - Seamless integration with AIR Kit ecosystem

---

## 🎵 Spotify Authentication

**Use Case**: Music applications, entertainment platforms, music taste credentials  
**Configuration**: `NEXT_PUBLIC_AUTH_METHOD=spotify`

### Setup Steps

1. **Create Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create new app
   - Set redirect URI: `http://127.0.0.1:3000/api/auth/callback/spotify` (development)
   - Set redirect URI: `https://yourapp.com/api/auth/callback/spotify` (production)

2. **Required Environment Variables**
   ```bash
   NEXT_PUBLIC_AUTH_METHOD=spotify
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   NEXTAUTH_SECRET=your_random_secret
   NEXTAUTH_URL=http://127.0.0.1:3000  # Development
   ```

3. **User Flow**
   - User clicks "Sign in with Spotify"
   - Redirects to Spotify authorization
   - User grants permissions
   - Spotify user ID becomes identifier
   - Music data is fetched for credential content

### Spotify Scopes Required
- `user-read-email` - User's email address
- `user-read-private` - User's subscription details
- `user-top-read` - User's top artists and tracks
- `user-follow-read` - User's followed artists
- `playlist-read-private` - User's private playlists
- `user-read-recently-played` - User's recently played tracks

---

## 𝕏 Twitter/X Authentication

**Use Case**: Social media applications, profile credentials, Twitter analytics  
**Configuration**: `NEXT_PUBLIC_AUTH_METHOD=twitter`

### Setup Steps

1. **Create Twitter App**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create new project and app
   - Set up OAuth 2.0 authentication
   - Set redirect URI: `http://127.0.0.1:3000/api/auth/callback/twitter` (development)
   - Set redirect URI: `https://yourapp.com/api/auth/callback/twitter` (production)

2. **Required Environment Variables**
   ```bash
   NEXT_PUBLIC_AUTH_METHOD=twitter
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   NEXTAUTH_SECRET=your_random_secret
   NEXTAUTH_URL=http://127.0.0.1:3000  # Development
   ```

3. **User Flow**
   - User clicks "Sign in with Twitter"
   - Redirects to Twitter authorization
   - User grants permissions
   - Twitter user ID becomes identifier
   - Profile data is fetched for credential content

### Twitter API Scopes Required
- `tweet.read` - Read user's tweets
- `users.read` - Read user's profile information
- `follows.read` - Read user's followers and following

> **📚 Detailed Guide**: See [TWITTER_SETUP.md](./TWITTER_SETUP.md) for complete Twitter integration setup.

---

## 🔧 Custom OAuth Authentication

**Use Case**: Other OAuth providers (Google, GitHub, Facebook, etc.)  
**Configuration**: `NEXT_PUBLIC_AUTH_METHOD=custom`

### Setup Steps

1. **Choose OAuth Provider**
   - Google OAuth
   - GitHub OAuth
   - Twitter OAuth
   - Custom OAuth provider

2. **Implement Provider**
   - Add provider to `lib/auth.ts`
   - Configure scopes and permissions
   - Set up redirect URIs

3. **Required Environment Variables**
   ```bash
   NEXT_PUBLIC_AUTH_METHOD=custom
   # Provider-specific variables
   PROVIDER_CLIENT_ID=your_provider_client_id
   PROVIDER_CLIENT_SECRET=your_provider_client_secret
   NEXTAUTH_SECRET=your_random_secret
   NEXTAUTH_URL=http://127.0.0.1:3000
   ```

4. **User Flow**
   - User clicks "Sign in with [Provider]"
   - Redirects to provider authorization
   - User grants permissions
   - Provider user ID becomes identifier

---

## 🔄 Switching Between Methods

### Development
Change `NEXT_PUBLIC_AUTH_METHOD` in your `.env.local`:

```bash
# For wallet authentication
NEXT_PUBLIC_AUTH_METHOD=wallet

# For AIR Kit authentication  
NEXT_PUBLIC_AUTH_METHOD=airkit

# For Spotify authentication
NEXT_PUBLIC_AUTH_METHOD=spotify

# For Twitter authentication
NEXT_PUBLIC_AUTH_METHOD=twitter

# For custom OAuth
NEXT_PUBLIC_AUTH_METHOD=custom
```

### Production
Set the environment variable in your deployment platform:

- **Vercel**: Environment Variables in project settings
- **Netlify**: Environment Variables in site settings
- **Railway**: Environment Variables in service settings
- **Docker**: Environment variables in docker-compose.yml

---

## 🛠️ Implementation Details

### File Structure
```
lib/
├── auth.ts              # NextAuth configuration
├── hooks/
│   ├── useSpotify.ts    # Spotify-specific hook
│   └── useAirProvider.tsx # AIR Kit provider hook
└── providers/
    └── index.tsx        # Provider configuration

app/(home)/
├── api/auth/
│   ├── spotify/         # Spotify auth endpoint
│   └── [...nextauth]/   # NextAuth handlers
└── _components/
    └── GetStartedView/  # Authentication UI
```

### Key Components

1. **Authentication Hook** (`lib/hooks/useSpotify.ts`)
   - Manages Spotify session state
   - Provides API access methods
   - Handles token refresh

2. **NextAuth Configuration** (`lib/auth.ts`)
   - Spotify provider setup
   - JWT token management
   - Session callbacks

3. **API Routes** (`app/(home)/api/auth/`)
   - Custom authentication endpoints
   - Token validation
   - User data fetching

4. **UI Components** (`app/(home)/_components/`)
   - Authentication buttons
   - User data display
   - Credential issuance flow

---

## 🔒 Security Considerations

### Token Management
- ✅ Secure token storage in JWTs
- ✅ Token validation on all API calls
- ✅ Automatic token refresh
- ✅ Secure session management

### Data Privacy
- ✅ Minimal scope requests
- ✅ User consent for data access
- ✅ Secure data transmission
- ✅ No sensitive data logging

### Production Security
- ✅ HTTPS enforcement
- ✅ Secure redirect URIs
- ✅ Environment variable protection
- ✅ CORS configuration

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Set production environment variables
- [ ] Configure production redirect URIs
- [ ] Update OAuth app settings
- [ ] Test authentication flow
- [ ] Verify credential issuance

### Post-deployment
- [ ] Update OAuth redirect URIs
- [ ] Test production authentication
- [ ] Monitor error logs
- [ ] Verify credential storage
- [ ] Test user flows

---

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check OAuth app redirect URI configuration
   - Ensure development vs production URLs match

2. **"Client not found"**
   - Verify client ID and secret are correct
   - Check environment variable names

3. **"Authentication failed"**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL configuration

4. **"No user data"**
   - User needs to grant required permissions
   - Check API scopes and permissions

### Debug Mode
Set `NODE_ENV=development` for detailed logging:
- Authentication flow debugging
- API call monitoring
- Error tracking
- Token validation logs
