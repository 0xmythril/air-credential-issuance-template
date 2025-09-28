# Spotify Integration Setup Guide

This guide covers the complete setup for Spotify OAuth integration with music taste credential issuance.

## 🎯 Overview

The Spotify integration allows users to:
- Authenticate with their Spotify account
- Fetch their music listening data (top artists, tracks, genres)
- Issue verifiable credentials containing their music taste profile

## 📋 Prerequisites

1. **Spotify Developer Account**
   - Sign up at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app

2. **Development Environment**
   - Node.js 18+ installed
   - pnpm or npm package manager
   - Git for version control

## 🚀 Setup Steps

### 1. Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create app"
3. Fill in the details:
   - **App name**: Your app name
   - **App description**: Brief description
   - **Redirect URI**: `http://127.0.0.1:3000/api/auth/callback/spotify` (for development)
   - **Which API/SDKs are you planning to use**: Web API

### 2. Get Your Credentials

1. From your app dashboard, copy:
   - **Client ID**
   - **Client Secret**

2. Save these for your environment variables

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Set authentication method to Spotify
NEXT_PUBLIC_AUTH_METHOD=spotify

# Spotify Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
# Development URL (change to your production URL for deployment)
NEXTAUTH_URL=http://127.0.0.1:3000

# AIR Kit Configuration (existing)
NEXT_PUBLIC_PARTNER_ID=your_partner_id
NEXT_PUBLIC_ISSUER_DID=your_issuer_did
NEXT_PUBLIC_ISSUE_PROGRAM_ID=your_issue_program_id
NEXT_PUBLIC_HEADLINE=Your App Headline
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_BUILD_ENV=sandbox
NEXT_PUBLIC_MOCA_CHAIN=devnet
NEXT_PUBLIC_THEME=light

# Partner Configuration
PARTNER_PRIVATE_KEY=your_private_key
SIGNING_ALGORITHM=ES256
```

### 4. Important Notes

- **Development**: Use 127.0.0.1 instead of localhost (Spotify requirement)
- **Development redirect URI**: `http://127.0.0.1:3000/api/auth/callback/spotify`
- **Production**: Update redirect URI to your production domain (e.g., `https://yourapp.com/api/auth/callback/spotify`)
- Make sure your Spotify app's redirect URI exactly matches your environment URL

### 5. Test the Setup

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://127.0.0.1:3000`

3. Click "Sign in with Spotify"

4. Grant the requested permissions

5. Verify you can see your music data

## 🎵 Spotify Scopes Required

The integration requests the following Spotify scopes:

- `user-read-email` - User's email address
- `user-read-private` - User's subscription details  
- `user-top-read` - User's top artists and tracks
- `user-follow-read` - User's followed artists
- `playlist-read-private` - User's private playlists
- `user-read-recently-played` - User's recently played tracks

## 🔧 Implementation Details

### Key Files Modified

1. **`lib/auth.ts`** - NextAuth configuration with Spotify provider
2. **`lib/hooks/useSpotify.ts`** - Spotify session and API management
3. **`app/(home)/api/auth/spotify/route.ts`** - Custom Spotify authentication
4. **`app/(home)/api/user/user-data/route.ts`** - Enhanced to fetch Spotify data
5. **`app/(home)/_components/GetStartedView/components/IssuanceModal.tsx`** - UI updates

### Data Structure

The Spotify integration fetches and processes:

- **Top Artists** - User's most listened to artists (last 6 months)
- **Top Tracks** - User's most played songs (last 6 months)
- **Followed Artists** - Artists the user follows
- **Music Analysis** - Genre analysis, diversity scoring, and insights

### Credential Content

The issued credentials contain:

```json
{
  "spotify_id": "user123",
  "display_name": "John Doe",
  "followed_artists": {
    "followed_artists_1": "Artist 1",
    "followed_artists_2": "Artist 2",
    "followed_artists_3": "Artist 3"
  },
  "top_artists": {
    "top_artists_1": "Artist 1",
    "top_artists_2": "Artist 2", 
    "top_artists_3": "Artist 3"
  },
  "top_tracks": {
    "top_tracks_1": "Track 1",
    "top_tracks_2": "Track 2",
    "top_tracks_3": "Track 3"
  },
  "top_genres": {
    "top_genres_1": "electronic",
    "top_genres_2": "pop",
    "top_genres_3": "rock"
  },
  "music_diversity_score": 25,
  "total_followed_artists": 150
}
```

## 🚀 Production Deployment

### 1. Update Spotify App Settings

1. Go to your Spotify app dashboard
2. Add production redirect URI: `https://yourapp.com/api/auth/callback/spotify`
3. Update app settings as needed

### 2. Environment Variables

Update your production environment variables:

```bash
# Production URLs
NEXTAUTH_URL=https://yourapp.com

# Keep all other variables the same
```

### 3. Deploy

Deploy to your preferred platform:
- **Vercel**: Recommended for Next.js
- **Netlify**: Alternative hosting
- **Railway**: Full-stack hosting
- **Docker**: Containerized deployment

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication Flow**
   - [ ] Click "Sign in with Spotify"
   - [ ] Redirect to Spotify authorization
   - [ ] Grant permissions
   - [ ] Return to app authenticated

2. **Data Fetching**
   - [ ] Top artists displayed
   - [ ] Top tracks displayed
   - [ ] Followed artists displayed
   - [ ] Music diversity score calculated

3. **Credential Issuance**
   - [ ] Click "Continue" to issue credential
   - [ ] AIR Kit login successful
   - [ ] Credential created with music data
   - [ ] Success confirmation displayed

### Error Scenarios

Test these scenarios:
- [ ] Invalid Spotify credentials
- [ ] Network connectivity issues
- [ ] User denies permissions
- [ ] Spotify API rate limits
- [ ] Invalid redirect URI

## 🆘 Troubleshooting

### Common Issues

- **"Invalid redirect URI"**: Make sure your Spotify app's redirect URI exactly matches your `NEXTAUTH_URL` + `/api/auth/callback/spotify`
- **"Client not found"**: Double-check your `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- **NextAuth errors**: Ensure `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` points to your development server
- **"No music data"**: User needs listening history on Spotify
- **SSR errors**: Normal for this setup, app works via client-side rendering

### Debug Mode

Set `NODE_ENV=development` to see detailed console logs of:
- Spotify API calls
- Music data processing
- Credential issuance flow

## 📚 Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [NextAuth.js Spotify Provider](https://next-auth.js.org/providers/spotify)
- [AIR Kit Documentation](https://docs.air3.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 Success!

Once setup is complete, users can:
1. Sign in with their Spotify account
2. View their personalized music taste data
3. Issue verifiable credentials containing their music profile
4. Store credentials securely on the Moca Network

The integration provides a seamless way to create music-based verifiable credentials that can be used for various applications like music recommendations, social features, or identity verification based on music taste.
