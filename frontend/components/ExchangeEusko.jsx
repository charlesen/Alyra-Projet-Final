"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * @notice Composant pour échanger EURC ↔ EUS.
 * @dev Suppose qu'on a besoin de faire 2 appels :
 *      - "mintWithEURC" (vers EUS)   => j'apporte X EURC (transfertFrom) et je reçois X EUS
 *      - "redeem" (vers EURC)       => je brûle X EUS, je reçois X EURC
 */
export default function ExchangeEusko() {
    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    // Champs de formulaire
    const [mintAmount, setMintAmount] = useState("");
    const [redeemAmount, setRedeemAmount] = useState("");

    //Ecriture de la transaction
    const {
        data: txHash,
        error,
        isPending,
        writeContract,
    } = useWriteContract();

    // Attente confirmation
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Sur succès
    useEffect(() => {
        if (isSuccess && txHash) {
            toast({
                title: "Transaction réussie",
                description: "Échange effectué avec succès.",
                variant: "success",
            });
            setMintAmount("");
            setRedeemAmount("");
        }
    }, [isSuccess, txHash, toast]);

    // Bouton "Achat EUS" => mintWithEURC
    const handleMint = async () => {
        if (!mintAmount.trim()) {
            toast({
                title: "Champs manquants",
                description: "Veuillez saisir un montant d'EURC à convertir en EUS",
                variant: "destructive",
            });
            return;
        }
        try {
            const parsed = parseUnits(mintAmount, 6); // 6 décimales
            writeContract({
                address: EUSKO_TOKEN_ADDRESS,
                abi: EUSKO_ABI,
                functionName: "mintWithEURC",
                /**
                 *   Dans le contrat, on attend `(address _recipient, uint256 _eurcAmount)`.
                 *   Le "recipient" ici est notre propre wallet => `address`.
                 *   On suppose que l'utilisateur a déjà fait "approve" de ses EURC 
                 *   pour le contrat EUSKO, ou c'est le contrat EUSKO qui appelle "transferFrom"...
                 */
                args: [address, parsed],
            });

            toast({
                title: "Transaction soumise",
                description: "Achat d'Eusko en cours...",
                variant: "info",
            });
        } catch (err) {
            console.error("Erreur handleMint:", err);
            toast({
                title: "Erreur",
                description: "Impossible d'effectuer l'achat d'EUS.",
                variant: "destructive",
            });
        }
    };

    // Bouton "Vendre EUS" => redeem
    const handleRedeem = async () => {
        if (!redeemAmount.trim()) {
            toast({
                title: "Champs manquants",
                description: "Veuillez saisir un montant d'EUS à revendre en EURC",
                variant: "destructive",
            });
            return;
        }
        try {
            const parsed = parseUnits(redeemAmount, 6);
            writeContract({
                address: EUSKO_TOKEN_ADDRESS,
                abi: EUSKO_ABI,
                functionName: "redeem",
                args: [parsed],
            });

            toast({
                title: "Transaction soumise",
                description: "Vente d'Eusko en cours...",
                variant: "info",
            });
        } catch (err) {
            console.error("Erreur handleRedeem:", err);
            toast({
                title: "Erreur",
                description: "Impossible d'effectuer la vente d'EUS.",
                variant: "destructive",
            });
        }
    };

    if (!isConnected) {
        return (
            <div className="p-4 text-center text-red-100 bg-red-500/20 rounded">
                Veuillez connecter votre wallet pour échanger.
            </div>
        );
    }

    return (
        <div className="max-w-2xl w-full mx-auto mt-10 px-6 py-6 bg-[#64748b] text-white rounded shadow">

            {/* Section Achat */}
            <div className="mb-6 p-4 bg-gray-900/30 rounded">
                <h4 className="text-xl font-semibold mb-3">Acheter des EUS (via EURC)</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                            Montant EURC à convertir
                        </label>
                        <input
                            type="number"
                            step="0.000001"
                            value={mintAmount}
                            onChange={(e) => setMintAmount(e.target.value)}
                            className="w-full p-2 rounded border border-gray-700 bg-gray-900/60"
                            placeholder="Ex: 10.0 EURC"
                        />
                    </div>
                    <div className="flex-1 flex items-end">
                        <Button
                            onClick={handleMint}
                            disabled={isPending || isConfirming}
                            className="mt-4 sm:mt-0 w-full sm:w-auto bg-indigo-700 hover:bg-indigo-600"
                        >
                            {isPending || isConfirming ? "Transaction..." : "Acheter EUS"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Section Vente */}
            <div className="mb-2 p-4 bg-gray-900/30 rounded">
                <h4 className="text-xl font-semibold mb-3">Vendre vos EUS (pour EURC)</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                            Montant EUS à vendre
                        </label>
                        <input
                            type="number"
                            step="0.000001"
                            value={redeemAmount}
                            onChange={(e) => setRedeemAmount(e.target.value)}
                            className="w-full p-2 rounded border border-gray-700 bg-gray-900/60"
                            placeholder="Ex: 5.0 EUS"
                        />
                    </div>
                    <div className="flex-1 flex items-end">
                        <Button
                            onClick={handleRedeem}
                            disabled={isPending || isConfirming}
                            className="mt-4 sm:mt-0 w-full sm:w-auto bg-green-700 hover:bg-green-600"
                        >
                            {isPending || isConfirming ? "Transaction..." : "Vendre EUS"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Affichage statut / erreurs / hash */}
            {(isPending || isConfirming || error || txHash) && (
                <div className="mt-4 p-3 bg-gray-900/60 rounded text-sm">
                    {txHash && <p className="text-blue-200">Hash: {txHash}</p>}
                    {isConfirming && (
                        <p className="text-yellow-300 mt-1">Confirmation en cours...</p>
                    )}
                    {error && (
                        <p className="text-red-400 mt-1">
                            {error.shortMessage || error.message}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
