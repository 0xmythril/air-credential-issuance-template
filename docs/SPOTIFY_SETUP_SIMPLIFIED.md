# Spotify Authentication Setup

Quick setup guide for Spotify OAuth integration with the modular authentication system.

> **💡 Using the modular auth system?** See [MODULAR_AUTH_SYSTEM.md](./MODULAR_AUTH_SYSTEM.md) for the complete guide.

## 🎯 Spotify Developer Setup

### 1. Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create app"
3. Fill in the details:
   - **App name**: Your app name
   - **App description**: Brief description
   - **Redirect URI**: `http://127.0.0.1:3000/api/auth/callback/spotify` (development)
   - **Redirect URI**: `https://yourapp.com/api/auth/callback/spotify` (production)
   - **Which API/SDKs are you planning to use**: Web API

### 2. Get Credentials

From your app dashboard, copy:
- **Client ID**
- **Client Secret** (click "Show client secret")

## ⚙️ Environment Configuration

Add to your `.env.local`:

```bash
# Authentication Method
NEXT_PUBLIC_AUTH_METHOD=spotify

# Spotify Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://127.0.0.1:3000  # Development
# NEXTAUTH_URL=https://yourapp.com   # Production
```

## 🔧 Required Scopes

The integration uses these Spotify scopes:
- `user-read-email` - User's email address
- `user-read-private` - User's profile information
- `user-top-read` - User's top artists and tracks
- `user-follow-read` - User's followed artists
- `playlist-read-private` - User's playlists
- `user-read-recently-played` - Recently played tracks

## 🚀 Quick Start

1. **Set environment variables** (see above)
2. **Start development server**:
   ```bash
   pnpm dev
   ```
3. **Navigate to**: `http://127.0.0.1:3000`
4. **Click "Sign in with Spotify"**

## 📋 What Gets Issued as Credentials

The Spotify integration creates credentials containing:

```typescript
{
  spotify_id: "user123",
  followed_artists: {
    followed_artists_1: "Artist Name",
    followed_artists_2: "Another Artist",
    followed_artists_3: "Third Artist"
  },
  top_artists: {
    top_artists_1: "Top Artist 1",
    top_artists_2: "Top Artist 2", 
    top_artists_3: "Top Artist 3"
  },
  top_tracks: {
    top_tracks_1: "Track Name",
    top_tracks_2: "Another Track",
    top_tracks_3: "Third Track"
  },
  top_genres: {
    top_genres_1: "pop",
    top_genres_2: "rock",
    top_genres_3: "electronic"
  },
  music_diversity_score: 15,
  total_followed_artists: 45
}
```

## 🔒 Production Notes

- **Use HTTPS** for production redirect URIs
- **Secure environment variables** in your deployment platform
- **Update NEXTAUTH_URL** to your production domain
- **Test thoroughly** with real Spotify accounts

## 🆘 Troubleshooting

- **404 on redirect**: Check redirect URI matches exactly
- **Invalid client**: Verify Client ID and Secret
- **Scope errors**: Ensure all required scopes are configured
- **NEXTAUTH_URL**: Must match your actual domain

For more advanced configuration and extending to other providers, see [MODULAR_AUTH_SYSTEM.md](./MODULAR_AUTH_SYSTEM.md).
