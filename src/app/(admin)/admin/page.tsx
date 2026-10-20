"use client";

import React, { useState, useEffect } from "react";
import MetricsCard from "@/components/admin/MetricsCard";
import BookingTable from "@/components/admin/BookingTable";
import { Booking, BlockedSlot } from "@/lib/db";
import { formatGHS } from "@/lib/paystack";
import { TIME_SLOTS } from "@/components/client/DateScroller";
import {
  Calendar as CalendarIcon,
  DollarSign,
  Camera,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    depositsCollected: 0,
    upcomingShoots: 0,
    activeClients: 0,
  });
  const [loading, setLoading] = useState(true);

  // Calendar blocking state
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [blockReason, setBlockReason] = useState<string>("");

  // SMS Gateway test state
  const [testPhone, setTestPhone] = useState<string>("");
  const [testingSms, setTestingSms] = useState<boolean>(false);
  const [smsTestResult, setSmsTestResult] = useState<any>(null);

  const handleTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;
    setTestingSms(true);
    setSmsTestResult(null);
    try {
      const res = await fetch("/api/sms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone }),
      });
      const data = await res.json();
      setSmsTestResult(data);
    } catch (err: any) {
      setSmsTestResult({ success: false, error: err.message });
    } finally {
      setTestingSms(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, blocksRes, metricsRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/blocks"),
        fetch("/api/metrics"),
      ]);

      if (bookingsRes.ok) {
        const b = await bookingsRes.json();
        setBookings(b.bookings || []);
      }
      if (blocksRes.ok) {
        const bl = await blocksRes.json();
        setBlockedSlots(bl.blocks || []);
      }
      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m.metrics || {});
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBookingStatus = async (
    id: string,
    status: Booking["bookingStatus"]
  ) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, bookingStatus: status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleRescheduleBooking = async (
    id: string,
    newDate: string,
    newTimeSlot: string,
    reason?: string
  ) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          id,
          newDate,
          newTimeSlot,
          reason,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error rescheduling booking:", err);
    }
  };

  const handleToggleBlockSlot = async (slot: string) => {
    const existingBlock = blockedSlots.find(
      (b) => b.date === selectedCalendarDate && b.timeSlot === slot
    );

    if (existingBlock) {
      try {
        const res = await fetch(`/api/blocks?id=${existingBlock.id}`, {
          method: "DELETE",
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error("Error unblocking:", err);
      }
    } else {
      try {
        const res = await fetch("/api/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: selectedCalendarDate,
            timeSlot: slot,
            reason: blockReason || "Studio Maintenance / Reserved",
          }),
        });
        if (res.ok) {
          setBlockReason("");
          fetchData();
        }
      } catch (err) {
        console.error("Error blocking slot:", err);
      }
    }
  };

  const calendarDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const fullDate = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    return { fullDate, dayLabel };
  });

  return (
    <div className="space-y-10">
      {/* Top Welcome & Quick Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2A878] block mb-1">
            Studio Operations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1716]">
            Operations & Booking Overview
          </h1>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-5 py-2.5 rounded-full bg-white border border-[#E8E2D8] hover:border-[#C2A878] text-xs font-semibold uppercase tracking-wider text-[#1A1716] flex items-center gap-2 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C2A878] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. METRICS CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Bookings"
          value={metrics.totalBookings}
          subtitle="All confirmed & completed"
          icon={Camera}
          trend={{ value: "+22% this month", positive: true }}
        />

        <MetricsCard
          title="Total Studio Revenue"
          value={formatGHS(metrics.totalRevenue)}
          subtitle="Combined booking value"
          icon={DollarSign}
          trend={{ value: "+30% YoY", positive: true }}
        />

        <MetricsCard
          title="Deposits Collected"
          value={formatGHS(metrics.depositsCollected)}
          subtitle="30% Paystack payments"
          icon={Sparkles}
        />

        <MetricsCard
          title="Upcoming Shoots"
          value={metrics.upcomingShoots}
          subtitle="Scheduled this week"
          icon={CalendarIcon}
        />
      </div>

      {/* 2. VISUAL CALENDAR & TIME SLOT BLOCKING TOOL */}
      <div className="bg-white border border-[#E8E2D8] rounded-3xl p-7 sm:p-10 shadow-[0_4px_24px_rgba(26,23,22,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E8E2D8]">
          <div>
            <div className="flex items-center gap-2 text-[#1A1716] font-serif font-bold text-2xl">
              <CalendarIcon className="w-5 h-5 text-[#C2A878]" />
              <span>Interactive Calendar & Slot Blockout</span>
            </div>
            <p className="text-xs text-[#7A736E] mt-1 font-light">
              Click any time slot below to lock or unlock it from the public booking scheduler.
            </p>
          </div>

          {/* Quick Date Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {calendarDays.map((cd) => (
              <button
                key={cd.fullDate}
                onClick={() => setSelectedCalendarDate(cd.fullDate)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCalendarDate === cd.fullDate
                    ? "bg-[#C2A878] text-white font-bold shadow-xs"
                    : "bg-[#FAF8F5] text-[#7A736E] hover:text-[#1A1716] border border-[#E8E2D8]"
                }`}
              >
                {cd.dayLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Input */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Reason for blocking slot (e.g. Lens Maintenance, Private Buyout)..."
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className="flex-1 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1A1716] placeholder-[#A49E99] focus:outline-none focus:border-[#C2A878] focus:bg-white transition"
          />
          <span className="text-xs text-[#7A736E] self-center">
            Managing: <strong className="text-[#1A1716]">{selectedCalendarDate}</strong>
          </span>
        </div>

        {/* Time Slots Grid for Selected Date */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {TIME_SLOTS.map((slot) => {
            const isBlocked = blockedSlots.find(
              (b) => b.date === selectedCalendarDate && b.timeSlot === slot
            );
            const activeBooking = bookings.find(
              (b) =>
                b.date === selectedCalendarDate &&
                b.timeSlot === slot &&
                b.bookingStatus !== "cancelled"
            );

            return (
              <div
                key={slot}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                  isBlocked
                    ? "bg-red-50 border-red-200 text-red-900"
                    : activeBooking
                    ? "bg-[#F7F2E7] border-[#EFE8DA] text-[#967E51]"
                    : "bg-[#FAF8F5] border-[#E8E2D8] text-[#1A1716]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#1A1716]">{slot}</span>
                    {isBlocked ? (
                      <Lock className="w-4 h-4 text-red-500" />
                    ) : activeBooking ? (
                      <Camera className="w-4 h-4 text-[#C2A878]" />
                    ) : (
                      <Unlock className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>

                  {isBlocked && (
                    <div className="text-[11px] text-red-600 font-medium leading-tight">
                      Blocked: {isBlocked.reason}
                    </div>
                  )}

                  {activeBooking && !isBlocked && (
                    <div className="text-[11px] text-[#967E51] font-medium truncate">
                      Booked: {activeBooking.clientName}
                    </div>
                  )}

                  {!isBlocked && !activeBooking && (
                    <div className="text-[11px] text-emerald-700 font-medium">
                      Available Slot
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleBlockSlot(slot)}
                  className={`mt-4 py-2 px-3 rounded-xl text-xs font-semibold w-full uppercase tracking-wider transition ${
                    isBlocked
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white hover:bg-[#FAF8F5] border border-[#E8E2D8] text-[#1A1716]"
                  }`}
                >
                  {isBlocked ? "Unblock Slot" : "Block Slot"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SMS GATEWAY DIAGNOSTICS & TEST TOOL */}
      <div className="bg-white border border-[#E8E2D8] rounded-3xl p-7 sm:p-8 shadow-[0_4px_24px_rgba(26,23,22,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F7F2E7] border border-[#EFE8DA] flex items-center justify-center text-[#C2A878]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1A1716]">
                SMS Dispatch & Client Prompt Gateway
              </h3>
              <p className="text-xs text-[#7A736E] font-light">
                Sends automated booking confirmations, 1-hour session prompts, and rescheduling alerts across Ghana.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleTestSms} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter phone number to test SMS (e.g. 0244123456 or +233...)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1A1716] placeholder-[#A49E99] focus:outline-none focus:border-[#C2A878] focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={testingSms || !testPhone.trim()}
            className="px-6 py-3 rounded-xl bg-[#C2A878] hover:bg-[#B29766] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testingSms ? "Sending Test..." : "Send Test SMS"}</span>
          </button>
        </form>

        {smsTestResult && (
          <div
            className={`mt-4 p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
              smsTestResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {smsTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold block">
                {smsTestResult.success ? "SMS Gateway Operational" : "SMS Test Notice"}
              </span>
              <p>{smsTestResult.message || smsTestResult.error}</p>
              <div className="text-[11px] opacity-80 pt-1">
                Provider: <strong>{smsTestResult.provider || "simulated"}</strong> • Sender ID: <strong>{smsTestResult.senderId || "Braosei"}</strong>
                {!smsTestResult.hasApiKeyConfigured && (
                  <span className="block mt-0.5 text-amber-700">
                    ℹ Currently in simulated mode. Add your SMS API key to <code>.env.local</code> to deliver real SMS to mobile networks.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. RECENT BOOKINGS & MANAGEMENT TABLE */}
      <div>
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-bold text-[#1A1716]">Scheduled Sessions</h2>
          <p className="text-xs text-[#7A736E] font-light">
            Manage real-time shoot statuses, connect with clients on WhatsApp, and review session notes.
          </p>
        </div>

        <BookingTable
          bookings={bookings}
          onUpdateStatus={handleUpdateBookingStatus}
          onReschedule={handleRescheduleBooking}
        />
      </div>
    </div>
  );
}
