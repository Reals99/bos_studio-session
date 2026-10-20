"use client";

import React, { useState } from "react";
import { Booking } from "@/lib/db";
import { formatGHS } from "@/lib/paystack";
import { TIME_SLOTS } from "@/components/client/DateScroller";
import {
  Search,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Banknote,
  Calendar,
  AlertCircle,
  Send,
  Info,
} from "lucide-react";

interface BookingTableProps {
  bookings: Booking[];
  onUpdateStatus?: (id: string, status: Booking["bookingStatus"]) => void;
  onReschedule?: (id: string, newDate: string, newTimeSlot: string, reason?: string) => Promise<void>;
}

export default function BookingTable({
  bookings,
  onUpdateStatus,
  onReschedule,
}: BookingTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeNoteModal, setActiveNoteModal] = useState<Booking | null>(null);

  // Reschedule state
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState(TIME_SLOTS[0]);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.clientPhone.includes(searchTerm) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.packageName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : b.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Booking["bookingStatus"]) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const getWhatsAppLink = (booking: Booking) => {
    const rawPhone = booking.clientPhone.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hello ${booking.clientName}, this is Braosei Studios regarding your ${booking.packageName} scheduled on ${booking.date} at ${booking.timeSlot}. (Booking ID: ${booking.id})`
    );
    return `https://wa.me/${rawPhone}?text=${message}`;
  };

  const handleOpenReschedule = (booking: Booking) => {
    setReschedulingBooking(booking);
    setNewDate(booking.date);
    setNewTimeSlot(booking.timeSlot || TIME_SLOTS[0]);
    setRescheduleReason("");
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingBooking || !newDate || !newTimeSlot || !onReschedule) return;
    setIsSubmittingReschedule(true);
    try {
      await onReschedule(reschedulingBooking.id, newDate, newTimeSlot, rescheduleReason);
      setReschedulingBooking(null);
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white border border-[#E8E2D8] rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(26,23,22,0.03)]">
      {/* Top Filter and Search Bar */}
      <div className="p-5 sm:p-6 border-b border-[#E8E2D8] flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A49E99] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, phone, or ID (e.g. BOS-4019)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#1A1716] placeholder-[#A49E99] focus:outline-none focus:border-[#C2A878] focus:bg-white transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "confirmed", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? "bg-[#C2A878] text-white font-bold shadow-xs"
                  : "bg-[#FAF8F5] text-[#7A736E] hover:text-[#1A1716] border border-[#E8E2D8]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#7A736E] border-b border-[#E8E2D8]">
            <tr>
              <th className="py-4 px-6">Client / Booking</th>
              <th className="py-4 px-6">Schedule</th>
              <th className="py-4 px-6">Package & Pricing</th>
              <th className="py-4 px-6">Payment</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E2D8] text-[#1A1716]">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#7A736E]">
                  No bookings found matching your search.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-[#FAF8F5] transition duration-150"
                >
                  {/* Client Info */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-[#1A1716] flex items-center gap-2">
                      <span>{b.clientName}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F7F2E7] text-[#967E51] border border-[#EFE8DA]">
                        {b.id}
                      </span>
                    </div>
                    <div className="text-xs text-[#7A736E] mt-0.5">{b.clientPhone}</div>
                    <div className="text-[11px] text-[#A49E99]">{b.clientEmail}</div>
                  </td>

                  {/* Schedule */}
                  <td className="py-4 px-6">
                    <div className="font-semibold text-[#1A1716]">
                      {new Date(b.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-[#C2A878] font-bold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {b.timeSlot}
                    </div>
                    {b.rescheduledAt && (
                      <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-200 mt-1 inline-block">
                        Rescheduled
                      </span>
                    )}
                  </td>

                  {/* Package & Pricing */}
                  <td className="py-4 px-6">
                    <div className="font-serif font-bold text-[#1A1716] text-base">{b.packageName}</div>
                    <div className="text-xs font-bold text-[#1A1716]">
                      Total: {formatGHS(b.packagePrice)}
                    </div>
                    <div className="text-[11px] text-[#7A736E]">
                      Deposit: {formatGHS(b.depositAmount)} | Due: {formatGHS(b.balanceDue)}
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {b.paymentMethod === "paystack" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1 text-[11px] font-semibold">
                          <CreditCard className="w-3 h-3" />
                          Paystack 30%
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 text-[11px] font-semibold">
                          <Banknote className="w-3 h-3" />
                          Cash on Arrival
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#7A736E] mt-1 capitalize font-medium">
                      {b.paymentStatus.replace("_", " ")}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">{getStatusBadge(b.bookingStatus)}</td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Reschedule Button */}
                      <button
                        onClick={() => handleOpenReschedule(b)}
                        title="Reschedule Session (Dispatches SMS)"
                        className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] text-xs font-semibold text-[#1A1716] hover:bg-[#C2A878] hover:text-white border border-[#E8E2D8] transition flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>

                      {/* WhatsApp Link */}
                      <a
                        href={getWhatsAppLink(b)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>

                      {/* Notes button */}
                      {b.notes && (
                        <button
                          onClick={() => setActiveNoteModal(b)}
                          title="View Session Notes"
                          className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] text-xs font-semibold text-[#1A1716] hover:bg-[#F0EBE3] border border-[#E8E2D8] transition"
                        >
                          Notes
                        </button>
                      )}

                      {/* Status toggle actions */}
                      {b.bookingStatus !== "completed" && (
                        <button
                          onClick={() => onUpdateStatus?.(b.id, "completed")}
                          title="Mark Complete"
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {b.bookingStatus !== "cancelled" && (
                        <button
                          onClick={() => onUpdateStatus?.(b.id, "cancelled")}
                          title="Cancel Booking"
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 transition"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 bg-[#1A1716]/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#E8E2D8] rounded-3xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2A878] mb-1">
              <Calendar className="w-4 h-4" />
              <span>Admin Schedule Editor</span>
            </div>
            <h4 className="font-serif text-2xl font-bold text-[#1A1716] mb-1">
              Reschedule: {reschedulingBooking.clientName}
            </h4>
            <p className="text-xs text-[#7A736E] mb-5">
              Current: <strong>{reschedulingBooking.date}</strong> at <strong>{reschedulingBooking.timeSlot}</strong> ({reschedulingBooking.packageName})
            </p>

            {/* Rescheduling Fee Policy Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-5 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Rescheduling Policy Notice:</strong>
                <span>
                  Rescheduling sessions attracts an administrative fee. Confirming this change will update the database and automatically dispatch an SMS update to <strong>{reschedulingBooking.clientPhone}</strong>.
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-[#1A1716] uppercase tracking-wider mb-1.5">
                  Select New Date *
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl px-4 py-3 text-sm text-[#1A1716] focus:outline-none focus:border-[#C2A878] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1716] uppercase tracking-wider mb-1.5">
                  Select New Time Slot *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setNewTimeSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition ${
                        newTimeSlot === slot
                          ? "bg-[#C2A878] text-white border-[#C2A878] shadow-xs"
                          : "bg-[#FAF8F5] text-[#1A1716] border-[#E8E2D8] hover:border-[#C2A878]"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1716] uppercase tracking-wider mb-1.5">
                  Reason for Rescheduling (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Client requested date change, Studio maintenance..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl px-4 py-2.5 text-xs text-[#1A1716] focus:outline-none focus:border-[#C2A878]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D8]">
              <button
                type="button"
                disabled={isSubmittingReschedule}
                onClick={() => setReschedulingBooking(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#7A736E] hover:bg-[#FAF8F5] border border-[#E8E2D8] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReschedule}
                onClick={handleConfirmReschedule}
                className="px-6 py-2.5 rounded-full bg-[#C2A878] hover:bg-[#B29766] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReschedule ? "Updating & Dispatching..." : "Confirm & Send SMS"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1716]/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#E8E2D8] rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h4 className="font-serif text-2xl font-bold text-[#1A1716] mb-1">
              Shoot Notes for {activeNoteModal.clientName}
            </h4>
            <div className="text-xs text-[#C2A878] font-bold uppercase tracking-wider mb-4">
              Booking ID: {activeNoteModal.id} ({activeNoteModal.packageName})
            </div>
            <p className="text-xs sm:text-sm text-[#1A1716] bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D8] leading-relaxed">
              {activeNoteModal.notes}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveNoteModal(null)}
                className="px-5 py-2.5 rounded-full bg-[#C2A878] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#B29766] transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
