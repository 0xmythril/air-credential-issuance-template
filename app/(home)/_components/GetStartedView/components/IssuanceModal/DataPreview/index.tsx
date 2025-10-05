import dynamic from "next/dynamic";

export const SpotifyPreview = dynamic(() => import("./SpotifyPreview").then(m => m.SpotifyPreview), { ssr: false });
export const TwitterPreview = dynamic(() => import("./TwitterPreview").then(m => m.TwitterPreview), { ssr: false });
export const DiscordPreview = dynamic(() => import("./DiscordPreview").then(m => m.DiscordPreview), { ssr: false });
export const LinkedInPreview = dynamic(() => import("./LinkedInPreview").then(m => m.LinkedInPreview), { ssr: false });
export const EthosPreview = dynamic(() => import("./EthosPreview").then(m => m.EthosPreview), { ssr: false });
export const WalletPreview = dynamic(() => import("./WalletPreview").then(m => m.WalletPreview), { ssr: false });
