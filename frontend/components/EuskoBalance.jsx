"use client";
import { useBalance, useReadContract } from "wagmi";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";

function EuskoBalance({ address }) {
    // Récupération de l'adresse de la réserve depuis le contrat
    const { data: reserveData, isError: reserveAddrError, isLoading: reserveAddrLoading } = useReadContract({
        address: EUSKO_TOKEN_ADDRESS,
        abi: EUSKO_ABI,
        functionName: 'reserve',
    });

    const reserve = reserveData;

    // Balance utilisateur
    const { data: userData, isLoading: userLoading, isError: userError } = useBalance({
        address,
        token: EUSKO_TOKEN_ADDRESS,
        enabled: !!address
    });

    // Balance réserve
    const { data: reserveBalanceData, isLoading: reserveLoading, isError: reserveError } = useBalance({
        address: reserve,
        token: EUSKO_TOKEN_ADDRESS,
        enabled: !!reserve
    });

    const loading = userLoading || reserveLoading || reserveAddrLoading;
    const error = userError || reserveError || reserveAddrError;

    if (!address) {
        return null;
    }

    if (loading) {
        return (
            <div className="text-center mt-4">Chargement des soldes...</div>
        );
    }

    if (error || !userData || (reserve && !reserveBalanceData)) {
        console.error('Erreur chargement balances', { userError, reserveError, reserveAddrError });
        return (
            <div className="text-center mt-4 text-red-500">
                Erreur lors du chargement des soldes (utilisateur ou réserve)
            </div>
        );
    }

    const formatBalance = (data) => {
        const decimals = data.decimals ?? 6;
        const rawValue = BigInt(data.value.toString());
        return (Number(rawValue) / (10 ** decimals)).toFixed(2);
    };

    const userBalanceFormatted = formatBalance(userData);
    const reserveBalanceFormatted = reserve ? formatBalance(reserveBalanceData) : null;

    return (
        <div className="bg-white sm:py-32 lg:text-center">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        {/* Solde Utilisateur */}
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold text-gray-900">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <svg className="h-6 w-6 text-white" fill="none"
                                        viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v7.5m0 0 3-3m-3 3-3-3m8.25 8.25a4.5 4.5 0 0 0-1.41-8.775 5.25 5.25 0 0 0-10.233-2.33 3 3 0 0 0-3.758 3.848A3.752 3.752 0 0 0 6 19.5h12.75Z" />
                                    </svg>
                                </div>
                                Votre solde Eusko
                            </dt>
                            <dd className="mt-2 text-base text-gray-600">
                                {userBalanceFormatted} EUS
                            </dd>
                        </div>

                        {/* Solde Réserve (si disponible) */}
                        {reserve && (
                            <div className="relative pl-16">
                                <dt className="text-base font-semibold text-gray-900">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                        <svg className="h-6 w-6 text-white" fill="none"
                                            viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12H3m10-5v10M3 9h3m6-6h3m-3 6h3m-3 6h3m6-6h3M4.5 4.5l3 3m9-3l-3 3m-6 9l3 3m9-3l-3 3" />
                                        </svg>
                                    </div>
                                    Solde de la réserve
                                </dt>
                                <dd className="mt-2 text-base text-gray-600">
                                    {reserveBalanceFormatted} EUS
                                </dd>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EuskoBalance;
