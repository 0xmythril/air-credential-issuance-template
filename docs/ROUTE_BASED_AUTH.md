# Route-Based Authentication

This application now supports **route-based authentication**, allowing you to direct users to specific authentication methods via URL routes. This makes it easy to integrate with different platforms and use cases.

## Available Routes

### 🎵 Spotify Authentication
**URL**: `http://127.0.0.1:3000/spotify` (or `https://yourapp.com/spotify`)

Issues credentials based on:
- Top artists
- Top genres
- Top tracks
- Followed artists
- Music diversity score

**Use Case**: Music applications, entertainment platforms, music taste credentials

---

### 🐦 Twitter (X) Authentication
**URL**: `http://127.0.0.1:3000/twitter` (or `https://yourapp.com/twitter`)

Issues credentials based on:
- Follower count
- Following count
- Tweet count
- Account verification status
- Profile information

**Use Case**: Social media applications, reputation systems, influencer verification

---

### 💬 Discord Authentication
**URL**: `http://127.0.0.1:3000/discord` (or `https://yourapp.com/discord`)

Issues credentials based on:
- Server count (guilds joined)
- Owned servers
- Connected accounts
- Verification status
- Premium (Nitro) status

**Use Case**: Gaming communities, Discord bots, community management

---

### 🔗 Wallet Authentication (Ethos)
**URL**: `http://127.0.0.1:3000/ethos` or `http://127.0.0.1:3000/wallet`

Issues credentials based on:
- Wallet address
- On-chain reputation data
- Transaction history
- Token holdings (if configured)

**Use Case**: Web3 applications, DeFi, NFT projects, blockchain-based systems

---

### 🆔 AIR Kit Authentication
**URL**: `http://127.0.0.1:3000/airkit`

Issues credentials based on:
- AIR Kit user identity
- Existing credentials
- User profile data

**Use Case**: Direct AIR Kit integration, existing AIR Kit users

---

## How It Works

### Architecture

The application uses a **context-based routing system** that automatically detects the authentication method from the URL path:

1. **AuthMethodContext** (`lib/contexts/AuthMethodContext.tsx`)
   - Detects auth method from pathname
   - Updates dynamically when route changes
   - Provides `authMethod` to all child components

2. **Route-Specific Pages** (`app/(home)/[method]/page.tsx`)
   - Each route has its own page component
   - Shows appropriate loading state
   - Renders the same `GetStartedView` component with different context

3. **Dynamic Components**
   - Components use `useAuthMethod()` hook instead of hardcoded env variables
   - Headlines, button text, and data preview adjust automatically
   - Authentication flows are method-specific

### Implementation Example

```typescript
// In any component
import { useAuthMethod } from '@/lib/contexts/AuthMethodContext';

function MyComponent() {
  const { authMethod } = useAuthMethod();
  
  // authMethod will be 'spotify', 'twitter', 'discord', 'wallet', or 'airkit'
  // based on the current route
}
```

### Environment Variables

No special environment variables needed for routing! Each route automatically determines its authentication method.

```bash
# Optional: Custom headline (if not set, auto-generated based on route)
NEXT_PUBLIC_HEADLINE=""

# Optional: Per-route issuance programs
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID=""
NEXT_PUBLIC_TWITTER_PROGRAM_ID=""
NEXT_PUBLIC_DISCORD_PROGRAM_ID=""
NEXT_PUBLIC_ETHOS_PROGRAM_ID=""
```

## Integration Examples

### Embedding in Your Application

Direct users to specific credential types:

```html
<!-- Spotify Credential -->
<a href="https://yourapp.com/spotify">Get Music Taste Credential</a>

<!-- Twitter Credential -->
<a href="https://yourapp.com/twitter">Verify Twitter Profile</a>

<!-- Discord Credential -->
<a href="https://yourapp.com/discord">Prove Discord Membership</a>

<!-- Wallet Credential -->
<a href="https://yourapp.com/ethos">Connect Wallet</a>
```

### Deep Linking

Use route-based URLs for deep linking from other platforms:

```javascript
// From a Discord bot
const credentialUrl = 'https://yourapp.com/discord';
await interaction.reply(`Get your verified Discord credential: ${credentialUrl}`);

// From a Spotify app
window.location.href = 'https://yourapp.com/spotify';

// From a Twitter integration
const url = `https://yourapp.com/twitter`;
```

### QR Codes

Generate QR codes for specific authentication methods:

```javascript
// Example: Generate QR code for Discord credential
const qrCode = generateQR('https://yourapp.com/discord');

// Users scan QR → Opens Discord auth → Issues Discord credential
```

## Root Route Behavior

The root route `/` displays a **home page** with all available credential options:

```
'/' → Shows credential selection page with cards for each option

Users can:
- Browse all available credential types
- Read descriptions and features
- Click to navigate to specific credential routes
```

Each credential card shows:
- Title and description
- Visual icon
- List of included features
- "Get This Credential" button

## Benefits

### 1. **Multiple Integrations Per App**
- One deployment supports all authentication methods
- No need to deploy separate apps for different platforms
- Unified credential issuance infrastructure

### 2. **Easy Partner Integration**
```javascript
// Spotify Partner
const spotifyCredentialLink = 'https://yourapp.com/spotify';

// Twitter Partner
const twitterCredentialLink = 'https://yourapp.com/twitter';

// Discord Partner
const discordCredentialLink = 'https://yourapp.com/discord';
```

### 3. **Flexible User Experience**
- Users choose their preferred authentication method via URL
- Each route has appropriate branding and messaging
- Seamless integration with platform-specific UX

### 4. **Developer-Friendly**
- Clean separation of concerns
- Easy to add new authentication methods
- Type-safe with TypeScript
- Context-based state management

## Adding New Authentication Methods

To add a new authentication method (e.g., Facebook):

1. **Add to AuthMethod type** (`lib/contexts/AuthMethodContext.tsx`):
```typescript
export type AuthMethod = "wallet" | "airkit" | "spotify" | "twitter" | "discord" | "facebook";
```

2. **Create route page** (`app/(home)/facebook/page.tsx`):
```typescript
"use client";
import { GetStartedView } from "../_components/GetStartedView";
// ... implementation
```

3. **Add route detection** (`lib/contexts/AuthMethodContext.tsx`):
```typescript
if (pathname.startsWith('/facebook')) {
  return 'facebook';
}
```

4. **Implement provider** (`lib/auth/providers/facebook.ts`):
```typescript
export class FacebookAuthProvider extends BaseAuthProvider {
  // ... implementation
}
```

5. **Register provider** (`lib/auth/providers/index.ts`):
```typescript
AuthProviderFactory.register('facebook', FacebookAuthProvider);
```

## Migration from Environment-Based Auth

If you were previously using `NEXT_PUBLIC_AUTH_METHOD` in `.env`:

### Before:
```bash
# Old approach - only one method per deployment
NEXT_PUBLIC_AUTH_METHOD="spotify"
```

### After:
```bash
# New approach - all methods available via routes
# No NEXT_PUBLIC_AUTH_METHOD needed!
```

Simply remove `NEXT_PUBLIC_AUTH_METHOD` from your `.env` file. Your users can now access:
- `/spotify` - Spotify authentication
- `/twitter` - Twitter authentication
- `/discord` - Discord authentication
- `/wallet` or `/ethos` - Wallet authentication
- `/airkit` - AIR Kit authentication

## Testing

Test all routes locally:

```bash
# Start dev server
pnpm dev

# Test each route
http://127.0.0.1:3000/spotify
http://127.0.0.1:3000/twitter
http://127.0.0.1:3000/discord
http://127.0.0.1:3000/ethos
http://127.0.0.1:3000/wallet
http://127.0.0.1:3000/airkit
```

## Notes

- **Spotify OAuth**: Use `127.0.0.1:3000` (not `localhost`) for redirect URIs
- **Session Management**: NextAuth.js handles OAuth sessions for Spotify, Twitter, Discord
- **Credential Format**: Each method produces platform-specific credential data
- **AIR Kit**: All methods require AIR Kit login for credential issuance

## Support

For issues or questions about route-based authentication:
1. Check the [Authentication Setup Guide](./AUTHENTICATION_SETUP.md)
2. Review [Development Guide](./DEVELOPMENT_GUIDE.md)
3. See [Modular Auth System](./MODULAR_AUTH_SYSTEM.md) for architecture details
