# Quick Start: Route-Based Authentication

## TL;DR

Your application now supports multiple authentication methods via different URLs:

```bash
# Spotify Music Taste Credential
http://127.0.0.1:3000/spotify

# Twitter Profile Credential  
http://127.0.0.1:3000/twitter

# Discord Profile Credential
http://127.0.0.1:3000/discord

# Wallet/Ethos Credential
http://127.0.0.1:3000/ethos
# or
http://127.0.0.1:3000/wallet

# AIR Kit Credential
http://127.0.0.1:3000/airkit
```

## How to Use

### For End Users

**Option 1: Start from Home Page**
1. Visit the home page at `/`
2. Browse all available credential types
3. Click on the credential you want to issue

**Option 2: Direct URL**
Simply navigate to the URL for the credential type you want:

1. **Music lovers**: Go to `/spotify`
2. **Twitter users**: Go to `/twitter`
3. **Discord members**: Go to `/discord`
4. **Web3 users**: Go to `/ethos` or `/wallet`
5. **AIR Kit users**: Go to `/airkit`

### For Developers/Partners

Embed these URLs in your application:

```html
<!-- Music App Integration -->
<a href="https://yourapp.com/spotify">
  Get Music Credential
</a>

<!-- Social Platform Integration -->
<a href="https://yourapp.com/twitter">
  Verify Twitter Profile
</a>

<!-- Gaming/Community Integration -->
<a href="https://yourapp.com/discord">
  Prove Discord Membership
</a>

<!-- Web3 DApp Integration -->
<a href="https://yourapp.com/ethos">
  Connect Wallet
</a>
```

### For Bot Developers

Direct users to specific credentials:

```javascript
// Discord Bot
const discordCredUrl = 'https://yourapp.com/discord';
await message.reply(`Get your credential: ${discordCredUrl}`);

// Twitter Bot
const twitterCredUrl = 'https://yourapp.com/twitter';
tweet(`Verify your profile: ${twitterCredUrl}`);
```

## Configuration

### Environment Variables

```bash
# .env file

# Optional: Sets where "/" redirects to (default: "wallet")
# No NEXT_PUBLIC_AUTH_METHOD needed - routes determine auth method!

# Optional: Custom headline (auto-generated if empty)
NEXT_PUBLIC_HEADLINE=""

# Required for each auth method you want to use:
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=""

TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""

DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
```

### OAuth Setup

Each authentication method requires OAuth configuration:

- **Spotify**: [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
  - Redirect URI: `http://127.0.0.1:3000/api/auth/callback/spotify`
  
- **Twitter**: [developer.twitter.com/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)
  - Redirect URI: `http://127.0.0.1:3000/api/auth/callback/twitter`
  
- **Discord**: [discord.com/developers/applications](https://discord.com/developers/applications)
  - Redirect URI: `http://127.0.0.1:3000/api/auth/callback/discord`

## What Changed

### Before (Environment-Based)
```bash
# Could only use ONE method per deployment
# Routes automatically determine auth - no config needed
```

### After (Route-Based)
```bash
# ALL methods available in one deployment
# Just configure the ones you need
# Users access via different routes
```

## Testing Locally

```bash
# Start dev server
pnpm dev

# Open different routes in browser:
# http://127.0.0.1:3000/spotify
# http://127.0.0.1:3000/twitter  
# http://127.0.0.1:3000/discord
# http://127.0.0.1:3000/ethos
```

## Production Deployment

1. **Configure OAuth apps** for each platform with production URLs:
   ```
   https://yourapp.com/api/auth/callback/spotify
   https://yourapp.com/api/auth/callback/twitter
   https://yourapp.com/api/auth/callback/discord
   ```

2. **Set environment variables** in your hosting platform

3. **Deploy** - all routes are automatically available

4. **Share route URLs** with users or integrate into your apps

## Benefits

✅ **One deployment, multiple credential types**  
✅ **Easy partner integrations** (just share the route URL)  
✅ **Flexible user experience** (users choose their preferred method)  
✅ **Platform-specific branding** (each route shows appropriate messaging)  
✅ **No code changes needed** (just environment variables)

## Need Help?

- 📖 Full documentation: [ROUTE_BASED_AUTH.md](./ROUTE_BASED_AUTH.md)
- 🔧 Setup guides: [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
- 💻 Development: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
