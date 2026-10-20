"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  STUDIO_PACKAGES,
  STUDIO_EXTRAS,
  formatGHS,
  calculatePaymentBreakdown,
  initializePaystackPayment,
  StudioPackage,
} from "@/lib/paystack";
import DateScroller, { TIME_SLOTS } from "@/components/client/DateScroller";
import {
  Check,
  CreditCard,
  Banknote,
  CheckCircle2,
  Sparkles,
  Mail,
  Bell,
  AlertCircle,
  Clock,
  Instagram,
  MapPin,
  Calendar,
  Info,
} from "lucide-react";

function BookingApp() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>("standard");

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(TIME_SLOTS[1]);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [shootNotes, setShootNotes] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "cash">("paystack");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [blockedSlots, setBlockedSlots] = useState<Array<{ date: string; timeSlot: string; reason?: string }>>([]);
  const [existingBookings, setExistingBookings] = useState<Array<{ date: string; timeSlot: string }>>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  useEffect(() => {
    async function loadAvailability() {
      try {
        const [blocksRes, bookingsRes] = await Promise.all([
          fetch("/api/blocks"),
          fetch("/api/bookings"),
        ]);
        if (blocksRes.ok) {
          const data = await blocksRes.json();
          setBlockedSlots(data.blocks || []);
        }
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setExistingBookings(
            (data.bookings || []).map((b: any) => ({
              date: b.date,
              timeSlot: b.timeSlot,
            }))
          );
        }
      } catch (err) {
        console.error("Availability load error:", err);
      }
    }
    loadAvailability();
  }, []);

  const selectedPkg: StudioPackage =
    STUDIO_PACKAGES.find((p) => p.id === selectedPackageId) || STUDIO_PACKAGES[1];

  const breakdown = calculatePaymentBreakdown(selectedPkg.price, selectedPkg.depositPercent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setErrorMsg("Please provide your name, email, and phone number.");
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      setErrorMsg("Please choose an available date and time slot.");
      return;
    }

    setLoading(true);

    if (paymentMethod === "paystack") {
      const tempRef = `BOS_PAY_${Date.now()}`;
      initializePaystackPayment({
        email: clientEmail,
        amount: breakdown.depositAmount,
        currency: "GHS",
        reference: tempRef,
        metadata: {
          clientName,
          clientPhone,
          packageName: selectedPkg.name,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
        },
        onSuccess: async (res) => {
          await finalizeBooking("paystack", res.reference);
        },
        onCancel: () => {
          setLoading(false);
          setErrorMsg("Paystack payment cancelled. Booking not confirmed.");
        },
      });
    } else {
      await finalizeBooking("cash", `CASH_${Date.now()}`);
    }
  };

  const finalizeBooking = async (method: "paystack" | "cash", reference: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          packageId: selectedPkg.id,
          paymentMethod: method,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          notes: shootNotes,
          reference,
        }),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setConfirmedBooking(data.booking);
      } else {
        setErrorMsg(data.error || "Failed to confirm booking.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while saving booking.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CONFIRMATION VIEW (Details Saved, Email Sent, 1hr SMS Prompt)
  // -------------------------------------------------------------
  if (confirmedBooking) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="bg-white border-2 border-[#C59B27] rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_rgba(197,155,39,0.15)] text-center">
          <div className="w-16 h-16 rounded-full bg-[#F7F2E7] border-2 border-[#C59B27] flex items-center justify-center mx-auto mb-5 text-[#C59B27] shadow-sm">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-[#B8860B] block mb-1">
            Booking Confirmed & Saved
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1716] mb-2">
            Your Session Is Locked In
          </h2>
          <p className="text-xs text-[#7A736E] mb-6">
            Reference ID: <span className="font-mono font-bold text-[#1A1716] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E2D8]">{confirmedBooking.id}</span>
          </p>

          {/* Session Overview Box */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E2D8] text-left mb-6 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-[#E8E2D8] pb-2">
              <span className="text-[#7A736E]">Photography Package:</span>
              <span className="font-bold text-[#1A1716]">{confirmedBooking.packageName}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D8] pb-2">
              <span className="text-[#7A736E]">Date & Scheduled Slot:</span>
              <span className="font-bold text-[#C59B27]">{confirmedBooking.date} • {confirmedBooking.timeSlot}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D8] pb-2">
              <span className="text-[#7A736E]">Studio Location:</span>
              <span className="font-semibold text-[#1A1716]">F. W. H Migeod Avenue, Takoradi</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D8] pb-2">
              <span className="text-[#7A736E]">Client Name:</span>
              <span className="font-medium text-[#1A1716]">{confirmedBooking.clientName}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D8] pb-2">
              <span className="text-[#7A736E]">Payment Status:</span>
              <span className="font-bold text-[#1A1716] capitalize">
                {confirmedBooking.paymentMethod === "paystack" ? "Paystack 30% Deposit (Paid)" : "Cash on Arrival (Pending)"}
              </span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-[#1A1716]">
              <span>Balance Due at Studio:</span>
              <span className="text-[#B8860B]">{formatGHS(confirmedBooking.balanceDue)}</span>
            </div>
          </div>

          {/* Automatic System Notifications Box */}
          <div className="bg-[#F7F2E7] border border-[#EFE8DA] rounded-2xl p-4 mb-6 text-left space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1A1716] block">Confirmation Email Dispatched</span>
                <span className="text-[#7A736E] text-[11px]">
                  A complete receipt, shoot brief, and studio directions have been sent to <strong>{confirmedBooking.clientEmail}</strong>.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-[#EFE8DA]">
              <Bell className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1A1716] block">Automated 1-Hour Reminder SMS</span>
                <span className="text-[#7A736E] text-[11px]">
                  Our automated prompt system will send an SMS to <strong>{confirmedBooking.clientPhone}</strong> exactly 1 hour before your session.
                </span>
              </div>
            </div>
          </div>

          {/* Rescheduling Policy Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2 text-left mb-6">
            <Info className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
            <span>
              <strong>Rescheduling Policy:</strong> Please arrive on time. Rescheduling a confirmed session attracts an administrative fee.
            </span>
          </div>

          <button
            onClick={() => {
              setConfirmedBooking(null);
              setClientName("");
              setClientEmail("");
              setClientPhone("");
              setShootNotes("");
            }}
            className="w-full py-3.5 px-6 rounded-full bg-[#1A1716] hover:bg-[#C59B27] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            Done • Book Another Session
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MINIMAL DIRECT BOOKING VIEW
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header: Subheader set to "Studio session booking, Takoradi" */}
      <div className="border-b border-[#E8E2D8] pb-6 mb-8 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#1A1716] tracking-tight">
          BRAOSEI STUDIOS
        </h1>
        <p className="text-xs sm:text-sm text-[#B8860B] font-bold uppercase tracking-widest mt-1">
          Studio Session Booking, Takoradi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. PACKAGES (FIRST THING YOU SEE) */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1716]">
              1. Select Photography Package
            </h2>
            <span className="text-xs text-[#7A736E] font-medium">Choose your session</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {STUDIO_PACKAGES.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;
              const pkgBreakdown = calculatePaymentBreakdown(pkg.price, pkg.depositPercent);

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-150 border flex flex-col justify-between ${
                    isSelected
                      ? "bg-white border-2 border-[#C59B27] shadow-[0_6px_22px_rgba(197,155,39,0.3)] scale-[1.01]"
                      : "bg-white border-[#E8E2D8] hover:border-[#C59B27]/60 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif text-lg font-bold text-[#1A1716]">
                        {pkg.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#C59B27]" />
                      )}
                    </div>

                    {pkg.startingFrom && (
                      <span className="text-[10px] text-[#C59B27] font-bold uppercase tracking-wider block">
                        Starting from
                      </span>
                    )}

                    <div className="font-serif text-3xl font-extrabold text-[#1A1716] mb-1">
                      {formatGHS(pkg.price)}
                    </div>

                    <div className="text-[11px] font-bold text-[#B8860B] mb-3">
                      30% Deposit: {formatGHS(pkgBreakdown.depositAmount)}
                    </div>

                    <ul className="space-y-1.5 text-xs text-[#383330] mb-4">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#C59B27] font-bold">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2.5 border-t border-[#E8E2D8] flex items-center justify-between text-[11px] text-[#7A736E]">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-[#C59B27]" />
                      {pkg.duration}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* EXTRAS & ADD-ONS NOTICE */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D8] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1716] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Extras & Add-Ons Available</span>
          </div>

          <p className="text-xs text-[#7A736E] mb-3 font-light">
            Need video reels, extra outfits, RAW unedited access, or frames? Request them in your notes:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px]">
            {STUDIO_EXTRAS.map((extra) => (
              <div key={extra.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8]">
                <div className="font-bold text-[#1A1716]">{extra.title}</div>
                <div className="text-[10px] text-[#C59B27] font-bold">{extra.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. DATE & TIME SELECTION */}
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1716] mb-4">
            2. Choose Date & Time
          </h2>

          <DateScroller
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onSelectDate={setSelectedDate}
            onSelectTimeSlot={setSelectedTimeSlot}
            blockedSlots={blockedSlots}
            existingBookings={existingBookings}
          />
        </div>

        {/* 3. CLIENT DETAILS */}
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1716] mb-4">
            3. Client Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1716] uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kwame Mensah"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1716] placeholder-[#A49E99] focus:outline-none focus:border-[#C59B27] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1716] uppercase tracking-wider mb-1.5">
                Email Address * (For Confirmation & Guidelines)
              </label>
              <input
                type="email"
                required
                placeholder="kwame@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1716] placeholder-[#A49E99] focus:outline-none focus:border-[#C59B27] focus:bg-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-[#1A1716] uppercase tracking-wider mb-1.5">
              Phone / WhatsApp * (For 1-Hour Reminder SMS Prompt)
            </label>
            <input
              type="tel"
              required
              placeholder="+233 24 000 0000"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1716] placeholder-[#A49E99] focus:outline-none focus:border-[#C59B27] focus:bg-white"
            />
            <span className="text-[11px] text-[#7A736E] mt-1 block">
              You will receive an automated SMS reminder exactly 1 hour before your shoot.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1716] uppercase tracking-wider mb-1.5">
              Session Notes & Requested Extras (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 2 looks, outfit concepts, requested video reel or physical frames..."
              value={shootNotes}
              onChange={(e) => setShootNotes(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl p-3 text-sm text-[#1A1716] placeholder-[#A49E99] focus:outline-none focus:border-[#C59B27] focus:bg-white"
            />
          </div>
        </div>

        {/* 4. PAYMENT OPTIONS */}
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1716] mb-4">
            4. Payment Option
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div
              onClick={() => setPaymentMethod("paystack")}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                paymentMethod === "paystack"
                  ? "bg-[#FAF8F5] border-2 border-[#C59B27] shadow-sm"
                  : "bg-white border-[#E8E2D8] hover:border-[#C59B27]/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-[#1A1716] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#C59B27]" />
                  Paystack (30% Deposit)
                </span>
                {paymentMethod === "paystack" && <CheckCircle2 className="w-4 h-4 text-[#C59B27]" />}
              </div>
              <p className="text-xs text-[#7A736E] mb-2 font-light">
                Pay 30% deposit now via Mobile Money or Card. Remaining 70% paid on shoot day.
              </p>
              <div className="text-xs font-bold text-[#B8860B]">
                Deposit: {formatGHS(breakdown.depositAmount)}
              </div>
            </div>

            <div
              onClick={() => setPaymentMethod("cash")}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                paymentMethod === "cash"
                  ? "bg-[#FAF8F5] border-2 border-[#C59B27] shadow-sm"
                  : "bg-white border-[#E8E2D8] hover:border-[#C59B27]/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-[#1A1716] flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-[#7A736E]" />
                  Cash on Arrival
                </span>
                {paymentMethod === "cash" && <CheckCircle2 className="w-4 h-4 text-[#C59B27]" />}
              </div>
              <p className="text-xs text-[#7A736E] mb-2 font-light">
                Reserve your slot now and pay in full upon arrival at the studio.
              </p>
              <div className="text-xs font-bold text-[#1A1716]">
                Total on Arrival: {formatGHS(selectedPkg.price)}
              </div>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E2D8] text-xs space-y-1">
            <div className="flex justify-between text-[#7A736E]">
              <span>Selected: <strong>{selectedPkg.name}</strong> ({selectedDate} at {selectedTimeSlot})</span>
              <span>Total: <strong>{formatGHS(selectedPkg.price)}</strong></span>
            </div>
            {paymentMethod === "paystack" && (
              <div className="flex justify-between text-[#B8860B] font-bold border-t border-[#E8E2D8] pt-1">
                <span>30% Deposit Due Now:</span>
                <span>{formatGHS(breakdown.depositAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rescheduling Notice */}
        <div className="p-4 rounded-2xl bg-[#F7F2E7] border border-[#EFE8DA] text-xs text-[#7A736E] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#1A1716]">Studio Booking Policy:</strong> Please arrive on time. Rescheduling a confirmed session attracts an administrative fee.
          </span>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-[#C59B27] hover:bg-[#B8860B] text-white font-black text-xs uppercase tracking-widest shadow-[0_8px_24px_rgba(197,155,39,0.35)] transition disabled:opacity-50"
        >
          {loading
            ? "Reserving Session..."
            : paymentMethod === "paystack"
            ? `Pay 30% Deposit (${formatGHS(breakdown.depositAmount)})`
            : `Confirm Cash Reservation (${formatGHS(selectedPkg.price)})`}
        </button>
      </form>

      {/* Footer with Location and Instagram */}
      <footer className="mt-16 pt-8 border-t border-[#E8E2D8] text-center text-xs text-[#7A736E] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-[#1A1716] font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#C59B27] shrink-0" />
            <span>Braosei Studios : F. W. H Migeod Avenue, Takoradi</span>
          </div>

          <a
            href="https://instagram.com/braoseistudios"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#C59B27] hover:text-[#B8860B] font-bold transition"
          >
            <Instagram className="w-4 h-4" />
            <span>@braoseistudios</span>
          </a>
        </div>

        <p className="text-[11px] text-[#A49E99]">
          © {new Date().getFullYear()} Braosei Studios. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#7A736E]">Loading studio booking...</div>}>
      <BookingApp />
    </Suspense>
  );
}
