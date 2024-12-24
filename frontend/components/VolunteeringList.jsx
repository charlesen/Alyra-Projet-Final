// components/VolunteeringList.jsx
"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Importer le hook personnalisé
import { useVolunteeringActions } from "@/hooks/useVolunteeringActions";

export default function VolunteeringList() {
    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    // Vérifier si l'utilisateur est un organisme/approuvé
    const {
        data: isMerchantData,
        isLoading: isMerchantLoading,
        isError: isMerchantError,
    } = useReadContract({
        address: EUSKO_TOKEN_ADDRESS,
        abi: EUSKO_ABI,
        functionName: "isApprovedMerchant",
        args: [address || "0x0000000000000000000000000000000000000000"],
        enabled: !!address,
    });
    const isMerchant = isMerchantData ?? false;

    // Vérifier si l'utilisateur est "authorized"
    const {
        data: isAuthorizedData,
        isLoading: isAuthorizedLoading,
        isError: isAuthorizedError,
    } = useReadContract({
        address: EUSKO_TOKEN_ADDRESS,
        abi: EUSKO_ABI,
        functionName: "isAuthorizedAccount",
        args: [address || "0x0000000000000000000000000000000000000000"],
        enabled: !!address,
    });
    const isAuthorized = isAuthorizedData ?? false;

    // Hook écriture (pour les futures interactions on-chain)
    const { writeContract } = useWriteContract();

    const [acts, setActs] = useState([]);
    const [isLoadingLocal, setIsLoadingLocal] = useState(true);

    // Charger la liste JSON au montage
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch("/api/volunteering"); // Utiliser l'API
                const data = await res.json();
                setActs(data);
            } catch (error) {
                console.error("Erreur lors du chargement JSON:", error);
                toast({
                    title: "Erreur de chargement",
                    description: "Impossible de charger les opportunités de bénévolat.",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingLocal(false);
            }
        }
        loadData();
    }, [toast]);

    // Définir les onglets de filtrage
    const TABS = [
        { key: "new", label: "Nouveau" },
        { key: "inProgress", label: "Candidature en cours" },
        { key: "validated", label: "Candidature validée" },
        { key: "finished", label: "Contrat terminé" },
        { key: "readyOnChain", label: "Prêt pour la blockchain" },
        { key: "registeredOnChain", label: "Inscrit sur la blockchain" },
    ];
    const [activeTab, setActiveTab] = useState("new");

    // Filtrer les actes selon le statut et le rôle de l'utilisateur
    const filteredActs = acts.filter((act) => {
        if (activeTab === "new") {
            return act.status === "new"; // Afficher tous les actes "new"
        } else {
            if (!isConnected) {
                return false; // Les autres statuts ne sont visibles que pour les bénévoles connectés
            }
            return act.status === activeTab && act.volunteer.toLowerCase() === address.toLowerCase();
        }
    });

    // Utiliser le hook personnalisé pour obtenir les méthodes d'action
    const actions = useVolunteeringActions({
        address,
        isConnected,
        isMerchant,
        isAuthorized,
        writeContract,
        setActs,
        toast,
    });

    // Loading states
    if (isLoadingLocal || isMerchantLoading || isAuthorizedLoading) {
        return <p className="text-center mt-4">Chargement en cours...</p>;
    }

    // Gestion des erreurs
    if (isMerchantError || isAuthorizedError) {
        return (
            <p className="text-center mt-4 text-red-600">
                Erreur lors de la vérification de vos permissions.
            </p>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
            <h2 className="text-2xl font-bold mb-6 text-indigo-600">Opportunités de Bénévolat</h2>

            {/* Système d'onglets */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`px-4 py-2 rounded-md font-semibold ${activeTab === tab.key
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Affichage des actes filtrés */}
            {filteredActs.length === 0 ? (
                <p className="text-center">Aucun acte à afficher pour ce statut.</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredActs.map((act) => (
                        <div
                            key={act.id}
                            className="flex flex-col bg-white rounded-md shadow p-4 border border-gray-200"
                        >
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
                            <p className="text-gray-700 flex-grow mb-4">{act.description}</p>

                            {/* Boutons d'actions selon le statut */}
                            <div className="flex flex-col gap-2">
                                {/* Bouton "Postuler" => new => inProgress */}
                                {act.status === "new" && (
                                    <button
                                        onClick={() => actions.handleApply(act)}
                                        className={`inline-block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${isConnected
                                                ? "bg-indigo-600 hover:bg-indigo-500"
                                                : "bg-gray-400 cursor-not-allowed"
                                            }`}
                                        disabled={!isConnected}
                                    >
                                        {isConnected ? "Postuler" : "Connectez votre wallet"}
                                    </button>
                                )}

                                {/* Bouton "Valider" => inProgress => validated */}
                                {act.status === "inProgress" && (
                                    <button
                                        onClick={() => actions.handleValidate(act)}
                                        className="inline-block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-green-600 hover:bg-green-500"
                                    >
                                        Valider l'acte
                                    </button>
                                )}

                                {/* Bouton "Terminer" => validated => finished */}
                                {act.status === "validated" && (
                                    <button
                                        onClick={() => actions.handleFinish(act)}
                                        className="inline-block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-green-700 hover:bg-green-600"
                                    >
                                        Terminer l'acte
                                    </button>
                                )}

                                {/* Bouton "Préparer on-chain" => finished => readyOnChain */}
                                {act.status === "finished" && (
                                    <button
                                        onClick={() => actions.handlePrepareOnChain(act)}
                                        className="inline-block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-purple-600 hover:bg-purple-500"
                                    >
                                        Préparer l'acte on-chain
                                    </button>
                                )}

                                {/* Bouton "Enregistrer on-chain" => readyOnChain => registeredOnChain */}
                                {act.status === "readyOnChain" && (
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
                                        ✅ Cet acte est déjà inscrit sur la blockchain.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
