import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  Zap, ExternalLink, Lock, Unlock, Image as ImageIcon, Video,
  Music, BookOpen, Brain, Search, PenTool, Clock, AlertTriangle, ArrowRight, Download
} from "lucide-react";
import { Link } from "wouter";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getPlanInfo(plan: string) {
  switch ((plan || "free").toLowerCase()) {
    case "basic": return { label: "Basic Plan",  badge: "Basic", expiry: "15 Days", color: "text-blue-400" };
    case "pro":   return { label: "Pro Plan",    badge: "Pro",   expiry: "30 Days", color: "text-purple-400" };
    default:      return { label: "Free Trial",  badge: "Free",  expiry: "1 Day",   color: "text-gray-400" };
  }
}

const GEMINI_FEATURES = [
  {
    icon: ImageIcon,
    name: "Create Image",
    badge: "New",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    desc: "Generate stunning AI images with Gemini Pro",
    plans: ["pro"],
    color: "#60a5fa",
  },
  {
    icon: PenTool,
    name: "Canvas",
    badge: null,
    badgeColor: "",
    desc: "Collaborative AI canvas for writing and editing",
    plans: ["pro"],
    color: "#a855f7",
  },
  {
    icon: Search,
    name: "Deep Research",
    badge: null,
    badgeColor: "",
    desc: "In-depth research with cited sources and analysis",
    plans: ["pro"],
    color: "#34d399",
  },
  {
    icon: Video,
    name: "Create Video",
    badge: null,
    badgeColor: "",
    desc: "AI-powered video generation inside Gemini",
    plans: ["pro"],
    color: "#f59e0b",
  },
  {
    icon: Music,
    name: "Create Music",
    badge: "New",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    desc: "Generate original music and audio with AI",
    plans: ["pro"],
    color: "#ec4899",
  },
  {
    icon: BookOpen,
    name: "Guided Learning",
    badge: null,
    badgeColor: "",
    desc: "Interactive AI tutor for any subject or skill",
    plans: ["pro"],
    color: "#06b6d4",
  },
  {
    icon: Brain,
    name: "Deep Think",
    badge: "New",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    desc: "Extended reasoning mode for complex problems",
    plans: ["pro"],
    color: "#8b5cf6",
  },
];

export default function GeminiAccess() {
  const { user, token } = useAuth();
  const planInfo = getPlanInfo(user?.plan || "free");
  const plan = (user?.plan || "free").toLowerCase();
  const hasGemini = plan === "pro" || plan === "basic";
  const geminiExtUrl = token
    ? `${API_BASE}/extension/gemini-download?token=${encodeURIComponent(token)}`
    : "#";
  const isExpired = (user?.daysRemaining != null && user.daysRemaining <= 0) ||
                    (user?.planExpiresAt != null && new Date(user.planExpiresAt).getTime() < Date.now());

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full" style={FONT}>

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              Gemini <span className="text-[#06b6d4]">Pro</span> Access
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {hasGemini ? "Your Gemini Pro session is active — all features unlocked" : "Upgrade to Pro to unlock Gemini Ultra features"}
            </p>
          </div>
          <Link href="/pricing">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1528] border border-white/10 text-white text-sm font-bold cursor-pointer hover:border-[#7c3aed]/50 transition-all"
              style={{ boxShadow: "0 0 14px rgba(124,58,237,0.12)" }}>
              <Zap className="h-4 w-4 text-[#a855f7]" />
              {planInfo.badge} Plan
            </div>
          </Link>
        </div>

        {/* ── PLAN CARD ── */}
        <div className="rounded-2xl bg-[#1a1528] border border-[#06b6d4]/25 p-6 w-full"
          style={{ boxShadow: "0 0 40px rgba(6,182,212,0.10), 0 2px 12px rgba(0,0,0,0.4)" }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center"
                style={{ boxShadow: "0 0 10px rgba(6,182,212,0.3)" }}>
                <Zap className="h-4 w-4 text-[#06b6d4]" />
              </div>
              <span className="text-white font-bold text-sm">{planInfo.label}</span>
            </div>
            {!hasGemini && (
              <Link href="/pricing">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#06b6d4] text-white text-sm font-bold cursor-pointer hover:bg-[#0891b2] transition-colors"
                  style={{ boxShadow: "0 0 14px rgba(6,182,212,0.35)" }}>
                  Upgrade to Pro <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            )}
          </div>

          <div className="flex items-end justify-between mb-3">
            <span className={`text-5xl font-black tracking-tight ${isExpired ? "text-red-400" : hasGemini ? "text-[#06b6d4]" : "text-gray-500"}`}>
              {isExpired ? "Expired" : hasGemini ? "Unlocked" : "Locked"}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              {user?.daysRemaining != null ? (
                <span className={user.daysRemaining <= 0 ? "text-red-400 font-bold" : user.daysRemaining <= 2 ? "text-yellow-400 font-bold" : "text-gray-400"}>
                  {user.daysRemaining <= 0 ? "Expired" : `${user.daysRemaining} day${user.daysRemaining === 1 ? "" : "s"} left`}
                </span>
              ) : (
                <>Plan: <span className="text-[#06b6d4] font-bold ml-1">{planInfo.expiry}</span></>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full transition-all ${
              isExpired ? "w-0 bg-red-500" :
              hasGemini ? "w-full bg-gradient-to-r from-[#06b6d4] to-[#a855f7]" :
              "w-0 bg-gray-700"
            }`} />
          </div>

          {isExpired && (
            <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-red-300 text-sm font-semibold flex-1">Your plan has expired. Renew to restore Gemini Pro access.</span>
              <Link href="/pricing">
                <div className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold cursor-pointer hover:bg-red-600 transition-colors shrink-0">
                  Renew Now
                </div>
              </Link>
            </div>
          )}

          {!hasGemini && !isExpired && (
            <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#06b6d4]/8 border border-[#06b6d4]/20">
              <Lock className="h-4 w-4 text-[#06b6d4] shrink-0" />
              <span className="text-gray-300 text-sm font-semibold flex-1">Gemini access requires a <span className="text-[#06b6d4] font-black">Basic or Pro Plan</span>. Free plan does not include Gemini.</span>
              <Link href="/pricing">
                <div className="px-4 py-1.5 rounded-lg bg-[#06b6d4] text-white text-xs font-bold cursor-pointer hover:bg-[#0891b2] transition-colors shrink-0 whitespace-nowrap">
                  Upgrade
                </div>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            {[
              { label: "Free · No Access",      match: "free"  },
              { label: "Basic · Gemini Unlock", match: "basic" },
              { label: "Pro · Gemini Unlock",   match: "pro"   },
            ].map((t) => {
              const active = plan === t.match;
              return (
                <span key={t.match} className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                  active ? "bg-[#06b6d4] text-white" : "bg-white/5 text-gray-500"
                }`}>
                  {t.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── GEMINI PRO FEATURES ── */}
        <div className="rounded-2xl bg-[#1a1528] border border-white/8 p-5 w-full"
          style={{ boxShadow: "0 0 24px rgba(6,182,212,0.06), 0 2px 8px rgba(0,0,0,0.25)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-lg bg-[#06b6d4]/20 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-[#06b6d4]" />
            </div>
            <span className="text-white font-bold text-sm">Gemini Pro Tools</span>
            <span className="ml-auto text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
              Basic & Pro Plans
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {GEMINI_FEATURES.map((feature) => {
              const Icon = feature.icon;
              const unlocked = hasGemini && !isExpired;
              return (
                <div key={feature.name}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    unlocked ? "bg-[#06b6d4]/8 border-[#06b6d4]/20" : "bg-white/3 border-white/5 opacity-50"
                  }`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${unlocked ? "bg-[#1a1528]" : "bg-white/5"}`}
                    style={unlocked ? { boxShadow: `0 0 10px ${feature.color}30` } : {}}>
                    <Icon className="h-4 w-4" style={{ color: unlocked ? feature.color : "#4b5563" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${unlocked ? "text-white" : "text-gray-600"}`}>{feature.name}</span>
                      {feature.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${
                          unlocked ? feature.badgeColor : "bg-white/5 text-gray-600 border-white/5"
                        }`}>{feature.badge}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{feature.desc}</div>
                  </div>

                  <div className="shrink-0">
                    {unlocked
                      ? <Unlock className="h-3.5 w-3.5 text-green-400" />
                      : <Lock className="h-3.5 w-3.5 text-gray-600" />
                    }
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-gray-600 mt-3 text-center">
            Extension injects your session automatically · History hidden · Account switcher locked
          </p>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="rounded-2xl bg-[#1a1528] border border-white/8 p-5 w-full">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">How It Works</p>
          <div className="space-y-3">
            {[
              { n: "1", text: "Make sure BunnyFlow Chrome extension is installed and logged in" },
              { n: "2", text: 'Click "Open Gemini Pro" below — your session is auto-connected' },
              { n: "3", text: "Gemini opens with your Pro account — all tools and features unlocked" },
              { n: "4", text: "Chat history is hidden and account switcher is locked for security" },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#06b6d4]/20 text-[#06b6d4] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-[#06b6d4]/30">
                  {s.n}
                </div>
                <span className="text-gray-300 text-sm leading-relaxed">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── GEMINI EXTENSION DOWNLOAD ── */}
        <div
          className="rounded-2xl border border-[#06b6d4]/25 p-4 flex items-center gap-4"
          style={{ background: "rgba(6,182,212,0.04)" }}
        >
          <div className="h-9 w-9 rounded-lg bg-[#06b6d4]/15 border border-[#06b6d4]/25 flex items-center justify-center shrink-0">
            <Download className="h-4 w-4 text-[#06b6d4]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">BunnyFlow Gemini Extension</p>
            <p className="text-gray-500 text-xs">Dedicated Gemini-only extension — separate from Flow extension</p>
          </div>
          <a
            href={hasGemini ? geminiExtUrl : "#"}
            download={hasGemini && token ? "bunnyflow-gemini-extension.zip" : undefined}
            onClick={!hasGemini ? (e) => e.preventDefault() : undefined}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all shrink-0"
            style={hasGemini ? {
              background: "linear-gradient(135deg,#0891b2,#06b6d4)",
              color: "#fff",
              boxShadow: "0 0 12px rgba(6,182,212,0.3)",
            } : {
              background: "rgba(255,255,255,0.05)",
              color: "#64748b",
              cursor: "not-allowed"
            }}
          >
            <Download className="h-3 w-3" />
            {hasGemini ? "Download" : "Upgrade to Download"}
          </a>
        </div>

        {/* ── COMING SOON BANNER ── */}
        <div className="w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-[#06b6d4]/20"
          style={{ background: "linear-gradient(135deg, #061520 0%, #0a1f2e 100%)" }}>
          <div className="flex items-center gap-2.5 mb-1">
            <Clock className="h-5 w-5 text-[#06b6d4]" />
            <span className="text-white font-black text-lg">Coming Soon</span>
          </div>
          <span className="text-gray-500 text-sm text-center max-w-xs leading-relaxed">
            Gemini Pro access is being set up — it will be available very soon. Stay tuned!
          </span>
          <span className="mt-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#06b6d4]/15 border border-[#06b6d4]/25 text-[#06b6d4]">
            Under Setup
          </span>
        </div>

      </div>
    </DashboardLayout>
  );
}
