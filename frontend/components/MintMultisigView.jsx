"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function MintMultisigView({
    // Connection & signer
    isConnected,
    userAddress,
    isSigner,
    isSignerLoading,
    isSignerError,
    threshold,
    thresholdLoading,

    // Soumission
    eurcAmount,
    setEurcAmount,
    handleSubmitTx,
    submitTxIndexData,
    submitTxError,
    isSubmitting,

    // Transactions
    transactions,
    isLoadingTxList,
    activeTab,
    setActiveTab,

    // Confirmation/Exécution
    handleConfirmTx,
    handleExecuteTx,
    confirmError,
    execError,
    isConfirming,
    isExecPending,
}) {
    if (!isConnected) {
        return (
            <div className="bg-red-100 text-red-800 p-4 text-center">
                Veuillez connecter votre wallet
            </div>
        );
    }
    if (isSignerLoading) {
        return <div>Chargement en cours...</div>;
    }
    if (isSignerError) {
        return (
            <div className="bg-red-50 text-red-600 p-4">
                Erreur: impossible de déterminer votre rôle de signataire.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-white">Mint via MultiSig</h1>

            {/* 1) Section soumission */}
            <section className="bg-gray-800 p-4 rounded-md mb-8 text-white">
                <h2 className="text-xl font-semibold mb-2">Soumettre transaction</h2>
                {!isSigner && (
                    <p className="text-sm text-red-300">
                        Vous n&apos;êtes pas signataire : vous ne pouvez pas soumettre.
                    </p>
                )}
                <div className="mb-4">
                    <label className="block mb-1 font-medium">
                        Montant EURC à Minter
                    </label>
                    <input
                        type="number"
                        step="0.000001"
                        className="w-full p-2 rounded bg-gray-700 focus:outline-none"
                        value={eurcAmount}
                        onChange={(e) => setEurcAmount(e.target.value)}
                    />
                </div>
                <Button
                    onClick={handleSubmitTx}
                    disabled={!isSigner || isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white w-full"
                >
                    {isSubmitting ? "Transaction..." : "Valider"}
                </Button>
                {submitTxError && (
                    <p className="text-red-300 mt-2">
                        Erreur : {submitTxError.shortMessage || submitTxError.message}
                    </p>
                )}
                {submitTxIndexData && (
                    <p className="text-green-400 mt-2">
                        Transaction #{submitTxIndexData.toString()} soumise !
                    </p>
                )}
            </section>

            {/* 2) Section liste + filtrage */}
            <section className="text-white">
                <h2 className="text-xl font-semibold mb-2">Liste des Transactions</h2>
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded ${activeTab === "all"
                            ? "bg-indigo-600"
                            : "bg-gray-700 hover:bg-gray-600"
                            }`}
                    >
                        Toutes
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-4 py-2 rounded ${activeTab === "pending"
                            ? "bg-indigo-600"
                            : "bg-gray-700 hover:bg-gray-600"
                            }`}
                    >
                        En Attente
                    </button>
                    <button
                        onClick={() => setActiveTab("executed")}
                        className={`px-4 py-2 rounded ${activeTab === "executed"
                            ? "bg-indigo-600"
                            : "bg-gray-700 hover:bg-gray-600"
                            }`}
                    >
                        Exécutées
                    </button>
                </div>

                {isLoadingTxList ? (
                    <p>Chargement des transactions...</p>
                ) : transactions.length === 0 ? (
                    <p>Aucune transaction trouvée.</p>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((tx, idx) => (
                            <div key={idx} className="bg-gray-800 p-4 rounded">
                                <p className="text-sm text-gray-200">
                                    <strong>TxIndex:</strong> {tx.txIndex}
                                </p>
                                {/* <p className="text-sm text-gray-200">
                                    <strong>Target:</strong> {tx.target}
                                </p>
                                <p className="text-sm text-gray-200">
                                    <strong>Value:</strong> {tx.value.toString()} wei
                                </p> */}
                                <p className="text-sm text-gray-200">
                                    <strong>Confirmations:</strong>{" "}
                                    {tx.numConfirmations.toString()}
                                </p>
                                <p className="text-sm text-gray-200">
                                    <strong>Exécutée:</strong> {tx.executed ? "Oui" : "Non"}
                                </p>

                                {!tx.executed && (
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            className="bg-green-600 hover:bg-green-500 text-white"
                                            onClick={() => handleConfirmTx(tx.txIndex)}
                                            disabled={!isSigner || isConfirming}
                                        >
                                            {isConfirming ? "Confirmation en cours..." : "Confirmer"}
                                        </Button>
                                        {!tx.executed && tx.numConfirmations >= threshold && (
                                            <Button
                                                onClick={() => handleExecuteTx(tx.txIndex)}
                                                disabled={!isSigner || isExecPending}
                                                className="bg-purple-600 hover:bg-purple-500 text-white"
                                            >
                                                Exécuter
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Erreurs ou Status confirmations */}
                {confirmError && (
                    <p className="text-red-300 mt-2">
                        Erreur lors de la confirmation: {confirmError.shortMessage || confirmError.message}
                    </p>
                )}
                {execError && (
                    <p className="text-red-300 mt-2">
                        Erreur lors de l'executation: {execError.shortMessage || execError.message}
                    </p>
                )}
            </section>
        </div>
    );
}
