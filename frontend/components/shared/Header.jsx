"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-2">
                    {/* Logo ou Nom du Projet */}
                    <div className="flex-shrink-0 mb-4 md:mb-0">
                        <Link
                            href="/"
                            className="text-indigo-600 text-2xl font-bold hover:underline"
                        >
                            Eusko Dapp
                        </Link>
                    </div>

                    {/* Menu Principal */}
                    <nav className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-8 mb-4 md:mb-0">
                        <Link
                            href="/"
                            className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                        >
                            Accueil
                        </Link>
                        <Link
                            href="/mint"
                            className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                        >
                            Mint
                        </Link>
                        <Link
                            href="/volunteers"
                            className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                        >
                            Bénévoles
                        </Link>
                        <Link
                            href="/merchants"
                            className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                        >
                            Commerçants
                        </Link>
                        <Link
                            href="/dao"
                            className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                        >
                            DAO
                        </Link>
                    </nav>

                    {/* Connect Wallet Button */}
                    <div className="flex-shrink-0">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </header>
    );
}
