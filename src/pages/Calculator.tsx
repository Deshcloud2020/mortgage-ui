import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Calculator as CalculatorIcon, CheckCircle2, Info, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Calculator = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form state
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(0);
  const [desiredHomePrice, setDesiredHomePrice] = useState<number>(400000);
  const [downPayment, setDownPayment] = useState<number>(80000);

  // Calculated values
  const [dti, setDti] = useState<number>(0);
  const [maxHomePrice, setMaxHomePrice] = useState<number>(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(0);
  const [estimatedRate, setEstimatedRate] = useState<number>(7.0);

  // Payment breakdown
  const [principalInterest, setPrincipalInterest] = useState<number>(0);
  const [propertyTaxes, setPropertyTaxes] = useState<number>(0);
  const [homeInsurance, setHomeInsurance] = useState<number>(0);
  const [pmi, setPmi] = useState<number>(0);

  // Calculate everything when inputs change
  useEffect(() => {
    if (monthlyIncome <= 0) {
      setDti(0);
      setMaxHomePrice(0);
      setMonthlyPayment(0);
      return;
    }

    // Calculate DTI
    const currentDti = (monthlyDebts / monthlyIncome) * 100;
    setDti(currentDti);

    // Calculate max affordable home price (28% front-end ratio)
    const maxHousingPayment = monthlyIncome * 0.28;
    const estimatedTaxInsurance = 400; // Rough estimate
    const maxPIPayment = maxHousingPayment - estimatedTaxInsurance;

    // Calculate max loan amount using mortgage formula
    const monthlyRate = estimatedRate / 100 / 12;
    const numPayments = 360; // 30 years
    const maxLoan = maxPIPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    const calculatedMaxPrice = maxLoan + downPayment;
    setMaxHomePrice(Math.round(calculatedMaxPrice));

    // Calculate payment for desired home
    const loan = desiredHomePrice - downPayment;
    setLoanAmount(loan);

    const downPercent = (downPayment / desiredHomePrice) * 100;
    setDownPaymentPercent(downPercent);

    // Calculate P&I
    const pi = loan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    setPrincipalInterest(pi);

    // Estimate property taxes (1.2% annually)
    const taxes = (desiredHomePrice * 0.012) / 12;
    setPropertyTaxes(taxes);

    // Estimate home insurance (0.5% annually)
    const insurance = (desiredHomePrice * 0.005) / 12;
    setHomeInsurance(insurance);

    // Calculate PMI if down payment < 20%
    const pmiAmount = downPercent < 20 ? loan * 0.005 / 12 : 0;
    setPmi(pmiAmount);

    // Total monthly payment
    const total = pi + taxes + insurance + pmiAmount;
    setMonthlyPayment(total);

  }, [monthlyIncome, monthlyDebts, desiredHomePrice, downPayment, estimatedRate]);

  const getDtiStatus = () => {
    if (dti === 0) return { color: "text-muted-foreground", bg: "bg-muted", icon: null, message: "" };
    if (dti < 28) return {
      color: "text-green-600",
      bg: "bg-green-50",
      icon: <CheckCircle2 className="h-5 w-5" />,
      message: t('calculator.results.dti.excellent')
    };
    if (dti < 36) return {
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: <CheckCircle2 className="h-5 w-5" />,
      message: t('calculator.results.dti.good')
    };
    if (dti < 43) return {
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      icon: <Info className="h-5 w-5" />,
      message: t('calculator.results.dti.fair')
    };
    return {
      color: "text-red-600",
      bg: "bg-red-50",
      icon: <AlertTriangle className="h-5 w-5" />,
      message: t('calculator.results.dti.high')
    };
  };

  const dtiStatus = getDtiStatus();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInputChange = (setter: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setter(value);
  };

  const getSuggestions = () => {
    if (dti <= 36) return null;

    const targetDti = 36;
    const targetDebtAmount = (monthlyIncome * targetDti) / 100;
    const debtReduction = monthlyDebts - targetDebtAmount;

    const incomeIncrease = (monthlyDebts / (targetDti / 100)) - monthlyIncome;

    const maxAffordablePayment = monthlyIncome * 0.28;
    const estimatedTaxInsurance = (desiredHomePrice * 0.017) / 12;
    const maxPIPayment = maxAffordablePayment - estimatedTaxInsurance;
    const monthlyRate = estimatedRate / 100 / 12;
    const numPayments = 360;
    const maxLoan = maxPIPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    const suggestedPrice = maxLoan + downPayment;

    return {
      debtReduction: Math.ceil(debtReduction),
      incomeIncrease: Math.ceil(incomeIncrease),
      suggestedPrice: Math.round(suggestedPrice)
    };
  };

  const suggestions = getSuggestions();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('calculator.title')}</h1>
        <p className="text-lg text-muted-foreground mb-2">{t('calculator.subtitle')}</p>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Info className="h-4 w-4" />
          {t('calculator.noLoginRequired')}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5" />
              {t('calculator.form.monthlyIncome.label')}
            </CardTitle>
            <CardDescription>
              {t('calculator.form.monthlyIncome.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="income">{t('calculator.form.monthlyIncome.label')} *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="income"
                  type="number"
                  placeholder={t('calculator.form.monthlyIncome.placeholder')}
                  className="pl-8 text-lg"
                  value={monthlyIncome || ''}
                  onChange={handleInputChange(setMonthlyIncome)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('calculator.form.monthlyIncome.description')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="debts">{t('calculator.form.monthlyDebts.label')} *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="debts"
                  type="number"
                  placeholder={t('calculator.form.monthlyDebts.placeholder')}
                  className="pl-8 text-lg"
                  value={monthlyDebts || ''}
                  onChange={handleInputChange(setMonthlyDebts)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('calculator.form.monthlyDebts.description')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="homePrice">{t('calculator.form.desiredHomePrice.label')} *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="homePrice"
                  type="number"
                  placeholder={t('calculator.form.desiredHomePrice.placeholder')}
                  className="pl-8 text-lg"
                  value={desiredHomePrice || ''}
                  onChange={handleInputChange(setDesiredHomePrice)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment">{t('calculator.form.downPayment.label')} *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="downPayment"
                  type="number"
                  placeholder={t('calculator.form.downPayment.placeholder')}
                  className="pl-8 text-lg"
                  value={downPayment || ''}
                  onChange={handleInputChange(setDownPayment)}
                />
              </div>
              {downPaymentPercent > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('calculator.results.downPaymentPercent', { percent: downPaymentPercent.toFixed(1) })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* DTI Card */}
          <Card className={dtiStatus.bg}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {dtiStatus.icon}
                {t('calculator.results.dti.label')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-4xl font-bold ${dtiStatus.color}`}>
                  {dti > 0 ? `${dti.toFixed(1)}%` : '--'}
                </span>
                {dti > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{t('calculator.form.monthlyIncome.label')}</div>
                    <div className="font-semibold">{formatCurrency(monthlyIncome)}</div>
                    <div className="text-sm text-muted-foreground mt-1">{t('calculator.form.monthlyDebts.label')}</div>
                    <div className="font-semibold">{formatCurrency(monthlyDebts)}</div>
                  </div>
                )}
              </div>

              {dti > 0 && (
                <>
                  <Progress
                    value={Math.min(dti, 100)}
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>28%</span>
                    <span>36%</span>
                    <span>43%</span>
                  </div>
                  <p className={`text-sm font-medium ${dtiStatus.color}`}>
                    {dtiStatus.message}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Affordability Results */}
          {monthlyIncome > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('calculator.results.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    {t('calculator.results.maxHomePrice')}
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(maxHomePrice)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">{t('calculator.results.estimatedPayment')}</span>
                    <span className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('calculator.results.paymentBreakdown.principal')}</span>
                      <span className="font-medium">{formatCurrency(principalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('calculator.results.paymentBreakdown.taxes')}</span>
                      <span className="font-medium">{formatCurrency(propertyTaxes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('calculator.results.paymentBreakdown.insurance')}</span>
                      <span className="font-medium">{formatCurrency(homeInsurance)}</span>
                    </div>
                    {pmi > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('calculator.results.paymentBreakdown.pmi')}</span>
                        <span className="font-medium">{formatCurrency(pmi)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('calculator.results.loanAmount')}</span>
                      <span className="font-medium">{formatCurrency(loanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('calculator.results.interestRate')}</span>
                      <span className="font-medium">{estimatedRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('calculator.results.loanTerm')}</span>
                      <span className="font-medium">{t('calculator.results.loanTerm')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings and Suggestions */}
          {suggestions && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  {t('calculator.warnings.highDti', { dti: dti.toFixed(1) })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-yellow-900">
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>{t('calculator.warnings.suggestions.payOffDebt', { amount: suggestions.debtReduction })}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>{t('calculator.warnings.suggestions.increaseIncome', { amount: suggestions.incomeIncrease })}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>{t('calculator.warnings.suggestions.lowerHomePrice', { price: formatCurrency(suggestions.suggestedPrice) })}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* CTA Section */}
      {monthlyIncome > 0 && dti < 43 && (
        <Card className="mt-8 border-primary">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">{t('calculator.cta.startApplication')}</h3>
              <p className="text-muted-foreground">
                {t('calculator.cta.learnMore')}
              </p>
              <Button size="lg" onClick={() => navigate("/application/account-creation")}>
                {t('calculator.cta.startButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
          {t('calculator.disclaimer')}
        </p>
      </div>
    </div>
  );
};

export default Calculator;
