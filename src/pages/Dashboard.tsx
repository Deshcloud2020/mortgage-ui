import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApplication } from "@/contexts/ApplicationContext";
import { Calendar, FileText, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { applicationData, clearApplication } = useApplication();
  const { t } = useTranslation();

  const hasProgress = applicationData.personalInfo.firstName !== '';

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('dashboard.title')}</h1>

      {hasProgress ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('dashboard.applicationInProgress.title')}</CardTitle>
                  <CardDescription>{t('dashboard.applicationInProgress.description')}</CardDescription>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('dashboard.applicationInProgress.applicant')}</span>
                  <span className="font-medium">
                    {applicationData.personalInfo.firstName} {applicationData.personalInfo.lastName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('dashboard.applicationInProgress.lastSaved')}</span>
                  <span className="font-medium">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {t('dashboard.applicationInProgress.recently')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => navigate("/application/personal-info")}>
                  {t('dashboard.applicationInProgress.resumeButton')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm(t('dashboard.applicationInProgress.confirmStartOver'))) {
                      clearApplication();
                    }
                  }}
                >
                  {t('dashboard.applicationInProgress.startOverButton')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('dashboard.quickCalculator.title')}</CardTitle>
                  <CardDescription>{t('dashboard.quickCalculator.description')}</CardDescription>
                </div>
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t('dashboard.quickCalculator.text')}
              </p>
              <Button className="w-full" variant="outline" onClick={() => navigate("/calculator")}>
                {t('dashboard.quickCalculator.button')}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.getStarted.title')}</CardTitle>
            <CardDescription>{t('dashboard.getStarted.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t('dashboard.getStarted.text')}
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/application/personal-info")}>
                {t('dashboard.getStarted.startButton')}
              </Button>
              <Button variant="outline" onClick={() => navigate("/calculator")}>
                {t('dashboard.getStarted.calculatorButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
