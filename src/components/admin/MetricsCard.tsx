import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  colorScheme?: "gold" | "emerald" | "cyan" | "purple";
}

export default function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: MetricsCardProps) {
  return (
    <div className="rounded-3xl p-7 bg-white border border-[#E8E2D8] shadow-[0_4px_24px_rgba(26,23,22,0.03)] transition-all hover:border-[#C2A878]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-[#7A736E] uppercase tracking-wider">
          {title}
        </span>
        <div className="p-3 rounded-2xl bg-[#F7F2E7] border border-[#EFE8DA] text-[#C2A878]">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1716] tracking-tight">
          {value}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        {subtitle && <span className="text-[#7A736E] font-light">{subtitle}</span>}
        {trend && (
          <span
            className={`font-semibold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
              trend.positive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
