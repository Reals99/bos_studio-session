"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  ExternalLink,
  Sparkles,
  KeyRound,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const CORRECT_PIN = "85410";

  useEffect(() => {
    const authStatus = localStorage.getItem("bos_admin_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.trim() === CORRECT_PIN) {
      localStorage.setItem("bos_admin_auth", "true");
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Incorrect passcode. Please enter the correct PIN.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bos_admin_auth");
    setIsAuthenticated(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F4F0EB] flex items-center justify-center text-[#7A736E]">
        Verifying studio session...
      </div>
    );
  }

  // -------------------------------------------------------------
  // PIN LOGIN WALL
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F0EB] flex items-center justify-center p-6">
        <div className="bg-white border border-[#E8E2D8] rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-[0_20px_50px_rgba(26,23,22,0.06)] relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-[#F7F2E7] border border-[#EFE8DA] flex items-center justify-center mx-auto mb-6 text-[#C2A878] shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#967E51] block mb-1">
              Braosei Studios
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1A1716]">Manager Portal</h2>
            <p className="text-xs text-[#7A736E] mt-1 font-light">
              Enter your studio passcode to access operations, schedule, and client CRM.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#A49E99] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={10}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN (e.g. 85410)"
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl pl-11 pr-4 py-3.5 text-center tracking-widest text-lg font-mono text-[#1A1716] placeholder-[#A49E99] focus:outline-none focus:border-[#C2A878] focus:bg-white transition"
                  autoFocus
                />
              </div>
              {pinError && (
                <p className="text-xs text-red-600 mt-2 text-center font-medium">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#C2A878] hover:bg-[#B29766] text-white font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(194,168,120,0.3)]"
            >
              <span>Unlock Admin Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E8E2D8] text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-[#7A736E] hover:text-[#1A1716] transition inline-flex items-center gap-1"
            >
              <span>← Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN LAYOUT
  // -------------------------------------------------------------
  const navItems = [
    {
      label: "Dashboard & Calendar",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Client CRM Database",
      href: "/admin/crm",
      icon: Users,
      active: pathname === "/admin/crm",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#1A1716] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-18 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1716]">
                BRAOSEI
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#C2A878] uppercase">
                Studio Operations
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden sm:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition ${
                      item.active
                        ? "bg-[#C2A878] text-white font-bold shadow-xs"
                        : "text-[#7A736E] hover:text-[#1A1716] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-[#7A736E] hover:text-[#1A1716] flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-[#FAF8F5] border border-[#E8E2D8] transition"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3 text-[#C2A878]" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-[#7A736E] hover:text-red-600 p-2 rounded-full hover:bg-red-50 border border-transparent hover:border-red-200 transition flex items-center gap-1"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="sm:hidden flex border-t border-[#E8E2D8] px-4 py-2 gap-2 bg-[#FAF8F5]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  item.active
                    ? "bg-[#C2A878] text-white font-bold"
                    : "text-[#7A736E] hover:text-[#1A1716]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
