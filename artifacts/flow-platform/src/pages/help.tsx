import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  BookOpen, ChevronDown, ChevronUp, Chrome,
  Zap, Video, Gift, CreditCard, Play, AlertCircle, CheckCircle2, Lock,
  ExternalLink, Youtube, HelpCircle, ArrowRight
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Register & Choose a Plan",
    icon: CreditCard,
    color: "#a855f7",
    steps: [
      "Go to flowbybunny.site and click Sign Up.",
      "Enter your email, username, and password to create your account.",
      "Free plan gives 1 day access — upgrade to Basic (15 days) or Pro (30 days) for full access.",
      "Contact admin or use a referral link to get your plan activated.",
    ],
  },
  {
    number: "02",
    title: "Install the Chrome Extension",
    icon: Chrome,
    color: "#7c3aed",
    steps: [
      "Go to the Extension page from the top navbar.",
      'Click "Download Extension" to get the .zip file.',
      "Open Chrome and go to chrome://extensions/",
      'Enable "Developer Mode" toggle in the top-right corner.',
      'Click "Load Unpacked" and select the extracted extension folder.',
      "The BunnyFlow extension icon will appear in your browser toolbar.",
    ],
  },
  {
    number: "03",
    title: "Login to the Extension",
    icon: Zap,
    color: "#06b6d4",
    steps: [
      "Click the BunnyFlow icon in your Chrome toolbar.",
      "Enter the same email & password you used to register on the portal.",
      'Click "Login" — your plan status will appear.',
      "The extension will sync your account automatically.",
      "If you see your plan (Basic/Pro), you are ready to generate!",
    ],
  },
  {
    number: "04",
    title: "Generate Videos on Google Flow",
    icon: Video,
    color: "#22c55e",
    steps: [
      'Open Google Flow: labs.google/fx/tools/flow (or click "Open Google Flow" from the portal menu).',
      "The BunnyFlow extension will inject your session automatically.",
      'You will only see "Veo 3.1 Fast [Lower Priority]" model — this is the only allowed model.',
      "Other models (Veo 3.1 Fast, Veo 3.1 Quality) are locked for Free plan users.",
      "Type your prompt and click Generate to create your video!",
      "Free plan users do NOT get Google Flow access — upgrade to Basic or Pro.",
    ],
  },
  {
    number: "05",
    title: "Access Google Gemini Pro",
    icon: Zap,
    color: "#06b6d4",
    steps: [
      "Gemini Pro access is available for Pro plan users only (Basic plan does NOT include Gemini).",
      'Open Google Gemini: click "Get Access Gemini Pro" below, or go to gemini.google.com/app.',
      "The BunnyFlow extension will automatically inject your Gemini Pro session.",
      "Your account switcher will be locked (dimmed) — do NOT try to switch accounts.",
      "Chat history is hidden for privacy — this is intentional.",
      "All Gemini Pro features are unlocked: Advanced models, long context, file uploads, and more.",
    ],
    geminiLink: true,
  },
  {
    number: "06",
    title: "Refer Friends & Earn Tokens",
    icon: Gift,
    color: "#f59e0b",
    steps: [
      'Go to "Refer & Earn" from the portal menu.',
      "Copy your unique referral link and share it with friends.",
      "When a friend registers using your link and buys a plan, you earn tokens automatically.",
      "Basic plan purchase = 5 tokens ($0.15), Pro plan = 7 tokens ($0.21).",
      "Minimum withdrawal is 34 tokens ($1.02) — withdraw via Binance, Easypaisa, or Bank Transfer.",
    ],
  },
];

const VIDEOS = [
  {
    id: "portal-intro",
    title: "Portal Overview — Getting Started",
    description: "Complete walkthrough of the BunnyFlow portal, dashboard, and all features.",
    embedId: "",
    placeholder: true,
  },
  {
    id: "extension-install",
    title: "How to Install the Extension",
    description: "Step-by-step guide to download, install, and activate the Chrome extension.",
    embedId: "",
    placeholder: true,
  },
  {
    id: "google-flow",
    title: "Generating Videos on Google Flow",
    description: "How to use Google Flow with BunnyFlow extension to generate AI videos.",
    embedId: "",
    placeholder: true,
  },
  {
    id: "referral",
    title: "Refer & Earn — How It Works",
    description: "Learn how to share your referral link and earn tokens for every plan purchase.",
    embedId: "",
    placeholder: true,
  },
];

const FAQS = [
  {
    q: "Why can't I access Google Flow?",
    a: "Google Flow access requires a Basic or Pro plan. Free plan users do not get access. Please upgrade your plan from the Pricing page.",
  },
  {
    q: "Which AI model can I use?",
    a: 'Only "Veo 3.1 Fast [Lower Priority]" is available. Other models (Veo 3.1 Fast, Veo 3.1 Quality) are locked — even with a paid plan. This is controlled by the extension.',
  },
  {
    q: "The extension shows Free Plan even after I upgraded.",
    a: "Log out of the extension and log back in. The extension will re-sync your latest plan from the portal.",
  },
  {
    q: "How long does my plan last?",
    a: "Free: 1 day, Basic: 15 days, Pro: 30 days — starting from the day your plan is activated.",
  },
  {
    q: "How do I withdraw my referral tokens?",
    a: 'Go to Refer & Earn → Withdraw tab. Minimum withdrawal is 34 tokens ($1.02). Supported methods: Binance, Easypaisa, Bank Transfer. Admin processes withdrawals manually.',
  },
  {
    q: "My plan is expired — what should I do?",
    a: "Visit the Pricing page and contact admin to renew. Once renewed, log out and back in on the extension to refresh your access.",
  },
  {
    q: "Can I use the extension on multiple browsers?",
    a: "Yes, but you can only be logged in on one browser at a time. Your session is tied to your account.",
  },
];

export default function Help() {
  const [activeTab, setActiveTab] = useState<"guide" | "videos" | "faq">("guide");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6 text-[#a855f7]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Help & Guide</h1>
            <p className="text-gray-500 text-sm mt-0.5">Everything you need to use BunnyFlow like a pro</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1a1528] border border-white/8 w-fit">
          {[
            { key: "guide", label: "Step-by-Step Guide", icon: BookOpen },
            { key: "videos", label: "Video Tutorials", icon: Youtube },
            { key: "faq",   label: "FAQ", icon: HelpCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === key
                  ? "bg-[#7c3aed] text-white"
                  : "text-gray-500 hover:text-white hover:bg-white/6"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── GUIDE TAB ── */}
        {activeTab === "guide" && (
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">Follow these steps in order to set up and start using BunnyFlow.</p>
            {STEPS.map((section, idx) => {
              const Icon = section.icon;
              const isOpen = openStep === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/8 bg-[#1a1528] overflow-hidden transition-all"
                  style={{ boxShadow: isOpen ? `0 0 20px ${section.color}20` : "none" }}
                >
                  <button
                    onClick={() => setOpenStep(isOpen ? null : idx)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors text-left"
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ background: `${section.color}20`, borderColor: `${section.color}40` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: section.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-black tracking-widest"
                          style={{ color: section.color }}
                        >
                          STEP {section.number}
                        </span>
                      </div>
                      <p className="text-white font-black text-base">{section.title}</p>
                    </div>
                    <div className="text-gray-500 shrink-0">
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 border-t border-white/6">
                      <ol className="space-y-3 mt-3">
                        {section.steps.map((step, si) => (
                          <li key={si} className="flex items-start gap-3">
                            <div
                              className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5"
                              style={{ background: `${section.color}25`, color: section.color }}
                            >
                              {si + 1}
                            </div>
                            <span className="text-gray-300 text-sm leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                      {(section as any).geminiLink && (
                        <a
                          href="https://gemini.google.com/app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
                          style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", boxShadow: "0 0 16px rgba(6,182,212,0.35)" }}
                        >
                          <Zap className="h-4 w-4" />
                          Get Access Gemini Pro
                          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick links */}
            <div className="rounded-2xl border border-white/8 bg-[#1a1528] p-5 mt-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Quick Links</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Upgrade Plan",     href: "/pricing",                           icon: CreditCard, color: "#a855f7" },
                  { label: "Get Extension",     href: "/extension",                         icon: Chrome,     color: "#7c3aed" },
                  { label: "Refer & Earn",      href: "/refer",                             icon: Gift,       color: "#f59e0b" },
                  { label: "Open Google Flow",  href: "https://labs.google/fx/tools/flow",  icon: ExternalLink, color: "#22c55e", external: true },
                  { label: "Get Access Gemini Pro", href: "https://gemini.google.com/app", icon: Zap, color: "#06b6d4", external: true },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${link.color}20` }}>
                      <link.icon className="h-4 w-4" style={{ color: link.color }} />
                    </div>
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors flex-1">{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VIDEOS TAB ── */}
        {activeTab === "videos" && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">Watch these tutorials to quickly get started with BunnyFlow.</p>
            <div className="grid gap-4">
              {VIDEOS.map((video) => (
                <div
                  key={video.id}
                  className="rounded-2xl border border-white/8 bg-[#1a1528] overflow-hidden"
                >
                  {/* Video embed area */}
                  {video.embedId && !video.placeholder ? (
                    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${video.embedId}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full flex flex-col items-center justify-center gap-3 bg-[#0f0d1a] border-b border-white/6"
                      style={{ minHeight: 200 }}
                    >
                      <div className="h-14 w-14 rounded-2xl bg-red-600/15 border border-red-600/25 flex items-center justify-center">
                        <Youtube className="h-7 w-7 text-red-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-sm font-bold">Video Coming Soon</p>
                        <p className="text-gray-600 text-xs mt-0.5">Admin will upload tutorial videos here</p>
                      </div>
                    </div>
                  )}
                  {/* Info */}
                  <div className="px-5 py-4 flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-red-600/15 border border-red-600/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Play className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-black text-sm">{video.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{video.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note for admin */}
            <div className="rounded-xl border border-[#7c3aed]/25 bg-[#7c3aed]/8 px-5 py-4 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-[#a855f7] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#a855f7] text-sm font-bold">Adding Video Tutorials</p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  To add a YouTube video, paste its embed ID (the part after <code className="text-[#a855f7]">youtube.com/watch?v=</code>) into the portal code. Contact your developer to update the video links.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── FAQ TAB ── */}
        {activeTab === "faq" && (
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">Common questions answered — read these before contacting support.</p>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/8 bg-[#1a1528] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-left"
                  >
                    <div className="h-7 w-7 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center shrink-0 border border-[#7c3aed]/30">
                      <HelpCircle className="h-3.5 w-3.5 text-[#a855f7]" />
                    </div>
                    <p className="text-white font-bold text-sm flex-1">{faq.q}</p>
                    <div className="text-gray-500 shrink-0">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 border-t border-white/6 pt-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                        <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Contact note */}
            <div className="rounded-xl border border-white/8 bg-[#1a1528] px-5 py-4 flex items-center gap-3 mt-2">
              <Lock className="h-4 w-4 text-gray-500 shrink-0" />
              <p className="text-gray-500 text-sm">
                Still have questions? Contact the admin directly via WhatsApp or the platform's support channel.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
