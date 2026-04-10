import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Pricing from "@/pages/pricing";
import Extension from "@/pages/extension";
import Dashboard from "@/pages/dashboard";
import GenerateVideo from "@/pages/generate-video";
import GenerateImage from "@/pages/generate-image";
import Generations from "@/pages/generations";
import Refer from "@/pages/refer";
import Earn from "@/pages/earn";
import Admin from "@/pages/admin";
import Help from "@/pages/help";
import GeminiAccess from "@/pages/gemini-access";
import WhiskAccess from "@/pages/whisk-access";
import UserSettings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/extension">
        <ProtectedRoute><Extension /></ProtectedRoute>
      </Route>
      <Route path="/earn" component={Earn} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/generate/video">
        <ProtectedRoute><GenerateVideo /></ProtectedRoute>
      </Route>
      <Route path="/generate/image">
        <ProtectedRoute><GenerateImage /></ProtectedRoute>
      </Route>
      <Route path="/generations">
        <ProtectedRoute><Generations /></ProtectedRoute>
      </Route>
      <Route path="/refer">
        <ProtectedRoute><Refer /></ProtectedRoute>
      </Route>
      
      <Route path="/help">
        <ProtectedRoute><Help /></ProtectedRoute>
      </Route>
      <Route path="/gemini">
        <ProtectedRoute><GeminiAccess /></ProtectedRoute>
      </Route>
      <Route path="/whisk">
        <ProtectedRoute><WhiskAccess /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><UserSettings /></ProtectedRoute>
      </Route>

      {/* Admin Route (Standalone) */}
      <Route path="/admin" component={Admin} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
