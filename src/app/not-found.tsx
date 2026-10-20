import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F0EB] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">404 Error</span>
        <h2 className="font-serif text-3xl font-bold text-[#1A1716]">Page Not Found</h2>
        <p className="text-xs text-[#7A736E] leading-relaxed">
          The requested page could not be located. Return to the studio booking page to reserve your session.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-[#1A1716] hover:bg-[#C59B27] text-white text-xs font-bold uppercase tracking-wider transition"
          >
            Return to Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
