import { useState } from "react";
import { useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";

export default function UpdateReserve() {
    const [newAddr, setNewAddr] = useState("");

    const { data, error, isPending, writeContract } = useWriteContract();

    const handleUpdate = async () => {
        try {
            await writeContract({
                address: EUSKO_TOKEN_ADDRESS,
                abi: EUSKO_ABI,
                functionName: "updateReserve",
                args: [newAddr],
            });
        } catch (err) {
            console.error("Erreur updateReserve:", err);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 rounded-md text-white-700">
            <h3 className="text-xl font-semibold mb-4">
                Mise à jour de la réserve
            </h3>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Nouvelle adresse de la réserve"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-neutral-900 p-2"
                    value={newAddr}
                    onChange={(e) => setNewAddr(e.target.value)}
                />
                {error && <p className="text-red-500">Erreur : {error.message}</p>}
                {data && <p>Tx en cours : {data}</p>}
            </div>
            <Button
                variant="default"
                onClick={handleUpdate}
                disabled={isPending}
                className="w-full"
            >
                {isPending ? "Transaction..." : "Mettre à jour la réserve"}
            </Button>
        </div>
    );
}
