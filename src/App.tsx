import { Layout } from "@/components/Layout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ApplicationProvider } from "./contexts/ApplicationContext";


const Index = lazy(() => import("./pages/Index"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));


const EmailVerification = lazy(() => import("./pages/application/EmailVerification"));
const PersonalInfo = lazy(() => import("./pages/application/PersonalInfo"));
const Employment = lazy(() => import("./pages/application/Employment"));
const Assets = lazy(() => import("./pages/application/Assets"));
const Debts = lazy(() => import("./pages/application/Debts"));
const Property = lazy(() => import("./pages/application/Property"));
const Review = lazy(() => import("./pages/application/Review"));
const Results = lazy(() => import("./pages/application/Results"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});


const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ApplicationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/application/email-verification" element={<EmailVerification />} />
                <Route path="/application/personal-info" element={<PersonalInfo />} />
                <Route path="/application/employment" element={<Employment />} />
                <Route path="/application/assets" element={<Assets />} />
                <Route path="/application/debts" element={<Debts />} />
                <Route path="/application/property" element={<Property />} />
                <Route path="/application/review" element={<Review />} />
                <Route path="/application/results" element={<Results />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </ApplicationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
