import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApplication } from "@/contexts/ApplicationContext";
import { Download, Home, Mail, MessageCircle, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Results = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    toast.success(t('results.toast.downloaded'));
  };

  const handleEmailResults = () => {
    toast.success(t('results.toast.emailed', { email: applicationData.personalInfo.email }));
  };

  const getDTIStatus = (dti: number) => {
    if (dti < 28) return { text: "Excellent", color: "text-green-600", bg: "bg-green-50" };
    if (dti < 36) return { text: "Good", color: "text-blue-600", bg: "bg-blue-50" };
    if (dti < 43) return { text: "Fair", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: "High", color: "text-red-600", bg: "bg-red-50" };
  };

  const dtiStatus = getDTIStatus(backEndDTI);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      {/* Congratulations Banner */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {t('results.congratulations', { name: applicationData.personalInfo.firstName })}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t('results.subtitle')}
        </p>
      </div>

      {/* Main Prequalification Card */}
      <Card className="border-2 border-primary mb-8">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">{t('results.prequalificationAmount.title')}</CardTitle>
          <CardDescription>{t('results.prequalificationAmount.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-5xl font-bold text-primary mb-2">
              ${maxLoanAmount.toLocaleString()}
            </p>
            <p className="text-muted-foreground">{t('results.prequalificationAmount.maxLoanAmount')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <p className="text-sm text-muted-foreground">{t('results.prequalificationAmount.estimatedPayment')}</p>
              <p className="text-2xl font-semibold">${Math.round(totalMonthlyPayment).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t('results.prequalificationAmount.paymentNote')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('results.prequalificationAmount.estimatedHomePrice')}</p>
              <p className="text-2xl font-semibold">${estimatedHomePrice.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t('results.prequalificationAmount.withDownPayment', { amount: applicationData.assets.downPayment.toLocaleString() })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('results.prequalificationAmount.interestRate')}</p>
              <p className="text-2xl font-semibold">{estimatedRate.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground">{t('results.prequalificationAmount.term')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('results.prequalificationAmount.downPayment')}</p>
              <p className="text-2xl font-semibold">${applicationData.assets.downPayment.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {((applicationData.assets.downPayment / estimatedHomePrice) * 100).toFixed(1)}% of home price
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button className="flex-1" size="lg" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              {t('results.actions.downloadLetter')}
            </Button>
            <Button variant="outline" className="flex-1" size="lg" onClick={handleEmailResults}>
              <Mail className="h-4 w-4 mr-2" />
              {t('results.actions.emailResults')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('results.affordability.title')}</CardTitle>
          <CardDescription>{t('results.affordability.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('results.affordability.monthlyIncome')}</p>
              <p className="text-xl font-semibold">${monthlyIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('results.affordability.totalDebts')}</p>
              <p className="text-xl font-semibold">${totalDebts.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('results.affordability.housingPayment')}</p>
              <p className="text-xl font-semibold">${Math.round(totalMonthlyPayment).toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('results.affordability.frontEndDti')}</span>
              <span className={`font-semibold ${frontEndDTI < 28 ? 'text-green-600' : 'text-yellow-600'}`}>
                {frontEndDTI.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('results.affordability.backEndDti')}</span>
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
              {backEndDTI < 36 ? t('results.affordability.qualifies') :
                backEndDTI < 43 ? t('results.affordability.fhaQualifies') :
                  t('results.affordability.tooHigh')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loan Comparison */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('results.loanComparison.title')}</CardTitle>
          <CardDescription>{t('results.loanComparison.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('results.loanComparison.headers.loanType')}</TableHead>
                <TableHead>{t('results.loanComparison.headers.loanAmount')}</TableHead>
                <TableHead>{t('results.loanComparison.headers.interestRate')}</TableHead>
                <TableHead>{t('results.loanComparison.headers.monthlyPayment')}</TableHead>
                <TableHead>{t('results.loanComparison.headers.totalInterest')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{t('results.loanComparison.types.30yearFixed')}</TableCell>
                <TableCell>${maxLoanAmount.toLocaleString()}</TableCell>
                <TableCell>{estimatedRate.toFixed(2)}%</TableCell>
                <TableCell>${Math.round(totalMonthlyPayment).toLocaleString()}</TableCell>
                <TableCell>${Math.round((monthlyPI * 360) - maxLoanAmount).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t('results.loanComparison.types.15yearFixed')}</TableCell>
                <TableCell>${maxLoanAmount.toLocaleString()}</TableCell>
                <TableCell>{(estimatedRate - 0.5).toFixed(2)}%</TableCell>
                <TableCell>${Math.round(totalMonthlyPayment * 1.4).toLocaleString()}</TableCell>
                <TableCell>${Math.round((monthlyPI * 180 * 1.4) - maxLoanAmount).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t('results.loanComparison.types.fha30year')}</TableCell>
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
          <CardTitle>{t('results.nextSteps.title')}</CardTitle>
          <CardDescription>{t('results.nextSteps.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => navigate("/dashboard")}>
            <Home className="h-5 w-5 mr-3" />
            {t('results.nextSteps.savePrequalification')}
          </Button>
          <Button variant="outline" className="w-full justify-start" size="lg">
            <MessageCircle className="h-5 w-5 mr-3" />
            {t('results.nextSteps.chatWithAdvisor')}
          </Button>
          <Button variant="outline" className="w-full justify-start" size="lg">
            <Phone className="h-5 w-5 mr-3" />
            {t('results.nextSteps.scheduleCall')}
          </Button>
        </CardContent>
      </Card>
    </div>
    </div >
  );
};

export default Results;
