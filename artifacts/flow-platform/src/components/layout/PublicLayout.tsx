import { Link } from "wouter";
import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { Gift, X } from "lucide-react";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* ── ANNOUNCEMENT BANNER ── */}
      {bannerVisible && (
        <div className="w-full bg-[#0a0a0f] border-b border-[#7c3aed]/20 py-2 flex items-center justify-center relative">
          <Link href="/earn">
            <div className="inline-flex items-center gap-2.5 bg-[#f3f0ff] hover:bg-[#ede8ff] transition-colors rounded-full px-5 py-1.5 cursor-pointer">
              <Gift className="h-4 w-4 text-[#7c3aed] shrink-0" />
              <span className="text-[#7c3aed] font-bold text-sm">Refer &amp; earn up to <span className="font-black">$10</span></span>
            </div>
          </Link>
          <button
            onClick={() => setBannerVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-[#0a0a0f] border-t border-[#7c3aed]/20 py-12">
        <div className="container px-4 sm:px-8 mx-auto max-w-6xl">

          {/* Top row: brand + earn money highlight */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/6">
            <div className="flex items-center gap-3">
              <img src="/bunny-logo.jpeg" alt="BunnyFlow" className="h-9 w-9 rounded-full border-2 border-[#7c3aed]" style={{ boxShadow: "0 0 10px rgba(124,58,237,0.4)" }} />
              <div>
                <span className="font-extrabold text-lg text-white">Bunny<span className="text-[#a855f7]">Flow</span></span>
                <div className="text-gray-600 text-xs">AI Video Platform</div>
              </div>
            </div>

            {/* Earn Money highlight block */}
            <Link href="/earn">
              <div
                className="flex items-center gap-4 rounded-2xl border-2 border-[#7c3aed]/50 px-5 py-3 cursor-pointer hover:border-[#7c3aed] transition-all group"
                style={{ background: "linear-gradient(135deg, #1a0f35 0%, #2d1a5e 100%)", boxShadow: "4px 4px 0px #4c1d95" }}
              >
                <div className="h-9 w-9 rounded-xl bg-[#7c3aed] flex items-center justify-center shrink-0" style={{ boxShadow: "2px 2px 0px #4c1d95" }}>
                  <Gift className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <div className="text-white font-black text-sm flex items-center gap-2">
                    Earn Money
                    <span className="text-[9px] font-black bg-[#a855f7] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">New</span>
                  </div>
                  <div className="text-[#a855f7]/70 text-xs">Refer friends · Earn $0.15–$0.21 per plan</div>
                </div>
                <div className="text-[#7c3aed] group-hover:translate-x-1 transition-transform text-lg font-black shrink-0">→</div>
              </div>
            </Link>
          </div>

          {/* Bottom row: nav links + copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-gray-500">
              <Link href="/pricing" className="hover:text-[#a855f7] transition-colors">Pricing</Link>
              <Link href="/earn" className="hover:text-[#a855f7] transition-colors font-semibold text-[#a855f7]">💰 Earn Money</Link>
              <Link href="/login" className="hover:text-[#a855f7] transition-colors">Login</Link>
              <Link href="/register" className="hover:text-[#a855f7] transition-colors">Sign Up</Link>
            </div>
            <div className="text-gray-700 text-xs">© 2026 BunnyFlow · All rights reserved</div>
          </div>

          {/* Disclaimer + branding line */}
          <div className="border-t border-white/5 pt-5 flex flex-col items-center gap-3 text-center">
            <p className="text-gray-700 text-[11px] max-w-2xl leading-relaxed">
              BunnyFlow works with <span className="text-gray-500 font-semibold">Google Flow (labs.google.com)</span> to provide AI generation services. BunnyFlow is <span className="text-gray-500 font-semibold">not affiliated with, partnered with, or sponsored by Google</span> in any way. All Google trademarks belong to their respective owners.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="text-gray-600 text-xs font-medium">Created with love ❤️ from</span>
              <span className="text-white text-xs font-bold flex items-center gap-1">
                🇵🇰 Pakistan
              </span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
