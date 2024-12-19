"use client";
import { useAccount } from "wagmi";
import EuskoBalance from "@/components/EuskoBalance";
import NotConnected from "@/components/shared/NotConnected";

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-20 bg-white dark:bg-gray-900 min-h-screen gap-16">
      <main className="max-w-2xl w-full flex flex-col items-center sm:items-start">
        <div className="p-4">
          {isConnected ? <EuskoBalance address={address} /> : <NotConnected />}
        </div>

        <section className="mb-8 text-gray-700 dark:text-gray-300 leading-relaxed">
          <h3 className="text-2xl font-semibold mb-4">Bienvenue sur Eusko</h3>
          <p className="mb-4">
            Eusko est un stablecoin adossé à l’EURC, conçu pour valoriser le
            bénévolat et encourager le commerce local. En offrant des
            récompenses en EUS aux bénévoles, nous soutenons l’économie sociale
            et solidaire, tout en permettant aux commerçants partenaires de
            bénéficier de nouveaux clients engagés.
          </p>
          <p className="mb-4">
            Connectez votre portefeuille pour consulter votre solde, participer
            à des actes de bénévolat, dépenser vos EUS chez nos commerçants
            approuvés, et plus encore.
          </p>
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
