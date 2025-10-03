"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Music, Twitter, MessageSquare, Wallet, Shield, LogOut, CheckCircle2, XCircle } from "lucide-react";
import { useDisconnect } from "wagmi";
import { useAirkit } from "../../lib/hooks/useAirkit";
import { useSession, SessionType } from "../../lib/hooks/useSession";
import { useAirProvider } from "../../lib/hooks/useAirProvider";
import { useSpotify } from "../../lib/hooks/useSpotify";
import { useTwitter } from "../../lib/hooks/useTwitter";
import { useDiscord } from "../../lib/hooks/useDiscord";

interface SessionsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ConnectedAccount {
  type: SessionType;
  name: string;
  icon: React.ReactNode;
  isConnected: boolean;
  displayInfo?: string;
  onLogout: () => Promise<void>;
}

// Safe wrappers to prevent SessionProvider errors
function useSafeSpotify() {
  try {
    return useSpotify();
  } catch {
    return { isAuthenticated: false, user: null, signOut: () => Promise.resolve() };
  }
}

function useSafeTwitter() {
  try {
    return useTwitter();
  } catch {
    return { isAuthenticated: false, user: null, signOut: () => Promise.resolve() };
  }
}

function useSafeDiscord() {
  try {
    return useDiscord();
  } catch {
    return { isAuthenticated: false, user: null, signOut: () => Promise.resolve() };
  }
}

export function SessionsSidebar({ open, onOpenChange }: SessionsSidebarProps) {
  const sessionStore = useSession();
  const { airService } = useAirkit();
  const airProvider = useAirProvider();
  const spotify = useSafeSpotify();
  const twitter = useSafeTwitter();
  const discord = useSafeDiscord();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Build connected accounts list
  const connectedAccounts: ConnectedAccount[] = [
    {
      type: "discord",
      name: "Discord",
      icon: <MessageSquare className="h-5 w-5" />,
      isConnected: discord.isAuthenticated && !!sessionStore.sessions.discord.accessToken,
      displayInfo: discord.user ? 
        String((discord.user as Record<string, unknown>).username || 
              (discord.user as Record<string, unknown>).global_name || 
              "Discord User") : 
        undefined,
      onLogout: async () => {
        await discord.signOut();
        sessionStore.clearSession("discord");
      },
    },
    {
      type: "twitter",
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      isConnected: twitter.isAuthenticated && !!sessionStore.sessions.twitter.accessToken,
      displayInfo: twitter.user ? 
        String((twitter.user as Record<string, unknown>).username || 
              (twitter.user as Record<string, unknown>).name || 
              "Twitter User") : 
        undefined,
      onLogout: async () => {
        await twitter.signOut();
        sessionStore.clearSession("twitter");
      },
    },
    {
      type: "spotify",
      name: "Spotify",
      icon: <Music className="h-5 w-5" />,
      isConnected: spotify.isAuthenticated && !!sessionStore.sessions.spotify.accessToken,
      displayInfo: spotify.user ? 
        String((spotify.user as Record<string, unknown>).display_name || 
              (spotify.user as Record<string, unknown>).email || 
              "Spotify User") : 
        undefined,
      onLogout: async () => {
        await spotify.signOut();
        sessionStore.clearSession("spotify");
      },
    },
    {
      type: "wallet",
      name: "Wallet",
      icon: <Wallet className="h-5 w-5" />,
      isConnected: !!sessionStore.sessions.wallet.accessToken,
      displayInfo: sessionStore.sessions.wallet.userName,
      onLogout: async () => {
        await wagmiDisconnect();
        sessionStore.clearSession("wallet");
      },
    },
  ];

  const handleLogout = async (account: ConnectedAccount) => {
    await account.onLogout();
  };

  const logoutAirServices = async () => {
    try {
      if (airProvider.isLoggedIn) {
        await airService.logout();
      }
    } catch (error) {
      console.error("Failed to logout from AIR Services:", error);
    }
  };

  const connectedCount = connectedAccounts.filter(a => a.isConnected).length + (airProvider.isLoggedIn ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Account Dashboard</SheetTitle>
          <SheetDescription>
            Manage all your connected accounts and sessions
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary Card */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{connectedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <Separator />

          {/* OAuth Accounts Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              OAuth Accounts
            </h3>
            <div className="space-y-3">
              {connectedAccounts.map((account) => (
                <div
                  key={account.type}
                  className={`rounded-lg border p-4 transition-colors ${
                    account.isConnected
                      ? "bg-card border-border"
                      : "bg-muted/30 border-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`mt-0.5 ${account.isConnected ? "text-foreground" : "text-muted-foreground"}`}>
                        {account.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{account.name}</h4>
                          {account.isConnected ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {account.isConnected && account.displayInfo && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {account.displayInfo}
                          </p>
                        )}
                        {!account.isConnected && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Not connected
                          </p>
                        )}
                      </div>
                    </div>
                    {account.isConnected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLogout(account)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* AIR Kit Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              AIR Kit
            </h3>
            <div
              className={`rounded-lg border p-4 transition-colors ${
                airProvider.isLoggedIn
                  ? "bg-card border-border"
                  : "bg-muted/30 border-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 ${airProvider.isLoggedIn ? "text-foreground" : "text-muted-foreground"}`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">AIR Kit</h4>
                      {airProvider.isLoggedIn ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {airProvider.isLoggedIn && airProvider.userEmail && (
                      <>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {airProvider.userEmail}
                        </p>
                        {airProvider.address && (
                          <p className="text-xs text-muted-foreground truncate mt-1 font-mono">
                            {airProvider.address}
                          </p>
                        )}
                      </>
                    )}
                    {!airProvider.isLoggedIn && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Not connected
                      </p>
                    )}
                  </div>
                </div>
                {airProvider.isLoggedIn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logoutAirServices}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Future Features Placeholder */}
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              More dashboard features coming soon...
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

