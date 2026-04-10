import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { Chrome, Download, Shield, Zap, Settings, CheckCircle2, ExternalLink, Lock, ArrowRight, Gift, Users, Wallet, Star } from "lucide-react";
import { Link } from "wouter";

export default function Extension() {
  const { user } = useAuth();

  const downloadUrl = `${import.meta.env.BASE_URL}downloads/custom-extension.zip`;

  const steps = [
    { num: 1, title: "Download the ZIP", desc: "Click the Download button above and save the ZIP file anywhere on your computer." },
    { num: 2, title: "Enable Developer Mode in Chrome", desc: 'Open Chrome → go to chrome://extensions → toggle "Developer mode" ON in the top-right corner.' },
    { num: 3, title: "Remove old extension (if any)", desc: "If BunnyFlow is already installed, remove it first to avoid conflicts." },
    { num: 4, title: "Drag & Drop the ZIP into Chrome", desc: "Drag the downloaded ZIP file and drop it directly onto the chrome://extensions page." },
    { num: 5, title: "⚠️ Enter Server URL before signing in", desc: `Click the BunnyFlow extension icon → find the Server URL field → paste: ${window.location.origin} → click Save.` },
    { num: 6, title: "Sign In", desc: "Enter your BunnyFlow email and password in the extension popup and click Sign In." },
    { num: 7, title: "Visit Google Flow or Whisk", desc: "Open labs.google.com/fx/tools/flow or whisk.google.com — session auto-injects. You'll see a green indicator when connected." },
  ];

  const isFree = (user?.plan || "free").toLowerCase() === "free";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 w-full">

        {/* Free plan notice */}
        {isFree && (
          <div className="rounded-2xl border-2 border-red-500/40 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
            style={{ background: "linear-gradient(135deg,#1a0b0b 0%,#2a0f0f 100%)", boxShadow: "0 0 30px rgba(239,68,68,0.12)" }}>
            <div className="h-12 w-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
              <Lock className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="text-red-400 font-black text-base mb-1">Google Flow Access Locked on Free Plan</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Extension can be downloaded and installed, but <span className="text-red-400 font-semibold">session injection is disabled</span> on the Free plan.
                Upgrade to <span className="text-white font-bold">Basic or Pro</span> to unlock full access.
              </p>
            </div>
            <Link href="/pricing">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white font-black text-sm cursor-pointer hover:bg-[#6d28d9] transition-all shrink-0" style={{ boxShadow: "3px 3px 0px #4c1d95" }}>
                Upgrade Now <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        )}

        {/* Main download card */}
        <div className="rounded-2xl bg-[#1a1528] border border-[#7c3aed]/25 p-8 text-center"
          style={{ boxShadow: "0 0 40px rgba(124,58,237,0.14), 0 2px 12px rgba(0,0,0,0.4)" }}>
          <div className="h-16 w-16 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center mx-auto mb-4" style={{ boxShadow: "0 0 20px rgba(124,58,237,0.35)" }}>
            <Chrome className="h-8 w-8 text-[#a855f7]" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">BunnyFlow Chrome Extension</h1>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Works on <span className="text-[#a855f7] font-semibold">Google Flow</span> &amp; <span className="text-orange-400 font-semibold">Whisk</span>. Auto-injects sessions — install once, works everywhere.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7c3aed] text-white font-bold hover:bg-[#6d28d9] transition-all text-sm"
              style={{ boxShadow: "0 0 18px rgba(124,58,237,0.4)" }}
            >
              <Download className="h-4 w-4" /> Download Extension
            </a>
            <a
              href="chrome://extensions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:bg-white/8 transition-all text-sm"
            >
              <ExternalLink className="h-4 w-4" /> chrome://extensions
            </a>
          </div>
          <p className="text-xs text-gray-600 mt-3">Requires Chrome or Edge · Manifest V3 · Google Flow + Whisk</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Shield, title: "Admin sessions", desc: "No personal Google account needed — all managed." },
            { icon: Zap, title: "Auto model select", desc: "Selects Veo Fast [Lower Priority] automatically." },
            { icon: Settings, title: "Auto inject", desc: "Injects session when you open Flow or Whisk." },
            { icon: Lock, title: "Account locked", desc: "ULTRA + M avatar blocked on Whisk — secure." },
          ].map(f => (
            <div key={f.title} className="rounded-2xl bg-[#1a1528] border border-white/8 p-4">
              <div className="h-8 w-8 rounded-xl bg-[#7c3aed]/15 flex items-center justify-center mb-2">
                <f.icon className="h-4 w-4 text-[#a855f7]" />
              </div>
              <h3 className="font-bold text-white text-xs mb-1">{f.title}</h3>
              <p className="text-gray-500 text-[10px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Server URL */}
        <div className="rounded-2xl bg-[#0d0b14] border border-[#7c3aed]/20 p-5">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">Your Server URL (enter in extension popup)</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-[#1a1528] border border-white/10 rounded-lg px-4 py-2.5 text-[#a855f7] font-mono text-sm">
              {window.location.origin}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.origin)}
              className="px-4 py-2.5 rounded-lg bg-[#7c3aed]/20 border border-[#7c3aed]/30 text-[#a855f7] text-sm font-bold hover:bg-[#7c3aed]/30 transition-all whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Installation steps */}
        <div className="rounded-2xl bg-[#1a1528] border border-white/8 p-6">
          <h2 className="text-lg font-black text-white mb-5">Installation Guide</h2>
          <div className="space-y-4">
            {steps.map(step => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="h-7 w-7 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5">{step.num}</div>
                <div>
                  <p className="text-white font-bold text-sm">{step.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account ready */}
        {user && (
          <div className="rounded-2xl bg-[#0d0b14] border border-white/8 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white font-bold text-sm">Your account is ready</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Logged in as <span className="text-[#a855f7]">{user.email}</span> · {user.plan?.toUpperCase()} plan
                  {user.daysRemaining != null && ` · ${user.daysRemaining} day${user.daysRemaining === 1 ? "" : "s"} left`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plan upgrade */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-[#a855f7]" />
            <h2 className="text-white font-black text-lg">Unlock Full Google Flow Access</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border-2 border-blue-500/25 p-6 flex flex-col gap-4"
              style={{ background: "linear-gradient(135deg,#0d1020 0%,#101830 100%)" }}>
              <div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Basic Plan</div>
                <div className="text-3xl font-black text-white mb-0.5">15 Days</div>
                <div className="text-gray-500 text-xs">Unlimited Google Flow access</div>
              </div>
              <ul className="space-y-1.5 flex-1">
                {["✓  Full Google Flow + Whisk access", "✓  Veo Fast [Lower Priority] unlocked", "✓  15 days unlimited usage"].map(f => (
                  <li key={f} className="text-gray-400 text-xs">{f}</li>
                ))}
              </ul>
              <Link href="/pricing">
                <div className="w-full text-center px-4 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-sm cursor-pointer hover:bg-blue-600/30 transition-all">View Basic Plan →</div>
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-[#7c3aed]/50 p-6 flex flex-col gap-4 relative"
              style={{ background: "linear-gradient(135deg,#1a0f35 0%,#2d1a5e 100%)", boxShadow: "5px 5px 0px #4c1d95" }}>
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-black uppercase tracking-widest bg-[#7c3aed] text-white px-2 py-1 rounded-full">Best Value</span>
              </div>
              <div>
                <div className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest mb-1">Pro Plan</div>
                <div className="text-3xl font-black text-white mb-0.5">30 Days</div>
                <div className="text-gray-500 text-xs">Maximum access</div>
              </div>
              <ul className="space-y-1.5 flex-1">
                {["✓  Full Google Flow + Whisk access", "✓  All models unlocked", "✓  30 days unlimited usage"].map(f => (
                  <li key={f} className="text-gray-400 text-xs">{f}</li>
                ))}
              </ul>
              <Link href="/pricing">
                <div className="w-full text-center px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white font-bold text-sm cursor-pointer hover:bg-[#6d28d9] transition-all" style={{ boxShadow: "2px 2px 0px #4c1d95" }}>View Pro Plan →</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Referral */}
        <div className="rounded-2xl border-2 border-[#7c3aed]/35 p-6"
          style={{ background: "linear-gradient(135deg,#0f0b1e 0%,#1a1038 100%)", boxShadow: "0 0 30px rgba(124,58,237,0.10)" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center shrink-0">
              <Gift className="h-6 w-6 text-[#a855f7]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-black text-base">Earn Money with Referrals</span>
                <span className="text-[9px] font-black bg-[#a855f7] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Share your referral link. When friends buy a plan, you earn real USD.
                <span className="text-[#a855f7] font-semibold"> Basic = $0.15 · Pro = $0.21</span>
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                {[
                  { icon: Users, label: "No referral limit" },
                  { icon: Wallet, label: "Withdraw via Binance / Easypaisa" },
                  { icon: Zap, label: "Instant token rewards" },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <b.icon className="h-3.5 w-3.5 text-[#7c3aed]" />{b.label}
                  </div>
                ))}
              </div>
            </div>
            <Link href="/refer">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-[#a855f7] font-bold text-sm cursor-pointer hover:bg-[#7c3aed]/25 transition-all shrink-0">
                Go to Refer &amp; Earn <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
