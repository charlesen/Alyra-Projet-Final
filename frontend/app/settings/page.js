"use client";

import Settings from "@/components/Settings";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl lg:text-center text-white">
      <h2 className="text-3xl font-semibold">Paramètres</h2>
      <div className="mx-auto max-w-2xl text-center">
        <Settings />
      </div>
    </div>
  );
}
