"use client";
import { useReadContract, useBalance } from "wagmi";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";

export default function ReserveBalance() {
    // 1) On récupère l'adresse de la `reserve` du contrat EUSKO
    const { data: reserveAddr, isLoading: loadingReserveAddr } = useReadContract({
        address: EUSKO_TOKEN_ADDRESS,
        abi: EUSKO_ABI,
        functionName: "reserve",
    });

    // On peut à présent lire la balance de la réserve en EUSKO
    const { data: reserveBalanceData } = useBalance({
        address: reserveAddr,
        token: EUSKO_TOKEN_ADDRESS,  // le token EUSKO
        enabled: !!reserveAddr,
    });

    if (loadingReserveAddr) {
        return <p>Chargement de l'adresse de la réserve...</p>;
    }
    if (!reserveAddr) {
        return <p>Erreur: impossible de récupérer la réserve.</p>;
    }

    let displayBalance = null;
    if (reserveBalanceData) {
        // conversion BigInt => number
        const decimals = reserveBalanceData.decimals ?? 6;
        const rawValue = Number(reserveBalanceData.value) / (10 ** decimals);
        displayBalance = rawValue.toFixed(2);
    }

    return (
        <div className="p-4 rounded-md shadow text-white text-center">
            <h3 className="text-lg font-semibold">Solde de la réserve</h3>
            <p className="text-2xl font-bold">{displayBalance} EUS</p>
        </div>
    );
}
