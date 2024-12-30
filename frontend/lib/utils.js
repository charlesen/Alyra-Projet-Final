import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
