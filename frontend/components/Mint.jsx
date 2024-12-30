"use client";
import { useState, useEffect } from "react";
import {
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    useAccount,
} from "wagmi";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function Mint() {
    const { address: userAddress, isConnected } = useAccount();
    const { toast } = useToast();

    // 1) Vérifier si l'utilisateur est autorisé
    const {
        data: isAuthData,
        isLoading: isAuthLoading,
        isError: isAuthError,
    } = useReadContract({
        address: EUSKO_TOKEN_ADDRESS,
        abi: EUSKO_ABI,
        functionName: "isAuthorizedAccount",
        args: [userAddress || "0x0000000000000000000000000000000000000000"],
        enabled: !!userAddress,
    });
    const isAuthorized = isAuthData || false;

    // 2) Récupérer l'adresse de la réserve
    const {
        data: reserveData,
        isLoading: isReserveLoading,
        isError: isReserveError,
    } = useReadContract({
        address: EUSKO_TOKEN_ADDRESS,
        abi: EUSKO_ABI,
        functionName: "reserve",
    });
    const reserveAddr = reserveData || "";

    // 3) Champs pour saisir le montant
    const [eurcAmount, setEurcAmount] = useState("");
    const [lastHash, setLastHash] = useState("");

    // 4) Hook écriture
    const { data: txHash, error, isPending, writeContract } = useWriteContract();

    // 5) Confirmation de la transaction
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: lastHash || txHash,
    });

    // 6) Mise à jour du hash si reçu
    useEffect(() => {
        if (txHash) {
            setLastHash(txHash);
        }
    }, [txHash]);

    // 7) Sur succès
    useEffect(() => {
        if (isSuccess && lastHash) {
            toast({
                title: "Mint effectué",
                description: "Les jetons Eusko ont été créés avec succès !",
                className: "bg-lime-200",
            });
            setEurcAmount("");
            setLastHash("");
        }
    }, [isSuccess, lastHash, toast]);

    // 8) Bouton "Minter"
    const handleMint = async () => {
        if (!eurcAmount.trim()) {
            toast({
                title: "Champs manquants",
                description: "Veuillez saisir le montant à minter",
                className: "bg-red-200",
            });
            return;
        }
        const parsedAmount = BigInt(Math.floor(parseFloat(eurcAmount) * 1e6));

        try {
            await writeContract({
                address: EUSKO_TOKEN_ADDRESS,
                abi: EUSKO_ABI,
                functionName: "mintWithEURC",
                // On force `reserveAddr` en destinataire
                args: [reserveAddr, parsedAmount],
            });
        } catch (err) {
            console.error("Mint error:", err);
        }
    };

    // 9) Rendu ou "guard clauses"
    if (!isConnected) {
        return (
            <div className="p-4 bg-red-50 rounded-md text-red-800 mt-4 text-center">
                Vous devez connecter votre wallet pour procéder au mint.
            </div>
        );
    }
    if (isAuthLoading || isReserveLoading) {
        return (
            <div className="p-4 bg-gray-50 rounded-md text-gray-800 mt-4 text-center">
                Vérification en cours...
            </div>
        );
    }
    if (isAuthError || !isAuthorized) {
        return (
            <div className="p-4 bg-red-50 rounded-md text-red-800 mt-4 text-center">
                Vous n'êtes pas autorisé à utiliser cette fonctionnalité.
            </div>
        );
    }
    if (isReserveError || !reserveAddr) {
        return (
            <div className="p-4 bg-red-50 rounded-md text-red-800 mt-4 text-center">
                Impossible de récupérer l'adresse de la réserve.
            </div>
        );
    }

    // 10) Affichage principal
    return (
        <div className="max-w-lg mx-auto p-6 rounded-md shadow">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">
                Mint des Eusko
            </h3>

            {/* Champ "Réserve" affiché en lecture seule */}
            <div className="mb-4">
                <label
                    htmlFor="recipient"
                    className="block text-sm font-medium text-gray-700"
                >
                    Adresse destinataire (réserve)
                </label>
                <input
                    type="text"
                    id="recipient"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 text-gray-500"
                    value={reserveAddr}
                    readOnly
                />
            </div>

            {/* Montant en EURC/EUS (6 décimales) */}
            <div className="mb-4">
                <label
                    htmlFor="eurcAmount"
                    className="block text-sm font-medium text-gray-700"
                >
                    Montant EURC
                </label>
                <input
                    type="number"
                    step="0.000001"
                    id="eurcAmount"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                    placeholder="10.0"
                    value={eurcAmount}
                    onChange={(e) => setEurcAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Rappel : 1 EUS = 1 EURC, 6 décimales
                </p>
            </div>

            <Button
                variant="default"
                onClick={handleMint}
                disabled={isPending || isConfirming}
                className="w-full"
            >
                {isPending || isConfirming ? "Transaction..." : "Minter"}
            </Button>

            {/* Status transaction */}
            {(isPending || isConfirming || error || txHash) && (
                <div className="mt-4">
                    {txHash && (
                        <Alert className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded relative">
                            <AlertDescription>
                                Hash de la transaction: {txHash}
                            </AlertDescription>
                        </Alert>
                    )}
                    {isConfirming && (
                        <Alert className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded relative mt-2">
                            <AlertDescription>
                                En attente de confirmation...
                            </AlertDescription>
                        </Alert>
                    )}
                    {error && (
                        <Alert className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded relative mt-2">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>
                                {error.shortMessage || error.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
        </div>
    );
}
