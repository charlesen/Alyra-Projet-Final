import RainbowKitAndWagmiProvider from "./wagmi";
import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/shared/Layout";

import "./globals.css";

export const metadata = {
  title: "Eusko3 Dapp",
  description: "A simple People money by Alyra Eusko3",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className="bg-gradient-to-r from-slate-800 to-slate-700">
        <RainbowKitAndWagmiProvider>
          <Layout>{children}</Layout>
        </RainbowKitAndWagmiProvider>
        <Toaster />
      </body>
    </html>
  );
}
