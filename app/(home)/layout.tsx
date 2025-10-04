"use client";
import { Toaster } from "@/components/ui/sonner";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";
import { Header } from "@/components/common/Header";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";
import Link from "next/link";

const Providers = dynamic(
  () => import("../../lib/providers").then((m) => m.Providers),
  {
    ssr: false,
  }
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Providers>
        <AnnouncementBanner />
        <Header />
        {/* Prefetch popular routes for faster nav */}
        <div className="sr-only" aria-hidden>
          <Link prefetch href="/explore">Explore</Link>
          <Link prefetch href="/spotify">Spotify</Link>
          <Link prefetch href="/twitter">Twitter</Link>
          <Link prefetch href="/discord">Discord</Link>
          <Link prefetch href="/ethos">Ethos</Link>
        </div>
        {children}
      </Providers>
      <Toaster position="top-center" />
    </>
  );
}
