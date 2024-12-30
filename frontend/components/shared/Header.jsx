"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
    return (
        <header className="dark:bg-gray-900 shadow-sm sm:text-center">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-baseline justify-end md:flex-row md:items-center md:justify-end py-4 md:py-2">
                    {/* Connect Wallet Button */}
                    <div className="flex-shrink-0">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </header>
    );
}
