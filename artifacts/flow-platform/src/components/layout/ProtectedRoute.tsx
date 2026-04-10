import { useAuth } from "@/lib/auth";
import { Redirect, useLocation } from "wouter";
import { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={`/login?redirectTo=${encodeURIComponent(location)}`} />;
  }

  return <>{children}</>;
}
