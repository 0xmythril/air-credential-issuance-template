import type { CredentialData } from "../types";

interface EthosPreviewProps {
  credentialData: CredentialData;
  isTestAddress?: boolean;
}

export const EthosPreview = ({ credentialData, isTestAddress = false }: EthosPreviewProps) => {
  // Helper to format wallet address (shorten for display)
  const formatAddress = (addr: string) => {
    if (addr.length > 12) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr;
  };

  // Helper to get level color/badge
  const getLevelBadge = (level: string | number | undefined) => {
    if (!level) return null;
    const levelStr = String(level).toLowerCase();
    
    let colorClass = "bg-gray-500/10 text-gray-500 border-gray-500/20";
    let emoji = "⚪";
    
    if (levelStr.includes("untrusted")) {
      colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
      emoji = "🔴";
    } else if (levelStr.includes("questionable")) {
      colorClass = "bg-orange-500/10 text-orange-500 border-orange-500/20";
      emoji = "🟠";
    } else if (levelStr.includes("neutral")) {
      colorClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      emoji = "🟡";
    } else if (levelStr.includes("reputable")) {
      colorClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
      emoji = "🔵";
    } else if (levelStr.includes("exemplary")) {
      colorClass = "bg-green-500/10 text-green-500 border-green-500/20";
      emoji = "🟢";
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
        {emoji} {String(level).charAt(0).toUpperCase() + String(level).slice(1)}
      </span>
    );
  };

  // Helper to get score badge color (0-2800 range)
  const getScoreBadge = (score: number) => {
    let colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
    let emoji = "🔴";
    
    if (score >= 2000) {
      // Exemplary: 2000-2800
      colorClass = "bg-green-500/10 text-green-500 border-green-500/20";
      emoji = "🟢";
    } else if (score >= 1600) {
      // Reputable: 1600-1999
      colorClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
      emoji = "🔵";
    } else if (score >= 1200) {
      // Neutral: 1200-1599
      colorClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      emoji = "🟡";
    } else if (score >= 800) {
      // Questionable: 800-1199
      colorClass = "bg-orange-500/10 text-orange-500 border-orange-500/20";
      emoji = "🟠";
    }
    // Untrusted: 0-799 (default red)
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
        {emoji} {score}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
        <div className="text-center">
          <h3 className="font-semibold text-sm">🔐 Your Ethos Wallet Credential Data</h3>
          <p className="text-xs text-muted-foreground mt-1">
            This is what will be stored as your verifiable credential
          </p>
        </div>

        <div className="space-y-3">
          {/* Wallet Address */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Wallet Address:</div>
            <div className="pl-2 space-y-1 text-xs">
              {credentialData.address && (
                <div className={isTestAddress ? "text-orange-600 dark:text-orange-400 font-semibold" : ""}>
                  <span className="font-medium">Address:</span>{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    {String(credentialData.address)}
                  </code>
                  {isTestAddress && (
                    <span className="ml-2 text-xs">
                      ⚠️ Test Address
                    </span>
                  )}
                </div>
              )}
              {credentialData.address && (
                <div className="text-muted-foreground/70">
                  Short: {formatAddress(String(credentialData.address))}
                </div>
              )}
            </div>
          </div>

          {/* Reputation Metrics */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Reputation Metrics:</div>
            <div className="pl-2 space-y-2 text-xs">
              {credentialData.score !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Ethos Score:</span>
                  {getScoreBadge(Number(credentialData.score))}
                </div>
              )}
              {credentialData.level && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Reputation Level:</span>
                  {getLevelBadge(credentialData.level)}
                </div>
              )}
            </div>
          </div>

          {/* Score Explanation */}
          {credentialData.score !== undefined && (
            <div className="text-xs text-muted-foreground/70 bg-blue-50/50 dark:bg-blue-950/30 rounded p-2 border border-blue-200/30 dark:border-blue-800/30">
              <div className="font-medium mb-1">ℹ️ Ethos Credibility Score Levels:</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span>🔴 <strong>Untrusted:</strong></span>
                  <span>0-799</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🟠 <strong>Questionable:</strong></span>
                  <span>800-1199</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🟡 <strong>Neutral:</strong></span>
                  <span>1200-1599</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔵 <strong>Reputable:</strong></span>
                  <span>1600-1999</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🟢 <strong>Exemplary:</strong></span>
                  <span>2000-2800</span>
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

