# Authentication Setup Guide

This guide covers how to set up different authentication methods in the AIR Credential Issuance Template.

## Route-Based Authentication

The template uses **route-based authentication**. Each URL route automatically determines the authentication method:

- `/spotify` → Spotify OAuth
- `/twitter` → Twitter OAuth
- `/discord` → Discord OAuth
- `/ethos` or `/wallet` → Wallet Connect
- `/airkit` → AIR Kit authentication

No configuration needed - just navigate to the route!

## Authentication Method Details

### 1. Wallet Authentication (Ethos)

**Route**: `/ethos` or `/wallet`

**Description**: Web3 wallet authentication using RainbowKit and WalletConnect.

**Setup Steps**:
1. Get a Reown (formerly WalletConnect) Project ID from https://cloud.reown.com/
2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_REOWN_PROJECT_ID="your_project_id"
   ```
3. *(Optional)* Set wallet-specific program ID:
   ```bash
   NEXT_PUBLIC_ETHOS_PROGRAM_ID="your_wallet_program_id"
   ```

**User Flow**:
- User visits `/ethos`
- Clicks "Connect Wallet"
- Selects wallet (MetaMask, Coinbase, etc.)
- Signs message to authenticate
- Credential is issued

---

### 2. AIR Kit Authentication

**Route**: `/airkit`

**Description**: Direct authentication using AIR Kit's built-in authentication.

**Setup Steps**:
1. Configure AIR Kit credentials:
   ```bash
   NEXT_PUBLIC_PARTNER_ID="your_partner_id"
   NEXT_PUBLIC_ISSUER_DID="your_issuer_did"
   NEXT_PUBLIC_ISSUE_PROGRAM_ID="your_program_id"
   ```
2. *(Optional)* Set AIR Kit-specific program ID:
   ```bash
   NEXT_PUBLIC_AIRKIT_PROGRAM_ID="your_airkit_program_id"
   ```

**User Flow**:
- User visits `/airkit`
- AIR Kit widget handles authentication
- User logs in with AIR account
- Credential is issued

---

### 3. Spotify Authentication

**Route**: `/spotify`

**Description**: OAuth authentication with Spotify to access user's music data.

**Setup Steps**:

1. **Create Spotify App**:
   - Go to https://developer.spotify.com/dashboard
   - Create a new app
   - Add redirect URI: `http://127.0.0.1:3000/api/auth/callback/spotify` (for local dev)
   - For production, add: `https://yourdomain.com/api/auth/callback/spotify`

2. **Configure Environment Variables**:
   ```bash
   # Server-side OAuth
   SPOTIFY_CLIENT_ID="your_client_id"
   SPOTIFY_CLIENT_SECRET="your_client_secret"
   
   # Client-side API calls
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID="your_client_id"
   
   # NextAuth
   NEXTAUTH_SECRET="generate_random_secret"
   NEXTAUTH_URL="http://127.0.0.1:3000"  # Use 127.0.0.1 for Spotify
   ```

3. ***(Optional)* Set Spotify-specific program ID**:
   ```bash
   NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="your_spotify_program_id"
   ```

**User Flow**:
- User visits `/spotify`
- Clicks "Sign in with Spotify"
- Redirected to Spotify OAuth
- Grants permissions
- Returns to app with access token
- Spotify data fetched
- Credential is issued

**Data Retrieved**: User profile, top artists, top tracks, followed artists, playlists.

---

### 4. Twitter Authentication

**Route**: `/twitter`

**Description**: OAuth 2.0 authentication with Twitter to access user's profile data.

**Setup Steps**:

1. **Create Twitter App**:
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Create a new app (OAuth 2.0 type)
   - Add redirect URI: `http://127.0.0.1:3000/api/auth/callback/twitter`
   - For production, add: `https://yourdomain.com/api/auth/callback/twitter`
   - Enable OAuth 2.0 and request scopes: `tweet.read`, `users.read`, `follows.read`

2. **Configure Environment Variables**:
   ```bash
   TWITTER_CLIENT_ID="your_client_id"
   TWITTER_CLIENT_SECRET="your_client_secret"
   
   # NextAuth
   NEXTAUTH_SECRET="generate_random_secret"
   NEXTAUTH_URL="http://127.0.0.1:3000"
   ```

3. ***(Optional)* Set Twitter-specific program ID**:
   ```bash
   NEXT_PUBLIC_TWITTER_PROGRAM_ID="your_twitter_program_id"
   ```

**User Flow**:
- User visits `/twitter`
- Clicks "Sign in with Twitter"
- Redirected to Twitter OAuth
- Grants permissions
- Returns to app with access token
- Twitter data fetched
- Credential is issued

**Data Retrieved**: User ID, username, display name, bio, follower count, following count, tweet count, verified status.

---

### 5. Discord Authentication

**Route**: `/discord`

**Description**: OAuth 2.0 authentication with Discord to access user's profile and guild data.

**Setup Steps**:

1. **Create Discord App**:
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Navigate to OAuth2 settings
   - Add redirect URI: `http://127.0.0.1:3000/api/auth/callback/discord`
   - For production, add: `https://yourdomain.com/api/auth/callback/discord`
   - Request scopes: `identify`, `email`, `guilds`, `guilds.members.read`

2. **Configure Environment Variables**:
   ```bash
   DISCORD_CLIENT_ID="your_client_id"
   DISCORD_CLIENT_SECRET="your_client_secret"
   
   # NextAuth
   NEXTAUTH_SECRET="generate_random_secret"
   NEXTAUTH_URL="http://127.0.0.1:3000"
   ```

3. ***(Optional)* Set Discord-specific program ID**:
   ```bash
   NEXT_PUBLIC_DISCORD_PROGRAM_ID="your_discord_program_id"
   ```

**User Flow**:
- User visits `/discord`
- Clicks "Sign in with Discord"
- Redirected to Discord OAuth
- Grants permissions
- Returns to app with access token
- Discord data fetched
- Credential is issued

**Data Retrieved**: User ID, username, discriminator, email, avatar, banner, accent color, locale, verified status, premium type, guilds.

---

## Route-Specific Issuance Programs

Each route can be configured to use its own issuance program via environment variables:

```bash
# .env
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="music_credential_v1"
NEXT_PUBLIC_TWITTER_PROGRAM_ID="social_credential_v1"
NEXT_PUBLIC_DISCORD_PROGRAM_ID="community_credential_v1"
```

This allows each route to issue different credential types.

**Priority**:
1. Route-specific program ID (`NEXT_PUBLIC_SPOTIFY_PROGRAM_ID`, etc.)
2. Global default (`NEXT_PUBLIC_ISSUE_PROGRAM_ID`)

See [DYNAMIC_ISSUANCE_PROGRAMS.md](DYNAMIC_ISSUANCE_PROGRAMS.md) for more details.

---

## Testing Authentication

### Local Development
1. Start the dev server: `pnpm dev`
2. Navigate to desired route:
   - `http://127.0.0.1:3000/spotify`
   - `http://127.0.0.1:3000/twitter`
   - `http://127.0.0.1:3000/discord`
   - `http://127.0.0.1:3000/ethos`
3. Follow authentication flow
4. Check browser console for debug logs

### Common Issues

**Spotify OAuth fails**:
- Ensure `NEXTAUTH_URL="http://127.0.0.1:3000"` (not localhost)
- Verify redirect URI matches exactly

**Twitter OAuth fails**:
- Check OAuth 2.0 is enabled
- Verify scopes are requested
- Ensure redirect URI is correct

**Discord OAuth fails**:
- Check scopes are enabled
- Verify redirect URI matches
- Ensure bot is not required

**Wallet Connect fails**:
- Verify `NEXT_PUBLIC_REOWN_PROJECT_ID` is set
- Check wallet extension is installed
- Try different wallet

---

## Switching Between Methods

Simply navigate to different routes - no code changes needed!

```
/spotify  → Spotify authentication
/twitter  → Twitter authentication
/discord  → Discord authentication
/ethos    → Wallet authentication
```

The app automatically adapts the UI and authentication flow based on the route.

---

## Further Reading

- [Route-Based Authentication Details](ROUTE_BASED_AUTH.md)
- [Dynamic Issuance Programs](DYNAMIC_ISSUANCE_PROGRAMS.md)
- [Development Guide](DEVELOPMENT_GUIDE.md)
