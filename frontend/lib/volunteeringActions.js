import { updateActStatus } from "@/lib/utils";

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
    alert(
      "L'acte de benevolat doit être 'terminé' pour être prêt pour la blockchain."
    );
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
