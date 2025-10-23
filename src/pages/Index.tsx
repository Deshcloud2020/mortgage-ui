import { AuthModal } from '@/components/AuthModal';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthenticated as checkAuth } from "@/lib/auth";
import { Calculator, Shield, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleFullPrequalificationClick = () => {
    if (checkAuth()) {
      // User is authenticated, proceed to email verification
      navigate("/application/email-verification");
    } else {
      // User is not authenticated, show auth modal
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    // After successful authentication, navigate to email verification
    navigate("/application/email-verification");
  };

  return (
    <>
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {t('home.hero.title')}
            <span className="block text-primary">{t('home.hero.titleHighlight')}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={handleFullPrequalificationClick}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('home.cta.fullPrequalification.title')}</CardTitle>
                <CardDescription>
                  {t('home.cta.fullPrequalification.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  {t('home.cta.fullPrequalification.button')}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">{t('home.cta.fullPrequalification.duration')}</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors cursor-pointer" onClick={() => navigate("/calculator")}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>{t('home.cta.quickCalculator.title')}</CardTitle>
                <CardDescription>
                  {t('home.cta.quickCalculator.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" size="lg">
                  {t('home.cta.quickCalculator.button')}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">{t('home.cta.quickCalculator.duration')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-card py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.benefits.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.benefits.secure.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.benefits.secure.description')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.benefits.noCreditImpact.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.benefits.noCreditImpact.description')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.benefits.instantResults.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.benefits.instantResults.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('home.howItWorks.title')}</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('home.howItWorks.step1.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.howItWorks.step1.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('home.howItWorks.step2.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.howItWorks.step2.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('home.howItWorks.step3.title')}</h3>
              <p className="text-muted-foreground">
                {t('home.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default Index;
