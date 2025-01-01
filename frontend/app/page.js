"use client";
import { useAccount } from "wagmi";
import EuskoBalance from "@/components/EuskoBalance";
import NotConnected from "@/components/shared/NotConnected";
import GuaranteeFundBalance from "@/components/GuaranteeFundBalance";
import ReserveBalance from "@/components/ReserveBalance";
import VolunteerPoints from "@/components/VolunteerPoints";

/**
 * HOME PAGE
 * Design d’inspiration « wallet dApp » au style moderne.
 * - Couleurs sombres, touches de dégradé
 * - Cards arrondies, ombres douces
 * - Icônes & typography cohérentes
 */
export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen w-full text-gray-100">
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-center tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-center text-sm text-gray-400 mt-2">
            Bienvenue sur votre espace Eusko
          </p>
        </header>

        {isConnected ? (
          <>
            {/* =========================
                SECTION SOLDE & POINTS
               ========================= */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Card Solde Eusko */}
              <div className="rounded-xl bg-[#2f343c] p-6 shadow-md relative overflow-hidden">
                <EuskoBalance address={address} />
              </div>

              {/* Card Points bénévolat */}
              <div className="rounded-xl bg-[#2f343c] p-6 shadow-md relative overflow-hidden">
                <VolunteerPoints address={address} />
              </div>
            </section>
          </>
        ) : (
          <div className="my-6">
            <NotConnected />
          </div>
        )}

        {/* =========================
                SECTION FOND & RESERVE
               ========================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Fond de garanti */}
          <div className="rounded-xl bg-[#2f343c] p-6 shadow-md relative overflow-hidden">
            <GuaranteeFundBalance />
          </div>

          {/* Card Reserve */}
          <div className="rounded-xl bg-[#2f343c] p-6 shadow-md relative overflow-hidden">
            <ReserveBalance />
          </div>
        </section>
      </main>
    </div>
  );
}
