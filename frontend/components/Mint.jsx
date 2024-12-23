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

    // Lire si l'utilisateur est autorisé
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

    // Lire l'adresse de la réserve
    const {
        data: reserveData,
        isLoading: isReserveLoading,
        isError: isReserveError,
    } = useReadContract({
        address: EUSKO_TOKEN_ADDRESS,
        abi: EUSKO_ABI,
        functionName: "reserve",
        enabled: true,
    });
    // Convertir en string (ou laisser sous forme d'adresse)
    const reserveAddr = reserveData || "";

    // État pour le champ "recipient"
    const [recipient, setRecipient] = useState("");
    const [eurcAmount, setEurcAmount] = useState("");
    const [lastHash, setLastHash] = useState("");

    // Hook écriture
    const { data: txHash, error, isPending, writeContract } = useWriteContract();

    // Hook réception confirmation
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: lastHash || txHash,
    });

    // Mettre par défaut l'adresse de la réserve si la lecture est prête
    // et si l'utilisateur n'a jamais saisi manuellement.
    useEffect(() => {
        if (!recipient && reserveAddr && !isReserveLoading && !isReserveError) {
            setRecipient(reserveAddr);
        }
    }, [recipient, reserveAddr, isReserveLoading, isReserveError]);

    // Mémoriser la txHash
    useEffect(() => {
        if (txHash) {
            setLastHash(txHash);
        }
    }, [txHash]);

    // Sur succès
    useEffect(() => {
        if (isSuccess && lastHash) {
            toast({
                title: "Mint success",
                description: "The Eusko tokens have been minted successfully!",
                className: "bg-lime-200",
            });
            setRecipient(reserveAddr); // On remet la valeur par défaut
            setEurcAmount("");
            setLastHash("");
        }
    }, [isSuccess, lastHash, toast, reserveAddr]);

    // Bouton "Minter"
    const handleMint = async () => {
        // Si le champ est vide ou que l’utilisateur l’a effacé,
        // on réutilise l’adresse de la réserve
        const finalRecipient = recipient || reserveAddr;
        const finalEurcAmount = eurcAmount.trim();

        if (!finalRecipient || !finalEurcAmount) {
            toast({
                title: "Missing fields",
                description: "Please enter both recipient and amount",
                className: "bg-red-200",
            });
            return;
        }

        const parsedAmount = BigInt(Math.floor(parseFloat(finalEurcAmount) * 1e6));
        try {
            await writeContract({
                address: EUSKO_TOKEN_ADDRESS,
                abi: EUSKO_ABI,
                functionName: "mintWithEURC",
                args: [finalRecipient, parsedAmount],
            });
        } catch (err) {
            console.error("Mint error:", err);
        }
    };

    // ---- Rendu ----
    if (!isConnected) {
        return (
            <div className="p-4 bg-red-50 rounded-md text-red-800 mt-4">
                Vous devez connecter votre wallet pour procéder au mint.
            </div>
        );
    }
    if (isAuthLoading || isReserveLoading) {
        return (
            <div className="p-4 bg-gray-50 rounded-md text-gray-800 mt-4">
                Vérification en cours...
            </div>
        );
    }
    if (isAuthError || !isAuthorized) {
        return (
            <div className="p-4 bg-red-50 rounded-md text-red-800 mt-4">
                Vous n'êtes pas autorisé à utiliser cette fonctionnalité.
            </div>
        );
    }
    if (isReserveError) {
        return (
            <div className="p-4 bg-red-50 rounded-md text-red-800 mt-4">
                Impossible de récupérer l'adresse de la réserve.
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto bg-gray-50 p-6 rounded-md shadow">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">Mint des Eusko</h3>

            {/* Champ destinataire */}
            <div className="mb-4">
                <label
                    htmlFor="recipient"
                    className="block text-sm font-medium text-gray-700"
                >
                    Adresse du destinataire
                </label>
                <input
                    type="text"
                    id="recipient"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                    placeholder="0x1234..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                />
            </div>

            {/* Champ montant */}
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

            {/* Bouton "Minter" */}
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
                                Transaction hash: {txHash}
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
