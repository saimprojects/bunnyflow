import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2, Check, Gift } from "lucide-react";
import { useState } from "react";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

/* ── Animated text lines that scroll across the background ── */
const MARQUEE_TEXT = Array(18).fill("BunnyFlow").join("  ·  ");

function AnimatedBg() {
  const rows = [
    { dir: "left",  speed: "30s", color: "rgba(168,85,247,0.13)",  delay: "0s"   },
    { dir: "right", speed: "25s", color: "rgba(124,58,237,0.10)",  delay: "-5s"  },
    { dir: "left",  speed: "35s", color: "rgba(139,92,246,0.08)",  delay: "-10s" },
    { dir: "right", speed: "28s", color: "rgba(168,85,247,0.12)",  delay: "-3s"  },
    { dir: "left",  speed: "22s", color: "rgba(124,58,237,0.09)",  delay: "-8s"  },
    { dir: "right", speed: "32s", color: "rgba(167,139,250,0.07)", delay: "-12s" },
    { dir: "left",  speed: "26s", color: "rgba(168,85,247,0.11)",  delay: "-2s"  },
    { dir: "right", speed: "38s", color: "rgba(124,58,237,0.08)",  delay: "-6s"  },
    { dir: "left",  speed: "24s", color: "rgba(139,92,246,0.10)",  delay: "-14s" },
    { dir: "right", speed: "29s", color: "rgba(168,85,247,0.09)",  delay: "-4s"  },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex whitespace-nowrap absolute w-[200%]"
          style={{
            top: `${(i / rows.length) * 100 + 2}%`,
            animation: `${row.dir === "left" ? "marqueeLeft" : "marqueeLeft2"} ${row.speed} linear infinite`,
            animationDelay: row.delay,
            left: 0,
          }}
        >
          <span className="text-2xl font-black tracking-widest pr-8" style={{ color: row.color }}>
            {MARQUEE_TEXT}
          </span>
          <span className="text-2xl font-black tracking-widest pr-8" style={{ color: row.color }}>
            {MARQUEE_TEXT}
          </span>
        </div>
      ))}
      {/* Centre glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/10 blur-[120px]" />
    </div>
  );
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const urlRef = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("ref") || ""
    : "";

  const [referralCode, setReferralCode] = useState(urlRef);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const registerMutation = useRegister();

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({ data: { ...data, referralCode } as any }, {
      onSuccess: (response) => {
        login(response.token, response.user);
        toast({ title: "Account created successfully!" });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({ title: "Registration failed", description: error.error?.message || "Could not create account", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBg />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl border-2 border-[#7c3aed] shadow-[8px_8px_0px_#4c1d95] p-8 space-y-7">

          {/* Logo + Brand */}
          <div className="text-center space-y-4">
            <img
              src="/bunny-logo.jpeg"
              alt="BunnyFlow"
              className="h-24 w-24 rounded-full object-cover border-4 border-[#7c3aed] shadow-[0_0_20px_#7c3aed55] mx-auto"
            />
            <div>
              <h1 className="text-3xl font-black text-[#0a0a0f]">
                Join <span className="text-[#7c3aed]">BunnyFlow</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">Start your 1-day free trial</p>
            </div>
          </div>

          {/* Perks */}
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            {["1-Day Free Trial", "No card needed", "Instant access"].map((p) => (
              <span key={p} className="flex items-center gap-1"><Check className="h-3 w-3 text-[#7c3aed]" />{p}</span>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[#0a0a0f] font-semibold text-sm">Username</Label>
                    <FormControl>
                      <Input
                        placeholder="johndoe"
                        className="border-2 border-gray-200 focus:border-[#7c3aed] rounded-xl bg-white text-[#0a0a0f] h-11"
                        {...field}
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[#0a0a0f] font-semibold text-sm">Email</Label>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        className="border-2 border-gray-200 focus:border-[#7c3aed] rounded-xl bg-white text-[#0a0a0f] h-11"
                        {...field}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[#0a0a0f] font-semibold text-sm">Password</Label>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="border-2 border-gray-200 focus:border-[#7c3aed] rounded-xl bg-white text-[#0a0a0f] h-11"
                        {...field}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Referral Code */}
              <div>
                <Label className="text-[#0a0a0f] font-semibold text-sm flex items-center gap-1.5 mb-1.5">
                  <Gift className="h-3.5 w-3.5 text-[#7c3aed]" /> Referral Code
                  <span className="font-normal text-gray-400 text-xs">(optional)</span>
                </Label>
                <div className="relative">
                  <Input
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter code if you have one"
                    className={`border-2 rounded-xl bg-white text-[#0a0a0f] h-11 uppercase tracking-widest font-mono text-sm ${
                      referralCode
                        ? "border-[#7c3aed] ring-2 ring-[#7c3aed]/20"
                        : "border-gray-200 focus:border-[#7c3aed]"
                    }`}
                  />
                  {referralCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[#7c3aed] bg-[#f3f0ff] px-2 py-0.5 rounded-full">
                      <Check className="h-3 w-3" /> Applied
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-black bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl border-0 shadow-[4px_4px_0px_#4c1d95] hover:shadow-[2px_2px_0px_#4c1d95] hover:translate-x-[2px] hover:translate-y-[2px] transition-all mt-2"
                disabled={registerMutation.isPending}
                data-testid="button-submit"
              >
                {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#7c3aed] hover:text-[#6d28d9]">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
