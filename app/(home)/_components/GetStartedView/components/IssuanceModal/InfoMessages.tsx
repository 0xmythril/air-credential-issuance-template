interface InfoMessagesProps {
  isSpotifyLogin: boolean;
  isTwitterLogin: boolean;
  isDiscordLogin: boolean;
  spotifyAuthenticated: boolean;
  twitterAuthenticated: boolean;
  discordAuthenticated: boolean;
  hasAccessToken: boolean;
}

export const InfoMessages = ({
  isSpotifyLogin,
  isTwitterLogin,
  isDiscordLogin,
  spotifyAuthenticated,
  twitterAuthenticated,
  discordAuthenticated,
  hasAccessToken,
}: InfoMessagesProps) => {
  if (isSpotifyLogin) {
    if (!spotifyAuthenticated) {
      return (
        <div className="text-sm text-muted-foreground max-w-md space-y-2">
          <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-3">
            🎵 Connect your Spotify account to create a credential based on your music taste
          </div>
        </div>
      );
    }
    if (!hasAccessToken) {
      return (
        <div className="text-sm text-muted-foreground max-w-md space-y-2">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
            ℹ️ You&apos;re signed in to Spotify. Click &ldquo;Get My Music Data&rdquo; to fetch your
            listening history and create a credential.
          </div>
        </div>
      );
    }
  }

  if (isTwitterLogin) {
    if (!twitterAuthenticated) {
      return (
        <div className="text-sm text-muted-foreground max-w-md space-y-2">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
            𝕏 Connect your Twitter account to create a credential based on your profile
          </div>
        </div>
      );
    }
    if (!hasAccessToken) {
      return (
        <div className="text-sm text-muted-foreground max-w-md space-y-2">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
            ℹ️ You&apos;re signed in to Twitter. Click &ldquo;Get My Profile Data&rdquo; to fetch your
            profile information and create a credential.
          </div>
        </div>
      );
    }
  }

  if (isDiscordLogin) {
    if (!discordAuthenticated) {
      return (
        <div className="text-sm text-muted-foreground max-w-md space-y-2">
          <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-3">
            💬 Connect your Discord account to create a credential based on your profile
          </div>
        </div>
      );
    }
    if (!hasAccessToken) {
      return (
        <div className="text-sm text-muted-foreground max-w-md space-y-2">
          <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-3">
            ℹ️ You&apos;re signed in to Discord. Click &ldquo;Get My Discord Profile&rdquo; to fetch your
            server activity and create a credential.
          </div>
        </div>
      );
    }
  }

  return null;
};
