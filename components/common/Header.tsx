"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { useDisconnect } from "wagmi";
import { useAirkit } from "../../lib/hooks/useAirkit";
import { useSession, SessionType } from "../../lib/hooks/useSession";
import { useAirProvider } from "../../lib/hooks/useAirProvider";
import { useSpotify } from "../../lib/hooks/useSpotify";
import { useTwitter } from "../../lib/hooks/useTwitter";
import { useDiscord } from "../../lib/hooks/useDiscord";
import { Music, Twitter, MessageSquare, Wallet, Shield, LogOut, Home } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

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

export const Header = () => {
  const pathname = usePathname();
  const sessionStore = useSession();
  const { airService } = useAirkit();
  const airProvider = useAirProvider();
  const spotify = useSafeSpotify();
  const twitter = useSafeTwitter();
  const discord = useSafeDiscord();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState<SessionType | null>(null);
  
  const isHomePage = pathname === "/";

  // Build connected accounts list (Discord, Twitter, Spotify, Wallet, AIR)
  const connectedAccounts: ConnectedAccount[] = [
    {
      type: "discord",
      name: discord.user ? 
        ((discord.user as Record<string, unknown>).global_name as string || 
         (discord.user as Record<string, unknown>).username as string || 
         "Discord") : 
        "Discord",
      icon: <MessageSquare className="h-4 w-4" />,
      isConnected: discord.isAuthenticated && !!sessionStore.sessions.discord.accessToken,
      displayInfo: discord.user ? String((discord.user as Record<string, unknown>).username) : undefined,
      onLogout: async () => {
        discord.signOut();
        sessionStore.clearSession("discord");
      },
    },
    {
      type: "twitter",
      name: twitter.user ? 
        ((twitter.user as Record<string, unknown>).name as string || 
         (twitter.user as Record<string, unknown>).username as string || 
         "Twitter") : 
        "Twitter",
      icon: <Twitter className="h-4 w-4" />,
      isConnected: twitter.isAuthenticated && !!sessionStore.sessions.twitter.accessToken,
      displayInfo: twitter.user ? String((twitter.user as Record<string, unknown>).username) : undefined,
      onLogout: async () => {
        twitter.signOut();
        sessionStore.clearSession("twitter");
      },
    },
    {
      type: "spotify",
      name: spotify.user ? 
        ((spotify.user as Record<string, unknown>).name as string || 
         (spotify.user as Record<string, unknown>).email as string || 
         "Spotify") : 
        "Spotify",
      icon: <Music className="h-4 w-4" />,
      isConnected: spotify.isAuthenticated && !!sessionStore.sessions.spotify.accessToken,
      displayInfo: spotify.user ? String((spotify.user as Record<string, unknown>).email || (spotify.user as Record<string, unknown>).name) : undefined,
      onLogout: async () => {
        spotify.signOut();
        sessionStore.clearSession("spotify");
      },
    },
    {
      type: "wallet",
      name: "Wallet",
      icon: <Wallet className="h-4 w-4" />,
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
    setLogoutDialogOpen(null);
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto">
        <Link
          href="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={28}
            height={28}
            className="h-7 w-auto ml-4 dark:invert dark:grayscale"
          />
        </Link>
        
        <div className="flex items-center gap-2 mr-4">
          {/* Home button - show when not on home page */}
          {!isHomePage && (
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          )}
          
          {/* Connected Accounts (Discord, Twitter, Spotify, Wallet) */}
          {connectedAccounts.map((account) => 
            account.isConnected ? (
              <Dialog
                key={account.type}
                open={logoutDialogOpen === account.type}
                onOpenChange={(open) => setLogoutDialogOpen(open ? account.type : null)}
              >
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {account.icon}
                    <span className="hidden sm:inline">{account.name}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[300px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {account.icon}
                      {account.name} Account
                    </DialogTitle>
                    <DialogDescription>
                      Manage your {account.name} connection
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {account.displayInfo && (
                      <div>
                        <p className="text-sm text-muted-foreground">Connected as</p>
                        <p className="font-mono text-sm break-all">{account.displayInfo}</p>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => handleLogout(account)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout from {account.name}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : null
          )}

          {/* AIR Kit - Always on the far right */}
          {airProvider.isLoggedIn && airProvider.userEmail && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-primary/50"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">AIR</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[300px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    AIR Kit Account
                  </DialogTitle>
                  <DialogDescription>
                    Manage your AIR Kit connection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">{airProvider.userEmail}</p>
                  </div>
                  {airProvider.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-mono text-xs break-all">{airProvider.address}</p>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    onClick={logoutAirServices}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout from AIR Kit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
};