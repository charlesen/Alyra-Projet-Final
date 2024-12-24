"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm sm:text-center">
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
                    <nav className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                        <ul className="flex flex-wrap -mb-px">
                            <li className="me-2">
                                <Link
                                    href="/"
                                    className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                >
                                    Accueil
                                </Link>
                            </li>
                            <li className="me-2">
                                <Link
                                    href="/volunteering"
                                    className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                >
                                    Benevolats
                                </Link>
                            </li>
                            <li className="me-2">
                                <Link
                                    href="/merchants"
                                    className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                >
                                    Commerçants
                                </Link>
                            </li>
                            <li className="me-2">
                                <Link
                                    href="/mint"
                                    className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                >
                                    Mint
                                </Link>
                            </li>
                            <li className="me-2">
                                <Link
                                    href="/dao"
                                    className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                >
                                    DAO
                                </Link>
                            </li>
                        </ul>
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
