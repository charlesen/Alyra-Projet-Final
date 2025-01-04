"use client";
import { encodeFunctionData } from 'viem';
import { useWriteContract } from 'wagmi';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
    MULTISIG_ADDRESS,
    MULTISIG_ABI,
} from '@/constants';

export default function AddSigner() {
    // Adresse du nouveau signataire
    const [newSigner, setNewSigner] = useState('');

    // Hook wagmi pour soumettre une transaction
    const {
        writeContract: writeSubmitTx,
        data: submitTxData,
        isPending: isSubmitting,
        error: submitTxError,
    } = useWriteContract();

    // Execution `addSigner(newSigner)`
    async function handleAddSigner() {
        try {
            if (!newSigner) {
                alert('Veuillez saisir une adresse de nouveau signataire');
                return;
            }

            // 1) Encodage de l'appel addSigner(newSigner)
            const dataHex = encodeFunctionData({
                abi: MULTISIG_ABI,
                functionName: 'addSigner',
                args: [newSigner],
            });

            // 2) On appelle `submitTransaction(target=_multisig, value=0, data=dataHex)`
            writeSubmitTx({
                address: MULTISIG_ADDRESS,
                abi: MULTISIG_ABI,
                functionName: 'submitTransaction',
                args: [
                    MULTISIG_ADDRESS, // target == address(this)
                    0,                // value
                    dataHex,          // data
                ],
            });

            // 3) Ensuite, la transaction sera visible dans la liste du multisig (transactions[...])
            //    Les signataires pourront confirmer, puis exécuter => newSigner sera ajouté
        } catch (err) {
            console.error('Erreur handleAddSigner:', err);
            alert('Impossible de soumettre la transaction addSigner');
        }
    }

    return (
        <div className="max-w-lg mx-auto p-6 rounded-md text-white-700">
            <h3 className="text-xl font-semibold mb-4">
                Ajout d'un nouveau signataire
            </h3>
            <div className="mb-4">

                <label className="block text-sm font-medium">
                    Nouveau signataire:
                </label>
                <input
                    type="text"
                    value={newSigner}
                    placeholder="Nouvelle adresse de signataire"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-neutral-900 p-2"
                    onChange={(e) => setNewSigner(e.target.value)}
                />
            </div>

            <Button
                variant="default"
                onClick={handleAddSigner}
                disabled={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? "Transaction..." : "Ajout d'un signataire"}
            </Button>

            {submitTxError && (
                <p className="text-red-500">
                    Erreur: {submitTxError.message}
                </p>
            )}
            {submitTxData && (
                <p className="text-green-500">
                    Transaction #{submitTxData.toString()} soumise au multisig !
                </p>
            )}
        </div>
    );
}
