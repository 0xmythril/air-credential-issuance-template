import type { CredentialData } from "../types";

interface SpotifyPreviewProps {
  credentialData: CredentialData;
}

export const SpotifyPreview = ({ credentialData }: SpotifyPreviewProps) => {
  const hasFollowedArtists =
    credentialData.followed_artists &&
    typeof credentialData.followed_artists === "object" &&
    Object.keys(credentialData.followed_artists).length > 0;
  const hasTopArtists =
    credentialData.top_artists &&
    typeof credentialData.top_artists === "object" &&
    Object.keys(credentialData.top_artists).length > 0;
  const hasTopTracks =
    credentialData.top_tracks &&
    typeof credentialData.top_tracks === "object" &&
    Object.keys(credentialData.top_tracks).length > 0;
  const hasTopGenres =
    credentialData.top_genres &&
    typeof credentialData.top_genres === "object" &&
    Object.keys(credentialData.top_genres).length > 0;
  const hasDiversityScore = credentialData.music_diversity_score !== undefined;
  const hasTotalFollowed = credentialData.total_followed_artists !== undefined;

  return (
    <div className="space-y-3">
      <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
        <div className="text-center">
          <h3 className="font-semibold text-sm">🎵 Your Music Credential Data</h3>
          <p className="text-xs text-muted-foreground mt-1">
            This is what will be stored as your verifiable credential
          </p>
        </div>

        <div className="space-y-3">
          {/* Basic Info */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Profile:</div>
            <div className="pl-2 space-y-1 text-xs">
              {credentialData.spotify_id && (
                <div>
                  <span className="font-medium">Spotify ID:</span> {String(credentialData.spotify_id)}
                </div>
              )}
            </div>
          </div>

          {/* Music Data */}
          {(hasFollowedArtists || hasTopArtists || hasTopTracks) && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Music Data:</div>
              <div className="pl-2 space-y-1 text-xs">
                {hasFollowedArtists && (
                  <div>
                    <span className="font-medium">Top 3 Followed Artists:</span>
                    <div className="text-muted-foreground mt-1">
                      {Object.values(credentialData.followed_artists as Record<string, string>).join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      Keys: {Object.keys(credentialData.followed_artists as Record<string, string>).join(", ")}
                    </div>
                  </div>
                )}
                {hasTopArtists && (
                  <div>
                    <span className="font-medium">Top 3 Artists:</span>
                    <div className="text-muted-foreground mt-1">
                      {Object.values(credentialData.top_artists as Record<string, string>).join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      Keys: {Object.keys(credentialData.top_artists as Record<string, string>).join(", ")}
                    </div>
                  </div>
                )}
                {hasTopTracks && (
                  <div>
                    <span className="font-medium">Top 3 Tracks:</span>
                    <div className="text-muted-foreground mt-1">
                      {Object.values(credentialData.top_tracks as Record<string, string>).join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      Keys: {Object.keys(credentialData.top_tracks as Record<string, string>).join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Music Analytics */}
          {(hasTopGenres || hasDiversityScore || hasTotalFollowed) && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Music Analytics:</div>
              <div className="pl-2 space-y-1 text-xs">
                {hasTopGenres && (
                  <div>
                    <span className="font-medium">Top 3 Genres:</span>
                    <div className="text-muted-foreground">
                      {Object.values(credentialData.top_genres as Record<string, string>).join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      Keys: {Object.keys(credentialData.top_genres as Record<string, string>).join(", ")}
                    </div>
                  </div>
                )}
                {hasDiversityScore && (
                  <div>
                    <span className="font-medium">Music Diversity Score:</span>{" "}
                    {String(credentialData.music_diversity_score)}
                  </div>
                )}
                {hasTotalFollowed && (
                  <div>
                    <span className="font-medium">Total Followed Artists:</span>{" "}
                    {String(credentialData.total_followed_artists)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-center bg-green-50 dark:bg-green-950 rounded p-2">
        ✅ This data will be stored as a tamper-proof, verifiable credential on the blockchain
      </div>
    </div>
  );
};
