"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, Clock, ArrowRight } from "lucide-react";
import { StudioPackage, calculatePaymentBreakdown, formatGHS } from "@/lib/paystack";

interface PricingCardProps {
  pkg: StudioPackage;
  isSelected?: boolean;
  onSelect?: (pkgId: string) => void;
  showBookLink?: boolean;
}

export default function PricingCard({
  pkg,
  isSelected = false,
  onSelect,
  showBookLink = true,
}: PricingCardProps) {
  const { depositAmount, balanceDue } = calculatePaymentBreakdown(pkg.price, pkg.depositPercent);

  return (
    <div
      className={`relative rounded-3xl p-7 sm:p-8 transition-all duration-300 flex flex-col justify-between bg-white ${
        pkg.popular
          ? "border-2 border-[#C2A878] shadow-[0_16px_40px_-8px_rgba(194,168,120,0.22)]"
          : isSelected
          ? "border-2 border-[#C2A878] shadow-[0_12px_32px_rgba(194,168,120,0.18)]"
          : "border border-[#E8E2D8] shadow-[0_4px_24px_rgba(26,23,22,0.04)] hover:border-[#C2A878]/60 hover:shadow-[0_12px_32px_rgba(26,23,22,0.07)]"
      }`}
    >
      {/* Most Popular Badge */}
      {pkg.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-[#C2A878] text-white text-[11px] font-bold tracking-widest uppercase px-4 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 fill-white" />
            {pkg.badge}
          </span>
        </div>
      )}

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-serif text-2xl font-bold text-[#1A1716] tracking-tight">
            {pkg.name}
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#7A736E] border border-[#E8E2D8] flex items-center gap-1.5 shrink-0">
            <Clock className="w-3 h-3 text-[#C2A878]" />
            {pkg.duration}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#7A736E] mb-6 leading-relaxed">
          {pkg.tagline}
        </p>

        {/* Pricing Display */}
        <div className="mb-6 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]/80">
          {pkg.startingFrom && (
            <span className="text-[11px] text-[#C2A878] font-bold uppercase tracking-wider block mb-1">
              Starting from
            </span>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1716] tracking-tight">
              {formatGHS(pkg.price)}
            </span>
            <span className="text-xs text-[#7A736E] uppercase font-medium">/ session</span>
          </div>

          {/* 30% Paystack Deposit Highlight */}
          <div className="mt-3 pt-3 border-t border-[#E8E2D8] flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center text-[#1A1716] font-medium">
              <span className="text-[#7A736E]">30% Deposit due now:</span>
              <span className="font-bold text-[#C2A878]">{formatGHS(depositAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-[#7A736E]">
              <span>Balance on shoot day:</span>
              <span className="font-medium text-[#1A1716]">{formatGHS(balanceDue)}</span>
            </div>
          </div>
        </div>

        {/* Deliverables summary tag */}
        <div className="mb-6 p-3 rounded-xl bg-[#F7F2E7] border border-[#EFE8DA] text-xs text-[#967E51] font-semibold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C2A878] shrink-0" />
          <span>Includes: {pkg.deliverables}</span>
        </div>

        {/* Features list */}
        <ul className="space-y-3 mb-8">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#383330]">
              <div className="w-4 h-4 rounded-full bg-[#F7F2E7] flex items-center justify-center shrink-0 mt-0.5 border border-[#EFE8DA]">
                <Check className="w-2.5 h-2.5 text-[#C2A878] stroke-[3]" />
              </div>
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div>
        {showBookLink ? (
          <Link
            href={`/book?package=${pkg.id}`}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              pkg.popular
                ? "bg-[#C2A878] hover:bg-[#B29766] text-white shadow-[0_8px_20px_rgba(194,168,120,0.3)] hover:scale-[1.01]"
                : "bg-[#1A1716] hover:bg-[#C2A878] text-white shadow-sm"
            }`}
          >
            <span>Book {pkg.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onSelect?.(pkg.id)}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              isSelected
                ? "bg-[#C2A878] text-white shadow-sm"
                : "bg-[#FAF8F5] text-[#1A1716] border border-[#E8E2D8] hover:border-[#C2A878]"
            }`}
          >
            {isSelected ? "Selected Package ✓" : `Select ${pkg.name}`}
          </button>
        )}
      </div>
    </div>
  );
}
