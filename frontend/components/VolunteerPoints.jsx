"use client";
import { useAccount, useReadContract } from "wagmi";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";
import { useEffect, useState } from "react";

export default function VolunteerPoints() {
    const { address: volunteer, isConnected } = useAccount();
    const [totalPoints, setTotalPoints] = useState(0n); // BigInt en JS

    // Appel du contrat
    const {
        data: actsData,
        error,
        isLoading,
    } = useReadContract({
        address: EUSKO_TOKEN_ADDRESS,
        abi: EUSKO_ABI,
        functionName: "getActsByVolunteer",
        args: [volunteer],         // on passe l'adresse du bénévole
        enabled: !!volunteer,      // n'activer la lecture que si volunteer != undefined
    });

    // Quand on reçoit actsData, calculer la somme
    useEffect(() => {
        if (!actsData) return;
        // actsData est un tableau d'objets du type [organism, description, reward, timestamp]
        // en wagmi, vous aurez un tableau d’array: [ [organism, desc, reward, time], [...], ...]
        // ou un struct plus typé selon la version.
        let sum = 0n;
        actsData.forEach((act) => {
            console.log("act", act);
            const rewardValue = act['reward'];
            sum += rewardValue;
        });
        setTotalPoints(sum / 1000000n);
    }, [actsData]);

    if (!isConnected) {
        return <p>Veuillez connecter votre wallet pour voir vos points.</p>;
    }
    if (isLoading) {
        return <p>Chargement des actes en cours...</p>;
    }
    if (error) {
        return <p className="text-red-500">Erreur lors du chargement de vos points.</p>;
    }

    // Convertir BigInt => number ou string
    const displayPoints = totalPoints.toString();

    return (
        <div className="my-4 p-4 bg-gray-100 rounded-md text-center">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Mes points bénévolat</h3>
            <p className="text-gray-800 text-2xl font-bold">
                {displayPoints} points
            </p>
        </div>
    );
}
