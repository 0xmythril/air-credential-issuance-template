"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Music, Twitter, MessageSquare, Wallet } from "lucide-react";
import Link from "next/link";

interface CredentialOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  features: string[];
}

const credentialOptions: CredentialOption[] = [
  {
    id: "discord",
    title: "Discord Community Credential",
    description: "Showcase your Discord community involvement and status with AIR Kit",
    icon: <MessageSquare className="h-8 w-8" />,
    route: "/discord",
    color: "text-indigo-600 dark:text-indigo-400",
    features: [
      "Server Memberships",
      "Owned Servers",
      "Connected Accounts",
      "Nitro Status"
    ]
  },
  {
    id: "twitter",
    title: "Twitter Profile Credential",
    description: "Verify your Twitter presence and social influence with AIR Kit",
    icon: <Twitter className="h-8 w-8" />,
    route: "/twitter",
    color: "text-blue-500 dark:text-blue-400",
    features: [
      "Follower Count",
      "Account Verification",
      "Tweet Activity",
      "Profile Information"
    ]
  },
  {
    id: "spotify",
    title: "Music Taste Credential",
    description: "Prove your music taste and preferences with verifiable Spotify data via AIR Kit",
    icon: <Music className="h-8 w-8" />,
    route: "/spotify",
    color: "text-green-600 dark:text-green-400",
    features: [
      "Top Artists & Tracks",
      "Music Genres",
      "Followed Artists",
      "Music Diversity Score"
    ]
  },
  {
    id: "wallet",
    title: "Web3 Wallet Credential",
    description: "Verify your blockchain identity and on-chain reputation with AIR Kit",
    icon: <Wallet className="h-8 w-8" />,
    route: "/ethos",
    color: "text-purple-600 dark:text-purple-400",
    features: [
      "Wallet Address",
      "On-Chain History",
      "Token Holdings",
      "DeFi Activity"
    ]
  }
];

export function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-7xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Choose Your Credential Type
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Issue verifiable credentials about your social profiles, music taste, and wallet.
            Takes ~30 seconds. You can revoke at any time.
          </p>
        </div>

        {/* Credential Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentialOptions.map((option) => (
            <Card 
              key={option.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(option.route)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-muted group-hover:scale-110 transition-transform ${option.color}`}>
                    {option.icon}
                  </div>
                </div>
                <CardTitle className="mt-4">{option.title}</CardTitle>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    What&apos;s included:
                  </div>
                  <ul className="space-y-2">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="mr-2 text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-4" 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(option.route);
                    }}
                  >
                    Get This Credential
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-4 pt-8">
          <div className="bg-muted/50 rounded-lg p-6 max-w-3xl mx-auto">
            <h3 className="font-semibold mb-2">🔒 Secure & Verifiable</h3>
            <p className="text-sm text-muted-foreground">
              All credentials are stored as tamper-proof, verifiable credentials on the Moca Network 
              blockchain. Your data is cryptographically secured and you maintain full control.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <a href="https://docs.airkit.io" target="_blank" rel="noopener noreferrer" className="hover:underline">
              📚 Documentation
            </a>
            <a href="https://moca.network" target="_blank" rel="noopener noreferrer" className="hover:underline">
              🌐 Moca Network
            </a>
            <a href="https://github.com/MocaNetwork/air-credential-issuance-template" target="_blank" rel="noopener noreferrer" className="hover:underline">
              💻 GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
