import RainbowKitAndWagmiProvider from "./wagmi";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/shared/Layout";

import "./globals.css";

export const metadata = {
  title: "Eusko Dapp",
  description: "A simple People money by Alyra Eusko",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body>
        <RainbowKitAndWagmiProvider>
          <Layout>{children}</Layout>
        </RainbowKitAndWagmiProvider>
        <Toaster />
      </body>
    </html>
  );
}
