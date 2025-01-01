"use client";
import { useBalance } from "wagmi";
import { EURC_TOKEN_ADDRESS } from "@/constants"; // l'adresse du contrat EURC
import { EUSKO_TOKEN_ADDRESS } from "@/constants"; // l'adresse du contrat EUSKO => => c’est le “fond de garanti”

export default function GuaranteeFundBalance() {
    // L’adresse du fond de garanti = l’adresse du contrat EUSKO
    const guaranteeAddress = EUSKO_TOKEN_ADDRESS;

    // Récupérer la balance en EURC sur guaranteeAddress
    const { data, isLoading, isError } = useBalance({
        address: guaranteeAddress,
        token: EURC_TOKEN_ADDRESS,  // l'adresse du contrat ERC20 EURC
        enabled: !!guaranteeAddress,
    });

    if (isLoading) {
        return <p>Chargement du solde du fond de garanti en EURC...</p>;
    }
    if (isError || !data) {
        return <p>Erreur lors du chargement du solde du fond de garanti.</p>;
    }

    // data.value = BigInt => conversion
    const decimals = data.decimals ?? 6;
    const balanceNumber = Number(data.value) / 10 ** decimals;
    const displayBalance = balanceNumber.toFixed(2);

    return (
        <div className="p-4 rounded-md text-white text-center">
            <h3 className="text-lg font-semibold">Fond de Garanti</h3>
            <p className="text-2xl font-bold">
                {displayBalance} EURC
            </p>
        </div>
    );
}
