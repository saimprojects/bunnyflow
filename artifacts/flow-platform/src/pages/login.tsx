import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex whitespace-nowrap absolute w-[200%]"
          style={{
            top: `${(i / rows.length) * 100 + 4}%`,
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

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (response) => {
        login(response.token, response.user);
        toast({ title: "Welcome back!" });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({ title: "Login failed", description: error.error?.message || "Invalid credentials", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBg />

      <div className="relative z-10 w-full max-w-md">
        {/* Card — white with 3D purple shadow */}
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
                Bunny<span className="text-[#7c3aed]">Flow</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

              <Button
                type="submit"
                className="w-full h-12 text-base font-black bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl border-0 shadow-[4px_4px_0px_#4c1d95] hover:shadow-[2px_2px_0px_#4c1d95] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                disabled={loginMutation.isPending}
                data-testid="button-submit"
              >
                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="font-bold text-[#7c3aed] hover:text-[#6d28d9]">
                Sign up free
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
