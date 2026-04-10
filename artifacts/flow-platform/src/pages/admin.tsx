import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ShieldAlert, Trash2, Users, Cookie,
  Settings as SettingsIcon, Play, RefreshCw, LogOut,
  CheckCircle2, XCircle, Plus, ChevronRight,
  Pencil, Ban, UserCheck, Search, X, Wallet, Clock, Check, Gift, Zap, Wand2, Download
} from "lucide-react";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

/* ── Admin API ── */
const adminApi = {
  fetch: async (path: string, options: RequestInit = {}) => {
    const key = localStorage.getItem("admin_key");
    const res = await fetch(`/api/admin${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(key ? { "x-admin-key": key } : {}),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }
    return res.json();
  },
};

/* ── Reusable UI ── */
function StatCard({ icon: Icon, label, value, color = "#a855f7" }: any) {
  return (
    <div className="rounded-2xl p-5 border border-white/10 bg-[#1a1528]"
      style={{ boxShadow: "0 0 20px rgba(124,58,237,0.08)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
        <div className="h-8 w-8 rounded-xl bg-[#7c3aed]/15 flex items-center justify-center">
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    pro:   "bg-[#7c3aed]/20 text-[#a855f7] border-[#7c3aed]/30",
    basic: "bg-green-500/15 text-green-400 border-green-500/25",
    free:  "bg-white/8 text-gray-400 border-white/10",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider border ${styles[plan] || styles.free}`}>
      {plan}
    </span>
  );
}

type Tab = "overview" | "sessions" | "gemini-sessions" | "whisk-sessions" | "users" | "settings" | "withdrawals" | "extension";

export default function Admin() {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [geminiSessions, setGeminiSessions] = useState<any[]>([]);
  const [whiskSessions, setWhiskSessions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // User search
  const [userSearch, setUserSearch] = useState("");

  // Add session (Flow)
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionLabel, setSessionLabel] = useState("");
  const [sessionCookies, setSessionCookies] = useState("");

  // Add Gemini session
  const [showAddGeminiSession, setShowAddGeminiSession] = useState(false);
  const [geminiSessionLabel, setGeminiSessionLabel] = useState("");
  const [geminiSessionCookies, setGeminiSessionCookies] = useState("");
  const [geminiEditId, setGeminiEditId] = useState<number | null>(null);

  // Add Whisk session
  const [showAddWhiskSession, setShowAddWhiskSession] = useState(false);
  const [whiskSessionLabel, setWhiskSessionLabel] = useState("");
  const [whiskSessionCookies, setWhiskSessionCookies] = useState("");
  const [whiskEditId, setWhiskEditId] = useState<number | null>(null);

  // Edit user modal
  const [editUser, setEditUser] = useState<any>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPlan, setEditPlan] = useState("free");
  const [editExpiry, setEditExpiry] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  /* ── Extension upload ── */
  const [extMeta, setExtMeta] = useState<any>(null);
  const [extUploading, setExtUploading] = useState(false);
  const [extMsg, setExtMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadExtMeta = async () => {
    try {
      const key = localStorage.getItem("admin_key");
      const res = await fetch("/api/admin/extension-meta", { headers: key ? { "x-admin-key": key } : {} });
      if (res.ok) setExtMeta(await res.json());
    } catch { /* ignore */ }
  };

  const handleExtUpload = async (file: File) => {
    if (!file.name.endsWith(".zip")) { setExtMsg({ type: "err", text: "Only ZIP files allowed" }); return; }
    setExtUploading(true);
    setExtMsg(null);
    try {
      const key = localStorage.getItem("admin_key");
      const form = new FormData();
      form.append("extension", file);
      const res = await fetch("/api/admin/extension-upload", {
        method: "POST",
        headers: key ? { "x-admin-key": key } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setExtMeta({ uploaded: true, ...data.meta });
      setExtMsg({ type: "ok", text: `✅ "${file.name}" uploaded — ${(file.size / 1024).toFixed(1)} KB` });
    } catch (err: any) {
      setExtMsg({ type: "err", text: err.message || "Upload failed" });
    } finally {
      setExtUploading(false);
    }
  };

  /* ── Auth ── */
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await adminApi.fetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("admin_key", res.token);
      setAuthed(true);
      toast({ title: "Welcome, Admin!" });
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
  };

  /* ── Load data ── */
  const loadData = async () => {
    setLoading(true);
    try {
      const [st, se, gse, wse, us, sg, wd] = await Promise.all([
        adminApi.fetch("/stats").catch(() => null),
        adminApi.fetch("/sessions").catch(() => null),
        adminApi.fetch("/gemini-sessions").catch(() => null),
        adminApi.fetch("/whisk-sessions").catch(() => null),
        adminApi.fetch("/users").catch(() => null),
        adminApi.fetch("/settings").catch(() => null),
        adminApi.fetch("/withdrawals").catch(() => null),
      ]);
      setStats(st || null);
      setSessions(Array.isArray(se) ? se : (se?.sessions ?? []));
      setGeminiSessions(Array.isArray(gse) ? gse : (gse?.sessions ?? []));
      setWhiskSessions(Array.isArray(wse) ? wse : (wse?.sessions ?? []));
      setUsers(Array.isArray(us) ? us : (us?.users ?? []));
      const rawSettings = sg?.settings ?? {};
      setSettings(
        typeof rawSettings === "object" && !Array.isArray(rawSettings)
          ? Object.entries(rawSettings).map(([key, value]) => ({ key, value }))
          : []
      );
      setWithdrawals(Array.isArray(wd) ? wd : (wd?.withdrawals ?? []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawal = async (id: number, status: string, adminNote?: string) => {
    try {
      await adminApi.fetch(`/withdrawals/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNote }),
      });
      toast({ title: `Withdrawal ${status}` });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (localStorage.getItem("admin_key")) setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  useEffect(() => {
    if (authed && tab === "extension") loadExtMeta();
  }, [authed, tab]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  /* ── Session actions ── */
  const addSession = async () => {
    try {
      JSON.parse(sessionCookies);
      await adminApi.fetch("/sessions", {
        method: "POST",
        body: JSON.stringify({ label: sessionLabel, cookiesJson: sessionCookies }),
      });
      toast({ title: "Session added" });
      setShowAddSession(false);
      setSessionLabel(""); setSessionCookies("");
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const toggleSession = async (id: number, isActive: boolean) => {
    try {
      await adminApi.fetch(`/sessions/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  /* ── Gemini Session actions ── */
  const addGeminiSession = async () => {
    try {
      JSON.parse(geminiSessionCookies);
      if (geminiEditId !== null) {
        await adminApi.fetch(`/gemini-sessions/${geminiEditId}`, {
          method: "PATCH",
          body: JSON.stringify({ label: geminiSessionLabel, cookiesJson: geminiSessionCookies }),
        });
        toast({ title: "Gemini session updated" });
      } else {
        await adminApi.fetch("/gemini-sessions", {
          method: "POST",
          body: JSON.stringify({ label: geminiSessionLabel, cookiesJson: geminiSessionCookies }),
        });
        toast({ title: "Gemini session added" });
      }
      setShowAddGeminiSession(false);
      setGeminiSessionLabel(""); setGeminiSessionCookies(""); setGeminiEditId(null);
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const toggleGeminiSession = async (id: number, isActive: boolean) => {
    try {
      await adminApi.fetch(`/gemini-sessions/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const deleteGeminiSession = async (id: number) => {
    if (!confirm("Delete this Gemini session?")) return;
    try {
      await adminApi.fetch(`/gemini-sessions/${id}`, { method: "DELETE" });
      toast({ title: "Gemini session deleted" });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const addWhiskSession = async () => {
    try {
      JSON.parse(whiskSessionCookies);
      if (whiskEditId !== null) {
        await adminApi.fetch(`/whisk-sessions/${whiskEditId}`, {
          method: "PATCH",
          body: JSON.stringify({ label: whiskSessionLabel, cookiesJson: whiskSessionCookies }),
        });
        toast({ title: "Whisk session updated" });
      } else {
        await adminApi.fetch("/whisk-sessions", {
          method: "POST",
          body: JSON.stringify({ label: whiskSessionLabel, cookiesJson: whiskSessionCookies }),
        });
        toast({ title: "Whisk session added" });
      }
      setShowAddWhiskSession(false);
      setWhiskSessionLabel(""); setWhiskSessionCookies(""); setWhiskEditId(null);
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const toggleWhiskSession = async (id: number, isActive: boolean) => {
    try {
      await adminApi.fetch(`/whisk-sessions/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const deleteWhiskSession = async (id: number) => {
    if (!confirm("Delete this Whisk session?")) return;
    try {
      await adminApi.fetch(`/whisk-sessions/${id}`, { method: "DELETE" });
      toast({ title: "Whisk session deleted" });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const deleteSession = async (id: number) => {
    if (!confirm("Delete this session?")) return;
    try {
      await adminApi.fetch(`/sessions/${id}`, { method: "DELETE" });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  /* ── User actions ── */
  const openEditUser = (u: any) => {
    setEditUser(u);
    setEditUsername(u.username);
    setEditPlan(u.plan);
    // format planExpiresAt as YYYY-MM-DD for date input
    const exp = u.planExpiresAt ? new Date(u.planExpiresAt) : null;
    setEditExpiry(exp ? exp.toISOString().slice(0, 10) : "");
  };

  const saveEditUser = async () => {
    if (!editUser) return;
    setEditSaving(true);
    try {
      const body: any = { username: editUsername, plan: editPlan };
      if (editExpiry) {
        body.planExpiresAt = new Date(editExpiry).toISOString();
      }
      await adminApi.fetch(`/users/${editUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast({ title: "User updated" });
      setEditUser(null);
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  const deleteUser = async (u: any) => {
    if (!confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    try {
      await adminApi.fetch(`/users/${u.id}`, { method: "DELETE" });
      toast({ title: "User deleted" });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const suspendUser = async (u: any) => {
    if (!confirm(`Suspend "${u.username}"? Their credits will be set to 0.`)) return;
    try {
      await adminApi.fetch(`/users/${u.id}/reset-credits`, {
        method: "POST",
        body: JSON.stringify({ amount: 0 }),
      });
      toast({ title: "User suspended", description: "Credits set to 0" });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const restoreUser = async (u: any) => {
    try {
      await adminApi.fetch(`/users/${u.id}/set-plan`, {
        method: "POST",
        body: JSON.stringify({ plan: u.plan, resetCredits: true }),
      });
      toast({ title: "User restored" });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const fixReferral = async (u: any) => {
    if (!confirm(`Fix referral reward for "${u.username}"? This will award tokens to their referrer if not already done.`)) return;
    try {
      const data = await adminApi.fetch(`/users/${u.id}/fix-referral`, { method: "POST" });
      toast({ title: "Referral fixed!", description: `${data.tokensAwarded} tokens awarded to ${data.referrer}` });
      loadData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      // PATCH /admin/settings expects { key: value } pairs directly
      await adminApi.fetch("/settings", {
        method: "PATCH",
        body: JSON.stringify({ [key]: value }),
      });
      toast({ title: "Setting saved" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_key");
    setAuthed(false);
  };

  /* ══════════════════════════════════════════
      LOGIN SCREEN
  ══════════════════════════════════════════ */
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden" style={FONT}>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/10 blur-[120px]" />
        <div className="relative w-full max-w-md z-10">
          <div className="rounded-2xl border-2 border-[#7c3aed] bg-[#12101a] p-8 space-y-7"
            style={{ boxShadow: "8px 8px 0px #4c1d95" }}>
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center mx-auto border border-[#7c3aed]/40"
                style={{ boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
                <ShieldAlert className="h-7 w-7 text-[#a855f7]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Admin Portal</h1>
                <p className="text-gray-500 text-sm mt-1">Restricted access — BunnyFlow</p>
              </div>
            </div>
            <form onSubmit={login} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-300">Admin Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full h-11 rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white px-4 text-sm font-medium outline-none transition-colors"
                  placeholder="admin@bunnyflow.app" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-300">Master Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full h-11 rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white px-4 text-sm font-medium outline-none transition-colors"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={authLoading}
                className="w-full h-12 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-base transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ boxShadow: "4px 4px 0px #4c1d95" }}>
                {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                Authenticate
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
      ADMIN DASHBOARD
  ══════════════════════════════════════════ */
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview",         label: "Overview",         icon: Play },
    { id: "sessions",         label: "Flow Sessions",    icon: Cookie },
    { id: "gemini-sessions",  label: "Gemini Sessions",  icon: Zap },
    { id: "whisk-sessions",   label: "Whisk Sessions",   icon: Wand2 },
    { id: "users",            label: "Users",            icon: Users },
    { id: "withdrawals",      label: "Withdrawals",      icon: Wallet },
    { id: "extension",        label: "Extension",        icon: Download },
    { id: "settings",         label: "Settings",         icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" style={FONT}>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 h-14 bg-[#0d0b14] border-b border-white/8 flex items-center px-6 gap-5">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center border border-[#7c3aed]/40">
            <ShieldAlert className="h-3.5 w-3.5 text-[#a855f7]" />
          </div>
          <span className="font-black text-base text-white">Bunny<span className="text-[#a855f7]">Flow</span> Admin</span>
        </div>
        <div className="h-5 w-px bg-white/10" />
        <nav className="flex items-center gap-1 flex-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? "bg-[#7c3aed] text-white" : "text-gray-400 hover:text-white hover:bg-white/8"}`}
              style={tab === t.id ? { boxShadow: "0 0 12px rgba(124,58,237,0.35)" } : {}}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={loadData} disabled={loading}
            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/8">
            <RefreshCw className={`h-3.5 w-3.5 text-gray-400 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/8">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white mb-1">System Overview</h2>
              <p className="text-gray-500 text-sm">Real-time platform statistics</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users}        label="Total Users"       value={stats?.users?.total ?? 0} />
              <StatCard icon={Play}         label="Total Generations" value={stats?.generations?.total ?? 0} color="#60a5fa" />
              <StatCard icon={Cookie}       label="Active Sessions"   value={`${sessions.filter(s => s.isActive).length} / ${sessions.length}`} color="#34d399" />
              <StatCard icon={CheckCircle2} label="System Status"     value="Online" color="#34d399" />
            </div>
            {users.length > 0 && (
              <div className="rounded-2xl bg-[#1a1528] border border-white/8 overflow-hidden"
                style={{ boxShadow: "0 0 20px rgba(124,58,237,0.06)" }}>
                <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
                  <span className="font-black text-sm text-white">Recent Users</span>
                  <button onClick={() => setTab("users")} className="flex items-center gap-1 text-xs text-[#a855f7] font-bold hover:underline">
                    View all <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-[#a855f7] font-black text-xs border border-[#7c3aed]/30">
                          {(u.username || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.username}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <PlanBadge plan={u.plan} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SESSIONS ── */}
        {tab === "sessions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Google Flow Sessions</h2>
                <p className="text-gray-500 text-sm mt-0.5">Manage cookie sessions for Google Flow</p>
              </div>
              <button onClick={() => setShowAddSession(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm transition-all"
                style={{ boxShadow: "0 0 14px rgba(124,58,237,0.3)" }}>
                <Plus className="h-4 w-4" /> Add Session
              </button>
            </div>
            <div className="rounded-2xl bg-[#1a1528] border border-white/8 overflow-hidden"
              style={{ boxShadow: "0 0 20px rgba(124,58,237,0.06)" }}>
              {sessions.length === 0 ? (
                <div className="py-16 text-center">
                  <Cookie className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No sessions added yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Label", "Added", "Usage", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white text-sm">{s.label}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm font-semibold">{s.usageCount}</td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => toggleSession(s.id, !s.isActive)}>
                            {s.isActive
                              ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-green-500/15 text-green-400 border border-green-500/25"><CheckCircle2 className="h-3 w-3" />Active</span>
                              : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-white/8 text-gray-400 border border-white/10"><XCircle className="h-3 w-3" />Inactive</span>
                            }
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => deleteSession(s.id)}
                            className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors border border-red-500/20">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Add Session Modal */}
            {showAddSession && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-2xl bg-[#12101a] border border-[#7c3aed]/40 p-6 space-y-5"
                  style={{ boxShadow: "0 0 40px rgba(124,58,237,0.2)" }}>
                  <div>
                    <h3 className="text-lg font-black text-white">Add Google Flow Session</h3>
                    <p className="text-gray-500 text-sm mt-0.5">Paste exported cookie JSON from your browser</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300">Label (e.g. Account 1)</label>
                    <input value={sessionLabel} onChange={e => setSessionLabel(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white px-4 text-sm outline-none transition-colors"
                      placeholder="Account 1" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300">Cookies JSON</label>
                    <textarea value={sessionCookies} onChange={e => setSessionCookies(e.target.value)} rows={6}
                      className="w-full rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white px-4 py-3 text-xs font-mono outline-none transition-colors resize-none"
                      placeholder='[{"name": "SID", "value": "..."}, ...]' />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowAddSession(false)}
                      className="flex-1 h-11 rounded-xl border border-white/15 text-gray-400 font-bold text-sm hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={addSession}
                      className="flex-1 h-11 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm transition-colors"
                      style={{ boxShadow: "0 0 14px rgba(124,58,237,0.3)" }}>Save Session</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GEMINI SESSIONS ── */}
        {tab === "gemini-sessions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Gemini Pro Sessions</h2>
                <p className="text-gray-500 text-sm mt-0.5">Manage cookie sessions for Google Gemini Pro</p>
              </div>
              <button onClick={() => { setGeminiEditId(null); setGeminiSessionLabel(""); setGeminiSessionCookies(""); setShowAddGeminiSession(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm transition-all"
                style={{ boxShadow: "0 0 14px rgba(124,58,237,0.3)" }}>
                <Plus className="h-4 w-4" /> Add Session
              </button>
            </div>
            <div className="rounded-2xl bg-[#1a1528] border border-white/8 overflow-hidden"
              style={{ boxShadow: "0 0 20px rgba(124,58,237,0.06)" }}>
              {geminiSessions.length === 0 ? (
                <div className="py-16 text-center">
                  <Zap className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No Gemini sessions added yet</p>
                  <p className="text-gray-600 text-xs mt-1">Add a session to enable Gemini Pro access</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Label", "Added", "Cookies", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {geminiSessions.map(s => (
                      <tr key={s.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white text-sm">{s.label}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">
                          {s.cookieCount > 0
                            ? <span className="text-green-400 font-bold text-sm">{s.cookieCount} cookies ✓</span>
                            : <span className="text-red-400 font-bold text-sm">⚠ No cookies</span>
                          }
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => toggleGeminiSession(s.id, !s.isActive)}>
                            {s.isActive
                              ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-green-500/15 text-green-400 border border-green-500/25"><CheckCircle2 className="h-3 w-3" />Active</span>
                              : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-white/8 text-gray-400 border border-white/10"><XCircle className="h-3 w-3" />Inactive</span>
                            }
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setGeminiEditId(s.id); setGeminiSessionLabel(s.label); setGeminiSessionCookies(s.cookiesJson || ""); setShowAddGeminiSession(true); }}
                              className="h-8 w-8 rounded-lg bg-[#7c3aed]/15 hover:bg-[#7c3aed]/30 flex items-center justify-center text-[#a855f7] transition-colors border border-[#7c3aed]/25"
                              title="Edit cookies">
                              <SettingsIcon className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteGeminiSession(s.id)}
                              className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors border border-red-500/20">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Add Gemini Session Modal */}
            {showAddGeminiSession && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-2xl bg-[#12101a] border border-[#7c3aed]/40 p-6 space-y-5"
                  style={{ boxShadow: "0 0 40px rgba(124,58,237,0.2)" }}>
                  <div>
                    <h3 className="text-lg font-black text-white">{geminiEditId ? "Edit Gemini Session" : "Add Gemini Pro Session"}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{geminiEditId ? "Update the cookie JSON for this session" : "Paste exported cookie JSON from your Gemini browser session"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300">Label (e.g. Gemini Account 1)</label>
                    <input value={geminiSessionLabel} onChange={e => setGeminiSessionLabel(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white px-4 text-sm outline-none transition-colors"
                      placeholder="Gemini Account 1" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300">Cookies JSON</label>
                    <textarea value={geminiSessionCookies} onChange={e => setGeminiSessionCookies(e.target.value)} rows={6}
                      className="w-full rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white px-4 py-3 text-xs font-mono outline-none transition-colors resize-none"
                      placeholder='[{"name": "SID", "value": "..."}, ...]' />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowAddGeminiSession(false); setGeminiEditId(null); setGeminiSessionLabel(""); setGeminiSessionCookies(""); }}
                      className="flex-1 h-11 rounded-xl border border-white/15 text-gray-400 font-bold text-sm hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={addGeminiSession}
                      className="flex-1 h-11 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm transition-colors"
                      style={{ boxShadow: "0 0 14px rgba(124,58,237,0.3)" }}>Save Session</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WHISK SESSIONS ── */}
        {tab === "whisk-sessions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Whisk Sessions</h2>
                <p className="text-gray-500 text-sm mt-0.5">Manage cookie sessions for Google Whisk AI image generation</p>
              </div>
              <button onClick={() => { setWhiskEditId(null); setWhiskSessionLabel(""); setWhiskSessionCookies(""); setShowAddWhiskSession(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all"
                style={{ background: "linear-gradient(135deg,#f97316,#f59e0b)", boxShadow: "0 0 14px rgba(249,115,22,0.3)" }}>
                <Plus className="h-4 w-4" /> Add Session
              </button>
            </div>
            <div className="rounded-2xl bg-[#1a1528] border border-white/8 overflow-hidden"
              style={{ boxShadow: "0 0 20px rgba(249,115,22,0.06)" }}>
              {whiskSessions.length === 0 ? (
                <div className="py-16 text-center">
                  <Wand2 className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No Whisk sessions added yet</p>
                  <p className="text-gray-600 text-xs mt-1">Add a session to enable Whisk AI access</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Label", "Added", "Cookies", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {whiskSessions.map((s: any) => (
                      <tr key={s.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white text-sm">{s.label}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">
                          {s.cookieCount > 0
                            ? <span className="text-green-400 font-bold text-sm">{s.cookieCount} cookies ✓</span>
                            : <span className="text-red-400 font-bold text-sm">⚠ No cookies</span>
                          }
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => toggleWhiskSession(s.id, !s.isActive)}>
                            {s.isActive
                              ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-green-500/15 text-green-400 border border-green-500/25"><CheckCircle2 className="h-3 w-3" />Active</span>
                              : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-white/8 text-gray-400 border border-white/10"><XCircle className="h-3 w-3" />Inactive</span>
                            }
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setWhiskEditId(s.id); setWhiskSessionLabel(s.label); setWhiskSessionCookies(s.cookiesJson || ""); setShowAddWhiskSession(true); }}
                              className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors border"
                              style={{ background: "rgba(249,115,22,0.15)", borderColor: "rgba(249,115,22,0.25)", color: "#fb923c" }}
                              title="Edit cookies">
                              <SettingsIcon className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteWhiskSession(s.id)}
                              className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors border border-red-500/20">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Add / Edit Whisk Session Modal */}
            {showAddWhiskSession && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-2xl bg-[#12101a] border p-6 space-y-5"
                  style={{ borderColor: "rgba(249,115,22,0.4)", boxShadow: "0 0 40px rgba(249,115,22,0.2)" }}>
                  <div>
                    <h3 className="text-lg font-black text-white">{whiskEditId ? "Edit Whisk Session" : "Add Whisk Session"}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{whiskEditId ? "Update the cookie JSON for this session" : "Paste exported cookie JSON from your Whisk browser session"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300">Label (e.g. Whisk Account 1)</label>
                    <input value={whiskSessionLabel} onChange={e => setWhiskSessionLabel(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#1a1528] border-2 border-white/10 text-white px-4 text-sm outline-none transition-colors"
                      style={{ focusBorderColor: "#f97316" } as any}
                      onFocus={e => e.target.style.borderColor = "#f97316"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                      placeholder="Whisk Account 1" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300">Cookies JSON</label>
                    <textarea value={whiskSessionCookies} onChange={e => setWhiskSessionCookies(e.target.value)} rows={6}
                      className="w-full rounded-xl bg-[#1a1528] border-2 border-white/10 text-white px-4 py-3 text-xs font-mono outline-none transition-colors resize-none"
                      onFocus={e => e.target.style.borderColor = "#f97316"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                      placeholder='[{"name": "SID", "value": "..."}, ...]' />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowAddWhiskSession(false); setWhiskEditId(null); setWhiskSessionLabel(""); setWhiskSessionCookies(""); }}
                      className="flex-1 h-11 rounded-xl border border-white/15 text-gray-400 font-bold text-sm hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={addWhiskSession}
                      className="flex-1 h-11 rounded-xl text-white font-bold text-sm transition-colors"
                      style={{ background: "linear-gradient(135deg,#f97316,#f59e0b)", boxShadow: "0 0 14px rgba(249,115,22,0.3)" }}>Save Session</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-black text-white">User Management</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {userSearch.trim() ? `${filteredUsers.length} of ${users.length} users` : `${users.length} registered users`} — edit, suspend, or delete
                </p>
              </div>
              {/* Search bar */}
              <div className="relative min-w-[260px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full h-10 rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white pl-10 pr-9 text-sm font-medium outline-none transition-colors"
                />
                {userSearch && (
                  <button onClick={() => setUserSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-[#1a1528] border border-white/8 overflow-x-auto"
              style={{ boxShadow: "0 0 20px rgba(124,58,237,0.06)" }}>
              {users.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No users yet</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center">
                  <Search className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No users found</p>
                  <p className="text-gray-600 text-sm mt-1">No match for "<span className="text-[#a855f7]">{userSearch}</span>"</p>
                  <button onClick={() => setUserSearch("")} className="mt-3 text-sm text-[#a855f7] font-bold hover:underline">Clear search</button>
                </div>
              ) : (
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["User", "Email", "Plan", "Expiry", "Generations", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(u => {
                      const isSuspended = u.credits === 0;
                      const expDate = u.planExpiresAt ? new Date(u.planExpiresAt) : null;
                      const isExpired = expDate ? expDate < new Date() : false;
                      const daysLeft = expDate ? Math.ceil((expDate.getTime() - Date.now()) / 86400000) : null;
                      return (
                        <tr key={u.id} className="hover:bg-white/3 transition-colors">
                          {/* User */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-sm border shrink-0 ${isSuspended ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-[#7c3aed]/20 text-[#a855f7] border-[#7c3aed]/25"}`}>
                                {(u.username || "U")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-black text-white flex items-center gap-1.5">
                                  {u.username}
                                  {isSuspended && <span className="text-[10px] font-black text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded border border-red-500/20">SUSPENDED</span>}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">ID: {u.id}</p>
                              </div>
                            </div>
                          </td>
                          {/* Email */}
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-300 font-medium">{u.email}</p>
                          </td>
                          {/* Plan */}
                          <td className="px-5 py-4">
                            <PlanBadge plan={u.plan} />
                          </td>
                          {/* Expiry */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {expDate ? (
                              <div>
                                <p className={`text-sm font-bold ${isExpired ? "text-red-400" : daysLeft !== null && daysLeft <= 3 ? "text-yellow-400" : "text-white"}`}>
                                  {expDate.toLocaleDateString()}
                                </p>
                                <p className={`text-[11px] font-semibold ${isExpired ? "text-red-500" : "text-gray-500"}`}>
                                  {isExpired ? "Expired" : `${daysLeft}d left`}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-600 text-sm">—</span>
                            )}
                          </td>
                          {/* Generations */}
                          <td className="px-5 py-4">
                            <div className="text-sm text-white font-bold">{u.generationCount ?? 0}</div>
                            <div className="text-[11px] text-gray-500">{u.videosCount ?? 0}v · {u.imagesCount ?? 0}i</div>
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {/* Edit */}
                              <button onClick={() => openEditUser(u)} title="Edit"
                                className="h-8 w-8 rounded-lg bg-[#7c3aed]/15 hover:bg-[#7c3aed]/30 flex items-center justify-center text-[#a855f7] transition-colors border border-[#7c3aed]/25">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {/* Suspend / Restore */}
                              {isSuspended ? (
                                <button onClick={() => restoreUser(u)} title="Restore"
                                  className="h-8 w-8 rounded-lg bg-green-500/15 hover:bg-green-500/25 flex items-center justify-center text-green-400 transition-colors border border-green-500/20">
                                  <UserCheck className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button onClick={() => suspendUser(u)} title="Suspend"
                                  className="h-8 w-8 rounded-lg bg-yellow-500/15 hover:bg-yellow-500/25 flex items-center justify-center text-yellow-400 transition-colors border border-yellow-500/20">
                                  <Ban className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {/* Fix Referral — only show if user has referredBy (referred by someone) */}
                              {u.referredBy && (
                                <button onClick={() => fixReferral(u)} title="Fix Referral Reward"
                                  className="h-8 w-8 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 flex items-center justify-center text-emerald-400 transition-colors border border-emerald-500/20">
                                  <Gift className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {/* Delete */}
                              <button onClick={() => deleteUser(u)} title="Delete"
                                className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors border border-red-500/20">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── WITHDRAWALS ── */}
        {tab === "withdrawals" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white">Withdrawal Requests</h2>
              <p className="text-gray-500 text-sm mt-0.5">Review and process user withdrawal requests</p>
            </div>
            <div className="rounded-2xl bg-[#1a1528] border border-white/8 overflow-hidden">
              {withdrawals.length === 0 ? (
                <div className="py-16 text-center">
                  <Wallet className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No withdrawal requests</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {withdrawals.map((w: any) => {
                    const statusColor = w.status === "paid" ? "text-green-400" : w.status === "rejected" ? "text-red-400" : w.status === "approved" ? "text-blue-400" : "text-yellow-400";
                    return (
                      <div key={w.id} className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-bold">{w.username}</span>
                              <span className="text-gray-500 text-xs">{w.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-black text-white">{w.tokenAmount} tokens</span>
                              <span className="text-gray-500">→</span>
                              <span className="font-black text-[#a855f7]">${w.usdAmount}</span>
                              <span className="text-gray-600">via {w.method.replace("_", " ")}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{new Date(w.createdAt).toLocaleString()}</div>
                          </div>
                          <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border ${
                            w.status === "paid" ? "bg-green-500/15 text-green-400 border-green-500/25" :
                            w.status === "rejected" ? "bg-red-500/15 text-red-400 border-red-500/25" :
                            w.status === "approved" ? "bg-blue-500/15 text-blue-400 border-blue-500/25" :
                            "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
                          }`}>{w.status}</span>
                        </div>
                        <div className="bg-white/5 rounded-xl px-4 py-2.5 text-xs text-gray-300 font-mono break-all">
                          {w.accountDetails}
                        </div>
                        {w.adminNote && (
                          <div className="text-xs text-yellow-400 italic">{w.adminNote}</div>
                        )}
                        {w.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => updateWithdrawal(w.id, "approved")}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-bold border border-blue-500/25 hover:bg-blue-500/25 transition-colors">
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button onClick={() => updateWithdrawal(w.id, "paid")}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/15 text-green-400 text-xs font-bold border border-green-500/25 hover:bg-green-500/25 transition-colors">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid
                            </button>
                            <button onClick={() => updateWithdrawal(w.id, "rejected", "Rejected by admin")}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/15 text-red-400 text-xs font-bold border border-red-500/25 hover:bg-red-500/25 transition-colors">
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        )}
                        {w.status === "approved" && (
                          <button onClick={() => updateWithdrawal(w.id, "paid")}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/15 text-green-400 text-xs font-bold border border-green-500/25 hover:bg-green-500/25 transition-colors">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Paid
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white">System Configuration</h2>
              <p className="text-gray-500 text-sm mt-0.5">Global platform settings — click a value to edit, then press Enter or click away to save</p>
            </div>
            <div className="rounded-2xl bg-[#1a1528] border border-white/8 overflow-hidden"
              style={{ boxShadow: "0 0 20px rgba(124,58,237,0.06)" }}>
              {settings.length === 0 ? (
                <div className="py-16 text-center">
                  <SettingsIcon className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No settings configured</p>
                  <p className="text-gray-600 text-sm mt-1">Settings will appear here once added from the database</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Key", "Description", "Value"].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {settings.map((s: any) => {
                      const isBool = typeof s.value === "boolean";
                      const isArray = Array.isArray(s.value);
                      const displayVal = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
                      const typeLabel = isBool ? "bool" : isArray ? "array" : typeof s.value;
                      return (
                        <tr key={s.key} className="hover:bg-white/3 transition-colors">
                          {/* Key */}
                          <td className="px-5 py-4 font-mono text-sm text-[#a855f7] font-bold">{s.key}</td>
                          {/* Type badge */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-white/5 border border-white/10 text-gray-500 uppercase tracking-wider">
                              {typeLabel}
                            </span>
                          </td>
                          {/* Value — toggle for booleans, text input for others */}
                          <td className="px-5 py-4">
                            {isBool ? (
                              <button
                                onClick={() => {
                                  const newVal = !s.value;
                                  // optimistic local update
                                  setSettings(prev => prev.map(x => x.key === s.key ? { ...x, value: newVal } : x));
                                  updateSetting(s.key, JSON.stringify(newVal));
                                }}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full border-2 transition-all duration-200 ${s.value ? "bg-[#7c3aed] border-[#6d28d9]" : "bg-[#12101a] border-white/15"}`}
                                style={s.value ? { boxShadow: "0 0 10px rgba(124,58,237,0.4)" } : {}}
                              >
                                <span className={`inline-block h-4 w-4 rounded-full transition-all duration-200 font-black text-[8px] flex items-center justify-center ${s.value ? "translate-x-8 bg-white text-[#7c3aed]" : "translate-x-1 bg-gray-500 text-white"}`}>
                                  {s.value ? "ON" : ""}
                                </span>
                                <span className={`absolute text-[9px] font-black tracking-wider transition-all ${s.value ? "left-2 text-white" : "right-2 text-gray-500"}`}>
                                  {s.value ? "ON" : "OFF"}
                                </span>
                              </button>
                            ) : (
                              <input
                                defaultValue={displayVal}
                                onBlur={e => updateSetting(s.key, e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                className="h-9 rounded-lg bg-[#12101a] border border-white/15 text-white text-sm font-medium px-3 outline-none w-64 focus:border-[#7c3aed] transition-colors font-mono"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── EXTENSION ── */}
        {tab === "extension" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">BunnyFlow Extension</h2>
              <p className="text-gray-500 text-sm mt-0.5">Current extension available for all users to download from their Extension page</p>
            </div>

            {/* Extension info card */}
            <div className="rounded-2xl bg-[#0d0b14] border border-[#7c3aed]/25 p-6" style={{ boxShadow: "0 0 30px rgba(124,58,237,0.07)" }}>
              <div className="flex items-center gap-4 mb-5">
                <div className="h-14 w-14 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 0 20px rgba(124,58,237,0.2)" }}>
                  <Download className="h-7 w-7 text-[#a855f7]" />
                </div>
                <div>
                  <p className="text-[#a855f7] font-black text-xs uppercase tracking-widest mb-1">Active Extension</p>
                  <p className="text-white font-black text-base">
                    {extMeta?.filename || "bunnyflow-v3.6.6-complete-final.zip"}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {extMeta?.size ? `${(extMeta.size / 1024).toFixed(1)} KB` : "~88 KB"} ·
                    Version {extMeta?.version || "v3.6.6"} ·
                    Updated {extMeta?.uploadedAt ? new Date(extMeta.uploadedAt).toLocaleDateString() : "today"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`${import.meta.env.BASE_URL}downloads/custom-extension.zip`}
                  download
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-sm transition-colors"
                  style={{ boxShadow: "0 0 16px rgba(124,58,237,0.3)" }}
                >
                  <Download className="h-4 w-4" /> Download Extension
                </a>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/25">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 font-bold text-xs">Live for all users</span>
                </div>
              </div>
            </div>

            {/* Installation guide */}
            <div className="rounded-2xl bg-[#1a1528] border border-white/8 p-6">
              <p className="text-white font-black text-sm mb-4">Installation Steps</p>
              <div className="space-y-3">
                {[
                  { n: 1, title: "Download Extension ZIP", desc: "User goes to their Extension page → clicks Download Extension" },
                  { n: 2, title: "Enable Developer Mode", desc: 'Chrome → chrome://extensions → toggle "Developer mode" ON (top-right)' },
                  { n: 3, title: "Remove old extension", desc: "If BunnyFlow is already installed → Remove it first to avoid conflicts" },
                  { n: 4, title: "Drag & Drop ZIP", desc: "Drag the downloaded ZIP file directly onto the chrome://extensions page" },
                  { n: 5, title: "Enter Server URL", desc: `Click extension icon → Server URL field → paste: ${typeof window !== "undefined" ? window.location.origin : "https://flowbybunny.replit.app"} → Save` },
                  { n: 6, title: "Sign In", desc: "Enter BunnyFlow email + password in popup → Sign In" },
                  { n: 7, title: "Visit the site", desc: "Open Google Flow or Whisk — session auto-injects ✅" },
                ].map(step => (
                  <div key={step.n} className="flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5">{step.n}</div>
                    <div>
                      <p className="text-white font-bold text-sm">{step.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#12101a] border border-[#7c3aed]/40 p-6 space-y-5"
            style={{ boxShadow: "0 0 40px rgba(124,58,237,0.2)" }}>
            <div>
              <h3 className="text-lg font-black text-white">Edit User</h3>
              <p className="text-gray-500 text-sm mt-0.5">{editUser.email}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-300">Username</label>
              <input value={editUsername} onChange={e => setEditUsername(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white px-4 text-sm font-medium outline-none transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-300">Plan</label>
              <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white px-4 text-sm font-bold outline-none transition-colors cursor-pointer">
                <option value="free">Free (1 Day Trial)</option>
                <option value="basic">Basic (15 Days)</option>
                <option value="pro">Pro (30 Days)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-300">Custom Expiry Date</label>
              <p className="text-xs text-gray-500">Override the plan expiry — set any date you want</p>
              <input
                type="date"
                value={editExpiry}
                onChange={e => setEditExpiry(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#1a1528] border-2 border-white/10 focus:border-[#7c3aed] text-white px-4 text-sm font-medium outline-none transition-colors [color-scheme:dark]"
              />
              {editExpiry && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#a855f7] font-semibold">
                    Expires: {new Date(editExpiry).toDateString()}
                  </span>
                  <button onClick={() => setEditExpiry("")} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                    Clear
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditUser(null)}
                className="flex-1 h-11 rounded-xl border border-white/15 text-gray-400 font-bold text-sm hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={saveEditUser} disabled={editSaving}
                className="flex-1 h-11 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ boxShadow: "0 0 14px rgba(124,58,237,0.3)" }}>
                {editSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
