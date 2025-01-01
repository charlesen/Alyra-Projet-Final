"use client";
import { useAccount } from "wagmi";
import EuskoBalance from "@/components/EuskoBalance";
import NotConnected from "@/components/shared/NotConnected";
import GuaranteeFundBalance from "@/components/GuaranteeFundBalance";
import ReserveBalance from "@/components/ReserveBalance";
import VolunteerPoints from "@/components/VolunteerPoints";

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col items-center justify-center dark:bg-gray-900">
      <main className="max-w-2xl w-full flex flex-col items-center sm:items-start">
        <section className="py-8 text-gray-700 dark:text-gray-300 leading-relaxed w-full">
          {isConnected ? (
            <>
              <EuskoBalance address={address} />
              <VolunteerPoints address={address} />
            </>
          ) : (
            <NotConnected />
          )}
        </section>
        <section className="py-8 w-full">
          <GuaranteeFundBalance />
        </section>
      </main>
    </div>
  );
}
