"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, CalendarDays } from "lucide-react";

interface DateOption {
  fullDate: string; // YYYY-MM-DD
  dayName: string; // "Mon", "Tue"
  dayNumber: string; // "20"
  monthName: string; // "Oct"
  isToday: boolean;
}

interface DateScrollerProps {
  selectedDate: string;
  selectedTimeSlot: string;
  onSelectDate: (date: string) => void;
  onSelectTimeSlot: (slot: string) => void;
  blockedSlots?: Array<{ date: string; timeSlot: string; reason?: string }>;
  existingBookings?: Array<{ date: string; timeSlot: string }>;
}

export const TIME_SLOTS = [
  "09:00 AM",
  "11:30 AM",
  "02:00 PM",
  "04:30 PM",
  "07:00 PM",
];

export default function DateScroller({
  selectedDate,
  selectedTimeSlot,
  onSelectDate,
  onSelectTimeSlot,
  blockedSlots = [],
  existingBookings = [],
}: DateScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  // Generate next 30 days starting from today
  const dates: DateOption[] = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const fullDate = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = d.getDate().toString();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    const isToday = i === 0;

    return {
      fullDate,
      dayName,
      dayNumber,
      monthName,
      isToday,
    };
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const isSlotUnavailable = (slot: string) => {
    const allDayBlocked = blockedSlots.some(
      (b) => b.date === selectedDate && b.timeSlot === "ALL_DAY"
    );
    if (allDayBlocked) return { unavailable: true, reason: "Studio Closed" };

    const slotBlocked = blockedSlots.find(
      (b) => b.date === selectedDate && b.timeSlot === slot
    );
    if (slotBlocked) return { unavailable: true, reason: slotBlocked.reason || "Slot Blocked" };

    const slotBooked = existingBookings.some(
      (b) => b.date === selectedDate && b.timeSlot === slot
    );
    if (slotBooked) return { unavailable: true, reason: "Session Reserved" };

    return { unavailable: false, reason: "" };
  };

  // Check if current selectedDate is beyond the 30-day ribbon
  const isDateBeyondRibbon = !dates.some((d) => d.fullDate === selectedDate);

  return (
    <div className="space-y-6">
      {/* 1. Date Selection Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-[#1A1716] font-semibold text-sm">
            <Calendar className="w-4 h-4 text-[#C2A878]" />
            <span className="font-serif text-base tracking-wide">Select Shoot Date</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct date picker for dates far in the future */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl px-2.5 py-1 text-xs text-[#1A1716]">
              <CalendarDays className="w-3.5 h-3.5 text-[#C2A878]" />
              <label htmlFor="far-date-picker" className="text-[11px] text-[#7A736E] font-medium hidden sm:inline">
                Pick Far Date:
              </label>
              <input
                id="far-date-picker"
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) onSelectDate(e.target.value);
                }}
                className="bg-transparent text-[#1A1716] text-xs font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            {/* Left/Right scroller arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll dates left"
                className="p-1.5 rounded-lg bg-white border border-[#E8E2D8] text-[#7A736E] hover:text-[#1A1716] hover:border-[#C2A878] transition shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll dates right"
                className="p-1.5 rounded-lg bg-white border border-[#E8E2D8] text-[#7A736E] hover:text-[#1A1716] hover:border-[#C2A878] transition shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected date preview badge if far date picked */}
        {isDateBeyondRibbon && (
          <div className="mb-3 p-3 rounded-xl bg-[#F7F2E7] border border-[#EFE8DA] flex items-center justify-between text-xs text-[#967E51]">
            <span className="font-medium">
              Selected Future Date:{" "}
              <strong className="text-[#1A1716]">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </strong>
            </span>
            <span className="font-bold uppercase tracking-wider text-[10px] bg-white px-2 py-0.5 rounded border border-[#EFE8DA]">
              Custom Date Active
            </span>
          </div>
        )}

        {/* Horizontal Dates Bar */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x select-none"
          style={{ scrollbarWidth: "none" }}
        >
          {dates.map((item) => {
            const isSelected = selectedDate === item.fullDate;
            const hasBlocks = blockedSlots.some((b) => b.date === item.fullDate);

            return (
              <button
                key={item.fullDate}
                type="button"
                onClick={() => onSelectDate(item.fullDate)}
                className={`flex-shrink-0 w-20 py-3.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border snap-start ${
                  isSelected
                    ? "bg-[#C2A878] text-white border-[#C2A878] shadow-[0_6px_20px_rgba(194,168,120,0.35)] scale-105 font-bold"
                    : "bg-white border-[#E8E2D8] text-[#1A1716] hover:border-[#C2A878] hover:bg-[#FAF8F5]"
                }`}
              >
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold ${
                    isSelected ? "text-white/90" : "text-[#7A736E]"
                  }`}
                >
                  {item.dayName}
                </span>
                <span className="font-serif text-2xl font-bold leading-tight my-0.5">
                  {item.dayNumber}
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    isSelected ? "text-white/90 font-bold" : "text-[#7A736E]"
                  }`}
                >
                  {item.monthName}
                </span>

                {item.isToday && !isSelected && (
                  <span className="mt-1 text-[9px] bg-[#F7F2E7] text-[#967E51] px-1.5 py-0.2 rounded font-bold">
                    TODAY
                  </span>
                )}
                {hasBlocks && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2A878] mt-1"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Time Slot Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#1A1716] font-semibold text-sm">
            <Clock className="w-4 h-4 text-[#C2A878]" />
            <span className="font-serif text-base tracking-wide">Available Time Slots</span>
          </div>
          <span className="text-xs text-[#7A736E] font-medium">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {TIME_SLOTS.map((slot) => {
            const status = isSlotUnavailable(slot);
            const isSelected = selectedTimeSlot === slot && !status.unavailable;

            if (status.unavailable) {
              return (
                <div
                  key={slot}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-[#A49E99] flex flex-col items-center justify-center cursor-not-allowed opacity-60"
                  title={status.reason}
                >
                  <span className="text-xs font-medium line-through">{slot}</span>
                  <span className="text-[10px] text-red-500/80 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {status.reason}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelectTimeSlot(slot)}
                className={`p-3.5 rounded-xl text-center transition-all duration-200 border flex flex-col items-center justify-center ${
                  isSelected
                    ? "bg-[#C2A878] text-white border-[#C2A878] shadow-[0_4px_14px_rgba(194,168,120,0.3)] font-bold scale-[1.02]"
                    : "bg-white border-[#E8E2D8] text-[#1A1716] hover:border-[#C2A878] hover:bg-[#FAF8F5]"
                }`}
              >
                <span className="text-sm font-semibold tracking-tight">{slot}</span>
                <span
                  className={`text-[10px] mt-0.5 font-medium ${
                    isSelected ? "text-white/90" : "text-[#967E51]"
                  }`}
                >
                  {isSelected ? "Selected" : "Available"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
