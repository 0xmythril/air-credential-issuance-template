import type { CredentialData } from "../types";

interface DiscordPreviewProps {
  credentialData: CredentialData;
}

export const DiscordPreview = ({ credentialData }: DiscordPreviewProps) => {
  return (
    <div className="space-y-3">
      <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
        <div className="text-center">
          <h3 className="font-semibold text-sm">💬 Your Discord Profile Credential Data</h3>
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
                  <span className="font-medium">Username:</span> {String(credentialData.username)}
                  {credentialData.discriminator && credentialData.discriminator !== '0' && (
                    <span className="text-muted-foreground">#{String(credentialData.discriminator)}</span>
                  )}
                </div>
              )}
              {credentialData.global_name && (
                <div>
                  <span className="font-medium">Display Name:</span> {String(credentialData.global_name)}
                </div>
              )}
              {credentialData.verified !== undefined && (
                <div>
                  <span className="font-medium">Verified:</span> {credentialData.verified ? '✓ Yes' : 'No'}
                </div>
              )}
              {credentialData.premium_type !== undefined && credentialData.premium_type !== 0 && (
                <div>
                  <span className="font-medium">Discord Nitro:</span> {
                    credentialData.premium_type === 1 ? 'Classic' :
                    credentialData.premium_type === 2 ? 'Nitro' :
                    credentialData.premium_type === 3 ? 'Nitro Basic' :
                    'Active'
                  }
                </div>
              )}
            </div>
          </div>

          {/* Server Activity */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Server Activity:</div>
            <div className="pl-2 space-y-1 text-xs">
              {credentialData.guilds_count !== undefined && (
                <div>
                  <span className="font-medium">Servers Joined:</span> {Number(credentialData.guilds_count).toLocaleString()}
                </div>
              )}
              {credentialData.owned_guilds_count !== undefined && credentialData.owned_guilds_count !== 0 && (
                <div>
                  <span className="font-medium">Servers Owned:</span> {Number(credentialData.owned_guilds_count).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Account Security */}
          {credentialData.email && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Account Security:</div>
              <div className="pl-2 space-y-1 text-xs">
                <div>
                  <span className="font-medium">Email Verified:</span> {credentialData.verified ? '✓ Yes' : 'Pending'}
                </div>
              </div>
            </div>
          )}

          {/* Connected Accounts */}
          {credentialData.connections_count !== undefined && credentialData.connections_count !== 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Connected Accounts:</div>
              <div className="pl-2 space-y-1 text-xs">
                <div>
                  <span className="font-medium">Linked Platforms:</span> {Number(credentialData.connections_count).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {credentialData.locale && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Additional Info:</div>
              <div className="pl-2 space-y-1 text-xs">
                <div>
                  <span className="font-medium">Language:</span> {String(credentialData.locale).toUpperCase()}
                </div>
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
