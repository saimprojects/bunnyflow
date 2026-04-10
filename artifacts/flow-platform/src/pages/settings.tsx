import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { Settings, Mail, Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export default function UserSettings() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [email, setEmail]               = useState(user?.email || "");
  const [emailSaving, setEmailSaving]   = useState(false);

  const [currentPw, setCurrentPw]       = useState("");
  const [newPw, setNewPw]               = useState("");
  const [confirmPw, setConfirmPw]       = useState("");
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [pwSaving, setPwSaving]         = useState(false);

  async function updateProfile(body: object) {
    const res = await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");
    return data;
  }

  async function handleEmailSave(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || email === user?.email) return;
    setEmailSaving(true);
    try {
      await updateProfile({ email: email.trim() });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "Email updated successfully" });
    } catch (err: any) {
      toast({ title: "Failed to update email", description: err.message, variant: "destructive" });
    } finally {
      setEmailSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    if (newPw !== confirmPw) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPw.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setPwSaving(true);
    try {
      await updateProfile({ currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast({ title: "Password updated successfully" });
    } catch (err: any) {
      toast({ title: "Failed to update password", description: err.message, variant: "destructive" });
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6 w-full">

        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center">
              <Settings className="h-5 w-5 text-[#a855f7]" />
            </div>
            <h1 className="text-2xl font-black text-white">Account Settings</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">Update your email or change your password</p>
        </div>

        {/* Account info */}
        <div className="rounded-2xl bg-[#0d0b14] border border-white/8 p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-black text-lg border-2 border-[#a855f7] shrink-0"
            style={{ boxShadow: "0 0 12px rgba(124,58,237,0.4)" }}>
            {(user?.username || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold">{user?.username}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{
                background: user?.plan === "pro" ? "#2e1065" : user?.plan === "basic" ? "#1e3a5f" : "#1a1a1a",
                color: user?.plan === "pro" ? "#a855f7" : user?.plan === "basic" ? "#60a5fa" : "#6b7280",
                border: `1px solid ${user?.plan === "pro" ? "#7c3aed" : user?.plan === "basic" ? "#1d4ed8" : "#374151"}`,
              }}>
              {user?.plan === "pro" ? "Pro" : user?.plan === "basic" ? "Basic" : "Free"}
            </span>
          </div>
        </div>

        {/* Change Email */}
        <form onSubmit={handleEmailSave} className="rounded-2xl bg-[#1a1528] border border-white/8 p-6 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-7 w-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-400" />
            </div>
            <h2 className="text-white font-black text-base">Change Email</h2>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wider">New Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#0d0b14] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/60 transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={emailSaving || email === user?.email || !email.trim()}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {emailSaving ? "Saving…" : <><CheckCircle2 className="h-4 w-4" />Save Email</>}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordSave} className="rounded-2xl bg-[#1a1528] border border-white/8 p-6 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-7 w-7 rounded-lg bg-[#7c3aed]/15 flex items-center justify-center">
              <Lock className="h-4 w-4 text-[#a855f7]" />
            </div>
            <h2 className="text-white font-black text-base">Change Password</h2>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wider">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                className="w-full bg-[#0d0b14] border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/60 transition-colors"
                placeholder="Enter current password"
                required
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className="w-full bg-[#0d0b14] border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/60 transition-colors"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wider">Confirm New Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="w-full bg-[#0d0b14] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7c3aed]/60 transition-colors"
              placeholder="Repeat new password"
              required
            />
            {confirmPw && newPw !== confirmPw && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pwSaving || !currentPw || !newPw || newPw !== confirmPw}
            className="w-full py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ boxShadow: "0 0 14px rgba(124,58,237,0.3)" }}
          >
            {pwSaving ? "Saving…" : <><CheckCircle2 className="h-4 w-4" />Update Password</>}
          </button>
        </form>

      </div>
    </DashboardLayout>
  );
}
