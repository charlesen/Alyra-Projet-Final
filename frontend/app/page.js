"use client";
import { useAccount } from "wagmi";
import EuskoBalance from "@/components/EuskoBalance";
import NotConnected from "@/components/shared/NotConnected";

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-20 bg-white dark:bg-gray-900 min-h-screen gap-16">
      <main className="max-w-2xl w-full flex flex-col items-center sm:items-start">
        <div className="mx-auto max-w-2xl lg:text-center">
          <section class="text-center">
            <h2 className="text-3xl font-semibold text-indigo-600">
              Bienvenue sur Eusko
            </h2>
            <p class="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Eusko est un stablecoin adossé à l’EURC, conçu pour valoriser le
              bénévolat et encourager le commerce local.
            </p>
            <p class="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              En offrant des récompenses en EUS aux bénévoles, nous soutenons
              l’économie sociale et solidaire, tout en permettant aux
              commerçants partenaires de bénéficier de nouveaux clients engagés.
            </p>
          </section>
        </div>
        <section className="py-8 text-gray-700 dark:text-gray-300 leading-relaxed">
          {isConnected ? <EuskoBalance address={address} /> : <NotConnected />}
        </section>

        {!isConnected && (
          <div className="mt-4">
            <p className="text-gray-500 dark:text-gray-400">
              Veuillez connecter votre wallet pour voir votre solde Eusko et
              interagir avec la plateforme.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
