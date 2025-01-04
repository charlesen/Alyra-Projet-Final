"use client";
import AddSigner from "@/components/AddSigner";
import Mint from "@/components/Mint";
import MintMultiSig from "@/components/MintMultiSig";
import NotConnected from "@/components/shared/NotConnected";
import UpdateReserve from "@/components/UpdateReserve";
import { EUSKO_ABI, EUSKO_TOKEN_ADDRESS } from "@/constants";
import { useIsAuthorized } from "@/hooks/useIsAuthorized";
import { useAccount, useReadContract } from "wagmi";

export default function AdminPage() {
  const { address: userAddress, isConnected } = useAccount();

  const { isAuthorized, isAuthLoading, isAuthError } =
    useIsAuthorized(userAddress);

  // 1) Affichage pendant le chargement
  if (isAuthLoading) {
    return (
      <p className="text-center mt-6 text-white">Vérification en cours...</p>
    );
  }

  // 2) Gestion des erreurs
  if (isAuthError) {
    return (
      <p className="text-center mt-6 text-red-600">
        Erreur lors de la vérification de votre statut d'autorisation.
      </p>
    );
  }

  // 3) Vérification qu'on est connecté
  if (!isConnected) {
    return <NotConnected />;
  }

  // 4) Vérification qu'on est autorisé
  if (!isAuthorized) {
    return (
      <p className="text-center mt-6 text-red-500">
        Vous n'êtes pas autorisé(e) à accéder à cette page.
      </p>
    );
  }

  // 5) Si tout est OK, on affiche la page Admin
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center mb-8 text-white">
        <h2 className="text-3xl font-semibold mb-4">Admin</h2>

        {/* Mise à jour de l'adresse de la réserve */}
        <UpdateReserve />
        <hr className="my-6 border-gray-500" />

        {/* Mint direct (Autorisé) */}
        <Mint />
        <hr className="my-6 border-gray-500" />

        {/* Ajout d'un nouveau signataire au MultiSig */}
        <AddSigner />
        <hr className="my-6 border-gray-500" />

        {/* Partie MultiSig pour le Mint */}
        <MintMultiSig />
      </div>
    </div>
  );
}
