import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Check, X, MessageCircle, Zap, Infinity, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const plans = [
  {
    id: "free",
    name: "Free",
    subtitle: "Try it out",
    price: "$0",
    duration: "1 Day",
    durationIcon: Clock,
    credits: "Trial",
    creditsNote: "Limited generation",
    popular: false,
    color: "gray",
    features: [
      "1-day trial access",
      "AI video — Veo 3.1 Fast [Lower Priority]",
      "AI image — Nano Banana",
      "BunnyFlow Chrome extension",
      "Email support",
    ],
    cta: "Start Free Trial",
    isFree: true,
  },
  {
    id: "basic",
    name: "Basic",
    subtitle: "Perfect to start",
    price: "Contact",
    duration: "15 Days",
    durationIcon: Clock,
    credits: "Unlimited",
    creditsNote: "For 15 days",
    popular: false,
    color: "purple",
    features: [
      "15-day full access",
      "Unlimited AI video generation",
      "Video — Veo 3.1 Fast [Lower Priority]",
      "Unlimited AI image generation",
      "Image — Nano Banana + Pro Imagen",
      "BunnyFlow Chrome extension",
      "Priority support",
    ],
    cta: "Get Basic",
    isFree: false,
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "Maximum power",
    price: "Contact",
    duration: "30 Days",
    durationIcon: Clock,
    credits: "Unlimited",
    creditsNote: "For 30 days",
    popular: true,
    color: "purple",
    features: [
      "30-day full access",
      "Unlimited AI video generation",
      "Video — Veo 3.1 Fast [Lower Priority]",
      "Unlimited AI image generation",
      "Image — Nano Banana + Pro Imagen",
      "All premium models unlocked",
      "BunnyFlow Chrome extension",
      "24/7 priority support",
    ],
    cta: "Get Pro",
    isFree: false,
  },
];

export default function Pricing() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.isFree) return;
    setSelectedPlan(plan.name);
    setShowModal(true);
  };

  return (
    <PublicLayout>

      {/* ── CONTACT POPUP MODAL ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl border-2 border-[#7c3aed] shadow-[10px_10px_0px_#7c3aed] max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>

            {/* Icon */}
            <div className="h-16 w-16 rounded-2xl bg-[#7c3aed] flex items-center justify-center mb-6 shadow-[4px_4px_0px_#4c1d95]">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>

            {/* Content */}
            <h3 className="text-3xl font-black text-[#0a0a0f] mb-2">
              Get <span className="text-[#7c3aed]">{selectedPlan}</span> Plan
            </h3>
            <p className="text-gray-500 text-base mb-6 leading-relaxed">
              To activate the <strong>{selectedPlan}</strong> plan, please contact your reseller or admin. They will set up your account with full access.
            </p>

            {/* Contact info */}
            <div className="bg-[#f3f0ff] rounded-2xl border border-[#7c3aed]/20 p-5 mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#7c3aed] flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#4c1d95]">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</div>
                  <div className="text-[#0a0a0f] font-black">Your Reseller / Admin</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 pl-12">
                Reach out to the person who referred you to BunnyFlow, or contact the admin directly to get your plan activated.
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 h-12 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black rounded-xl border-0 shadow-[4px_4px_0px_#4c1d95] hover:shadow-[2px_2px_0px_#4c1d95] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                onClick={() => setShowModal(false)}
              >
                Got it
              </Button>
              <Button
                variant="outline"
                className="h-12 px-5 border-2 border-gray-200 hover:border-[#7c3aed] text-gray-500 hover:text-[#7c3aed] rounded-xl font-bold transition-colors"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="bg-[#0a0a0f] py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#7c3aed20_0%,_transparent_70%)]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#7c3aed]/10 blur-[80px]" />

        <div className="container relative px-4 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/40 bg-[#7c3aed]/10 px-4 py-1.5 text-sm font-semibold text-[#c084fc] mb-6">
              <Zap className="h-3.5 w-3.5" /> Simple Plan Pricing
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white leading-none mb-4">
              Choose your<br />
              <span className="text-gradient-purple">access level.</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-xl mx-auto">
              All paid plans include unlimited credits. Contact your reseller to activate.
            </p>
          </div>

          {/* Key stats */}
          <div className="flex justify-center gap-10 text-center">
            <div>
              <div className="text-3xl font-black text-[#a855f7]">20 cr</div>
              <div className="text-sm text-gray-500">per video</div>
            </div>
            <div className="w-px bg-[#7c3aed]/20" />
            <div>
              <div className="text-3xl font-black text-[#a855f7]">5 cr</div>
              <div className="text-sm text-gray-500">per image</div>
            </div>
            <div className="w-px bg-[#7c3aed]/20" />
            <div>
              <div className="text-3xl font-black text-[#a855f7]">∞</div>
              <div className="text-sm text-gray-500">paid plan credits</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANS — white bg ── */}
      <section className="bg-white py-20">
        <div className="container px-4 mx-auto max-w-5xl">

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border-[3px] p-8 transition-all duration-200
                  ${plan.popular
                    ? "border-[#7c3aed] bg-[#0a0a0f] text-white"
                    : "border-gray-100 bg-white hover:border-[#7c3aed]"
                  }`}
                style={{
                  boxShadow: plan.popular
                    ? "8px 8px 0px #7c3aed"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!plan.popular) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "6px 6px 0px #7c3aed";
                    (e.currentTarget as HTMLElement).style.transform = "translate(-2px, -2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.popular) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.transform = "translate(0,0)";
                  }
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#7c3aed] text-white text-xs font-black px-5 py-2 rounded-full" style={{ boxShadow: "3px 3px 0px #4c1d95" }}>
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className={`text-sm font-bold uppercase tracking-widest mb-1 ${plan.popular ? "text-[#a855f7]" : "text-[#7c3aed]"}`}>
                    {plan.subtitle}
                  </div>
                  <h3 className={`text-3xl font-black mb-3 ${plan.popular ? "text-white" : "text-[#0a0a0f]"}`}>
                    {plan.name}
                  </h3>

                  {/* Duration badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-black text-sm ${
                      plan.popular
                        ? "border-[#7c3aed] bg-[#7c3aed]/20 text-[#a855f7]"
                        : "border-[#7c3aed]/30 bg-[#f3f0ff] text-[#7c3aed]"
                    }`}
                    style={{ boxShadow: "3px 3px 0px #7c3aed" }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {plan.duration}
                  </div>
                </div>

                {/* Credits block */}
                <div
                  className={`rounded-2xl p-5 mb-6 text-center border-2 ${
                    plan.popular
                      ? "border-[#7c3aed]/40 bg-[#7c3aed]/15"
                      : "border-[#7c3aed]/20 bg-[#f3f0ff]"
                  }`}
                  style={{ boxShadow: "4px 4px 0px #7c3aed" }}
                >
                  <div className={`text-4xl font-black flex items-center justify-center gap-1 ${plan.popular ? "text-[#a855f7]" : "text-[#7c3aed]"}`}>
                    {plan.credits === "Unlimited" ? (
                      <><Infinity className="h-8 w-8" /> Credits</>
                    ) : (
                      plan.credits
                    )}
                  </div>
                  <div className={`text-sm font-medium mt-1 ${plan.popular ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.creditsNote}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="h-5 w-5 rounded-full bg-[#7c3aed] flex items-center justify-center shrink-0 mt-0.5"
                        style={{ boxShadow: "2px 2px 0px #4c1d95" }}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className={`text-sm ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.isFree ? (
                  <Button
                    asChild
                    className="w-full h-13 font-black text-base rounded-2xl border-0 bg-white text-[#7c3aed] border-2 border-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-colors"
                    style={{ boxShadow: "5px 5px 0px #7c3aed" }}
                  >
                    <Link href="/register">{plan.cta}</Link>
                  </Button>
                ) : (
                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full h-13 py-3.5 font-black text-base rounded-2xl border-0 transition-all cursor-pointer ${
                      plan.popular
                        ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                        : "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                    }`}
                    style={{ boxShadow: "5px 5px 0px #4c1d95" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0px #4c1d95";
                      (e.currentTarget as HTMLElement).style.transform = "translate(2px,2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "5px 5px 0px #4c1d95";
                      (e.currentTarget as HTMLElement).style.transform = "translate(0,0)";
                    }}
                  >
                    {plan.cta} →
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Bottom info strip */}
          <div className="mt-16 rounded-3xl overflow-hidden border-2 border-[#7c3aed]" style={{ boxShadow: "8px 8px 0px #7c3aed" }}>
            <div className="bg-[#0a0a0f] px-8 py-6 grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-black text-[#a855f7] mb-1">20 cr</div>
                <div className="text-sm text-gray-400">per AI video generated</div>
              </div>
              <div className="sm:border-x border-[#7c3aed]/20">
                <div className="text-3xl font-black text-[#a855f7] mb-1">5 cr</div>
                <div className="text-sm text-gray-400">per AI image generated</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#a855f7] mb-1">∞</div>
                <div className="text-sm text-gray-400">credits on paid plans</div>
              </div>
            </div>
            <div className="bg-[#7c3aed] px-8 py-4 text-center">
              <p className="text-white font-medium text-sm">
                To activate any paid plan, contact your reseller or admin. They will set up your access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ-style questions ── */}
      <section className="bg-[#f7f5ff] py-16">
        <div className="container px-4 mx-auto max-w-3xl">
          <h2 className="text-4xl font-black text-[#0a0a0f] mb-10 text-center">
            Common <span className="text-[#7c3aed]">questions</span>
          </h2>
          <div className="space-y-4">
            {[
              { q: "What happens when my plan expires?", a: "Your account becomes read-only. You can still view your generation history, but new generations require an active plan." },
              { q: "Are credits truly unlimited on paid plans?", a: "Yes — Basic and Pro plans have unlimited credits for their full duration (15 or 30 days). Generate as much as you want." },
              { q: "How do I contact my reseller?", a: "Reach out to the person who shared BunnyFlow with you, or contact your admin. They'll activate your plan directly." },
              { q: "Can I switch plans mid-way?", a: "Yes, your reseller can upgrade you to a higher plan at any time. Contact them to arrange." },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#7c3aed] p-6 transition-all"
                style={{ boxShadow: "none" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0px #7c3aed"; (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; }}
              >
                <h4 className="font-black text-[#0a0a0f] mb-2">{faq.q}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
