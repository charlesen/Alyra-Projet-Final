"use client";
import Link from "next/link";
import { useState } from "react";

// Icones Heroicons
// Vous pouvez en importer d'autres selon vos besoins.
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    ArrowUpOnSquareIcon,
    CurrencyDollarIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function Aside() {
    const [mode, setMode] = useState("user");

    const toggleMode = () => {
        setMode((prev) => (prev === "user" ? "operator" : "user"));
    };

    return (
        <aside className="w-60 text-white flex flex-col border-r border-gray-200 bg-gray-800">
            {/* Logo ou titre */}
            <div className="mb-6 pt-5 pb-2 text-center">
                <h1 className="text-2xl font-bold">Eusko3</h1>
            </div>

            {/* MENU principal */}
            <nav className="flex-1">
                <ul className="space-y-2">
                    <li>
                        <Link href="/" className="flex items-center p-3 hover:bg-gray-700">
                            <HomeIcon className="w-5 h-5 mr-2 shrink-0" />
                            Accueil
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/volunteering"
                            className="flex items-center p-3 hover:bg-gray-700"
                        >
                            <ClipboardDocumentListIcon className="w-5 h-5 mr-2 shrink-0" />
                            Missions
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/transfer"
                            className="flex items-center p-3 hover:bg-gray-700"
                        >
                            <ArrowUpOnSquareIcon className="w-5 h-5 mr-2 shrink-0" />
                            Transfert
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/exchange"
                            className="flex items-center p-3 hover:bg-gray-700"
                        >
                            <CurrencyDollarIcon className="w-5 h-5 mr-2 shrink-0" />
                            Achat/Vente
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* TOGGLE "USER" / "OPÉRATEUR" */}
            <div className="mt-4 px-3 pb-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">
                        {mode === "user" ? "Mode Utilisateur" : "Mode Opérateur"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={mode === "operator"}
                            onChange={toggleMode}
                        />
                        <div
                            className="w-10 h-5 bg-gray-200 peer-focus:outline-none
                dark:bg-gray-700 peer-checked:bg-indigo-600
                relative rounded-full
                after:content-['']
                after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 
                after:transition-all peer-checked:after:translate-x-full 
                peer-checked:after:border-white
              "
                        ></div>
                    </label>
                </div>

                {/* Exemple : un bouton Paramètres si besoin */}
                <Link
                    className="flex items-center text-sm p-3 hover:bg-gray-700"
                    href="/settings"
                >
                    <Cog6ToothIcon className="w-5 h-5 mr-2 shrink-0" />
                    Paramètres
                </Link>
            </div>
        </aside>
    );
}
