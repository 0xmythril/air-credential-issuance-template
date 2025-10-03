# Route-Based Issuance Programs

## Overview

The application supports **per-route issuance program IDs**, allowing each route to map to its own specific issuance program. This enables you to issue different credential types for each authentication method.

## URL Structure

### Route-to-Program Mapping
```
/:authMethod
```
**Examples:**
- `http://127.0.0.1:3000/spotify` → Uses `NEXT_PUBLIC_SPOTIFY_PROGRAM_ID` (or fallback)
- `http://127.0.0.1:3000/twitter` → Uses `NEXT_PUBLIC_TWITTER_PROGRAM_ID` (or fallback)
- `http://127.0.0.1:3000/discord` → Uses `NEXT_PUBLIC_DISCORD_PROGRAM_ID` (or fallback)
- `http://127.0.0.1:3000/ethos` → Uses `NEXT_PUBLIC_ETHOS_PROGRAM_ID` (or fallback)

Each route is configured via environment variables to use a specific issuance program.

## Use Cases

### 1. **Different Credentials Per Data Source**
Each authentication method can issue its own credential type:
- `/spotify` - Music taste credential
- `/twitter` - Social influence credential
- `/discord` - Community engagement credential
- `/ethos` - Wallet reputation credential

### 2. **Environment-Specific Programs**
Use different programs for testing vs production via environment variables:
```bash
# .env.development
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="test_spotify_program"

# .env.production
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="prod_spotify_program"
```

### 3. **Multi-Deployment Strategy**
Different deployments can issue different credentials from the same code:
- Deployment A: `NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="partner_a_music"`
- Deployment B: `NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="partner_b_music"`

## Implementation Details

### Architecture

1. **`IssuanceProgramContext`** (`lib/contexts/IssuanceProgramContext.tsx`)
   - Extracts auth method from URL path (e.g., `/spotify`)
   - Maps auth method to corresponding program ID from env variables
   - Falls back to `NEXT_PUBLIC_ISSUE_PROGRAM_ID` if route-specific ID not set

2. **Route Pages** (`app/(home)/:authMethod/page.tsx`)
   - Simple routes: `/spotify`, `/twitter`, `/discord`, `/ethos`
   - Each route automatically maps to its configured program ID
   - No dynamic segments needed

3. **`useCredentialIssuance` Hook**
   - Uses `useIssuanceProgram()` context to get program ID
   - Passes program ID to AIR Kit's `issueCredential`
   - Logs program ID for debugging

### Code Flow

```
User visits: /spotify
      ↓
IssuanceProgramContext reads route → "spotify"
      ↓
getProgramIdForAuthMethod("spotify") → checks NEXT_PUBLIC_SPOTIFY_PROGRAM_ID
      ↓
Returns program ID (or falls back to NEXT_PUBLIC_ISSUE_PROGRAM_ID)
      ↓
useCredentialIssuance gets programId from context
      ↓
airService.issueCredential({ credentialId: programId, ... })
```

## Console Logging

When using route-specific program IDs:

```javascript
🎯 [IssuanceProgram] Using program for spotify: spotify_music_credential
🎯 [Credential Issuance] Using program ID: spotify_music_credential
```

When using fallback (global default):

```javascript
🎯 [IssuanceProgram] Using global default for twitter: default_program_id
🎯 [Credential Issuance] Using program ID: default_program_id
```

## Example Scenarios

### Scenario 1: Music Taste Credential

**Setup in `.env`:**
```bash
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="music_taste_v1"
```

**URL:** `http://127.0.0.1:3000/spotify`

**Workflow:**
1. User navigates to `/spotify`
2. System reads `NEXT_PUBLIC_SPOTIFY_PROGRAM_ID` → `music_taste_v1`
3. User authenticates with Spotify
4. User's music data is fetched
5. Credential is issued using `music_taste_v1` program
6. User receives music taste credential

### Scenario 2: Social Influence Credential

**Setup in `.env`:**
```bash
NEXT_PUBLIC_TWITTER_PROGRAM_ID="social_influence_v2"
```

**URL:** `http://127.0.0.1:3000/twitter`

**Workflow:**
1. User navigates to `/twitter`
2. System reads `NEXT_PUBLIC_TWITTER_PROGRAM_ID` → `social_influence_v2`
3. User authenticates with Twitter
4. Twitter data fetched and transformed
5. Credential issued using `social_influence_v2` program

### Scenario 3: Multi-Environment Setup

**Development (`.env.development`):**
```bash
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="test_spotify_program"
NEXT_PUBLIC_TWITTER_PROGRAM_ID="test_twitter_program"
```

**Production (`.env.production`):**
```bash
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="prod_spotify_program"
NEXT_PUBLIC_TWITTER_PROGRAM_ID="prod_twitter_program"
```

Same code, different programs based on environment!

## Migration from Global Default

⚠️ **Breaking Change from Previous Versions**

- **Old behavior:** Routes used `NEXT_PUBLIC_ISSUE_PROGRAM_ID` as fallback
- **New behavior:** Each route **requires** its own specific program ID

### Migration Steps

If you were using `NEXT_PUBLIC_ISSUE_PROGRAM_ID`, update your `.env`:

**Before:**
```bash
NEXT_PUBLIC_ISSUE_PROGRAM_ID="my_program"
```

**After:**
```bash
# Set specific program for each route you use
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="my_program"
NEXT_PUBLIC_TWITTER_PROGRAM_ID="my_program"
NEXT_PUBLIC_DISCORD_PROGRAM_ID="my_program"
NEXT_PUBLIC_ETHOS_PROGRAM_ID="my_program"

# Optional: Keep old variable for reference (not used)
NEXT_PUBLIC_ISSUE_PROGRAM_ID="my_program"
```

## Configuration

### Environment Variables

#### Route-Specific Program IDs (Required)

Each route **must** have its own program ID configured:

```bash
# Spotify route (/spotify)
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="spotify_music_credential"

# Twitter route (/twitter)
NEXT_PUBLIC_TWITTER_PROGRAM_ID="twitter_social_credential"

# Discord route (/discord)
NEXT_PUBLIC_DISCORD_PROGRAM_ID="discord_community_credential"

# Ethos/Wallet route (/ethos or /wallet)
NEXT_PUBLIC_ETHOS_PROGRAM_ID="ethos_wallet_credential"

# AIR Kit route (/airkit)
NEXT_PUBLIC_AIRKIT_PROGRAM_ID="airkit_credential"
```

#### Program Resolution

The system directly maps routes to their configured program IDs:

- `/spotify` → `NEXT_PUBLIC_SPOTIFY_PROGRAM_ID` (required)
- `/twitter` → `NEXT_PUBLIC_TWITTER_PROGRAM_ID` (required)
- `/discord` → `NEXT_PUBLIC_DISCORD_PROGRAM_ID` (required)
- `/ethos` or `/wallet` → `NEXT_PUBLIC_ETHOS_PROGRAM_ID` or `NEXT_PUBLIC_WALLET_PROGRAM_ID` (required)
- `/airkit` → `NEXT_PUBLIC_AIRKIT_PROGRAM_ID` (required)

**If a route's program ID is not set, the application will throw an error** with a clear message indicating which environment variable needs to be configured.

#### Configuration Examples

**Same Program for All Routes:**
```bash
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="my_program"
NEXT_PUBLIC_TWITTER_PROGRAM_ID="my_program"
NEXT_PUBLIC_DISCORD_PROGRAM_ID="my_program"
NEXT_PUBLIC_ETHOS_PROGRAM_ID="my_program"
# All routes use the same program
```

**Different Programs Per Route:**
```bash
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="spotify_music_v1"
NEXT_PUBLIC_TWITTER_PROGRAM_ID="twitter_social_v1"
NEXT_PUBLIC_DISCORD_PROGRAM_ID="discord_community_v1"
NEXT_PUBLIC_ETHOS_PROGRAM_ID="ethos_wallet_v1"
# Each route has its own specific program
```

**Selective Route Configuration:**
```bash
# Only configure the routes you plan to use
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="spotify_program"
NEXT_PUBLIC_TWITTER_PROGRAM_ID="twitter_program"
# Only /spotify and /twitter routes will work
# Other routes will throw configuration errors
```

### Adding New Auth Method Support

To add program ID support for a new auth method:

1. **Add environment variable** to `.env`:
```bash
NEXT_PUBLIC_NEWMETHOD_PROGRAM_ID="your_program_id"
```

2. **Update `IssuanceProgramContext`** (`lib/contexts/IssuanceProgramContext.tsx`):
```typescript
case "newmethod":
  return env.NEXT_PUBLIC_NEWMETHOD_PROGRAM_ID;
```

3. **Create route page** (`app/(home)/newmethod/page.tsx`):
```typescript
"use client";
import { GetStartedView } from "../_components/GetStartedView";

export default function NewMethodPage() {
  return <GetStartedView />;
}
```

That's it! The route will automatically use its configured program ID.

## Testing

### Test Route-Specific Program ID
```bash
# Set in .env:
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="test_spotify_123"

# Navigate to:
http://127.0.0.1:3000/spotify

# Check console for:
🎯 [IssuanceProgram] Using program for spotify: test_spotify_123
```

### Test Fallback to Global Default
```bash
# Don't set NEXT_PUBLIC_TWITTER_PROGRAM_ID
# Navigate to:
http://127.0.0.1:3000/twitter

# Check console for:
🎯 [IssuanceProgram] Using global default for twitter: <global_program_id>
```

### Test Multiple Routes
```bash
# Set in .env:
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="spotify_program"
NEXT_PUBLIC_TWITTER_PROGRAM_ID="twitter_program"

# Test each route and verify different programs are used
```

## API Integration

If you're integrating this into your application:

### Generate Links
```typescript
const authMethod = "spotify";
const issuanceUrl = `https://yourapp.com/${authMethod}`;

// Share this URL with users
// The route will use the program ID configured in your deployment's env
```

### Embed in iFrame
```html
<iframe src="https://yourapp.com/spotify" />
<!-- Uses NEXT_PUBLIC_SPOTIFY_PROGRAM_ID from your env -->
```

### Deep Linking
```javascript
// Mobile app deep link
const deepLink = `myapp://issue/spotify`;
// Program ID determined by deployment configuration
```

### Multi-Deployment Strategy
```bash
# Deployment 1 (.env)
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="partner_a_program"

# Deployment 2 (.env)
NEXT_PUBLIC_SPOTIFY_PROGRAM_ID="partner_b_program"

# Both use URL: https://app.com/spotify
# But issue different credentials based on deployment config
```

## Future Enhancements

Potential future features:
1. **Program Metadata API** - Fetch program details before issuance
2. **Program Validation** - Server-side validation of program IDs
3. **Program Discovery** - List available programs per auth method
4. **Program-Specific UI** - Custom UI based on program type
5. **Program Analytics** - Track which programs are most used

## Security Considerations

⚠️ **Important Security Notes:**

1. **Program ID Validation**: The system validates basic format, but you should implement server-side validation in your AIR Kit setup to ensure only authorized program IDs can issue credentials.

2. **Rate Limiting**: Consider implementing rate limiting per program ID to prevent abuse.

3. **Access Control**: Your AIR Kit configuration should enforce which program IDs are valid for which issuers.

## Troubleshooting

### Program ID Not Detected
**Issue:** Using custom program ID but system uses default

**Solutions:**
- Check program ID is at least 10 characters
- Check program ID contains only alphanumeric characters
- Check console logs for extraction messages

### Wrong Credential Issued
**Issue:** Credential doesn't match expected program

**Solutions:**
- Verify program ID in AIR Kit dashboard
- Check console logs for program ID being used
- Ensure AIR Kit program exists and is active

### 404 on Dynamic Route
**Issue:** `/spotify/programId` shows 404

**Solutions:**
- Ensure you've run `pnpm build` after adding dynamic routes
- Restart dev server
- Check `app/(home)/spotify/[programId]/page.tsx` exists

## Summary

✅ **Dynamic issuance programs enable:**
- Multiple credential types from same data source
- Flexible program management without code changes
- Easy testing and development workflows
- Partner-specific credential issuance
- Environment-specific configurations

✅ **Fully extensible and backwards compatible**

