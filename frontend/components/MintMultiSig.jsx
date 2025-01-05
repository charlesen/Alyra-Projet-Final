"use client";

import { useState, useEffect, useCallback } from "react";
import { sepolia } from 'wagmi/chains';

import {
    useAccount,
    useWriteContract,
    useReadContract,
    useWaitForTransactionReceipt,
    usePublicClient
} from "wagmi";

import { readContract } from '@wagmi/core'

import { parseUnits, encodeFunctionData } from "viem";

import {
    MULTISIG_ADDRESS,
    MULTISIG_ABI,
    EUSKO_TOKEN_ADDRESS,
    EUSKO_ABI,
} from "@/constants";
import MintMultisigView from "./MintMultisigView";
import { useToast } from "@/hooks/use-toast";

export default function MintMultiSig() {
    const { address: userAddress, isConnected } = useAccount();
    const { toast } = useToast();

    /*----- 1) Vérifier si l’utilisateur est signataire -----*/
    const {
        data: isSignerData,
        isLoading: isSignerLoading,
        isError: isSignerError,
    } = useReadContract({
        address: MULTISIG_ADDRESS,
        abi: MULTISIG_ABI,
        functionName: "isSigner",
        args: [userAddress || "0x0000000000000000000000000000000000000000"],
        enabled: !!userAddress,
    });
    const isSigner = !!isSignerData;

    /*----- 2) Lire la liste des transactions du multisig -----*/
    const [transactions, setTransactions] = useState([]);
    const [isLoadingTxList, setIsLoadingTxList] = useState(false);
    const publicClient = usePublicClient();


    const fetchAllTransactions = useCallback(async () => {
        console.log("Inside fetchAllTransactions");
        if (!MULTISIG_ADDRESS) {
            console.log("No MULTISIG_ADDRESS => return");
            return;
        }
        setIsLoadingTxList(true);
        const results = [];
        let index = 0;
        while (true) {
            console.log("While loop index=", index, sepolia.id);
            try {
                const txData = await publicClient.readContract({
                    address: MULTISIG_ADDRESS,
                    abi: MULTISIG_ABI,
                    functionName: "transactions",
                    args: [index],
                });
                // results.push({ txIndex: index, ...txData });
                results.push({
                    txIndex: index,
                    target: txData[0],
                    value: txData[1],
                    data: txData[2],
                    executed: txData[3],
                    numConfirmations: txData[4],
                });
                index++;
            } catch (err) {
                console.log("Error reading tx at index=", index, err);
                break;
            }
        }
        console.log("Done looping => results:", results);
        setTransactions(results);
        setIsLoadingTxList(false);
    }, [publicClient]);


    useEffect(() => {
        if (isConnected) {
            console.log('fetchAllTransactions....');
            fetchAllTransactions();
        }
    }, [isConnected, fetchAllTransactions]);

    /*----- 3) Soumission transaction “mintWithEURC” -----*/
    const [eurcAmount, setEurcAmount] = useState("");

    const {
        data: submitTxIndexData,
        error: submitTxError,
        isPending: isSubmitting,
        writeContract: writeSubmitTx,
    } = useWriteContract();

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

    const {
        data: thresholdData,
        isLoading: thresholdLoading,
        isError: thresholdError,
    } = useReadContract({
        address: MULTISIG_ADDRESS,
        abi: MULTISIG_ABI,
        functionName: 'threshold',
    });

    const threshold = thresholdData ? Number(thresholdData) : 0;

    const handleSubmitTx = async () => {
        if (!isSigner) {
            toast({
                title: "Non signataire",
                description: "Seuls les signataires peuvent soumettre.",
                variant: "destructive",
            });
            return;
        }
        if (!eurcAmount.trim()) {
            toast({
                title: "Champs manquants",
                description: "Veuillez saisir un montant d'EURC.",
                variant: "destructive",
            });
            return;
        }

        try {

            const parsedAmount = parseUnits(eurcAmount, 6);
            const dataHex = encodeFunctionData({
                abi: EUSKO_ABI,
                functionName: "mintWithEURC",
                args: [reserveAddr, parsedAmount],
            });

            writeSubmitTx({
                address: MULTISIG_ADDRESS,
                abi: MULTISIG_ABI,
                functionName: "submitTransaction",
                args: [EUSKO_TOKEN_ADDRESS, 0, dataHex],
            });

            toast({
                title: "Transaction soumise",
                description: "Transaction enregistrée dans le multisig. À confirmer.",
                variant: "info",
            });
        } catch (err) {
            console.error("Erreur submitTx:", err);
            toast({
                title: "Erreur",
                description: "Impossible de soumettre la transaction.",
                variant: "destructive",
            });
        }
    };

    /*----- 4) Confirmation de transaction => “confirmTransaction(txIndex)” -----*/
    const {
        data: confirmData,
        error: confirmError,
        isPending: isConfirming,
        writeContract: writeConfirmTx,
    } = useWriteContract();

    const handleConfirmTx = async (txIndex) => {
        if (!isSigner) {
            toast({
                title: "Non signataire",
                description: "Seuls les signataires peuvent confirmer.",
                variant: "destructive",
            });
            return;
        }
        try {
            writeConfirmTx({
                address: MULTISIG_ADDRESS,
                abi: MULTISIG_ABI,
                functionName: "confirmTransaction",
                args: [txIndex],
            });
            toast({
                title: "Confirmation en cours",
                description: `Confirmation de la TX #${txIndex}...`,
                variant: "info",
            });
        } catch (err) {
            console.error("Erreur confirmTx:", err);
            toast({
                title: "Erreur",
                description: "Impossible de confirmer la TX.",
                variant: "destructive",
            });
        }
    };

    /*----- 5) Exécution => “executeTransaction(txIndex)” -----*/
    const {
        data: execData,
        error: execError,
        isPending: isExecPending,
        writeContract: writeExecuteTx,
    } = useWriteContract();

    const handleExecuteTx = async (txIndex) => {
        if (!isSigner) {
            toast({
                title: "Non signataire",
                description: "Seuls les signataires peuvent exécuter.",
                variant: "destructive",
            });
            return;
        }
        try {
            writeExecuteTx({
                address: MULTISIG_ADDRESS,
                abi: MULTISIG_ABI,
                functionName: "executeTransaction",
                args: [txIndex],
            });
            toast({
                title: "Exécution en cours",
                description: `Exécution de la TX #${txIndex}...`,
                variant: "info",
            });
        } catch (err) {
            console.error("Erreur executeTx:", err);
            toast({
                title: "Erreur",
                description: "Impossible d'exécuter la TX.",
                variant: "destructive",
            });
        }
    };

    // On surveille si la TX confirm/exec aboutit => si besoin, on refetch la liste
    // ou on s’appuie sur “useWaitForTransactionReceipt” si on veut plus de granularité.

    /*----- 6) Filtrage (onglets): all / executed / pending -----*/
    const [activeTab, setActiveTab] = useState("all");

    const filteredTxs = transactions.filter((tx) => {
        if (activeTab === "all") return true;
        if (activeTab === "executed") return tx.executed;
        if (activeTab === "pending") return !tx.executed;
        return true;
    });

    // 7) Finalement, on retourne la View en passant toutes les props
    return (
        <MintMultisigView
            isConnected={isConnected}
            userAddress={userAddress}
            isSigner={isSigner}
            isSignerLoading={isSignerLoading}
            isSignerError={isSignerError}
            threshold={threshold}
            thresholdLoading={thresholdLoading}
            eurcAmount={eurcAmount}
            setEurcAmount={setEurcAmount}
            handleSubmitTx={handleSubmitTx}
            submitTxIndexData={submitTxIndexData}
            submitTxError={submitTxError}
            isSubmitting={isSubmitting}
            transactions={filteredTxs}
            isLoadingTxList={isLoadingTxList}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleConfirmTx={handleConfirmTx}
            handleExecuteTx={handleExecuteTx}
            confirmError={confirmError}
            execError={execError}
            isConfirming={isConfirming}
            isExecPending={isExecPending}
        />
    );
}
