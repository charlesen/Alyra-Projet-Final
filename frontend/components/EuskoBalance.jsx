"use client";
import { useBalance } from "wagmi";
import { EUSKO_TOKEN_ADDRESS } from "@/constants";

function EuskoBalance({ address }) {
    // Balance utilisateur
    const {
        data: userData,
        isLoading: userLoading,
        isError: userError,
    } = useBalance({
        address,
        token: EUSKO_TOKEN_ADDRESS,
        enabled: !!address,
    });

    if (!address) {
        return null; // Pas d'adresse => pas d'affichage
    }

    if (userLoading) {
        return <div className="text-center mt-4">Chargement du solde...</div>;
    }

    if (userError || !userData) {
        return (
            <div className="text-center mt-4 text-red-500">
                Erreur lors du chargement du solde
            </div>
        );
    }

    // Mise en forme du solde avec 6 décimales
    const decimals = userData.decimals ?? 6;
    const rawValue = BigInt(userData.value.toString());
    const userBalanceFormatted = (Number(rawValue) / 10 ** decimals).toFixed(2);

    return (
        <div className="lg:text-center text-white">
            <h3 className="font-semibold text-xl mb-2">
                Votre solde en Eusko
            </h3>
            <p className="text-2xl font-bold">
                {userBalanceFormatted} EUS
            </p>
        </div>
    );
}

export default EuskoBalance;
