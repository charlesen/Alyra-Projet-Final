"use client";
import React from "react";

/**
 * events: tableau d’objets { type, blockNumber, from, to, amount, txHash, ... }
 * isLoading: bool
 * onRefresh: fonction pour reloader
 */
export default function EventsList({ events, isLoading, onRefresh }) {
  if (isLoading) {
    return <div className="text-gray-400">Chargement de l’historique…</div>;
  }

  if (!events?.length) {
    return (
      <div>
        <p>Aucun événement trouvé.</p>
        <button
          className="bg-gray-600 px-3 py-1 rounded text-white hover:bg-gray-500"
          onClick={onRefresh}
        >
          Rafraîchir
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Historique des transactions</h3>
        <button
          className="bg-gray-600 px-3 py-1 rounded text-white hover:bg-gray-500"
          onClick={onRefresh}
        >
          Rafraîchir
        </button>
      </div>

      <ul className="space-y-2">
        {events.map((evt, idx) => (
          <li
            key={`${evt.txHash}_${idx}`}
            className="bg-gray-700 p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            <div className="text-sm text-gray-200">
              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-2">
                {evt.type}
              </span>
              Bloc n° {evt.blockNumber}, Tx: {evt.txHash.slice(0, 10)}…
            </div>
            <div className="text-sm text-gray-400 mt-2 sm:mt-0 sm:text-right">
              {evt.type === "Transfer" ? (
                <>
                  <p>From: {evt.from}</p>
                  <p>To: {evt.to}</p>
                  <p>Amount: {evt.amount?.toString()} EUS</p>
                </>
              ) : evt.type === "Mint" ? (
                <>
                  <p>Minter: {evt.minter}</p>
                  <p>Recipient: {evt.recipient}</p>
                  <p>Amount: {evt.amount?.toString()} EUS</p>
                </>
              ) : evt.type === "Spent" ? (
                <>
                  <p>Spender: {evt.spender}</p>
                  <p>Merchant: {evt.merchant}</p>
                  <p>Amount: {evt.amount?.toString()} EUS</p>
                </>
              ) : (
                <p>Autre event…</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
