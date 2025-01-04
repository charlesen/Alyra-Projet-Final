"use client";
import { useReadContract } from "wagmi";
import { EUSKO_TOKEN_ADDRESS, EUSKO_ABI } from "@/constants";

/**
 * @dev Ce hook retourne un booléen `isAuthorized` + les états de loading/erreur
 *      relatifs à la lecture du contrat "isAuthorizedAccount(address)".
 */
export function useIsAuthorized(userAddress) {
  const {
    data: isAuthData,
    isLoading: isAuthLoading,
    isError: isAuthError,
  } = useReadContract({
    address: EUSKO_TOKEN_ADDRESS,
    abi: EUSKO_ABI,
    functionName: "isAuthorizedAccount",
    args: [userAddress || "0x0000000000000000000000000000000000000000"],
    enabled: Boolean(userAddress),
  });

  // Conversion data => booléen
  const isAuthorized = Boolean(isAuthData);

  return {
    isAuthorized,
    isAuthLoading,
    isAuthError,
  };
}
