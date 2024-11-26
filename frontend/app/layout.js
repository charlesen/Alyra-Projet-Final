import RainbowKitAndWagmiProvider from "./wagmi";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/shared/Layout";

import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Eusko Dapp",
  description: "A simple DAO by Team Eusko",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RainbowKitAndWagmiProvider>
          <Layout>{children}</Layout>
        </RainbowKitAndWagmiProvider>
        <Toaster />
      </body>
    </html>
  );
}
