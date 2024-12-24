"use client";
import Mint from "@/components/Mint";

export default function MintPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-8">
          <h2 className="text-3xl font-semibold text-indigo-600">Mint</h2>
        </div>

        <Mint />
      </div>
    </div>
  );
}
