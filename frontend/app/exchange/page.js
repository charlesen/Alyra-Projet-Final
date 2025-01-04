"use client";

import ExchangeEusko from "@/components/ExchangeEusko";

export default function MintPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center text-white">
        <h2 className="text-3xl font-semibold">Achat/Vente Eusko</h2>
        <ExchangeEusko />
      </div>
    </div>
  );
}
