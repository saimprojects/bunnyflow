import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight, Video, Image as ImageIcon, Chrome, Zap, Check,
  LayoutDashboard, History, Sparkles, Star, Gift, DollarSign, Users, Wallet
} from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>

      {/* ══════════════════════════════════════════
          HERO — Jeton-style: white bg, huge bold text
      ══════════════════════════════════════════ */}
      <section className="bg-white pt-20 pb-10 overflow-hidden">
        <div className="container px-4 sm:px-8 mx-auto max-w-6xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f3f0ff] border border-[#7c3aed]/20 px-4 py-1.5 text-sm font-semibold text-[#7c3aed] mb-8">
            <Zap className="h-3.5 w-3.5" /> Now with Veo 3 &amp; Imagen 4
          </div>

          {/* Huge Jeton-style heading */}
          <div className="max-w-4xl mb-8">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#0a0a0f] leading-[0.9] mb-6">
              AI Videos.<br />
              <span className="text-[#7c3aed]">Your Credits.</span><br />
              Zero Hassle.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 max-w-xl leading-relaxed font-medium">
              BunnyFlow gives you direct access to Google Flow's AI generation — powered by a simple credit system.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Button
              asChild
              size="lg"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-lg h-14 px-10 rounded-2xl border-0 shadow-[5px_5px_0px_#4c1d95] hover:shadow-[3px_3px_0px_#4c1d95] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Link href="/register">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-gray-200 hover:border-[#7c3aed] text-[#0a0a0f] hover:text-[#7c3aed] font-bold text-lg h-14 px-10 rounded-2xl transition-colors"
            >
              <Link href="/extension"><Chrome className="mr-2 h-5 w-5" /> Download Extension</Link>
            </Button>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-400">
            {["1-Day Free Trial", "No credit card", "Instant access", "Chrome extension"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#7c3aed]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GOOGLE FLOW-STYLE DASHBOARD PREVIEW
          (full width, no login needed)
      ══════════════════════════════════════════ */}
      <section className="bg-white pb-0">
        <div className="container px-4 sm:px-8 mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Live Preview — No signup needed</p>

          {/* Browser chrome */}
          <div className="rounded-t-2xl overflow-hidden border-2 border-[#7c3aed] shadow-[8px_8px_0px_#7c3aed]">

            {/* Browser bar */}
            <div className="bg-[#1a1025] px-4 py-2.5 flex items-center gap-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white/10 rounded-md px-4 py-1 text-xs text-gray-400 flex items-center gap-2">
                  <span className="text-green-400 text-[10px]">●</span>
                  bunnyflow.app/dashboard
                </div>
              </div>
            </div>

            {/* App shell */}
            <div className="flex bg-[#12101a]" style={{ height: "520px" }}>

              {/* ── Sidebar ── */}
              <aside className="w-52 shrink-0 bg-[#0d0b17] border-r border-white/5 flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/5">
                  <img src="/bunny-logo.jpeg" alt="BunnyFlow" className="h-7 w-7 rounded-full border border-[#7c3aed]" />
                  <span className="font-extrabold text-white text-sm">Bunny<span className="text-[#a855f7]">Flow</span></span>
                </div>

                {/* Nav */}
                <nav className="px-2 py-3 space-y-0.5 flex-1">
                  {[
                    { icon: LayoutDashboard, label: "Dashboard",      active: true  },
                    { icon: Video,           label: "Generate Video",  active: false },
                    { icon: ImageIcon,       label: "Generate Image",  active: false },
                    { icon: History,         label: "History",         active: false },
                    { icon: Gift,            label: "Refer & Earn",    active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        item.active
                          ? "bg-[#7c3aed] text-white shadow-[2px_2px_0px_#4c1d95]"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {item.label}
                    </div>
                  ))}
                </nav>

                {/* Plan badge at bottom */}
                <div className="p-3 border-t border-white/5">
                  <div className="rounded-xl bg-[#1a1528] border border-[#7c3aed]/30 p-3" style={{ boxShadow: "0 0 14px rgba(124,58,237,0.15)" }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-white flex items-center gap-1"><Zap className="h-2.5 w-2.5 text-[#a855f7]" /> Free Trial</span>
                      <span className="text-[9px] bg-[#7c3aed] text-white px-1.5 py-0.5 rounded-full font-black">1 Day</span>
                    </div>
                    <div className="text-xl font-black text-white">Unlimited</div>
                    <div className="text-[9px] text-gray-500 mb-2">Credits · Google Flow</div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full" />
                    </div>
                  </div>
                </div>
              </aside>

              {/* ── Main content ── */}
              <main className="flex-1 flex flex-col overflow-hidden">

                {/* Top bar */}
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-white font-black text-sm">Welcome back, <span className="text-[#a855f7]">johndoe</span> 👋</div>
                    <div className="text-gray-500 text-[11px]">Your BunnyFlow AI studio overview</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a1528] border border-white/10">
                    <Zap className="h-3.5 w-3.5 text-[#a855f7]" />
                    <span className="text-white text-xs font-bold">Free Plan</span>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="flex-1 overflow-hidden p-4 space-y-3">

                  {/* Plan card */}
                  <div className="rounded-xl bg-[#1a1528] border border-[#7c3aed]/25 px-4 py-3" style={{ boxShadow: "0 0 24px rgba(124,58,237,0.12)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-[#7c3aed]/25 flex items-center justify-center">
                          <Zap className="h-3.5 w-3.5 text-[#a855f7]" />
                        </div>
                        <span className="text-white font-bold text-xs">Free Trial</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7c3aed] text-white text-[10px] font-bold" style={{ boxShadow: "0 0 10px rgba(124,58,237,0.35)" }}>
                        Upgrade Plan →
                      </div>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-3xl font-black text-white">Unlimited</span>
                      <span className="text-gray-500 text-[10px] flex items-center gap-1"><span className="text-yellow-400">●</span> 1 day left</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full" />
                    </div>
                    <div className="flex gap-2">
                      {["Free · Trial", "Basic · 15 Days", "Pro · 30 Days"].map((t, i) => (
                        <span key={t} className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${i === 0 ? "bg-[#7c3aed] text-white" : "bg-white/5 text-gray-500"}`}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { icon: Video,     label: "VIDEOS GENERATED", value: "12"          },
                      { icon: ImageIcon, label: "IMAGES GENERATED",  value: "34"          },
                      { icon: Sparkles,  label: "MEMBER SINCE",      value: "Apr 2026", sm: true },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl bg-[#1a1528] border border-white/8 p-3" style={{ boxShadow: "0 0 16px rgba(0,0,0,0.25)" }}>
                        <div className="flex items-center gap-1 mb-1">
                          <s.icon className="h-3 w-3 text-gray-500" />
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{s.label}</span>
                        </div>
                        <div className={`font-black text-white ${s.sm ? "text-base" : "text-2xl"}`}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Model access */}
                  <div className="rounded-xl bg-[#1a1528] border border-white/8 px-4 py-3" style={{ boxShadow: "0 0 16px rgba(0,0,0,0.2)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-3.5 w-3.5 text-[#a855f7]" />
                      <span className="text-white font-bold text-xs">Model Access</span>
                      <span className="ml-auto text-[9px] text-gray-500 font-semibold uppercase tracking-widest">Free Plan</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { name: "Veo 3.1 Fast [Lower Priority]", desc: "Google Flow video — used by extension", on: true,  icon: Video     },
                        { name: "Veo 3.1 - Fast",                desc: "Locked — upgrade required",           on: false, icon: Video     },
                        { name: "Nano Banana",                   desc: "Free image generation",               on: true,  icon: ImageIcon },
                      ].map(m => (
                        <div key={m.name} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${m.on ? "bg-[#7c3aed]/10 border-[#7c3aed]/25" : "bg-white/3 border-white/5 opacity-40"}`}>
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${m.on ? "bg-[#7c3aed]/20" : "bg-white/5"}`}>
                            <m.icon className={`h-3 w-3 ${m.on ? "text-[#a855f7]" : "text-gray-600"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[10px] font-bold truncate ${m.on ? "text-white" : "text-gray-600"}`}>{m.name}</div>
                            <div className="text-[9px] text-gray-500 truncate">{m.desc}</div>
                          </div>
                          <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${m.on ? "bg-green-500/20 text-green-400" : "bg-white/5 text-gray-600"}`}>
                            {m.on ? "✓ ON" : <img src="/gold-lock.png" alt="locked" className="h-3.5 w-3.5 object-contain mx-auto" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </main>
            </div>
          </div>
          {/* Bottom shadow tab */}
          <div className="h-4 bg-[#7c3aed] rounded-b-2xl mx-1 opacity-30" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR — purple
      ══════════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="container px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "1 Day", label: "Free trial on signup" },
              { num: "20cr", label: "Per AI video" },
              { num: "5cr", label: "Per AI image" },
              { num: "999K", label: "Max credits / plan" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-[#7c3aed] mb-1">{s.num}</div>
                <div className="text-gray-500 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EARN MONEY — dark, full-width promo
      ══════════════════════════════════════════ */}
      <section className="bg-[#0a0a0f] py-16 md:py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7c3aed18_0%,_transparent_65%)]" />
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#a855f7]/10 blur-[100px]" />

        <div className="container relative px-4 sm:px-8 mx-auto max-w-6xl">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/40 bg-[#7c3aed]/10 px-4 py-1.5 text-sm font-semibold text-[#c084fc] mb-4">
                <Gift className="h-3.5 w-3.5" /> Referral Program
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-3">
                Earn Money<br />
                <span className="text-[#a855f7]">by sharing.</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-md">
                Refer friends to BunnyFlow. When they buy a plan, you earn real USD — instantly credited to your wallet.
              </p>
            </div>
            <Button
              asChild
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-base h-13 px-8 rounded-2xl border-0 shadow-[5px_5px_0px_#4c1d95] hover:shadow-[3px_3px_0px_#4c1d95] hover:translate-x-[2px] hover:translate-y-[2px] transition-all shrink-0"
            >
              <Link href="/earn">See How It Works <ArrowRight className="ml-2 h-4 w-4 inline" /></Link>
            </Button>
          </div>

          {/* 3 reward cards + rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: Users,
                title: "Basic Plan Referral",
                tokens: "5 Tokens",
                usd: "$0.15",
                desc: "Earned when your referral buys a 15-day plan",
                color: "border-blue-500/25",
                glow: "rgba(59,130,246,0.08)",
              },
              {
                icon: Gift,
                title: "Pro Plan Referral",
                tokens: "7 Tokens",
                usd: "$0.21",
                desc: "Earned when your referral buys a 30-day plan",
                color: "border-[#7c3aed]/40",
                glow: "rgba(124,58,237,0.12)",
                highlight: true,
              },
              {
                icon: Wallet,
                title: "Withdraw Anytime",
                tokens: "34+ Tokens",
                usd: "$1.02+",
                desc: "Cash out via Binance, Easypaisa, or Bank Transfer",
                color: "border-green-500/20",
                glow: "rgba(52,211,153,0.06)",
              },
            ].map(c => (
              <div
                key={c.title}
                className={`rounded-2xl border-2 p-6 relative overflow-hidden transition-all hover:translate-y-[-2px] ${c.color} ${c.highlight ? "bg-[#1a0f35]" : "bg-[#0f0b1e]"}`}
                style={{ boxShadow: c.highlight ? `6px 6px 0px #4c1d95, 0 0 30px ${c.glow}` : `0 0 20px ${c.glow}` }}
              >
                {c.highlight && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[#7c3aed] text-white px-2 py-1 rounded-full">Best</span>
                  </div>
                )}
                <div className="h-10 w-10 rounded-xl bg-[#7c3aed]/15 flex items-center justify-center mb-4 border border-[#7c3aed]/25">
                  <c.icon className="h-5 w-5 text-[#a855f7]" />
                </div>
                <div className="text-white font-black text-sm mb-2">{c.title}</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-black text-[#a855f7]">{c.usd}</span>
                  <span className="text-gray-500 text-sm font-medium">USD</span>
                </div>
                <div className="text-[#7c3aed]/70 text-xs font-bold mb-3">{c.tokens}</div>
                <p className="text-gray-600 text-xs leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Rate strip */}
          <div className="rounded-2xl border border-[#7c3aed]/20 bg-white/3 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-[#7c3aed] shrink-0" />
              <span className="text-gray-400 text-sm">
                <span className="text-white font-bold">1 Token = $0.03 USD</span> · No referral limit · Instant rewards on purchase
              </span>
            </div>
            <Link href="/register" className="text-[#a855f7] font-black text-sm hover:text-white transition-colors flex items-center gap-1.5 shrink-0">
              Start earning for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — white, 3D cards, Jeton clean style
      ══════════════════════════════════════════ */}
      <section className="bg-[#f7f5ff] py-20 md:py-28">
        <div className="container px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="mb-14">
            <h2 className="text-5xl md:text-6xl font-black text-[#0a0a0f] leading-tight mb-4">
              Built for creators<br />
              <span className="text-[#7c3aed]">at every level.</span>
            </h2>
            <p className="text-gray-500 text-xl max-w-xl">Everything you need to generate AI content at scale — without the friction.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Video, title: "Veo 3 Video", desc: "Google's most advanced video model. Generate cinematic 4K AI videos in seconds." },
              { icon: ImageIcon, title: "Imagen 4", desc: "Pixel-perfect image generation using Imagen 4 and Nano Banana models." },
              { icon: Zap, title: "Credit System", desc: "Simple credits. 20 per video, 5 per image. Buy once, use anytime." },
              { icon: Chrome, title: "Chrome Extension", desc: "Installs in 30 seconds. Bridges your BunnyFlow credits with Google Flow automatically." },
              { icon: Star, title: "Premium Models Unlocked", desc: "Higher plans unlock Veo 3 and other paid models, fully managed for you." },
              { icon: Check, title: "No Waitlist", desc: "Start generating immediately. No waitlist, no approval, no friction." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border-2 border-transparent hover:border-[#7c3aed] p-6 space-y-3 transition-all hover:shadow-[5px_5px_0px_#7c3aed] group">
                <div className="h-11 w-11 rounded-xl bg-[#f3f0ff] group-hover:bg-[#7c3aed] flex items-center justify-center transition-colors">
                  <f.icon className="h-5 w-5 text-[#7c3aed] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-black text-[#0a0a0f]">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — dark
      ══════════════════════════════════════════ */}
      <section className="bg-[#0a0a0f] py-20 md:py-28 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7c3aed15_0%,_transparent_70%)]" />
        <div className="container relative px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="mb-14">
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
              Ready in<br /><span className="text-gradient-purple">4 steps.</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-lg">No complicated setup. Install the extension, connect your account, and start generating.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { num: "01", title: "Create an Account", desc: "Sign up with your email and get a 1-day free trial instantly — no card required." },
              { num: "02", title: "Install the Extension", desc: "Download the BunnyFlow Chrome extension and install it in one click." },
              { num: "03", title: "Open Google Flow", desc: "Visit labs.google/fx/tools/flow. The extension syncs your session automatically." },
              { num: "04", title: "Generate & Enjoy", desc: "Type your prompt, hit generate. Credits deduct automatically after each creation." },
            ].map((step) => (
              <div key={step.num} className="group flex gap-5 p-6 rounded-2xl border border-[#7c3aed]/20 bg-[#0f0b1e] hover:border-[#7c3aed] transition-all">
                <div className="shrink-0 text-5xl font-black text-[#7c3aed]/20 group-hover:text-[#7c3aed] transition-colors leading-none">{step.num}</div>
                <div>
                  <h3 className="text-white font-black text-lg mb-1.5">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING PREVIEW — white, Jeton bold style
      ══════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-28">
        <div className="container px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="mb-14">
            <h2 className="text-5xl md:text-6xl font-black text-[#0a0a0f] leading-tight mb-4">
              3 plans.<br /><span className="text-[#7c3aed]">Unlimited power.</span>
            </h2>
            <p className="text-gray-500 text-xl max-w-lg">Try free for a day, then go unlimited. Contact your reseller to upgrade.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-12 max-w-3xl">
            {[
              { plan: "Free", duration: "1 Day", credits: "Trial", tag: null },
              { plan: "Basic", duration: "15 Days", credits: "Unlimited", tag: null },
              { plan: "Pro", duration: "30 Days", credits: "Unlimited", tag: "Best Value" },
            ].map((p) => (
              <div
                key={p.plan}
                className={`rounded-2xl p-6 border-2 transition-all ${
                  p.tag
                    ? "border-[#7c3aed] bg-[#0a0a0f] text-white"
                    : "border-gray-100 bg-white hover:border-[#7c3aed]"
                }`}
                style={{ boxShadow: p.tag ? "6px 6px 0px #7c3aed" : undefined }}
              >
                {p.tag && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#a855f7] mb-2">{p.tag}</div>
                )}
                <div className={`text-xl font-black mb-1 ${p.tag ? "text-white" : "text-[#0a0a0f]"}`}>{p.plan}</div>
                <div className={`text-3xl font-black mb-0.5 ${p.tag ? "text-[#a855f7]" : "text-[#7c3aed]"}`}>{p.credits}</div>
                <div className={`text-sm mb-1 ${p.tag ? "text-gray-400" : "text-gray-400"}`}>credits</div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold mt-2 ${p.tag ? "bg-[#7c3aed]/20 text-[#a855f7]" : "bg-[#f3f0ff] text-[#7c3aed]"}`}>
                  ⏱ {p.duration}
                </div>
              </div>
            ))}
          </div>

          <Button asChild className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-base h-13 px-8 rounded-2xl border-0 shadow-[5px_5px_0px_#4c1d95] hover:shadow-[3px_3px_0px_#4c1d95] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <Link href="/pricing">View all plans <ArrowRight className="ml-2 h-4 w-4 inline" /></Link>
          </Button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS — dark bg, iOS 26 glass cards, auto-scroll up
      ══════════════════════════════════════════ */}
      <section className="bg-[#0a0a0f] py-10 md:py-14 overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#7c3aed18_0%,_transparent_60%)]" />
        <div className="container relative px-4 sm:px-8 mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
              Hear it from our <span className="text-[#a855f7]">clients</span>
            </h2>
            <p className="text-gray-400 text-base max-w-lg mx-auto">Real users sharing their BunnyFlow experience.</p>
          </div>
        </div>

        {/* Scrolling columns */}
        <div className="flex gap-4 overflow-hidden" style={{ maxHeight: "420px", maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)" }}>

          {/* Column 1 — scrolls up */}
          <div className="flex flex-col gap-4 shrink-0 animate-[scrollUp_22s_linear_infinite]" style={{ minWidth: "340px" }}>
            {[
              { name: "Vamsi K.",    initials: "VK", color: "#7c3aed", title: "Recommended",                     body: "Very happy with the tool. Does what it says — simple and smooth. BunnyFlow connected my session instantly and I generated my first video in under a minute." },
              { name: "Layla M.",   initials: "LM", color: "#a855f7", title: "Game changer for content creators", body: "I was skeptical at first but the Chrome extension is incredibly seamless. My workflow went from hours to minutes with BunnyFlow." },
              { name: "Karl R.",    initials: "KR", color: "#6d28d9", title: "Best AI video tool I've tried",    body: "I've been using BunnyFlow for a few weeks. The support is great and I can always generate high-quality videos without any issues." },
              { name: "Priya S.",   initials: "PS", color: "#8b5cf6", title: "Unlimited is no joke",             body: "On the Pro plan now and honestly the unlimited access is incredible. No throttling, no waiting. Just pure AI generation at full speed." },
              { name: "Vamsi K.",   initials: "VK", color: "#7c3aed", title: "Recommended",                     body: "Very happy with the tool. Does what it says — simple and smooth. BunnyFlow connected my session instantly and I generated my first video in under a minute." },
              { name: "Layla M.",   initials: "LM", color: "#a855f7", title: "Game changer for content creators", body: "I was skeptical at first but the Chrome extension is incredibly seamless. My workflow went from hours to minutes with BunnyFlow." },
            ].map((r, i) => (
              <div key={i} className="rounded-2xl p-5 border border-white/10"
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                <p className="text-white font-bold text-sm mb-1">{r.title}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{r.body}</p>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0" style={{ background: r.color }}>
                    {r.initials}
                  </div>
                  <span className="text-gray-300 text-sm font-semibold">{r.name}</span>
                  <div className="flex ml-auto gap-0.5">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="h-3 w-3 fill-[#a855f7] text-[#a855f7]" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2 — scrolls up (offset) */}
          <div className="flex flex-col gap-4 shrink-0 animate-[scrollUp_28s_linear_infinite]" style={{ minWidth: "340px", animationDelay: "-8s" }}>
            {[
              { name: "Dennis P.",  initials: "DP", color: "#a855f7", title: "Awesome app, very user friendly",  body: "Would highly recommend BunnyFlow to my friends. Clean interface, simple credits, and the extension just works out of the box." },
              { name: "Leonie A.",  initials: "LA", color: "#7c3aed", title: "Fast & reliable",                  body: "The generation speed is insane. Veo 3 through BunnyFlow is significantly better than anything else I've tried. Worth every credit." },
              { name: "Hassan R.",  initials: "HR", color: "#6d28d9", title: "Best for German creators",         body: "The best AI video solution for creators. I've been a BunnyFlow user for months — the team always delivers updates and the support is top notch." },
              { name: "Mia T.",     initials: "MT", color: "#8b5cf6", title: "Blown away by the quality",        body: "I showed my clients videos I generated with BunnyFlow and they thought they were shot with a real drone. Absolutely unreal quality." },
              { name: "Dennis P.",  initials: "DP", color: "#a855f7", title: "Awesome app, very user friendly",  body: "Would highly recommend BunnyFlow to my friends. Clean interface, simple credits, and the extension just works out of the box." },
              { name: "Leonie A.",  initials: "LA", color: "#7c3aed", title: "Fast & reliable",                  body: "The generation speed is insane. Veo 3 through BunnyFlow is significantly better than anything else I've tried. Worth every credit." },
            ].map((r, i) => (
              <div key={i} className="rounded-2xl p-5 border border-white/10"
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                <p className="text-white font-bold text-sm mb-1">{r.title}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{r.body}</p>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0" style={{ background: r.color }}>
                    {r.initials}
                  </div>
                  <span className="text-gray-300 text-sm font-semibold">{r.name}</span>
                  <div className="flex ml-auto gap-0.5">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="h-3 w-3 fill-[#a855f7] text-[#a855f7]" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 3 — scrolls up (offset 2) */}
          <div className="flex flex-col gap-4 shrink-0 animate-[scrollUp_25s_linear_infinite] hidden lg:flex" style={{ minWidth: "340px", animationDelay: "-15s" }}>
            {[
              { name: "Arjun V.",   initials: "AV", color: "#7c3aed", title: "10/10 would recommend",            body: "Everything just works. I buy credits, install the extension, open Google Flow, and I'm generating within 30 seconds. No BS, no waiting." },
              { name: "Sofia L.",   initials: "SL", color: "#a855f7", title: "Incredible value",                 body: "The Basic plan alone gives me 15 days of unlimited generation. For the price, this is unbeatable. My YouTube channel has never looked better." },
              { name: "Omar K.",    initials: "OK", color: "#8b5cf6", title: "Smooth extension, great results",  body: "The Chrome extension is rock solid. It auto-syncs my account with Google Flow and I've never had a dropped session. Highly professional." },
              { name: "Emma W.",    initials: "EW", color: "#6d28d9", title: "Beautiful cinematic videos",       body: "I'm a filmmaker and BunnyFlow has changed how I create concept videos for clients. The Veo 3 model produces absolutely stunning results." },
              { name: "Arjun V.",   initials: "AV", color: "#7c3aed", title: "10/10 would recommend",            body: "Everything just works. I buy credits, install the extension, open Google Flow, and I'm generating within 30 seconds. No BS, no waiting." },
              { name: "Sofia L.",   initials: "SL", color: "#a855f7", title: "Incredible value",                 body: "The Basic plan alone gives me 15 days of unlimited generation. For the price, this is unbeatable. My YouTube channel has never looked better." },
            ].map((r, i) => (
              <div key={i} className="rounded-2xl p-5 border border-white/10"
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                <p className="text-white font-bold text-sm mb-1">{r.title}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{r.body}</p>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0" style={{ background: r.color }}>
                    {r.initials}
                  </div>
                  <span className="text-gray-300 text-sm font-semibold">{r.name}</span>
                  <div className="flex ml-auto gap-0.5">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="h-3 w-3 fill-[#a855f7] text-[#a855f7]" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA — purple, bold Jeton style
      ══════════════════════════════════════════ */}
      <section className="bg-[#7c3aed] py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#a855f740,_transparent_60%)]" />
        <div className="container relative px-4 sm:px-8 mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
              Start generating<br />AI videos today.
            </h2>
            <p className="text-purple-100 text-xl max-w-md">
              1-day free trial on signup. No credit card. Just install, connect, and create.
            </p>
          </div>
          <div className="flex flex-col gap-4 shrink-0">
            <img src="/bunny-logo.jpeg" alt="BunnyFlow" className="h-24 w-24 rounded-full border-4 border-white/30 object-cover mx-auto md:mx-0 shadow-[0_0_30px_rgba(255,255,255,0.15)]" />
            <Button asChild size="lg" className="bg-white text-[#7c3aed] hover:bg-gray-100 font-black text-lg h-14 px-10 rounded-2xl border-0 shadow-[5px_5px_0px_rgba(0,0,0,0.2)]">
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold text-base h-12 px-8 rounded-2xl">
              <Link href="/extension">Download Extension</Link>
            </Button>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
