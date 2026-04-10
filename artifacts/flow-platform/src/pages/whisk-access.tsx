import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import {
  Zap, ExternalLink, Lock, Unlock, Image as ImageIcon, Layers,
  Wand2, Palette, RefreshCw, Sliders, Clock, AlertTriangle, ArrowRight
} from "lucide-react";
import { Link } from "wouter";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

function getPlanInfo(plan: string) {
  switch ((plan || "free").toLowerCase()) {
    case "basic": return { label: "Basic Plan", badge: "Basic", expiry: "15 Days", color: "text-blue-400" };
    case "pro":   return { label: "Pro Plan",   badge: "Pro",   expiry: "30 Days", color: "text-purple-400" };
    default:      return { label: "Free Trial", badge: "Free",  expiry: "1 Day",   color: "text-gray-400" };
  }
}

const WHISK_FEATURES = [
  {
    icon: ImageIcon,
    name: "Image Generation",
    badge: null,
    badgeColor: "",
    desc: "Generate stunning images from text prompts with Whisk AI",
    color: "#f97316",
  },
  {
    icon: Wand2,
    name: "Style Transfer",
    badge: null,
    badgeColor: "",
    desc: "Apply artistic styles to any image with AI-powered transfer",
    color: "#fb923c",
  },
  {
    icon: Layers,
    name: "Image Remix",
    badge: "New",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    desc: "Remix and blend multiple images into creative compositions",
    color: "#f59e0b",
  },
  {
    icon: Palette,
    name: "Color & Mood Control",
    badge: null,
    badgeColor: "",
    desc: "Fine-tune colors, moods, and visual aesthetics of generated images",
    color: "#ea580c",
  },
  {
    icon: RefreshCw,
    name: "Iterative Editing",
    badge: null,
    badgeColor: "",
    desc: "Refine images step-by-step with natural language instructions",
    color: "#f97316",
  },
  {
    icon: Sliders,
    name: "Advanced Controls",
    badge: null,
    badgeColor: "",
    desc: "Full parameter control for precision AI image generation",
    color: "#fb923c",
  },
];

export default function WhiskAccess() {
  const { user } = useAuth();
  const planInfo = getPlanInfo(user?.plan || "free");
  const plan = (user?.plan || "free").toLowerCase();
  const hasWhisk = plan === "pro" || plan === "basic";
  const isExpired = (user?.daysRemaining != null && user.daysRemaining <= 0) ||
                    (user?.planExpiresAt != null && new Date(user.planExpiresAt).getTime() < Date.now());

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full" style={FONT}>

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              Whisk <span className="text-[#f97316]">Access</span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {hasWhisk ? "Your Whisk session is active — AI image generation unlocked" : "Upgrade to Basic or Pro to unlock Whisk"}
            </p>
          </div>
          <Link href="/pricing">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1528] border border-white/10 text-white text-sm font-bold cursor-pointer hover:border-[#f97316]/50 transition-all"
              style={{ boxShadow: "0 0 14px rgba(249,115,22,0.12)" }}>
              <Zap className="h-4 w-4 text-[#f97316]" />
              {planInfo.badge} Plan
            </div>
          </Link>
        </div>

        {/* ── PLAN CARD ── */}
        <div className="rounded-2xl bg-[#1a1528] border border-[#f97316]/25 p-6 w-full"
          style={{ boxShadow: "0 0 40px rgba(249,115,22,0.10), 0 2px 12px rgba(0,0,0,0.4)" }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#f97316]/20 flex items-center justify-center"
                style={{ boxShadow: "0 0 10px rgba(249,115,22,0.3)" }}>
                <Wand2 className="h-4 w-4 text-[#f97316]" />
              </div>
              <span className="text-white font-bold text-sm">{planInfo.label}</span>
            </div>
            {!hasWhisk && (
              <Link href="/pricing">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f97316] text-white text-sm font-bold cursor-pointer hover:bg-[#ea580c] transition-colors"
                  style={{ boxShadow: "0 0 14px rgba(249,115,22,0.35)" }}>
                  Upgrade <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            )}
          </div>

          <div className="flex items-end justify-between mb-3">
            <span className={`text-5xl font-black tracking-tight ${isExpired ? "text-red-400" : hasWhisk ? "text-[#f97316]" : "text-gray-500"}`}>
              {isExpired ? "Expired" : hasWhisk ? "Unlocked" : "Locked"}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              {user?.daysRemaining != null ? (
                <span className={user.daysRemaining <= 0 ? "text-red-400 font-bold" : user.daysRemaining <= 2 ? "text-yellow-400 font-bold" : "text-gray-400"}>
                  {user.daysRemaining <= 0 ? "Expired" : `${user.daysRemaining} day${user.daysRemaining === 1 ? "" : "s"} left`}
                </span>
              ) : (
                <>Plan: <span className="text-[#f97316] font-bold ml-1">{planInfo.expiry}</span></>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full transition-all ${
              isExpired ? "w-0 bg-red-500" :
              hasWhisk ? "w-full bg-gradient-to-r from-[#f97316] to-[#f59e0b]" :
              "w-0 bg-gray-700"
            }`} />
          </div>

          {isExpired && (
            <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-red-300 text-sm font-semibold flex-1">Your plan has expired. Renew to restore Whisk access.</span>
              <Link href="/pricing">
                <div className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold cursor-pointer hover:bg-red-600 transition-colors shrink-0">
                  Renew Now
                </div>
              </Link>
            </div>
          )}

          {!hasWhisk && !isExpired && (
            <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f97316]/8 border border-[#f97316]/20">
              <Lock className="h-4 w-4 text-[#f97316] shrink-0" />
              <span className="text-gray-300 text-sm font-semibold flex-1">Whisk access requires a <span className="text-[#f97316] font-black">Basic or Pro Plan</span>. Free plan does not include Whisk.</span>
              <Link href="/pricing">
                <div className="px-4 py-1.5 rounded-lg bg-[#f97316] text-white text-xs font-bold cursor-pointer hover:bg-[#ea580c] transition-colors shrink-0 whitespace-nowrap">
                  Upgrade
                </div>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            {[
              { label: "Free · No Access",      match: "free"  },
              { label: "Basic · Whisk Unlock",  match: "basic" },
              { label: "Pro · Whisk Unlock",    match: "pro"   },
            ].map((t) => {
              const active = plan === t.match;
              return (
                <span key={t.match} className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                  active ? "bg-[#f97316] text-white" : "bg-white/5 text-gray-500"
                }`}>
                  {t.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── WHISK FEATURES ── */}
        <div className="rounded-2xl bg-[#1a1528] border border-white/8 p-5 w-full"
          style={{ boxShadow: "0 0 24px rgba(249,115,22,0.06), 0 2px 8px rgba(0,0,0,0.25)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-lg bg-[#f97316]/20 flex items-center justify-center">
              <Wand2 className="h-3.5 w-3.5 text-[#f97316]" />
            </div>
            <span className="text-white font-bold text-sm">Whisk AI Tools</span>
            <span className="ml-auto text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
              Basic & Pro Plans
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {WHISK_FEATURES.map((feature) => {
              const Icon = feature.icon;
              const unlocked = hasWhisk && !isExpired;
              return (
                <div key={feature.name}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    unlocked ? "bg-[#f97316]/8 border-[#f97316]/20" : "bg-white/3 border-white/5 opacity-50"
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
            Extension injects your session automatically · Account switcher locked for security
          </p>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="rounded-2xl bg-[#1a1528] border border-white/8 p-5 w-full">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">How It Works</p>
          <div className="space-y-3">
            {[
              { n: "1", text: "Make sure BunnyFlow Chrome extension (v3.6+) is installed and logged in" },
              { n: "2", text: 'Click "Open Whisk" below — your session is auto-injected via extension' },
              { n: "3", text: "Whisk opens with your Pro account — all AI image generation tools unlocked" },
              { n: "4", text: "Extension uses dedicated Whisk sessions (separate from Gemini sessions)" },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#f97316]/20 text-[#f97316] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-[#f97316]/30">
                  {s.n}
                </div>
                <span className="text-gray-300 text-sm leading-relaxed">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BIG ACCESS BUTTON ── */}
        {hasWhisk && !isExpired ? (
          <a href="https://labs.google/fx/tools/whisk/project" target="_blank" rel="noopener noreferrer"
            className="block w-full">
            <div className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 hover:scale-[1.01] cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
                boxShadow: "0 0 30px rgba(249,115,22,0.35), 4px 4px 0px #c2410c"
              }}>
              <Wand2 className="h-5 w-5" />
              Open Whisk
              <ExternalLink className="h-4 w-4 opacity-70" />
            </div>
          </a>
        ) : (
          <Link href="/pricing">
            <div className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #1a1528, #2a1a0a)",
                boxShadow: "0 0 20px rgba(249,115,22,0.2), 4px 4px 0px #1a0f03",
                border: "1px solid rgba(249,115,22,0.3)"
              }}>
              <Lock className="h-5 w-5 text-gray-400" />
              <span className="text-gray-300">Upgrade to Unlock Whisk</span>
              <ArrowRight className="h-4 w-4 text-gray-500" />
            </div>
          </Link>
        )}

      </div>
    </DashboardLayout>
  );
}
