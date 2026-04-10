import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Zap, Video, LayoutDashboard, Chrome, LogOut, CreditCard, Gift,
  ExternalLink, AlertTriangle, BookOpen, Wand2, ChevronRight, Clock, Settings
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

function getPlanLabel(plan: string) {
  switch ((plan || "free").toLowerCase()) {
    case "basic": return "Basic Plan";
    case "pro":   return "Pro Plan";
    default:      return "Free Trial";
  }
}

function getPlanBadgeColor(plan: string) {
  switch ((plan || "free").toLowerCase()) {
    case "basic": return { bg: "#1e3a5f", text: "#60a5fa", border: "#1d4ed8" };
    case "pro":   return { bg: "#2e1065", text: "#a855f7", border: "#7c3aed" };
    default:      return { bg: "#1a1a1a", text: "#6b7280", border: "#374151" };
  }
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const plan = (user?.plan || "free").toLowerCase();
  const planLabel = getPlanLabel(plan);
  const planColors = getPlanBadgeColor(plan);
  const isExpired = (user?.daysRemaining != null && user.daysRemaining <= 0) ||
    (user?.planExpiresAt != null && new Date(user.planExpiresAt).getTime() < Date.now());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    if (avatarMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [avatarMenuOpen]);

  const navItems = [
    { href: "/dashboard",      label: "Overview",       icon: LayoutDashboard, badge: null          },
    { href: "/generate/video", label: "Flow Access",    icon: Video,           badge: null          },
    { href: "/gemini",         label: "Gemini Access",  icon: Zap,             badge: null          },
    { href: "/whisk",          label: "Whisk Access",   icon: Wand2,           badge: null          },
    { href: "/extension",      label: "Extension",      icon: Chrome,          badge: null          },
    { href: "/refer",          label: "Refer & Earn",   icon: Gift,            badge: "Earn Cash"   },
    { href: "/help",           label: "Help",           icon: BookOpen,        badge: null          },
  ];

  const daysLeft = user?.daysRemaining ?? null;

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#0a0a0f" }}
    >
      {/* ════════════════════════════════
          LEFT SIDEBAR
      ════════════════════════════════ */}
      <aside
        className="flex flex-col shrink-0 border-r border-white/8"
        style={{ width: 220, background: "#0d0b14", minHeight: "100vh", position: "sticky", top: 0, height: "100vh" }}
      >
        {/* ── Logo ── */}
        <div className="px-4 py-5 border-b border-white/8">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 cursor-pointer select-none">
              <img
                src="/bunny-logo.jpeg"
                alt="BunnyFlow"
                className="h-9 w-9 rounded-full object-cover border-2 border-[#7c3aed] shrink-0"
                style={{ boxShadow: "0 0 12px rgba(124,58,237,0.5)" }}
              />
              <span className="font-black text-base text-white tracking-tight leading-none">
                Bunny<span className="text-[#a855f7]">Flow</span>
              </span>
            </div>
          </Link>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all group ${
                    active
                      ? "bg-[#7c3aed]/20 text-white border border-[#7c3aed]/30"
                      : "text-gray-400 hover:text-white hover:bg-white/6 border border-transparent"
                  }`}
                  style={active ? { boxShadow: "0 0 12px rgba(124,58,237,0.12)" } : {}}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      active ? "text-[#a855f7]" : "text-gray-600 group-hover:text-gray-300"
                    }`}
                  />
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && !active && (
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30 shrink-0 leading-none">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#a855f7] shrink-0" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── Expired banner inside sidebar ── */}
        {isExpired && (
          <div className="mx-2 mb-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span className="text-red-300 text-[11px] font-bold">Plan Expired</span>
            </div>
            <Link href="/pricing">
              <div className="w-full py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-bold text-center cursor-pointer hover:bg-red-600 transition-colors">
                Renew Now
              </div>
            </Link>
          </div>
        )}

        {/* ── Account block (bottom) ── */}
        <div className="border-t border-white/8 p-3" ref={avatarRef}>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/6 transition-all select-none relative"
            onClick={() => setAvatarMenuOpen(v => !v)}
          >
            {/* Avatar */}
            <div
              className="h-8 w-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-black text-sm border-2 border-[#a855f7] shrink-0"
              style={{ boxShadow: "0 0 8px rgba(124,58,237,0.4)" }}
            >
              {(user?.username || "U")[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[13px] truncate leading-tight">{user?.username}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: planColors.bg, color: planColors.text, border: `1px solid ${planColors.border}` }}
                >
                  {planLabel}
                </span>
                {daysLeft !== null && (
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                    isExpired ? "text-red-400" : daysLeft <= 2 ? "text-yellow-400" : "text-gray-500"
                  }`}>
                    <Clock className="h-2.5 w-2.5" />
                    {isExpired ? "Expired" : `${daysLeft}d`}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className={`h-4 w-4 text-gray-600 shrink-0 transition-transform ${avatarMenuOpen ? "rotate-90" : ""}`} />
          </div>

          {/* ── Account popup ── */}
          {avatarMenuOpen && (
            <div
              className="absolute bottom-[72px] left-3 right-3 rounded-xl bg-[#12101a] border border-white/12 overflow-hidden z-50 py-1.5"
              style={{ boxShadow: "0 -8px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)" }}
            >
              <Link href="/pricing">
                <div onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/6 transition-colors cursor-pointer">
                  <CreditCard className="h-4 w-4 shrink-0" /><span>Plan & Pricing</span>
                </div>
              </Link>
              <Link href="/refer">
                <div onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/6 transition-colors cursor-pointer">
                  <Gift className="h-4 w-4 shrink-0" /><span>Refer & Earn</span>
                  <span className="ml-auto text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30">Earn Cash</span>
                </div>
              </Link>
              <a href="https://labs.google/fx/tools/flow" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/6 transition-colors">
                <ExternalLink className="h-4 w-4 shrink-0" /><span>Open Google Flow</span>
              </a>
              <Link href="/settings">
                <div onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/6 transition-colors cursor-pointer">
                  <Settings className="h-4 w-4 shrink-0" /><span>Account Settings</span>
                </div>
              </Link>
              <div className="my-1 border-t border-white/8" />
              <button
                onClick={() => { logout(); setAvatarMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/8 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" /><span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════ */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="w-full h-full px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
