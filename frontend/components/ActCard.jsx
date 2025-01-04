
import React from "react";

export default function ActCard({ act, actions, isMerchant, isAuthorized }) {
    return (
        <div className="flex flex-col bg-white rounded-md shadow p-4 border border-gray-200">
            <h3 className="text-xl font-bold text-indigo-700 mb-2">{act.title}</h3>
            <p className="text-sm text-gray-500 mb-1 break-all">
                <strong>Organisme :</strong> {act.organism}
            </p>
            <p className="text-sm text-gray-500 mb-1">
                <strong>Lieu :</strong> {act.location}
            </p>
            <p className="text-sm text-gray-500 mb-2">
                <strong>Date :</strong> {act.date}
            </p>

            {/* Afficher la récompense uniquement si le statut est finished, readyOnChain ou registeredOnChain */}
            {["finished", "readyOnChain", "registeredOnChain"].includes(act.status) && (
                <p className="text-sm text-gray-500 mb-2">
                    <strong>Récompense :</strong> {act.reward} EUS
                </p>
            )}
            <p className="text-gray-700 flex-grow mb-4">{act.description}</p>

            {/* Boutons d'actions selon le statut et le rôle */}
            <div className="flex flex-col gap-2">
                {/* Bouton "Postuler" => new => inProgress (Visible uniquement pour les Bénévoles) */}
                {act.status === "new" && !isMerchant && (
                    <button
                        onClick={() => actions.handleApply(act)}
                        className={`inline-block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${isAuthorized
                            ? "bg-indigo-600 hover:bg-indigo-500"
                            : "bg-gray-400 cursor-not-allowed"
                            }`}
                        disabled={!isAuthorized}
                    >
                        {isAuthorized ? "Postuler" : "Connectez votre wallet"}
                    </button>
                )}

                {/* Bouton "Valider l'acte" => inProgress => validated (Visible uniquement pour les Organismes) */}
                {act.status === "inProgress" && isMerchant && (
                    <button
                        onClick={() => actions.handleValidate(act)}
                        className="inline-block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-green-600 hover:bg-green-500"
                    >
                        Valider l'acte
                    </button>
                )}

                {/* Bouton "Terminer l'acte" => validated => finished (Visible uniquement pour les Organismes) */}
                {act.status === "validated" && isMerchant && (
                    <button
                        onClick={() => actions.handleFinish(act)}
                        className="inline-block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-green-700 hover:bg-green-600"
                    >
                        Terminer l'acte
                    </button>
                )}

                {/* Bouton "Préparer on-chain" => finished => readyOnChain (Visible uniquement pour les Organismes) */}
                {act.status === "finished" && isMerchant && (
                    <button
                        onClick={() => actions.handlePrepareOnChain(act)}
                        className="inline-block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-purple-600 hover:bg-purple-500"
                    >
                        Préparer l'acte on-chain
                    </button>
                )}

                {/* Bouton "Enregistrer on-chain" => readyOnChain => registeredOnChain (Visible uniquement pour les Utilisateurs Autorisés) */}
                {act.status === "readyOnChain" && isAuthorized && (
                    <button
                        onClick={() => actions.handleRegisterOnChain(act)}
                        className="inline-block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-purple-800 hover:bg-purple-700"
                    >
                        Enregistrer on-chain
                    </button>
                )}

                {/* Indicateur final si "registeredOnChain" */}
                {act.status === "registeredOnChain" && (
                    <p className="mt-2 text-sm text-green-800 font-semibold">
                        Cet acte est inscrit sur la blockchain.
                    </p>
                )}
                {act.txHash && (
                    <div className="mt-2">
                        <span className="text-xs text-gray-500">Hash:</span>{" "}
                        <a
                            href={`https://sepolia.etherscan.io/tx/${act.txHash}#eventlog`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            Voir la transaction
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
