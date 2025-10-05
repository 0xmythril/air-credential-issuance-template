import type { CredentialData } from "../types";

interface LinkedInPreviewProps {
  credentialData: CredentialData;
}

export const LinkedInPreview = ({ credentialData }: LinkedInPreviewProps) => {
  return (
    <div className="space-y-3">
      <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
        <div className="text-center">
          <h3 className="font-semibold text-sm">💼 Your LinkedIn Profile Credential Data</h3>
          <p className="text-xs text-muted-foreground mt-1">
            This is what will be stored as your verifiable credential
          </p>
        </div>

        <div className="space-y-3">
          {/* Profile Info */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Profile:</div>
            <div className="pl-2 space-y-1 text-xs">
              {credentialData.name && (
                <div>
                  <span className="font-medium">Full Name:</span> {String(credentialData.name)}
                </div>
              )}
              {credentialData.given_name && credentialData.family_name && (
                <div>
                  <span className="font-medium">Name (Structured):</span>{" "}
                  {String(credentialData.given_name)} {String(credentialData.family_name)}
                </div>
              )}
              {credentialData.email && (
                <div>
                  <span className="font-medium">Email:</span> {String(credentialData.email)}
                </div>
              )}
              {credentialData.profile_url && (
                <div>
                  <span className="font-medium">Profile URL:</span>{" "}
                  <a
                    href={String(credentialData.profile_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Professional Info (if available) */}
          {(credentialData.headline || credentialData.position || credentialData.company || credentialData.location) && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Professional Info:</div>
              <div className="pl-2 space-y-1 text-xs">
                {credentialData.headline && (
                  <div>
                    <span className="font-medium">Headline:</span> {String(credentialData.headline)}
                  </div>
                )}
                {credentialData.position && (
                  <div>
                    <span className="font-medium">Position:</span> {String(credentialData.position)}
                  </div>
                )}
                {credentialData.company && (
                  <div>
                    <span className="font-medium">Company:</span> {String(credentialData.company)}
                  </div>
                )}
                {credentialData.location && (
                  <div>
                    <span className="font-medium">Location:</span> {String(credentialData.location)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Network Stats */}
          {credentialData.connections !== undefined && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Network:</div>
              <div className="pl-2 space-y-1 text-xs">
                <div>
                  <span className="font-medium">Connections:</span> {Number(credentialData.connections).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {(credentialData.picture || credentialData.locale) && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Additional Info:</div>
              <div className="pl-2 space-y-1 text-xs">
                {credentialData.picture && (
                  <div>
                    <span className="font-medium">Profile Picture:</span>{" "}
                    <a
                      href={String(credentialData.picture)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Image
                    </a>
                  </div>
                )}
                {credentialData.locale && (
                  <div>
                    <span className="font-medium">Locale:</span> {String(credentialData.locale).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Note about extended data */}
          {!credentialData.headline && !credentialData.position && !credentialData.company && !credentialData.connections && (
            <div className="text-xs text-muted-foreground/70 bg-blue-50/50 dark:bg-blue-950/30 rounded p-2 border border-blue-200/30 dark:border-blue-800/30">
              <div className="font-medium mb-1">ℹ️ Note:</div>
              Extended professional data (headline, position, company, connections) requires LinkedIn Marketing Developer Platform access.
              Current data includes all publicly available OpenID Connect profile information.
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

