// src/utils/volunteeringActions.js

/**
 * Met à jour le statut d'un acte via l'API.
 * @param {Function} setActs - Fonction pour mettre à jour l'état des actes.
 * @param {number} actId - ID de l'acte à mettre à jour.
 * @param {string} newStatus - Nouveau statut à attribuer.
 */
export const updateActStatus = async (setActs, actId, newStatus) => {
  try {
    const response = await fetch("/api/volunteering", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ actId, newStatus }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Erreur lors de la mise à jour de l'acte."
      );
    }

    const data = await response.json();
    setActs((prevActs) =>
      prevActs.map((act) =>
        act.id === actId ? { ...act, status: newStatus } : act
      )
    );

    return data.act;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'acte via l'API:", error);
    throw error;
  }
};

/**
 * Action "Postuler" : passer de "new" à "inProgress"
 */
export const handleApply = async (
  act,
  address,
  setActs,
  toast,
  isConnected
) => {
  if (!isConnected) {
    alert("Veuillez connecter votre wallet.");
    return;
  }
  if (act.status !== "new") {
    alert("Impossible de postuler, l'acte n'est pas au statut 'new'.");
    return;
  }

  try {
    const response = await fetch("/api/volunteering", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actId: act.id,
        newStatus: "inProgress",
        volunteer: address,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la candidature.");
    }

    const data = await response.json();

    setActs((prevActs) =>
      prevActs.map((item) =>
        item.id === act.id
          ? { ...item, volunteer: address, status: "inProgress" }
          : item
      )
    );

    toast({
      title: "Candidature envoyée",
      description: `Vous avez postulé pour l'acte "${act.title}".`,
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Erreur",
      description: error.message || "Impossible de postuler à cet acte.",
      variant: "destructive",
    });
  }
};

/**
 * Action "Valider l'acte" : passer de "inProgress" à "validated"
 */
export const handleValidate = async (
  act,
  isMerchant,
  address,
  setActs,
  toast
) => {
  if (!isMerchant) {
    alert("Seuls les organismes approuvés peuvent valider un acte.");
    return;
  }
  if (address.toLowerCase() !== act.organism.toLowerCase()) {
    alert("Vous n'êtes pas l'organisme d'origine de cet acte.");
    return;
  }
  if (act.status !== "inProgress") {
    alert("L'acte n'est pas au statut 'inProgress'.");
    return;
  }

  try {
    await updateActStatus(setActs, act.id, "validated");

    toast({
      title: "Acte validé",
      description: `L'acte "${act.title}" a été validé.`,
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Erreur",
      description: error.message || "Impossible de valider cet acte.",
      variant: "destructive",
    });
  }
};

/**
 * Action "Terminer l'acte" : passer de "validated" à "finished"
 */
export const handleFinish = async (
  act,
  isMerchant,
  address,
  setActs,
  toast
) => {
  if (!isMerchant) {
    alert("Seuls les organismes approuvés peuvent terminer l'acte.");
    return;
  }
  if (address.toLowerCase() !== act.organism.toLowerCase()) {
    alert("Vous n'êtes pas l'organisme d'origine de cet acte.");
    return;
  }
  if (act.status !== "validated") {
    alert("L'acte n'est pas au statut 'validated'.");
    return;
  }

  try {
    await updateActStatus(setActs, act.id, "finished");

    toast({
      title: "Acte terminé",
      description: `L'acte "${act.title}" est maintenant terminé.`,
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Erreur",
      description: error.message || "Impossible de terminer cet acte.",
      variant: "destructive",
    });
  }
};

/**
 * Action "Préparer on-chain" : passer de "finished" à "readyOnChain"
 */
export const handlePrepareOnChain = async (
  act,
  isMerchant,
  address,
  setActs,
  toast
) => {
  if (!isMerchant) {
    alert(
      "Seuls les organismes approuvés peuvent préparer l'acte pour la blockchain."
    );
    return;
  }
  if (address.toLowerCase() !== act.organism.toLowerCase()) {
    alert("Vous n'êtes pas l'organisme d'origine de cet acte.");
    return;
  }
  if (act.status !== "finished") {
    alert("L'acte doit être 'finished' pour être prêt pour la blockchain.");
    return;
  }

  try {
    await updateActStatus(setActs, act.id, "readyOnChain");

    toast({
      title: "Prêt pour la blockchain",
      description: `L'acte "${act.title}" est prêt à être inscrit sur la blockchain.`,
      variant: "info",
    });
  } catch (error) {
    toast({
      title: "Erreur",
      description:
        error.message || "Impossible de préparer cet acte pour la blockchain.",
      variant: "destructive",
    });
  }
};

/**
 * Action "Enregistrer on-chain" : passer de "readyOnChain" à "registeredOnChain"
 */
export const handleRegisterOnChain = async (
  act,
  isAuthorized,
  writeContract,
  setActs,
  toast
) => {
  if (!isAuthorized) {
    alert(
      "Seules les adresses authorized peuvent enregistrer l'acte sur la blockchain."
    );
    return;
  }
  if (act.status !== "readyOnChain") {
    alert(
      "L'acte doit être 'readyOnChain' pour être enregistré sur la blockchain."
    );
    return;
  }

  try {
    // Appel on-chain réel
    const tx = await writeContract({
      address: EUSKO_TOKEN_ADDRESS,
      abi: EUSKO_ABI,
      functionName: "registerAct",
      args: [
        act.volunteer,
        act.organism,
        act.description,
        act.reward,
        act.timestamp,
      ],
    });

    toast({
      title: "Transaction en cours",
      description: "Enregistrement de l'acte sur la blockchain...",
      variant: "info",
    });

    // Attendre la confirmation de la transaction
    await tx.wait();

    // Mettre à jour le statut via l'API
    await updateActStatus(setActs, act.id, "registeredOnChain");

    toast({
      title: "Inscription réussie",
      description: `L'acte "${act.title}" a été inscrit sur la blockchain.`,
      variant: "success",
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement on-chain:", error);
    toast({
      title: "Erreur",
      description: "Impossible d'enregistrer l'acte sur la blockchain.",
      variant: "destructive",
    });
  }
};
