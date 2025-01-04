"use client";
import AddSigner from "@/components/AddSigner";
import Mint from "@/components/Mint";
import MintMultiSig from "@/components/MintMultiSig";
import UpdateReserve from "@/components/UpdateReserve";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center mb-8 text-white">
        <h2 className="text-3xl font-semibold">Admin</h2>
        <UpdateReserve />
        <hr />
        <Mint />
        <hr />
        <hr />
        <AddSigner />
        <MintMultiSig />
      </div>
    </div>
  );
}
