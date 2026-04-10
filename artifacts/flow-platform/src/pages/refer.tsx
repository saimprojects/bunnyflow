import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  Copy, Check, Gift, Users, Wallet, ArrowDownToLine,
  ChevronRight, Loader2, CheckCircle2, Clock, XCircle, Banknote
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "";

interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  tokens: number;
  usdEarnings: string;
  totalReferrals: number;
  purchasedReferrals: number;
  referrals: Array<{
    id: number;
    status: string;
    planPurchased: string | null;
    tokensAwarded: number;
    rewarded: boolean;
    createdAt: string;
    username: string | null;
    email: string | null;
  }>;
  minWithdrawalTokens: number;
  minWithdrawalUsd: string;
  tokenRate: string;
}

interface WithdrawalHistory {
  withdrawals: Array<{
    id: number;
    tokenAmount: number;
    usdAmount: string;
    method: string;
    status: string;
    createdAt: string;
    processedAt: string | null;
    adminNote: string | null;
  }>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:   { label: "Pending",   cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
    purchased: { label: "Purchased", cls: "bg-green-500/15 text-green-400 border-green-500/25" },
    approved:  { label: "Approved",  cls: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    rejected:  { label: "Rejected",  cls: "bg-red-500/15 text-red-400 border-red-500/25" },
    paid:      { label: "Paid",      cls: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-white/10 text-gray-400 border-white/10" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "purchased") return <CheckCircle2 className="h-4 w-4 text-green-400" />;
  if (status === "paid")      return <CheckCircle2 className="h-4 w-4 text-purple-400" />;
  if (status === "rejected")  return <XCircle className="h-4 w-4 text-red-400" />;
  if (status === "approved")  return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
  return <Clock className="h-4 w-4 text-yellow-400" />;
}

function methodLabel(m: string) {
  if (m === "binance")       return "Binance ID";
  if (m === "easypaisa")     return "Easypaisa";
  if (m === "bank_transfer") return "Bank Transfer";
  return m;
}

export default function Refer() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [history, setHistory] = useState<WithdrawalHistory | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "withdraw" | "history">("overview");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    tokenAmount: "",
    method: "binance",
    accountDetails: "",
  });

  const token = localStorage.getItem("flow_token");

  async function fetchInfo() {
    try {
      const res = await fetch(`${API_BASE}/api/referral/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setInfo(await res.json());
    } catch {}
  }

  async function fetchHistory() {
    try {
      const res = await fetch(`${API_BASE}/api/withdraw/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistory(await res.json());
    } catch {}
  }

  useEffect(() => {
    fetchInfo();
    fetchHistory();
  }, []);

  const referralLink = info?.referralCode
    ? (info.referralLink?.startsWith("https://")
        ? info.referralLink
        : `${window.location.origin}/register?ref=${info.referralCode}`)
    : "";

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
  }

  async function submitWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenAmount: Number(form.tokenAmount),
          method: form.method,
          accountDetails: form.accountDetails,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: "Request Submitted!", description: data.message });
      setForm({ tokenAmount: "", method: "binance", accountDetails: "" });
      fetchInfo();
      fetchHistory();
      setActiveTab("history");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const loading = !info;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── HEADER ── */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#7c3aed]/20 flex items-center justify-center" style={{ boxShadow: "0 0 16px rgba(124,58,237,0.25)" }}>
            <Gift className="h-5 w-5 text-[#a855f7]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Refer & Earn</h1>
            <p className="text-gray-500 text-sm">Share BunnyFlow, earn tokens when friends purchase a plan</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#7c3aed]" />
          </div>
        ) : (
          <>
            {/* ── STATS ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "TOKENS EARNED", value: info!.tokens.toString(), sub: `$${info!.usdEarnings} USD`, icon: Wallet, color: "rgba(168,85,247,0.12)" },
                { label: "TOTAL REFERRALS", value: info!.totalReferrals.toString(), sub: `${info!.purchasedReferrals} purchased`, icon: Users, color: "rgba(96,165,250,0.10)" },
                { label: "USD EARNINGS", value: `$${info!.usdEarnings}`, sub: info!.tokenRate, icon: Banknote, color: "rgba(52,211,153,0.08)" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl bg-[#1a1528] border border-white/8 p-4" style={{ boxShadow: `0 0 20px ${s.color}` }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <s.icon className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── REFERRAL LINK ── */}
            <div className="rounded-2xl bg-[#1a1528] border border-[#7c3aed]/25 p-5" style={{ boxShadow: "0 0 30px rgba(124,58,237,0.12)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Gift className="h-4 w-4 text-[#a855f7]" />
                <span className="text-white font-bold text-sm">Your Referral Link</span>
                <span className="ml-auto text-[10px] font-mono bg-white/8 px-2 py-0.5 rounded-full text-gray-400">{info!.referralCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-xs text-gray-400 bg-white/5 border border-white/8 rounded-xl px-4 py-3 truncate">
                  {referralLink}
                </div>
                <button
                  onClick={copyLink}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    copied ? "bg-green-500 text-white" : "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                  }`}
                  style={{ boxShadow: "0 0 14px rgba(124,58,237,0.3)" }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Reward info */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { plan: "Basic Plan", tokens: "5 Tokens", usd: "$0.15", color: "border-blue-500/25 bg-blue-500/8" },
                  { plan: "Pro Plan",   tokens: "7 Tokens", usd: "$0.21", color: "border-purple-500/25 bg-purple-500/8" },
                ].map(r => (
                  <div key={r.plan} className={`rounded-xl border p-3 ${r.color}`}>
                    <div className="text-xs font-bold text-gray-300 mb-0.5">{r.plan}</div>
                    <div className="text-lg font-black text-white">{r.tokens}</div>
                    <div className="text-[11px] text-[#a855f7] font-bold">{r.usd} earned</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-600 mt-3 text-center">1 token = $0.03 · Minimum withdrawal: {info!.minWithdrawalTokens} tokens (${info!.minWithdrawalUsd})</p>
            </div>

            {/* ── TABS ── */}
            <div className="flex items-center gap-1 bg-[#1a1528] border border-white/8 p-1 rounded-xl">
              {(["overview", "withdraw", "history"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold capitalize transition-all ${
                    activeTab === tab ? "bg-[#7c3aed] text-white" : "text-gray-500 hover:text-white"
                  }`}
                >
                  {tab === "overview" ? "Referrals" : tab === "withdraw" ? "Withdraw" : "History"}
                </button>
              ))}
            </div>

            {/* ── REFERRALS LIST ── */}
            {activeTab === "overview" && (
              <div className="rounded-2xl bg-[#1a1528] border border-white/8 overflow-hidden">
                {info!.referrals.length === 0 ? (
                  <div className="py-16 text-center">
                    <Users className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">No referrals yet</p>
                    <p className="text-gray-600 text-sm mt-1">Share your link to start earning</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">User</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Tokens</th>
                      </tr>
                    </thead>
                    <tbody>
                      {info!.referrals.map(r => (
                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm font-bold text-white">{r.username || "—"}</div>
                            <div className="text-[11px] text-gray-500">{r.email || "—"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <StatusIcon status={r.status} />
                              <StatusBadge status={r.status} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-400 capitalize">{r.planPurchased || "—"}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-bold ${r.rewarded ? "text-green-400" : "text-gray-600"}`}>
                              {r.rewarded ? `+${r.tokensAwarded}` : "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── WITHDRAWAL FORM ── */}
            {activeTab === "withdraw" && (
              <div className="rounded-2xl bg-[#1a1528] border border-white/8 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <ArrowDownToLine className="h-4 w-4 text-[#a855f7]" />
                  <span className="text-white font-bold">Withdraw Earnings</span>
                </div>

                <div className="mb-4 p-3 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Available Balance</span>
                  <div className="text-right">
                    <div className="text-lg font-black text-white">{info!.tokens} Tokens</div>
                    <div className="text-xs text-[#a855f7]">${info!.usdEarnings} USD</div>
                  </div>
                </div>

                <form onSubmit={submitWithdrawal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Token Amount <span className="text-gray-600 normal-case">(min {info!.minWithdrawalTokens})</span>
                    </label>
                    <input
                      type="number"
                      value={form.tokenAmount}
                      onChange={e => setForm(f => ({ ...f, tokenAmount: e.target.value }))}
                      placeholder={`Min ${info!.minWithdrawalTokens} tokens`}
                      min={info!.minWithdrawalTokens}
                      max={info!.tokens}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7c3aed] transition-colors"
                    />
                    {form.tokenAmount && (
                      <p className="text-[11px] text-[#a855f7] mt-1">
                        ≈ ${(Number(form.tokenAmount) * 0.03).toFixed(2)} USD
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "binance", label: "Binance ID" },
                        { value: "easypaisa", label: "Easypaisa" },
                        { value: "bank_transfer", label: "Bank Transfer" },
                      ].map(m => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, method: m.value, accountDetails: "" }))}
                          className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${
                            form.method === m.value
                              ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                              : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {form.method === "binance" ? "Binance ID" : form.method === "easypaisa" ? "Easypaisa Number" : "Bank Account Details"}
                    </label>
                    <textarea
                      value={form.accountDetails}
                      onChange={e => setForm(f => ({ ...f, accountDetails: e.target.value }))}
                      placeholder={
                        form.method === "binance" ? "Enter your Binance UID" :
                        form.method === "easypaisa" ? "Enter your Easypaisa number" :
                        "Bank name, account number, account title, IBAN..."
                      }
                      required
                      rows={form.method === "bank_transfer" ? 3 : 1}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7c3aed] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || info!.tokens < info!.minWithdrawalTokens}
                    className="w-full py-3.5 rounded-xl font-black text-white bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    style={{ boxShadow: "0 0 16px rgba(124,58,237,0.3)" }}
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
                    {submitting ? "Submitting..." : "Request Withdrawal"}
                  </button>

                  {info!.tokens < info!.minWithdrawalTokens && (
                    <p className="text-center text-xs text-yellow-400">
                      You need {info!.minWithdrawalTokens - info!.tokens} more tokens to withdraw
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* ── WITHDRAWAL HISTORY ── */}
            {activeTab === "history" && (
              <div className="rounded-2xl bg-[#1a1528] border border-white/8 overflow-hidden">
                {!history?.withdrawals.length ? (
                  <div className="py-16 text-center">
                    <ArrowDownToLine className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">No withdrawal requests yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {history.withdrawals.map(w => (
                      <div key={w.id} className="p-4 flex items-center gap-4">
                        <StatusIcon status={w.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold text-white">{w.tokenAmount} tokens</span>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="text-sm font-bold text-[#a855f7]">${w.usdAmount}</span>
                          </div>
                          <div className="text-[11px] text-gray-500">{methodLabel(w.method)} · {new Date(w.createdAt).toLocaleDateString()}</div>
                          {w.adminNote && <div className="text-[11px] text-yellow-400 mt-0.5">{w.adminNote}</div>}
                        </div>
                        <StatusBadge status={w.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
