// app/api/volunteering/route.js

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Obtenir le chemin absolu du fichier JSON des actes de bénévolat.
 */
const getFilePath = () => {
  return path.join(
    process.cwd(),
    "public",
    "data",
    "volunteer_opportunities.json"
  );
};

/**
 * Lire le contenu du fichier JSON des actes de bénévolat.
 */
const readActsFromFile = () => {
  const filePath = getFilePath();
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
};

/**
 * Écrire le contenu mis à jour dans le fichier JSON des actes de bénévolat.
 */
const writeActsToFile = (acts) => {
  const filePath = getFilePath();
  fs.writeFileSync(filePath, JSON.stringify(acts, null, 2), "utf8");
};

/**
 * Handler pour les requêtes GET.
 * Renvoie la liste actuelle des actes de bénévolat.
 */
export async function GET() {
  try {
    const acts = readActsFromFile();
    return NextResponse.json(acts);
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier JSON:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la lecture des actes." },
      { status: 500 }
    );
  }
}

/**
 * Handler pour les requêtes PUT.
 * Met à jour le statut d'un acte spécifique, et éventuellement assigne un bénévole.
 */
export async function PUT(request) {
  try {
    const { actId, newStatus, volunteer } = await request.json();

    if (!actId || !newStatus) {
      return NextResponse.json(
        { message: "actId et newStatus sont requis." },
        { status: 400 }
      );
    }

    const acts = readActsFromFile();

    const actIndex = acts.findIndex((act) => act.id === actId);
    if (actIndex === -1) {
      return NextResponse.json(
        { message: "Acte non trouvé." },
        { status: 404 }
      );
    }

    // Mettre à jour le statut et éventuellement le bénévole
    acts[actIndex].status = newStatus;
    if (volunteer !== undefined) {
      acts[actIndex].volunteer = volunteer;
    }

    writeActsToFile(acts);

    return NextResponse.json(
      { message: "Acte mis à jour avec succès.", act: acts[actIndex] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du fichier JSON:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la mise à jour des actes." },
      { status: 500 }
    );
  }
}
