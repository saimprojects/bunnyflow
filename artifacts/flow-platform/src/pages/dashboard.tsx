import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useGetGenerationStats, getGetGenerationStatsQueryKey } from "@workspace/api-client-react";
import { Loader2, Video, Image as ImageIcon, Zap, Calendar, ArrowRight, Clock, Chrome, Lock, Unlock, Gift, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

function getPlanInfo(plan: string) {
  switch ((plan || "free").toLowerCase()) {
    case "basic": return { label: "Basic Plan",  badge: "Basic", expiry: "15 Days", color: "text-blue-400"   };
    case "pro":   return { label: "Pro Plan",    badge: "Pro",   expiry: "30 Days", color: "text-purple-400" };
    default:      return { label: "Free Trial",  badge: "Free",  expiry: "1 Day",   color: "text-gray-400"   };
  }
}

const ALL_MODELS = [
  {
    type: "video",
    name: "Veo 3.1 Fast [Lower Priority]",
    tag: "LP Model",
    desc: "Google Flow video generation — used by extension",
    plans: ["free", "basic", "pro"],
  },
  {
    type: "video",
    name: "Veo 3.1 - Fast",
    tag: "Locked",
    desc: "Standard fast model — blocked by extension",
    plans: [],
  },
  {
    type: "video",
    name: "Veo 3.1 - Quality",
    tag: "Locked",
    desc: "High quality model — blocked by extension",
    plans: [],
  },
  {
    type: "image",
    name: "Nano Banana",
    tag: "Free Image",
    desc: "Basic AI image generation — available on all plans",
    plans: ["free", "basic", "pro"],
  },
  {
    type: "image",
    name: "Pro Imagen",
    tag: "Pro Image",
    desc: "Premium image model — Imagen 4 powered",
    plans: ["basic", "pro"],
  },
];

function getModelAccess(plan: string, modelPlans: string[]) {
  return modelPlans.includes((plan || "free").toLowerCase());
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useGetGenerationStats({
    query: { queryKey: getGetGenerationStatsQueryKey() }
  });

  const planInfo = getPlanInfo(user?.plan || "free");
  const isExpired = (user?.daysRemaining != null && user.daysRemaining <= 0) ||
                    (user?.planExpiresAt != null && new Date(user.planExpiresAt).getTime() < Date.now());

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#7c3aed]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full">

        {/* ── WELCOME HEADER ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              Welcome back, <span className="text-[#a855f7]">{user?.username}</span> 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Your BunnyFlow AI studio overview</p>
          </div>
          <Link href="/pricing">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1528] border border-white/10 text-white text-sm font-bold cursor-pointer hover:border-[#7c3aed]/50 transition-all" style={{ boxShadow: "0 0 14px rgba(124,58,237,0.12)" }}>
              <Zap className="h-4 w-4 text-[#a855f7]" />
              {planInfo.badge} Plan
            </div>
          </Link>
        </div>

        {/* ── PLAN CARD ── */}
        <div
          className="rounded-2xl bg-[#1a1528] border border-[#7c3aed]/25 p-6 w-full"
          style={{ boxShadow: "0 0 40px rgba(124,58,237,0.14), 0 2px 12px rgba(0,0,0,0.4)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#7c3aed]/25 flex items-center justify-center" style={{ boxShadow: "0 0 10px rgba(168,85,247,0.35)" }}>
                <Zap className="h-4 w-4 text-[#a855f7]" />
              </div>
              <span className="text-white font-bold text-sm">{planInfo.label}</span>
            </div>
            <Link href="/pricing">
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-sm font-bold cursor-pointer hover:bg-[#6d28d9] transition-colors" style={{ boxShadow: "0 0 14px rgba(124,58,237,0.35)" }}>
                Upgrade Plan <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </div>

          {/* Unlimited + days remaining */}
          <div className="flex items-end justify-between mb-3">
            <span className={`text-5xl font-black tracking-tight ${isExpired ? "text-red-400" : "text-white"}`}>
              {isExpired ? "Expired" : "Unlimited"}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              {user?.daysRemaining != null ? (
                <>
                  <span className={user.daysRemaining <= 0 ? "text-red-400 font-bold" : user.daysRemaining <= 2 ? "text-yellow-400 font-bold" : "text-gray-400"}>
                    {user.daysRemaining <= 0 ? "Expired" : `${user.daysRemaining} day${user.daysRemaining === 1 ? "" : "s"} left`}
                  </span>
                </>
              ) : (
                <>Plan: <span className="text-[#a855f7] font-bold ml-1">{planInfo.expiry}</span></>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full ${isExpired ? "w-0 bg-red-500" : "w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7]"}`} />
          </div>

          {/* Expired CTA */}
          {isExpired && (
            <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-red-300 text-sm font-semibold flex-1">Your plan has expired. Renew to restore Google Flow access.</span>
              <Link href="/pricing">
                <div className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold cursor-pointer hover:bg-red-600 transition-colors shrink-0">
                  Renew Now
                </div>
              </Link>
            </div>
          )}

          {/* Plan tier chips */}
          <div className="flex items-center gap-2">
            {[
              { label: "Free · Trial",    match: "free"  },
              { label: "Basic · 15 Days", match: "basic" },
              { label: "Pro · 30 Days",   match: "pro"   },
            ].map((t) => {
              const active = (user?.plan || "free").toLowerCase() === t.match;
              return (
                <span key={t.match} className={`text-xs px-3 py-1 rounded-full font-semibold ${active ? "bg-[#7c3aed] text-white" : "bg-white/5 text-gray-500"}`}>
                  {t.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Video,
              label: "VIDEOS GENERATED",
              value: (stats?.videosGenerated ?? 0).toString(),
              glow: "rgba(96,165,250,0.12)",
              small: false,
            },
            {
              icon: ImageIcon,
              label: "IMAGES GENERATED",
              value: (stats?.imagesGenerated ?? 0).toString(),
              glow: "rgba(244,114,182,0.12)",
              small: false,
            },
            {
              icon: Calendar,
              label: "MEMBER SINCE",
              value: user?.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—",
              glow: "rgba(52,211,153,0.08)",
              small: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-[#1a1528] border border-white/8 p-5 transition-all hover:border-white/15"
              style={{ boxShadow: `0 0 20px ${s.glow}, 0 2px 8px rgba(0,0,0,0.25)` }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <s.icon className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.label}</span>
              </div>
              <div className={`font-black text-white ${s.small ? "text-xl" : "text-3xl"}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── MODEL ACCESS ── */}
        <div
          className="rounded-2xl bg-[#1a1528] border border-white/8 p-5 w-full"
          style={{ boxShadow: "0 0 24px rgba(124,58,237,0.08), 0 2px 8px rgba(0,0,0,0.25)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-[#a855f7]" />
            </div>
            <span className="text-white font-bold text-sm">Model Access</span>
            <span className="ml-auto text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
              {planInfo.badge} Plan
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {ALL_MODELS.map((model) => {
              const hasAccess = getModelAccess(user?.plan || "free", model.plans);
              return (
                <div
                  key={model.name}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    hasAccess
                      ? "bg-[#7c3aed]/10 border-[#7c3aed]/25"
                      : "bg-white/3 border-white/5 opacity-50"
                  }`}
                >
                  {/* Type icon */}
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    hasAccess ? "bg-[#7c3aed]/20" : "bg-white/5"
                  }`}>
                    {model.type === "video"
                      ? <Video className={`h-4 w-4 ${hasAccess ? "text-[#a855f7]" : "text-gray-600"}`} />
                      : <ImageIcon className={`h-4 w-4 ${hasAccess ? "text-[#a855f7]" : "text-gray-600"}`} />
                    }
                  </div>

                  {/* Name + desc */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold truncate ${hasAccess ? "text-white" : "text-gray-600"}`}>
                      {model.name}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{model.desc}</div>
                  </div>

                  {/* Tag + lock */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hasAccess
                        ? model.tag === "Locked"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-[#7c3aed]/25 text-[#c084fc]"
                        : "bg-white/5 text-gray-600"
                    }`}>
                      {model.tag}
                    </span>
                    {hasAccess && model.tag !== "Locked"
                      ? <Unlock className="h-3.5 w-3.5 text-green-400" />
                      : <img src="/gold-lock.png" alt="locked" className="h-4 w-4 object-contain opacity-90" />
                    }
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-gray-600 mt-3 text-center">
            Extension auto-selects <span className="text-[#a855f7] font-semibold">Veo 3.1 Fast [Lower Priority]</span> · Other models blocked by plan
          </p>
        </div>

        {/* ── REFER & EARN PROMO ── */}
        <Link href="/refer">
          <div
            className="rounded-2xl border-2 border-[#7c3aed] p-5 cursor-pointer transition-all group relative overflow-hidden hover:translate-x-[-2px] hover:translate-y-[-2px]"
            style={{
              background: "linear-gradient(135deg, #1a0f35 0%, #2d1a5e 50%, #1a0f35 100%)",
              boxShadow: "6px 6px 0px #4c1d95, 0 0 40px rgba(124,58,237,0.35)"
            }}
          >
            {/* Background glow blobs */}
            <div className="pointer-events-none absolute -right-8 -top-8 w-56 h-56 rounded-full bg-[#7c3aed]/30 blur-[50px]" />
            <div className="pointer-events-none absolute -left-4 -bottom-4 w-32 h-32 rounded-full bg-[#a855f7]/20 blur-[30px]" />

            {/* NEW badge */}
            <div className="absolute top-3 right-3 z-20">
              <span className="text-[9px] font-black uppercase tracking-widest bg-[#a855f7] text-white px-2 py-1 rounded-full" style={{ boxShadow: "2px 2px 0px #6d28d9" }}>
                💰 EARN CASH
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div
                  className="h-12 w-12 rounded-xl bg-[#7c3aed] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ boxShadow: "3px 3px 0px #4c1d95, 0 0 18px rgba(124,58,237,0.6)" }}
                >
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-base leading-tight">Refer Friends & Earn Real Money</h3>
                  <p className="text-[#c084fc] text-xs mt-0.5 font-medium">Share your link → friends buy a plan → you earn USD</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Basic Plan", amount: "$0.15", sub: "5 tokens" },
                  { label: "Pro Plan",   amount: "$0.21", sub: "7 tokens" },
                  { label: "1 token",    amount: "$0.03", sub: "= USD" },
                ].map(r => (
                  <div key={r.label} className="rounded-xl bg-white/8 border border-[#7c3aed]/30 px-3 py-2 text-center">
                    <div className="text-[10px] text-[#c084fc] font-bold mb-0.5">{r.label}</div>
                    <div className="text-sm font-black text-white">{r.amount}</div>
                    <div className="text-[10px] text-gray-500">{r.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-[#a855f7] text-sm font-black group-hover:gap-3 transition-all">
                View Refer & Earn <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* ── QUICK ACTIONS ── 2 cards side by side */}
        <div className="grid grid-cols-2 gap-3">

          {/* Flow Access */}
          <Link href="/generate/video">
            <div
              className="rounded-2xl bg-[#1a1528] border border-white/8 p-5 cursor-pointer hover:border-[#7c3aed]/40 transition-all group h-full"
              style={{ boxShadow: "0 0 18px rgba(96,165,250,0.08), 0 2px 8px rgba(0,0,0,0.25)" }}
            >
              <div className="h-10 w-10 rounded-xl bg-[#7c3aed]/15 flex items-center justify-center mb-3" style={{ boxShadow: "0 0 12px rgba(124,58,237,0.2)" }}>
                <Video className="h-5 w-5 text-[#a855f7]" />
              </div>
              <h3 className="font-black text-white text-base">Flow Access</h3>
              <p className="text-gray-500 text-xs mt-0.5 mb-3">Google Flow · Veo 3 video generation</p>
              <div className="flex items-center gap-1 text-[#a855f7] text-xs font-bold group-hover:gap-2 transition-all">
                Start creating <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>

          {/* Get Extension */}
          <Link href="/extension">
            <div
              className="rounded-2xl bg-[#1a1528] border border-white/8 p-5 cursor-pointer hover:border-[#7c3aed]/40 transition-all group h-full"
              style={{ boxShadow: "0 0 18px rgba(124,58,237,0.06), 0 2px 8px rgba(0,0,0,0.25)" }}
            >
              <div className="h-10 w-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center mb-3" style={{ boxShadow: "0 0 12px rgba(124,58,237,0.12)" }}>
                <Chrome className="h-5 w-5 text-[#a855f7]" />
              </div>
              <h3 className="font-black text-white text-base">Get Chrome Extension</h3>
              <p className="text-gray-500 text-xs mt-0.5 mb-3">Auto-connects your session with Google Flow</p>
              <div className="flex items-center gap-1 text-[#a855f7] text-xs font-bold group-hover:gap-2 transition-all">
                Get extension <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>

        </div>

      </div>
    </DashboardLayout>
  );
}
