"use client";

import React, { useState } from "react";
import { Client } from "@/lib/db";
import { formatGHS } from "@/lib/paystack";
import {
  Search,
  User,
  Crown,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Edit3,
  MessageSquare,
  Check,
  X,
} from "lucide-react";

interface ClientListProps {
  clients: Client[];
  onSaveNotes?: (clientId: string, newNotes: string) => void;
  onUpdateTier?: (clientId: string, tier: "VIP" | "Regular" | "New") => void;
}

export default function ClientList({ clients, onSaveNotes, onUpdateTier }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [tempNotes, setTempNotes] = useState("");

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesTier = selectedTier === "all" ? true : c.tier === selectedTier;

    return matchesSearch && matchesTier;
  });

  const handleStartEdit = (client: Client) => {
    setEditingClient(client);
    setTempNotes(client.notes || "");
  };

  const handleSaveEdit = () => {
    if (editingClient && onSaveNotes) {
      onSaveNotes(editingClient.id, tempNotes);
    }
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A49E99] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E8E2D8] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#1A1716] placeholder-[#A49E99] focus:outline-none focus:border-[#C2A878] shadow-xs transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "VIP", "Regular", "New"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                selectedTier === tier
                  ? "bg-[#C2A878] text-white shadow-xs"
                  : "bg-white text-[#7A736E] hover:text-[#1A1716] border border-[#E8E2D8]"
              }`}
            >
              {tier === "all" ? "All Clients" : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const rawPhone = client.phone.replace(/[^0-9]/g, "");
          const whatsappUrl = `https://wa.me/${rawPhone}?text=Hello%20${encodeURIComponent(
            client.name
          )},%20greetings%20from%20Braosei%20Studios!`;

          return (
            <div
              key={client.id}
              className="bg-white border border-[#E8E2D8] hover:border-[#C2A878] rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-[0_4px_24px_rgba(26,23,22,0.03)]"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-center font-serif text-base font-bold text-[#1A1716]">
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-[#1A1716] text-lg leading-tight">
                        {client.name}
                      </h4>
                      <span className="text-[11px] text-[#7A736E] flex items-center gap-1 mt-0.5 font-light">
                        <Calendar className="w-3 h-3 text-[#C2A878]" />
                        First shoot: {client.firstSeen}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Tier Selector */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-full border border-[#E8E2D8]">
                      {(["New", "Regular", "VIP"] as const).map((tierOption) => {
                        const isSelected = client.tier === tierOption;
                        return (
                          <button
                            key={tierOption}
                            type="button"
                            title={`Mark client as ${tierOption}`}
                            onClick={() => onUpdateTier && onUpdateTier(client.id, tierOption)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                              isSelected
                                ? tierOption === "VIP"
                                  ? "bg-[#C2A878] text-white shadow-xs"
                                  : tierOption === "Regular"
                                  ? "bg-[#1A1716] text-white"
                                  : "bg-emerald-600 text-white"
                                : "text-[#7A736E] hover:text-[#1A1716] hover:bg-[#EFE8DA]/50"
                            }`}
                          >
                            {tierOption === "VIP" ? "★ VIP" : tierOption}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-[#A49E99]">Tier Status</span>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2 my-4 text-xs text-[#1A1716] bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E2D8]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#C2A878] shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#7A736E] shrink-0" />
                    <span className="truncate text-[#7A736E]">{client.email}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-center">
                    <span className="text-[10px] uppercase text-[#7A736E] block font-bold tracking-wider">
                      Bookings
                    </span>
                    <span className="font-serif text-lg font-bold text-[#1A1716]">
                      {client.totalBookings} shoots
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-center">
                    <span className="text-[10px] uppercase text-[#7A736E] block font-bold tracking-wider">
                      Lifetime Value
                    </span>
                    <span className="font-serif text-lg font-bold text-[#967E51]">
                      {formatGHS(client.lifetimeValue)}
                    </span>
                  </div>
                </div>

                {/* Private Studio Notes */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs text-[#7A736E] mb-1.5">
                    <span className="font-bold text-[#1A1716] uppercase text-[10px] tracking-wider">
                      Studio Notes
                    </span>
                    <button
                      onClick={() => handleStartEdit(client)}
                      className="text-[11px] text-[#C2A878] hover:text-[#967E51] font-semibold flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-[#7A736E] bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D8] italic leading-relaxed min-h-[46px] font-light">
                    &quot;{client.notes || "No specific studio notes yet."}&quot;
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-between">
                <span className="text-[11px] text-[#7A736E]">
                  Last shoot: {client.lastBookingDate}
                </span>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Notes Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-[#1A1716]/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#E8E2D8] rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h4 className="font-serif text-2xl font-bold text-[#1A1716] mb-1">
              Edit Notes: {editingClient.name}
            </h4>
            <p className="text-xs text-[#7A736E] mb-5 font-light">
              Record lighting preferences, wardrobe changes, music mood, or brand styling details.
            </p>

            <textarea
              rows={4}
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-2xl p-4 text-xs sm:text-sm text-[#1A1716] focus:outline-none focus:border-[#C2A878] focus:bg-white transition"
              placeholder="e.g. Loves warm golden lighting, brings own makeup artist..."
            />

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#7A736E] hover:bg-[#FAF8F5] border border-[#E8E2D8] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C2A878] text-white hover:bg-[#B29766] flex items-center gap-1.5 transition shadow-xs"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
