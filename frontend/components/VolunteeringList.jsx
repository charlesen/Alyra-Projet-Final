"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";
import { useToast } from "@/hooks/use-toast";

// Importer les sous-composants
import ActCard from "@/components/ActCard";

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

    const [acts, setActs] = useState([]);
    const [isLoadingLocal, setIsLoadingLocal] = useState(true);

    // Charger la liste via l'API au montage
    useEffect(() => {
        async function loadData() {
            try {
                // TODO : Utiliser une véritable API
                const res = await fetch("/api/volunteering");
                if (!res.ok) {
                    throw new Error("Erreur lors de la récupération des actes.");
                }
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
                return false; // Les autres statuts ne sont visibles que pour les utilisateurs connectés
            }

            if (isAuthorized) {
                // Pour les personnes autorisées on affiche tous les status selon l'onglet actif
                return act.status === activeTab;
            }
            else if (isMerchant) {
                // Pour les Organismes : afficher les actes qu'ils ont publiés avec le statut correspondant
                return act.status === activeTab && act.organism.toLowerCase() === address.toLowerCase();
            }
            else {
                // Pour les Bénévoles : afficher les actes qui leur sont assignés avec le statut correspondant
                return act.status === activeTab && act.volunteer.toLowerCase() === address.toLowerCase();
            }
        }
    });

    // Hook personnalisé pour obtenir les méthodes d'action
    const actions = useVolunteeringActions({
        address,
        isConnected,
        isMerchant,
        isAuthorized,
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
                        <ActCard
                            key={act.id}
                            act={act}
                            actions={actions}
                            isMerchant={isMerchant}
                            isAuthorized={isAuthorized}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
