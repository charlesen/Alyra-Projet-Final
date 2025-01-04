"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { parseAbiItem } from "viem";
import { publicClient } from "@/lib/client";
import { EUSKO_TOKEN_ADDRESS } from "@/constants";

import EventsList from "./EventsList";

export default function TransactionsList() {
    const { address: userAddress, isConnected } = useAccount();

    const [euskoEvents, setEuskoEvents] = useState([]);
    const [isFetchingEvents, setIsFetchingEvents] = useState(false);

    /**
     * Récupère tous les événements Transfer, Mint, Spent, etc.
     * puis ne garde que ceux qui concernent l’utilisateur connecté.
     */
    const fetchAllEvents = async () => {
        setIsFetchingEvents(true);
        try {
            // 1) Parse ABI items pour chaque event
            const transferEvent = parseAbiItem(
                "event Transfer(address indexed from, address indexed to, uint256 value)"
            );
            const mintedEvent = parseAbiItem(
                "event EuskoMintedWithEURC(address indexed minter, address indexed recipient, uint256 amount, uint256 eurcAmount)"
            );
            const spentEvent = parseAbiItem(
                "event EuskoSpent(address indexed spender, address indexed merchant, uint256 amount)"
            );

            const fromBlock = 0n;
            const toBlock = "latest";

            // 2) Récupération des logs on-chain
            const logsTransfer = await publicClient.getLogs({
                address: EUSKO_TOKEN_ADDRESS,
                event: transferEvent,
                fromBlock,
                toBlock,
            });

            const logsMinted = await publicClient.getLogs({
                address: EUSKO_TOKEN_ADDRESS,
                event: mintedEvent,
                fromBlock,
                toBlock,
            });

            const logsSpent = await publicClient.getLogs({
                address: EUSKO_TOKEN_ADDRESS,
                event: spentEvent,
                fromBlock,
                toBlock,
            });

            // 3) Normalisation en objets "Transfer" / "Mint" / "Spent"
            const parsedTransfers = logsTransfer.map((log) => ({
                type: "Transfer",
                blockNumber: Number(log.blockNumber),
                from: log.args?.from,
                to: log.args?.to,
                amount: log.args?.value, // BigInt
                txHash: log.transactionHash,
            }));

            const parsedMinted = logsMinted.map((log) => ({
                type: "Mint",
                blockNumber: Number(log.blockNumber),
                minter: log.args?.minter,
                recipient: log.args?.recipient,
                amount: log.args?.amount,
                eurcAmt: log.args?.eurcAmount,
                txHash: log.transactionHash,
            }));

            const parsedSpent = logsSpent.map((log) => ({
                type: "Spent",
                blockNumber: Number(log.blockNumber),
                spender: log.args?.spender,
                merchant: log.args?.merchant,
                amount: log.args?.amount,
                txHash: log.transactionHash,
            }));

            // 4) Combine
            let combined = [...parsedTransfers, ...parsedMinted, ...parsedSpent];

            // 5) **Filtrer pour ne garder que ceux qui concernent userAddress**
            const lowerUser = userAddress.toLowerCase();
            combined = combined.filter((ev) => {
                switch (ev.type) {
                    case "Transfer":
                        return (
                            ev.from?.toLowerCase() === lowerUser ||
                            ev.to?.toLowerCase() === lowerUser
                        );
                    case "Mint":
                        return (
                            ev.minter?.toLowerCase() === lowerUser ||
                            ev.recipient?.toLowerCase() === lowerUser
                        );
                    case "Spent":
                        return (
                            ev.spender?.toLowerCase() === lowerUser ||
                            ev.merchant?.toLowerCase() === lowerUser
                        );
                    default:
                        return false;
                }
            });

            // 6) Tri décroissant par blockNumber
            combined.sort((a, b) => b.blockNumber - a.blockNumber);

            setEuskoEvents(combined);
        } catch (error) {
            console.error("Erreur lors de la récupération des events:", error);
        } finally {
            setIsFetchingEvents(false);
        }
    };

    // Fetch au montage si connecté
    useEffect(() => {
        if (isConnected) {
            fetchAllEvents();
        }
    }, [isConnected]);

    // Handler pour rafraîchir manuellement
    const handleRefresh = async () => {
        await fetchAllEvents();
    };

    // Garde-fou si pas connecté
    if (!isConnected) {
        return (
            <></>
        );
    }

    return (
        <div className="p-4 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Mes transactions</h2>

            {/* Historique */}
            <section className="my-6">
                <EventsList
                    events={euskoEvents}
                    isLoading={isFetchingEvents}
                    onRefresh={handleRefresh}
                />
            </section>
        </div>
    );
}
