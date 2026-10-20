"use client";

import React, { useState, useEffect } from "react";
import ClientList from "@/components/admin/ClientList";
import { Client } from "@/lib/db";
import { formatGHS } from "@/lib/paystack";
import {
  Users,
  Crown,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

export default function AdminCRMPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSaveNotes = async (clientId: string, newNotes: string) => {
    try {
      const res = await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: clientId, notes: newNotes }),
      });
      if (res.ok) {
        fetchClients();
      }
    } catch (err) {
      console.error("Failed to update notes:", err);
    }
  };

  const handleUpdateTier = async (clientId: string, newTier: "VIP" | "Regular" | "New") => {
    try {
      const res = await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: clientId, tier: newTier }),
      });
      if (res.ok) {
        fetchClients();
      }
    } catch (err) {
      console.error("Failed to update client tier:", err);
    }
  };

  // Quick stats
  const totalClients = clients.length;
  const vipClients = clients.filter((c) => c.tier === "VIP").length;
  const totalLTV = clients.reduce((sum, c) => sum + c.lifetimeValue, 0);

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2A878] block mb-1">
            Client Relationships
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1716]">
            Studio Client Database & History
          </h1>
        </div>

        <button
          onClick={fetchClients}
          disabled={loading}
          className="px-5 py-2.5 rounded-full bg-white border border-[#E8E2D8] hover:border-[#C2A878] text-xs font-semibold uppercase tracking-wider text-[#1A1716] flex items-center gap-2 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C2A878] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh CRM</span>
        </button>
      </div>

      {/* CRM Highlight Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] flex items-center gap-5 shadow-[0_4px_24px_rgba(26,23,22,0.03)]">
          <div className="p-3.5 rounded-2xl bg-[#F7F2E7] border border-[#EFE8DA] text-[#C2A878]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#7A736E] uppercase font-bold tracking-wider block">
              Total Studio Clients
            </span>
            <span className="font-serif text-3xl font-bold text-[#1A1716]">{totalClients}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] flex items-center gap-5 shadow-[0_4px_24px_rgba(26,23,22,0.03)]">
          <div className="p-3.5 rounded-2xl bg-[#F7F2E7] border border-[#EFE8DA] text-[#967E51]">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#7A736E] uppercase font-bold tracking-wider block">
              VIP Tier Clients
            </span>
            <span className="font-serif text-3xl font-bold text-[#1A1716]">{vipClients}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] flex items-center gap-5 shadow-[0_4px_24px_rgba(26,23,22,0.03)]">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#7A736E] uppercase font-bold tracking-wider block">
              Combined Lifetime Value
            </span>
            <span className="font-serif text-3xl font-bold text-emerald-800">{formatGHS(totalLTV)}</span>
          </div>
        </div>
      </div>

      {/* Client List & Notes */}
      <ClientList
        clients={clients}
        onSaveNotes={handleSaveNotes}
        onUpdateTier={handleUpdateTier}
      />
    </div>
  );
}
