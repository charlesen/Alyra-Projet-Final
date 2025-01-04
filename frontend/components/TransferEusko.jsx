"use client";

import { useState, useEffect } from "react";
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem"; // Pour gérer les décimales
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";
import { Button } from "@/components/ui/button"; // Suppose que vous avez un composant Button
import { useToast } from "@/hooks/use-toast";   // Suppose un hook de notification
import NotConnected from "@/components/shared/NotConnected"; // Pour l'état non-connecté, par ex.

export default function TransferEusko() {
    const { address: userAddress, isConnected } = useAccount();
    const { toast } = useToast();

    // Champs de formulaire
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");

    // Hooks wagmi pour l'écriture
    const {
        data: txHash,
        error,
        isPending,
        writeContract,
    } = useWriteContract();

    // Attente de confirmation 
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Sur succès, vider le formulaire
    useEffect(() => {
        if (isSuccess && txHash) {
            toast({
                title: "Transfert réussi",
                description: "Votre transfert d'EUS s'est terminé avec succès.",
                variant: "success",
            });
            setRecipient("");
            setAmount("");
        }
    }, [isSuccess, txHash, toast]);

    // Fonction pour envoyer la transaction
    const handleTransfer = async () => {
        if (!recipient.trim() || !amount.trim()) {
            toast({
                title: "Champs manquants",
                description: "Veuillez saisir une adresse destinataire et un montant.",
                variant: "destructive",
            });
            return;
        }
        try {
            // EUS = 6 décimales
            const parsedAmount = parseUnits(amount, 6);
            await writeContract({
                address: EUSKO_TOKEN_ADDRESS,
                abi: EUSKO_ABI,
                functionName: "transfer",
                args: [recipient, parsedAmount],
            });
            toast({
                title: "Transaction soumise",
                description: "En attente de confirmation...",
                variant: "info",
            });
        } catch (err) {
            console.error("Erreur lors du transfert :", err);
        }
    };

    // État "non connecté"
    if (!isConnected) {
        return <NotConnected />;
    }

    // Affichage principal
    return (
        <div className="max-w-lg w-full mx-auto mt-10 px-6 py-6 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Transfert d'Eusko
            </h3>

            {/* Champ destinataire */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    Adresse destinataire
                </label>
                <input
                    type="text"
                    className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 bg-neutral-700"
                    placeholder="0x1234...."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                />
            </div>

            {/* Champ montant */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    Montant (EUS)
                </label>
                <input
                    type="number"
                    step="0.000001"
                    className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100  bg-neutral-700"
                    placeholder="Ex: 10.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Rappel: 1 EUS = 1 EURC avec 6 décimales
                </p>
            </div>

            {/* Bouton de transfert */}
            <Button
                variant="default"
                className="w-full mt-4"
                onClick={handleTransfer}
                disabled={isPending || isConfirming}
            >
                {isPending || isConfirming ? "Transaction..." : "Transférer"}
            </Button>

            {/* Affichage du hash, des erreurs, etc. */}
            {(isPending || isConfirming || error || txHash) && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    {txHash && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 break-words">
                            Hash: {txHash}
                        </p>
                    )}
                    {isConfirming && (
                        <p className="text-sm text-amber-500 mt-1">
                            Confirmation en cours...
                        </p>
                    )}
                    {error && (
                        <p className="text-sm text-red-500 mt-1">
                            {error.shortMessage || error.message}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
