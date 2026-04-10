import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set up the getter immediately so any API calls use it
setAuthTokenGetter(() => localStorage.getItem("flow_token"));

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("flow_token"));
  
  // Use the API hook to get the current user if we have a token
  const { data: user, isLoading: isUserLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetMeQueryKey()
    }
  });

  const isLoading = !!token && isUserLoading;
  const isAuthenticated = !!token && !!user;

  // Whenever user data refreshes from API, sync latest plan to __flow_auth__
  // so extension always shows current plan (e.g. after admin upgrades plan)
  useEffect(() => {
    if (!user || !token) return;
    const syncData = {
      userId: user.id,
      email: user.email,
      username: user.username,
      token,
      sessionToken: token,
      credits: user.credits,
      plan: user.plan,
      syncedAt: new Date().toISOString()
    };
    localStorage.setItem("__flow_auth__", JSON.stringify(syncData));
  }, [user?.id, user?.plan, user?.credits, token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("flow_token", newToken);
    
    // Sync to __flow_auth__ as requested
    const syncData = {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      token: newToken,
      sessionToken: newToken,
      credits: newUser.credits,
      plan: newUser.plan,
      syncedAt: new Date().toISOString()
    };
    localStorage.setItem("__flow_auth__", JSON.stringify(syncData));
    
    setTokenState(newToken);
    queryClient.setQueryData(getGetMeQueryKey(), newUser);
  };

  const logout = () => {
    localStorage.removeItem("flow_token");
    localStorage.removeItem("__flow_auth__");
    setTokenState(null);
    queryClient.setQueryData(getGetMeQueryKey(), null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ token, user: user ?? null, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
