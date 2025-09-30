import type { CredentialData } from "../types";

interface TwitterPreviewProps {
  credentialData: CredentialData;
}

export const TwitterPreview = ({ credentialData }: TwitterPreviewProps) => {
  return (
    <div className="space-y-3">
      <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
        <div className="text-center">
          <h3 className="font-semibold text-sm">𝕏 Your Twitter Profile Credential Data</h3>
          <p className="text-xs text-muted-foreground mt-1">
            This is what will be stored as your verifiable credential
          </p>
        </div>

        <div className="space-y-3">
          {/* Profile Info */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Profile:</div>
            <div className="pl-2 space-y-1 text-xs">
              {credentialData.username && (
                <div>
                  <span className="font-medium">Username:</span> @{String(credentialData.username)}
                </div>
              )}
              {credentialData.name && (
                <div>
                  <span className="font-medium">Name:</span> {String(credentialData.name)}
                </div>
              )}
              {credentialData.verified !== undefined && (
                <div>
                  <span className="font-medium">Verified:</span> {credentialData.verified ? "✓ Yes" : "No"}
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Metrics:</div>
            <div className="pl-2 space-y-1 text-xs">
              {credentialData.followers_count !== undefined && (
                <div>
                  <span className="font-medium">Followers:</span>{" "}
                  {Number(credentialData.followers_count).toLocaleString()}
                </div>
              )}
              {credentialData.following_count !== undefined && (
                <div>
                  <span className="font-medium">Following:</span>{" "}
                  {Number(credentialData.following_count).toLocaleString()}
                </div>
              )}
              {credentialData.tweet_count !== undefined && (
                <div>
                  <span className="font-medium">Tweets:</span>{" "}
                  {Number(credentialData.tweet_count).toLocaleString()}
                </div>
              )}
              {credentialData.listed_count !== undefined && (
                <div>
                  <span className="font-medium">Listed:</span>{" "}
                  {Number(credentialData.listed_count).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {(credentialData.description || credentialData.location || credentialData.account_created_at) && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Additional Info:</div>
              <div className="pl-2 space-y-1 text-xs">
                {credentialData.description && (
                  <div>
                    <span className="font-medium">Bio:</span>{" "}
                    {String(credentialData.description).substring(0, 100)}
                    {String(credentialData.description).length > 100 ? "..." : ""}
                  </div>
                )}
                {credentialData.location && (
                  <div>
                    <span className="font-medium">Location:</span> {String(credentialData.location)}
                  </div>
                )}
                {credentialData.account_created_at && (
                  <div>
                    <span className="font-medium">Joined:</span>{" "}
                    {new Date(String(credentialData.account_created_at)).toLocaleDateString()}
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
