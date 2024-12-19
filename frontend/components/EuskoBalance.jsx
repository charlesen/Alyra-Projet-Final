"use client";
import { useBalance } from "wagmi";
import { EUSKO_TOKEN_ADDRESS } from "@/constants";

function EuskoBalance({ address }) {
    const { data, isLoading, isError } = useBalance({
        address,
        token: EUSKO_TOKEN_ADDRESS,
        enabled: !!address // On active seulement si l'adresse existe
    });

    if (!address) {
        return null; // Pas d'adresse, pas d'affichage
    }

    if (isLoading) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500">Chargement de la balance...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-100 p-4 rounded-md text-center">
                <p className="text-sm text-red-700">Erreur lors du chargement de la balance</p>
            </div>
        );
    }

    const decimals = data.decimals ?? 6; // Au cas où, on met 6 par défaut
    const rawValue = BigInt(data.value.toString()); // s'assure qu'on manipule bien un BigInt
    const actualBalance = Number(rawValue) / 10 ** decimals;

    // On formate pour avoir 2 chiffres apres la virgule
    const balanceFormatted = actualBalance.toFixed(2);

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-md shadow-md mb-8 w-full text-center sm:text-left">
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Solde Eusko
            </h2>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {balanceFormatted} EUS
            </p>
        </div>
    );
}

export default EuskoBalance;
