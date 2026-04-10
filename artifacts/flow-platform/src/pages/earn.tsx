import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import {
  ArrowRight, Gift, Users, Wallet, DollarSign, Check,
  Copy, Zap, ChevronRight, Star, Shield, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    num: "01",
    title: "Sign Up & Get Your Link",
    desc: "Create a free BunnyFlow account. Your unique referral link is generated instantly — no setup needed.",
    icon: Users,
  },
  {
    num: "02",
    title: "Share With Friends",
    desc: "Send your referral link to anyone. They sign up, you're automatically tracked as their referrer.",
    icon: Copy,
  },
  {
    num: "03",
    title: "They Purchase a Plan",
    desc: "When your friend buys a Basic or Pro plan, you instantly receive tokens to your wallet.",
    icon: Zap,
  },
  {
    num: "04",
    title: "Withdraw Your Earnings",
    desc: "Convert tokens to dollars and withdraw via Binance, Easypaisa, or Bank Transfer. Minimum $1.02.",
    icon: Wallet,
  },
];

const rewards = [
  {
    plan: "Basic Plan",
    duration: "15 Days",
    tokens: 5,
    usd: "$0.15",
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "bg-blue-500/15 text-blue-400",
    popular: false,
  },
  {
    plan: "Pro Plan",
    duration: "30 Days",
    tokens: 7,
    usd: "$0.21",
    color: "border-[#7c3aed]/40 bg-[#7c3aed]/8",
    badge: "bg-[#7c3aed]/20 text-[#a855f7]",
    popular: true,
  },
];

const faqs = [
  { q: "When do I get my tokens?", a: "Tokens are added instantly to your wallet the moment your referred friend purchases a plan. No waiting period." },
  { q: "Is there a limit on referrals?", a: "No limit at all. Refer 10 people, 100 people — you earn tokens for every single purchase." },
  { q: "What are the withdrawal options?", a: "You can withdraw via Binance ID, Easypaisa mobile account, or direct Bank Transfer. Minimum withdrawal is 34 tokens ($1.02)." },
  { q: "Do I earn if my friend only signs up?", a: "No — tokens are only awarded when your referred friend purchases a Basic or Pro plan, not on signup alone." },
  { q: "What's the token conversion rate?", a: "1 token = $0.03. So Basic referral (5 tokens) = $0.15 and Pro referral (7 tokens) = $0.21 per successful purchase." },
  { q: "Can someone refer themselves?", a: "No. Self-referrals are blocked. Each user can only be referred once and the system prevents duplicate rewards." },
];

export default function Earn() {
  return (
    <PublicLayout>

      {/* ══════════════════════════════════════
          HERO — dark with purple glow
      ══════════════════════════════════════ */}
      <section className="bg-[#0a0a0f] pt-20 pb-16 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#7c3aed25_0%,_transparent_65%)]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#7c3aed]/10 blur-[100px]" />

        <div className="container relative px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/40 bg-[#7c3aed]/10 px-4 py-1.5 text-sm font-semibold text-[#c084fc] mb-8">
              <Gift className="h-3.5 w-3.5" /> Referral Program
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] mb-6">
              Refer friends.<br />
              <span className="text-[#a855f7]">Earn real</span><br />
              <span className="text-[#a855f7]">money.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-xl leading-relaxed mb-10">
              Share your BunnyFlow referral link. Earn tokens when your friends buy a plan.
              Withdraw as cash — straight to your account.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                asChild
                size="lg"
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-lg h-14 px-10 rounded-2xl border-0 shadow-[5px_5px_0px_#4c1d95] hover:shadow-[3px_3px_0px_#4c1d95] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Link href="/register">Start Earning Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white/15 hover:border-[#7c3aed] text-gray-300 hover:text-white bg-transparent font-bold text-lg h-14 px-10 rounded-2xl transition-colors"
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-500">
              {["Instant rewards", "No minimum referrals", "Real cash withdrawal", "Fraud protected"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#7c3aed]" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          REWARD CARDS — white bg
      ══════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="container px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="mb-14">
            <h2 className="text-5xl md:text-6xl font-black text-[#0a0a0f] leading-tight mb-4">
              How much<br /><span className="text-[#7c3aed]">you earn.</span>
            </h2>
            <p className="text-gray-500 text-xl max-w-lg">Every plan purchase by your referred friend puts money in your pocket. Instantly.</p>
          </div>

          {/* Token rate banner */}
          <div className="rounded-2xl bg-[#0a0a0f] border-2 border-[#7c3aed] p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left" style={{ boxShadow: "6px 6px 0px #7c3aed" }}>
            <div className="h-14 w-14 rounded-2xl bg-[#7c3aed] flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#4c1d95]">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-black text-xl mb-0.5">Token Conversion Rate</div>
              <div className="text-gray-400 text-sm">1 token = $0.03 USD. Withdraw at any time above the minimum threshold.</div>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-4xl font-black text-[#a855f7]">1 tkn</div>
              <div className="text-gray-400 text-sm">= $0.03 USD</div>
            </div>
          </div>

          {/* Reward cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8 max-w-2xl">
            {rewards.map(r => (
              <div
                key={r.plan}
                className={`relative rounded-3xl border-[3px] p-8 transition-all ${r.color}`}
                style={{ boxShadow: r.popular ? "8px 8px 0px #7c3aed" : "none" }}
                onMouseEnter={e => { if (!r.popular) { (e.currentTarget as HTMLElement).style.boxShadow = "6px 6px 0px #7c3aed"; (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; }}}
                onMouseLeave={e => { if (!r.popular) { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; }}}
              >
                {r.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#7c3aed] text-white text-xs font-black px-4 py-1.5 rounded-full" style={{ boxShadow: "3px 3px 0px #4c1d95" }}>
                      HIGHEST REWARD
                    </span>
                  </div>
                )}
                <div className={`inline-flex text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 ${r.badge}`}>
                  {r.plan}
                </div>
                <div className="text-6xl font-black text-[#0a0a0f] mb-1">{r.tokens}</div>
                <div className="text-gray-500 text-sm mb-4">tokens per referral</div>
                <div className="text-3xl font-black text-[#7c3aed]">{r.usd}</div>
                <div className="text-gray-500 text-sm mb-5">in USD per referral</div>
                <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
                  <Clock className="h-3.5 w-3.5" /> {r.duration} plan · paid by your referral
                </div>
              </div>
            ))}
          </div>

          {/* Example earnings table */}
          <div className="rounded-2xl border-2 border-gray-100 overflow-hidden max-w-2xl" style={{ boxShadow: "5px 5px 0px #e5e7eb" }}>
            <div className="bg-[#0a0a0f] px-6 py-4">
              <div className="text-white font-black text-base">Example Earnings</div>
              <div className="text-gray-400 text-sm">What you earn with different referral counts</div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f7f5ff]">
                  <th className="px-6 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-widest">Referrals</th>
                  <th className="px-6 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-widest">Basic Plan</th>
                  <th className="px-6 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-widest">Pro Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1, 5, 10, 25, 50].map(n => (
                  <tr key={n} className="hover:bg-[#f7f5ff] transition-colors">
                    <td className="px-6 py-3 font-black text-[#0a0a0f]">{n} {n === 1 ? "person" : "people"}</td>
                    <td className="px-6 py-3 text-[#7c3aed] font-bold">${(n * 5 * 0.03).toFixed(2)}</td>
                    <td className="px-6 py-3 text-[#7c3aed] font-bold">${(n * 7 * 0.03).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS — dark
      ══════════════════════════════════════ */}
      <section className="bg-[#0a0a0f] py-20 md:py-28 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7c3aed12_0%,_transparent_65%)]" />
        <div className="container relative px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="mb-14">
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
              4 steps to<br /><span className="text-[#a855f7]">your first dollar.</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-lg">The simplest referral system you've ever used. No codes to type, no waiting periods.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {steps.map(step => (
              <div key={step.num} className="group flex gap-5 p-6 rounded-2xl border border-[#7c3aed]/20 bg-[#0f0b1e] hover:border-[#7c3aed] hover:bg-[#0f0b1e] transition-all">
                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-[#7c3aed]/15 group-hover:bg-[#7c3aed] flex items-center justify-center transition-colors border border-[#7c3aed]/30">
                    <step.icon className="h-5 w-5 text-[#a855f7] group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div>
                  <div className="text-[#7c3aed]/40 group-hover:text-[#7c3aed] font-black text-sm mb-1 transition-colors">{step.num}</div>
                  <h3 className="text-white font-black text-lg mb-1.5">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WITHDRAWAL METHODS — white
      ══════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="container px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-[#0a0a0f] leading-tight mb-4">
                Cash out<br /><span className="text-[#7c3aed]">3 ways.</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                When you're ready to withdraw, choose your preferred payment method. Admin reviews and processes all requests within 24–48 hours.
              </p>

              <div className="space-y-3">
                {[
                  { method: "Binance ID", desc: "Transfer directly to your Binance account using your Binance UID", time: "Usually within 24 hrs" },
                  { method: "Easypaisa", desc: "Receive funds directly to your Easypaisa mobile wallet", time: "Usually within 24 hrs" },
                  { method: "Bank Transfer", desc: "Direct bank transfer — provide your IBAN and account details", time: "24–48 business hours" },
                ].map(m => (
                  <div key={m.method} className="flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#7c3aed] transition-all group">
                    <div className="h-10 w-10 rounded-xl bg-[#f3f0ff] group-hover:bg-[#7c3aed] flex items-center justify-center shrink-0 transition-colors">
                      <DollarSign className="h-5 w-5 text-[#7c3aed] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-[#0a0a0f] text-sm">{m.method}</div>
                      <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{m.desc}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 shrink-0 text-right">{m.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#0a0a0f] border-2 border-[#7c3aed] p-8" style={{ boxShadow: "8px 8px 0px #7c3aed" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#7c3aed] flex items-center justify-center shadow-[3px_3px_0px_#4c1d95]">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-black text-lg">Your Earnings Wallet</span>
              </div>

              {/* Mock wallet UI */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/8">
                  <span className="text-gray-400 text-sm">Available Tokens</span>
                  <span className="text-[#a855f7] font-black text-lg">37 tokens</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/8">
                  <span className="text-gray-400 text-sm">USD Value</span>
                  <span className="text-white font-black text-lg">$0.555</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/8">
                  <span className="text-gray-400 text-sm">Total Referrals</span>
                  <span className="text-white font-black text-lg">7 people</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  { label: "Aamir → Pro Plan",   tokens: "+7 tokens", usd: "+$0.21", color: "text-green-400" },
                  { label: "Fatima → Basic Plan", tokens: "+5 tokens", usd: "+$0.15", color: "text-green-400" },
                  { label: "Raza → Basic Plan",   tokens: "+5 tokens", usd: "+$0.15", color: "text-green-400" },
                ].map(tx => (
                  <div key={tx.label} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
                    <span className="text-gray-300 text-xs">{tx.label}</span>
                    <div className="text-right">
                      <div className={`text-xs font-black ${tx.color}`}>{tx.tokens}</div>
                      <div className="text-[10px] text-gray-500">{tx.usd}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-3.5 rounded-xl font-black text-white bg-[#7c3aed] hover:bg-[#6d28d9] transition-all flex items-center justify-center gap-2" style={{ boxShadow: "4px 4px 0px #4c1d95" }}>
                <DollarSign className="h-4 w-4" /> Withdraw Earnings
              </button>

              <div className="text-center mt-3 text-[11px] text-gray-600">Minimum withdrawal: 34 tokens ($1.02)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SAFETY & RULES — purple bg
      ══════════════════════════════════════ */}
      <section className="bg-[#f7f5ff] py-16">
        <div className="container px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-[#0a0a0f] mb-3">
              Fair & <span className="text-[#7c3aed]">protected.</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">Our system is designed to be completely fair for everyone.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "No Self-Referrals", desc: "You cannot use your own referral code. Only legitimate referrals are rewarded." },
              { icon: Check, title: "One Reward Per User", desc: "Each referred user can only trigger a reward once — no duplicates, no abuse." },
              { icon: Star, title: "Purchase-Only Rewards", desc: "Tokens are awarded only when a plan is purchased, not just on signup." },
            ].map(r => (
              <div key={r.title} className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#7c3aed] p-6 transition-all hover:shadow-[5px_5px_0px_#7c3aed] group">
                <div className="h-11 w-11 rounded-xl bg-[#f3f0ff] group-hover:bg-[#7c3aed] flex items-center justify-center mb-4 transition-colors">
                  <r.icon className="h-5 w-5 text-[#7c3aed] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-black text-[#0a0a0f] text-lg mb-2">{r.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="container px-4 sm:px-8 mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black text-[#0a0a0f] mb-10 text-center">
            Common <span className="text-[#7c3aed]">questions.</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#7c3aed] p-6 transition-all"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0px #7c3aed"; (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; }}
              >
                <h4 className="font-black text-[#0a0a0f] mb-2">{faq.q}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA — dark
      ══════════════════════════════════════ */}
      <section className="bg-[#0a0a0f] py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7c3aed20_0%,_transparent_65%)]" />
        <div className="container relative px-4 sm:px-8 mx-auto max-w-4xl text-center">
          <div className="h-20 w-20 rounded-3xl bg-[#7c3aed] flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_#4c1d95]">
            <Gift className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Ready to earn?<br /><span className="text-[#a855f7]">Start today.</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-xl mx-auto mb-10">
            Create your free account, grab your referral link, and start earning on every plan purchase your friends make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-lg h-14 px-12 rounded-2xl border-0 shadow-[5px_5px_0px_#4c1d95] hover:shadow-[3px_3px_0px_#4c1d95] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Link href="/register">Create Free Account <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/15 hover:border-[#7c3aed] text-gray-300 hover:text-white bg-transparent font-bold text-lg h-14 px-10 rounded-2xl transition-colors"
            >
              <Link href="/login">Already have account? Login <ChevronRight className="ml-1 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
