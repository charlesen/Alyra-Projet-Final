"use client";

import { parseUnits } from "viem";

import { useCallback, useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";
import { updateActStatus } from "@/lib/utils";
import {
  handleApply,
  handleValidate,
  handleFinish,
  handlePrepareOnChain,
} from "@/lib/volunteeringActions";

/**
 * Hook personnalisé pour gérer les actions de bénévolat.
 */
export const useVolunteeringActions = ({
  address,
  isConnected,
  isMerchant,
  isAuthorized,
  setActs,
  toast,
}) => {
  // Hook pour écrire dans le contrat (registerAct)
  const {
    writeContract: writeRegisterAct,
    data: registerTxData,
    error: registerError,
    isPending: isRegistering,
  } = useWriteContract();

  // Hook pour attendre la confirmation de la transaction
  const {
    isLoading: isRegisterConfirming,
    isSuccess: isRegisterSuccess,
    error: waitRegisterError,
  } = useWaitForTransactionReceipt({
    hash: registerTxData,
  });

  // Effet pour gérer le succès ou l'échec de la transaction
  useEffect(() => {
    if (isRegisterSuccess) {
      console.log(
        "Transaction confirmée, mise à jour de l'acte via l'API.",
        registerTxData
      );
      // Mettre à jour le statut via l'API
      updateActStatus(setActs, pendingActId, "registeredOnChain")
        .then(() => {
          toast({
            title: "Inscription réussie",
            description: `L'acte a été inscrit sur la blockchain.`,
            variant: "success",
          });
        })
        .catch((error) => {
          toast({
            title: "Erreur",
            description:
              "La transaction a réussi, mais la mise à jour du statut a échoué.",
            variant: "destructive",
          });
          console.error(
            "Erreur lors de la mise à jour du statut via l'API:",
            error
          );
        });
    }

    if (registerError || waitRegisterError) {
      console.log(
        "Erreur lors de l'enregistrement on-chain:",
        registerError || waitRegisterError
      );
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'acte sur la blockchain.",
        variant: "destructive",
      });
      console.error(
        "Erreur lors de l'enregistrement on-chain:",
        registerError || waitRegisterError
      );
    }
  }, [
    isRegisterSuccess,
    registerError,
    waitRegisterError,
    setActs,
    toast,
    registerTxData,
  ]);

  // Fonction pour enregistrer l'acte sur la blockchain
  const [pendingActId, setPendingActId] = useState(null);
  const handleRegisterOnChain = useCallback(
    async (act) => {
      if (!isAuthorized) {
        toast({
          title: "Non autorisé",
          description:
            "Seules les adresses autorisées peuvent enregistrer l'acte sur la blockchain.",
          variant: "destructive",
        });
        return;
      }
      if (act.status !== "readyOnChain") {
        toast({
          title: "Statut Incorrect",
          description:
            "L'acte doit être 'Prêt pour la blockchain' pour être enregistré sur la blockchain.",
          variant: "destructive",
        });
        return;
      }

      try {
        setPendingActId(act.id);
        // Appel de la fonction registerAct du contrat
        writeRegisterAct({
          address: EUSKO_TOKEN_ADDRESS,
          abi: EUSKO_ABI,
          functionName: "registerAct",
          args: [
            act.volunteer,
            act.organism,
            act.description,
            parseUnits(act.reward.toString(), 6),
          ],
        });

        toast({
          title: "Transaction en cours",
          description: "Enregistrement de l'acte sur la blockchain...",
          variant: "info",
        });
      } catch (error) {
        console.error("Erreur lors de l'appel de registerAct:", error);
        toast({
          title: "Erreur",
          description:
            "Impossible d'initier la transaction d'enregistrement on-chain.",
          variant: "destructive",
        });
      }
    },
    [isAuthorized, writeRegisterAct, toast]
  );

  // Fonction pour postuler à un acte
  const handleApplyAct = useCallback(
    async (act) => {
      await handleApply(act, address, setActs, toast, isConnected);
    },
    [address, setActs, toast, isConnected]
  );

  // Fonction pour valider un acte
  const handleValidateAct = useCallback(
    async (act) => {
      await handleValidate(act, isMerchant, address, setActs, toast);
    },
    [isMerchant, address, setActs, toast]
  );

  // Fonction pour terminer un acte
  const handleFinishAct = useCallback(
    async (act) => {
      await handleFinish(act, isMerchant, address, setActs, toast);
    },
    [isMerchant, address, setActs, toast]
  );

  // Fonction pour préparer un acte on-chain
  const handlePrepareOnChainAct = useCallback(
    async (act) => {
      await handlePrepareOnChain(act, isMerchant, address, setActs, toast);
    },
    [isMerchant, address, setActs, toast]
  );

  return {
    handleApply: handleApplyAct,
    handleValidate: handleValidateAct,
    handleFinish: handleFinishAct,
    handlePrepareOnChain: handlePrepareOnChainAct,
    handleRegisterOnChain,
    isRegistering: isRegistering || isRegisterConfirming,
  };
};
