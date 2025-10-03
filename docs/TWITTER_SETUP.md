# Twitter/X Authentication Setup

Quick setup guide for Twitter OAuth integration with the modular authentication system.

> **💡 Using the modular auth system?** See [MODULAR_AUTH_SYSTEM.md](./MODULAR_AUTH_SYSTEM.md) for the complete guide.

## 🎯 Twitter Developer Setup

### 1. Create Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign up for a developer account (if you haven't already)
3. Create a new project and app:
   - **Project name**: Your project name
   - **App name**: Your app name
   - **App description**: Brief description
4. Navigate to "User authentication settings"
5. Set up OAuth 2.0:
   - **App permissions**: Read
   - **Type of App**: Web App
   - **Callback URI**: `http://127.0.0.1:3000/api/auth/callback/twitter` (development)
   - **Callback URI**: `https://yourapp.com/api/auth/callback/twitter` (production)
   - **Website URL**: Your app's website

### 2. Get Credentials

From your app's "Keys and tokens" section, copy:
- **Client ID** (OAuth 2.0)
- **Client Secret** (OAuth 2.0)

> **Note**: Make sure you're using OAuth 2.0 credentials, not OAuth 1.0a.

## ⚙️ Environment Configuration

Add to your `.env.local`:

```bash
# Authentication Method
# Navigate to /twitter route - no config needed

# Twitter Credentials (OAuth 2.0)
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://127.0.0.1:3000  # Development
# NEXTAUTH_URL=https://yourapp.com   # Production
```

## 🔧 Required Scopes

The integration uses these Twitter API v2 scopes:
- `tweet.read` - Read user's tweets
- `users.read` - Read user's profile information
- `follows.read` - Read user's followers and following

> **Note**: Twitter's OAuth 2.0 scopes are different from v1.1a. Make sure you're using the correct API version.

## 🚀 Quick Start

1. **Set environment variables** (see above)
2. **Start development server**:
   ```bash
   pnpm dev
   ```
3. **Navigate to**: `http://127.0.0.1:3000`
4. **Click "Sign in with Twitter"**

## 📋 What Gets Issued as Credentials

The Twitter integration creates credentials containing:

```typescript
{
  twitter_id: "1234567890",
  username: "johndoe",
  name: "John Doe",
  followers_count: 150,
  following_count: 300,
  tweet_count: 89,
  listed_count: 5,
  verified: false,
  description: "Software developer interested in Web3",
  location: "San Francisco, CA",
  account_created_at: "2023-01-15T10:30:00.000Z"
}
```

### Credential Fields

| Field | Type | Description |
|-------|------|-------------|
| `twitter_id` | string | Twitter user ID |
| `username` | string | Twitter handle (@username) |
| `name` | string | Display name |
| `followers_count` | number | Number of followers |
| `following_count` | number | Number of accounts following |
| `tweet_count` | number | Total tweets posted |
| `listed_count` | number | Number of lists user is on |
| `verified` | boolean | Verification status |
| `description` | string | User bio/description |
| `location` | string | User's location (if provided) |
| `account_created_at` | string | Account creation date |

## 🔒 Production Notes

- **Use HTTPS** for production redirect URIs
- **Secure environment variables** in your deployment platform
- **Never commit** `.env.local` or credentials to version control
- **Use different apps** for development and production
- **Monitor API usage** in Twitter Developer Portal

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid OAuth 2.0 credentials"**
   - Ensure you're using OAuth 2.0 credentials, not OAuth 1.0a
   - Verify Client ID and Secret are correct
   - Check that credentials are from the same app

2. **"Redirect URI mismatch"**
   - Ensure redirect URI in Twitter app matches exactly
   - Use `127.0.0.1:3000` for local development (not `localhost`)
   - Include the full path: `/api/auth/callback/twitter`

3. **"Invalid scope"**
   - Twitter API v2 uses different scopes than v1.1a
   - Ensure app has read permissions enabled
   - Check User authentication settings in Twitter Developer Portal

4. **"User data not fetching"**
   - Verify Twitter API v2 is enabled for your app
   - Check that user.fields are requested in API calls
   - Ensure access token is valid and not expired

5. **"Authentication error" or "Failed to get Twitter user"**
   - Check NextAuth configuration in `lib/auth.ts`
   - Verify NEXTAUTH_SECRET is set
   - Ensure SessionProvider wraps the app

### Debug Mode

Enable debug logging in `.env.local`:

```bash
NEXTAUTH_DEBUG=true
DEBUG=next-auth:*
```

Check browser console and server logs for detailed error messages.

## 🔗 API Limitations

### Twitter API v2 Rate Limits

- **App-level**: 300 requests per 15-minute window
- **User-level**: 900 requests per 15-minute window

> **Tip**: Implement caching to reduce API calls and stay within limits.

## 🔐 Security Considerations

1. **Token Storage**: Access tokens are stored securely in NextAuth session
2. **Scope Minimization**: Request only necessary permissions
3. **HTTPS Required**: Use HTTPS in production
4. **Secret Rotation**: Rotate Client Secret periodically
5. **Monitor Access**: Review authorized apps in Twitter settings

## 🚀 Advanced Configuration

### Custom User Data

To fetch additional Twitter data, modify the `TwitterAuthProvider`:

```typescript
// lib/auth/providers/twitter.ts
async getUserData(): Promise<Record<string, unknown>> {
  // Add custom Twitter API calls here
  const response = await fetch(
    'https://api.twitter.com/2/users/me?user.fields=...',
    {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    }
  );
  // ... process response
}
```

### Additional Scopes

To request more permissions, update `lib/auth.ts`:

```typescript
const twitterScopes = [
  "tweet.read",
  "users.read",
  "follows.read",
  "offline.access",  // For refresh tokens
  "tweet.write",     // If you need write access
].join(" ");
```

## 📚 Resources

- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Twitter OAuth 2.0 Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [NextAuth Twitter Provider](https://next-auth.js.org/providers/twitter)
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)

---

**Need more help?** Check the [main documentation](../README.md) or [modular auth system guide](./MODULAR_AUTH_SYSTEM.md).
