import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#7c3aed]/20 bg-[#0a0a0f]/95 backdrop-blur-md">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-8 mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/bunny-logo.jpeg"
              alt="BunnyFlow"
              className="h-9 w-9 rounded-full object-cover border-2 border-[#7c3aed] shadow-[0_0_10px_#7c3aed55]"
            />
            <span className="font-extrabold text-xl tracking-tight text-white">
              Bunny<span className="text-[#a855f7]">Flow</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/pricing"
              className={`transition-colors hover:text-[#a855f7] ${location === "/pricing" ? "text-[#a855f7]" : "text-gray-400"}`}
            >
              Pricing
            </Link>
            <Link
              href="/extension"
              className={`transition-colors hover:text-[#a855f7] ${location === "/extension" ? "text-[#a855f7]" : "text-gray-400"}`}
            >
              Extension
            </Link>
            <Link
              href="/earn"
              className={`transition-colors hover:text-[#a855f7] font-semibold flex items-center gap-1.5 ${location === "/earn" ? "text-[#a855f7]" : "text-gray-400"}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#a855f7] inline-block" />
              Earn Money
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              asChild
              className="btn-3d bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl px-5 border-0"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 rounded-xl hidden sm:inline-flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="btn-3d bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl px-5 border-0"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
