import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Home, Calculator, Shield, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">uSign</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Benefits
              </a>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Get Pre-Qualified for Your
            <span className="block text-primary">Dream Home</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Know exactly how much you can afford in minutes. No credit impact, no obligations, 
            and completely secure.
          </p>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate("/application/personal-info")}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Full Prequalification</CardTitle>
                <CardDescription>
                  Get an accurate loan estimate based on your complete financial profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Start Application
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Takes 5-7 minutes</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors cursor-pointer" onClick={() => navigate("/calculator")}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Quick Calculator</CardTitle>
                <CardDescription>
                  Get a rough estimate of your buying power with basic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" size="lg">
                  Quick Estimate
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Takes 1 minute</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-card py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose uSign?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Bank-level encryption protects your information. Your data is never shared without permission.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">No Credit Impact</h3>
              <p className="text-muted-foreground">
                Soft credit checks won't affect your score. Shop confidently without worry.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Results</h3>
              <p className="text-muted-foreground">
                Get your prequalification letter immediately. No waiting, no surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Share Your Information</h3>
              <p className="text-muted-foreground">
                Tell us about your income, assets, and monthly debts. We'll guide you through each step.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">We Calculate Your Options</h3>
              <p className="text-muted-foreground">
                Our system analyzes your profile and determines your maximum loan amount and monthly payment.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Get Your Letter</h3>
              <p className="text-muted-foreground">
                Receive your prequalification letter instantly. Use it to make offers with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 uSign. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="/compliance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Compliance
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
