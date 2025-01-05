"use client";

import { useAccount } from "wagmi";
import QRCode from "react-qr-code";
import NotConnected from "./shared/NotConnected";

export default function Settings() {
    const { address, isConnected } = useAccount();

    if (!isConnected) {
        return <NotConnected />;
    }

    return (
        <div className="max-w-xl mx-auto mt-8 p-6 rounded-md bg-[#2f343c] shadow-md text-white">

            {/* Section "adresse" */}
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Mon adresse</h2>
                <p className="break-words text-indigo-200 text-sm bg-[#3f444c] p-2 rounded-md">
                    {address}
                </p>
            </section>

            {/* Section "QR Code" */}
            <section className="bg-[#3f444c] p-4 rounded-md flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-3">QR Code</h2>

                {/* QR code représentant l'adresse du wallet */}
                <QRCode value={address || "undefined"} size={128} bgColor="#3f444c" fgColor="#ffffff" />

                <p className="mt-3 text-sm text-gray-300">
                    Montrez ce QR code chez les commerçants partenaires pour qu&apos;ils
                    puissent scanner votre adresse et recevoir vos paiements en Eusko.
                </p>
            </section>
        </div>
    );
}
