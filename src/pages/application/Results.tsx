import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApplication } from "@/contexts/ApplicationContext";
import { Download, Home, Mail, MessageCircle, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Results = () => {
  const navigate = useNavigate();
  const { applicationData, calculateDTI, calculateMaxLoanAmount } = useApplication();

  const monthlyIncome = applicationData.employment.monthlyIncome + (applicationData.employment.additionalIncome || 0);
  const totalDebts = Object.values(applicationData.debts).reduce((sum, debt) => sum + debt, 0);
  const dti = calculateDTI();
  const maxLoanAmount = calculateMaxLoanAmount();

  // Estimate interest rate based on DTI
  const estimatedRate = dti < 28 ? 6.75 : dti < 36 ? 7.0 : 7.5;

  // Calculate monthly payment (P&I only for simplicity)
  const monthlyRate = estimatedRate / 100 / 12;
  const numPayments = 360; // 30 years
  const monthlyPI = maxLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Add estimated taxes and insurance (1.5% of home value annually)
  const estimatedHomePrice = maxLoanAmount + applicationData.assets.downPayment;
  const monthlyTaxesInsurance = (estimatedHomePrice * 0.015) / 12;
  const totalMonthlyPayment = monthlyPI + monthlyTaxesInsurance;

  // Calculate front-end and back-end DTI
  const frontEndDTI = (totalMonthlyPayment / monthlyIncome) * 100;
  const backEndDTI = ((totalMonthlyPayment + totalDebts) / monthlyIncome) * 100;

  const handleDownloadPDF = () => {
    toast.success("Prequalification letter downloaded!");
  };

  const handleEmailResults = () => {
    toast.success(`Results sent to ${applicationData.personalInfo.email}`);
  };

  const getDTIStatus = (dti: number) => {
    if (dti < 28) return { text: "Excellent", color: "text-green-600", bg: "bg-green-50" };
    if (dti < 36) return { text: "Good", color: "text-blue-600", bg: "bg-blue-50" };
    if (dti < 43) return { text: "Fair", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: "High", color: "text-red-600", bg: "bg-red-50" };
  };

  const dtiStatus = getDTIStatus(backEndDTI);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">uSign</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="ghost" size="sm">Help</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Congratulations Banner */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🎉 Congratulations, {applicationData.personalInfo.firstName}!
          </h1>
          <p className="text-xl text-muted-foreground">
            You're Prequalified for a Mortgage
          </p>
        </div>

        {/* Main Prequalification Card */}
        <Card className="border-2 border-primary mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Your Prequalification Amount</CardTitle>
            <CardDescription>Based on your income, assets, and debts</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <p className="text-5xl font-bold text-primary mb-2">
                ${maxLoanAmount.toLocaleString()}
              </p>
              <p className="text-muted-foreground">Maximum Loan Amount</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
                <p className="text-2xl font-semibold">${Math.round(totalMonthlyPayment).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">(Principal, Interest, Taxes, Insurance)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Home Price</p>
                <p className="text-2xl font-semibold">${estimatedHomePrice.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">With ${applicationData.assets.downPayment.toLocaleString()} down</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate (Estimated)</p>
                <p className="text-2xl font-semibold">{estimatedRate.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">30-year fixed</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Down Payment</p>
                <p className="text-2xl font-semibold">${applicationData.assets.downPayment.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {((applicationData.assets.downPayment / estimatedHomePrice) * 100).toFixed(1)}% of home price
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="flex-1" size="lg" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Get Prequalification Letter
              </Button>
              <Button variant="outline" className="flex-1" size="lg" onClick={handleEmailResults}>
                <Mail className="h-4 w-4 mr-2" />
                Email Results to Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Affordability Breakdown</CardTitle>
            <CardDescription>Your financial summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Gross Income</p>
                <p className="text-xl font-semibold">${monthlyIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Monthly Debts</p>
                <p className="text-xl font-semibold">${totalDebts.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Housing Payment</p>
                <p className="text-xl font-semibold">${Math.round(totalMonthlyPayment).toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Front-End DTI (Housing):</span>
                <span className={`font-semibold ${frontEndDTI < 28 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {frontEndDTI.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Back-End DTI (Total):</span>
                <span className={`font-semibold ${dtiStatus.color}`}>
                  {backEndDTI.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mt-4">
                <div
                  className={`h-3 rounded-full transition-all ${backEndDTI < 28 ? 'bg-green-600' : backEndDTI < 36 ? 'bg-blue-600' : backEndDTI < 43 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                  style={{ width: `${Math.min(backEndDTI, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {backEndDTI < 36 ? '✓ Your DTI qualifies you for most loan programs' :
                  backEndDTI < 43 ? '⚠ DTI above standard 36% limit but may qualify for FHA (43% limit)' :
                    '⚠ DTI exceeds most lender limits. Consider paying down debts or increasing income.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loan Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Compare Loan Options</CardTitle>
            <CardDescription>Different loan programs for your situation</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Monthly Payment</TableHead>
                  <TableHead>Total Interest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">30-Year Fixed</TableCell>
                  <TableCell>${maxLoanAmount.toLocaleString()}</TableCell>
                  <TableCell>{estimatedRate.toFixed(2)}%</TableCell>
                  <TableCell>${Math.round(totalMonthlyPayment).toLocaleString()}</TableCell>
                  <TableCell>${Math.round((monthlyPI * 360) - maxLoanAmount).toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">15-Year Fixed</TableCell>
                  <TableCell>${maxLoanAmount.toLocaleString()}</TableCell>
                  <TableCell>{(estimatedRate - 0.5).toFixed(2)}%</TableCell>
                  <TableCell>${Math.round(totalMonthlyPayment * 1.4).toLocaleString()}</TableCell>
                  <TableCell>${Math.round((monthlyPI * 180 * 1.4) - maxLoanAmount).toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">FHA 30-Year</TableCell>
                  <TableCell>${maxLoanAmount.toLocaleString()}</TableCell>
                  <TableCell>{(estimatedRate - 0.25).toFixed(2)}%</TableCell>
                  <TableCell>${Math.round(totalMonthlyPayment * 1.05).toLocaleString()}</TableCell>
                  <TableCell>${Math.round((monthlyPI * 360 * 1.05) - maxLoanAmount).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Continue your home buying journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => navigate("/dashboard")}>
              <Home className="h-5 w-5 mr-3" />
              Save Your Prequalification
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <MessageCircle className="h-5 w-5 mr-3" />
              Chat with an Advisor
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Phone className="h-5 w-5 mr-3" />
              Schedule a Call
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;
