"use client";
import { Toaster } from "@/components/ui/sonner";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";
import { Header } from "@/components/common/Header";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";

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
        {children}
      </Providers>
      <Toaster position="top-center" />
    </>
  );
}
