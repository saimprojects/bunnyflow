import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useCreateGeneration } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, ExternalLink, MonitorPlay, Smartphone, Square } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

const MODELS = [
  { id: "nano_banana", label: "Nano Banana", badge: "Free",   desc: "Fast, high-quality video generation" },
  { id: "veo3_fast",   label: "Veo 3 Fast",  badge: "Ultra+", desc: "Faster Veo 3 generation without audio" },
  { id: "veo3",        label: "Veo 3",        badge: "Ultra+", desc: "Best quality, native audio generation" },
];

const MODES = [
  { id: "lower", label: "Lower Priority", badge: "Free",  desc: "Standard queue — free for all plans" },
  { id: "high",  label: "High Priority",  badge: "Ultra", desc: "Skip the queue, instant generation" },
];

const RATIOS = [
  { id: "landscape", label: "16:9", icon: MonitorPlay },
  { id: "portrait",  label: "9:16", icon: Smartphone  },
  { id: "square",    label: "1:1",  icon: Square       },
];

export default function GenerateVideo() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createGeneration = useCreateGeneration();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("nano_banana");
  const [mode, setMode] = useState("lower");
  const [ratio, setRatio] = useState("landscape");
  const [duration, setDuration] = useState(6);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt required", description: "Please describe what you want to generate", variant: "destructive" });
      return;
    }
    createGeneration.mutate({
      data: { type: "video", prompt, model, aspectRatio: ratio, duration }
    }, {
      onSuccess: () => {
        toast({ title: "Opening Google Flow…", description: "Your session is being connected." });
        window.open("https://labs.google/fx/tools/flow", "_blank");
      },
      onError: (err) => {
        const msg = err.error?.message || "Failed to start";
        const isPlanErr = err.status === 402 || msg.toLowerCase().includes("plan") || msg.toLowerCase().includes("expired");
        toast({
          title: isPlanErr ? "Plan Expired" : "Error",
          description: isPlanErr ? "Your plan has expired. Contact admin to renew your access." : msg,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl mx-auto space-y-6 pb-8">

        {/* Header */}
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Powered by Google Flow · Veo 3</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#7c3aed]/15 border border-[#7c3aed]/30 text-xs text-[#a855f7] font-medium">
            <Zap className="h-3 w-3" />
            Unlimited generations · Daily plan-based access
          </div>
        </div>

        {/* VIDEO PROMPT */}
        <div className="rounded-xl bg-[#1a1528] border border-white/8 overflow-hidden" style={{ boxShadow: "0 0 20px rgba(124,58,237,0.08)" }}>
          <div className="px-4 py-2.5 border-b border-white/8">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Video Prompt</span>
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Cinematic drone shot over a neon-lit cyberpunk city at night, rain reflecting neon signs, slow smooth motion, highly detailed..."
            className="min-h-[110px] resize-none bg-transparent border-0 text-white text-sm placeholder:text-gray-600 focus-visible:ring-0 px-4 py-3"
            data-testid="input-prompt"
          />
        </div>

        {/* MODEL */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Model</p>
          <div className="grid grid-cols-3 gap-2">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`rounded-xl p-3 text-left border transition-all ${
                  model === m.id
                    ? "border-[#7c3aed] bg-[#7c3aed]/15"
                    : "border-white/8 bg-[#1a1528] hover:border-white/20"
                }`}
                style={model === m.id ? { boxShadow: "0 0 16px rgba(124,58,237,0.2)" } : {}}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-white">{m.label}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    m.badge === "Free" ? "bg-white/10 text-gray-400" : "bg-[#7c3aed] text-white"
                  }`}>{m.badge}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">{m.desc}</p>
                {model === m.id && (
                  <div className="mt-2 h-1 w-4 rounded-full bg-[#7c3aed]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* GENERATION MODE */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Generation Mode</p>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-xl p-3 text-left border transition-all ${
                  mode === m.id
                    ? "border-[#7c3aed] bg-[#7c3aed]/15"
                    : "border-white/8 bg-[#1a1528] hover:border-white/20"
                }`}
                style={mode === m.id ? { boxShadow: "0 0 16px rgba(124,58,237,0.15)" } : {}}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${mode === m.id ? "bg-[#a855f7]" : "bg-gray-600"}`} />
                    <span className="text-sm font-semibold text-white">{m.label}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    m.badge === "Free" ? "bg-white/10 text-gray-400" : "bg-[#7c3aed] text-white"
                  }`}>{m.badge}</span>
                </div>
                <p className="text-[11px] text-gray-500">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ASPECT RATIO + DURATION */}
        <div className="grid grid-cols-2 gap-4">
          {/* Aspect Ratio */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Aspect Ratio</p>
            <div className="flex gap-2">
              {RATIOS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRatio(r.id)}
                  className={`flex-1 rounded-xl p-3 flex flex-col items-center gap-1.5 border transition-all ${
                    ratio === r.id
                      ? "border-[#7c3aed] bg-[#7c3aed]/15"
                      : "border-white/8 bg-[#1a1528] hover:border-white/20"
                  }`}
                >
                  <r.icon className={`h-4 w-4 ${ratio === r.id ? "text-[#a855f7]" : "text-gray-500"}`} />
                  <span className={`text-xs font-bold ${ratio === r.id ? "text-white" : "text-gray-500"}`}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Duration</p>
              <span className="text-sm font-bold text-[#a855f7]">{duration}s</span>
            </div>
            <div className="rounded-xl bg-[#1a1528] border border-white/8 p-4">
              <div className="flex items-center justify-between text-[10px] text-gray-600 mb-2">
                <span>1s</span><span>8s</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="rounded-xl bg-[#1a1528] border border-white/8 p-4" style={{ boxShadow: "0 0 14px rgba(124,58,237,0.06)" }}>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">How It Works</p>
          <div className="space-y-2">
            {[
              "Write your video prompt above",
              "Click 'Open on Google Flow' — your session is auto-connected",
              "Google Flow opens — the extension injects your session",
              "Generate unlimited videos and images for the duration of your plan",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-[#7c3aed]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-[#a855f7]">{i + 1}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* OPEN ON GOOGLE FLOW button */}
        <button
          onClick={handleGenerate}
          disabled={createGeneration.isPending || !prompt.trim()}
          data-testid="button-generate"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1a1528] border border-white/15 text-white font-semibold text-sm hover:border-[#7c3aed]/50 hover:bg-[#1e1a30] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 0 20px rgba(124,58,237,0.1)" }}
        >
          {createGeneration.isPending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <ExternalLink className="h-4 w-4 text-[#a855f7]" />
          }
          Open on Google Flow
        </button>

      </div>
    </DashboardLayout>
  );
}
