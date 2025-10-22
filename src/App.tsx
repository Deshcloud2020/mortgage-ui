import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import AccountCreation from "./pages/application/AccountCreation";
import Assets from "./pages/application/Assets";
import Debts from "./pages/application/Debts";
import EmailVerification from "./pages/application/EmailVerification";
import Employment from "./pages/application/Employment";
import PersonalInfo from "./pages/application/PersonalInfo";
import Property from "./pages/application/Property";
import Results from "./pages/application/Results";
import Review from "./pages/application/Review";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ApplicationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/application/account-creation" element={<AccountCreation />} />
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
        </BrowserRouter>
      </ApplicationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
