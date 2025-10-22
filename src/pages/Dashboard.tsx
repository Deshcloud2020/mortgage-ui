import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useApplication } from "@/contexts/ApplicationContext";
import { Home, FileText, Calendar, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { applicationData, clearApplication } = useApplication();

  const hasProgress = applicationData.personalInfo.firstName !== '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">uSign</span>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

        {hasProgress ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Application in Progress</CardTitle>
                    <CardDescription>Continue where you left off</CardDescription>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Applicant</span>
                    <span className="font-medium">
                      {applicationData.personalInfo.firstName} {applicationData.personalInfo.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last saved</span>
                    <span className="font-medium">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Recently
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => navigate("/application/personal-info")}>
                    Resume Application
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (confirm("Are you sure you want to start over? This will delete your current progress.")) {
                        clearApplication();
                      }
                    }}
                  >
                    Start Over
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quick Calculator</CardTitle>
                    <CardDescription>Estimate your buying power</CardDescription>
                  </div>
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get a quick estimate of how much you might be able to borrow based on basic information.
                </p>
                <Button className="w-full" variant="outline" onClick={() => navigate("/calculator")}>
                  Open Calculator
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>You don't have any saved applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Start your mortgage prequalification application today and find out how much you can afford.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => navigate("/application/personal-info")}>
                  Start New Application
                </Button>
                <Button variant="outline" onClick={() => navigate("/calculator")}>
                  Use Quick Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
