import { ApplicationProgress } from "@/components/ApplicationProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApplication } from "@/contexts/ApplicationContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowLeft, Home, Info, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const assetsSchema = z.object({
  downPayment: z.number().min(0, "Down payment must be positive"),
  checkingAccounts: z.number().min(0, "Amount must be positive"),
  savingsAccounts: z.number().min(0, "Amount must be positive"),
  retirementAccounts: z.number().min(0, "Amount must be positive"),
  investments: z.number().min(0, "Amount must be positive"),
  otherRealEstate: z.number().min(0, "Amount must be positive"),
  hasRetirement: z.boolean().optional(),
  hasInvestments: z.boolean().optional(),
  hasRealEstate: z.boolean().optional(),
  hasGiftFunds: z.enum(["no", "yes"]),
  giftAmount: z.number().optional(),
});

const Assets = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { applicationData, updateAssets, saveProgress } = useApplication();
  const [estimatedHomePrice] = useState(400000); // This would come from user preferences or calculations
  const [totalAssets, setTotalAssets] = useState(0);
  const [remainingReserves, setRemainingReserves] = useState(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(0);
  const [pmiRequired, setPmiRequired] = useState(false);
  const [reserveMonths, setReserveMonths] = useState(0);

  const form = useForm<z.infer<typeof assetsSchema>>({
    resolver: zodResolver(assetsSchema),
    defaultValues: {
      downPayment: applicationData.assets.downPayment || 0,
      checkingAccounts: applicationData.assets.checkingAccounts || 0,
      savingsAccounts: applicationData.assets.savingsAccounts || 0,
      retirementAccounts: applicationData.assets.retirement || 0,
      investments: applicationData.assets.investments || 0,
      otherRealEstate: 0,
      hasRetirement: false,
      hasInvestments: false,
      hasRealEstate: false,
      hasGiftFunds: "no",
      giftAmount: 0,
    },
  });

  const watchedValues = form.watch();

  // Calculate totals and metrics
  useEffect(() => {
    const checking = watchedValues.checkingAccounts || 0;
    const savings = watchedValues.savingsAccounts || 0;
    const retirement = watchedValues.hasRetirement ? (watchedValues.retirementAccounts || 0) : 0;
    const investments = watchedValues.hasInvestments ? (watchedValues.investments || 0) : 0;
    const realEstate = watchedValues.hasRealEstate ? (watchedValues.otherRealEstate || 0) : 0;
    const giftFunds = watchedValues.hasGiftFunds === "yes" ? (watchedValues.giftAmount || 0) : 0;

    const total = checking + savings + retirement + investments + realEstate + giftFunds;
    setTotalAssets(total);

    const downPayment = watchedValues.downPayment || 0;
    const percent = estimatedHomePrice > 0 ? (downPayment / estimatedHomePrice) * 100 : 0;
    setDownPaymentPercent(percent);
    setPmiRequired(percent < 20);

    const closingCosts = estimatedHomePrice * 0.03; // Estimate 3% closing costs
    const reserves = total - downPayment - closingCosts;
    setRemainingReserves(Math.max(0, reserves));

    // Calculate reserve months (assuming $2500 monthly payment estimate)
    const estimatedMonthlyPayment = 2500;
    const months = reserves > 0 ? reserves / estimatedMonthlyPayment : 0;
    setReserveMonths(months);
  }, [watchedValues, estimatedHomePrice]);

  const setQuickDownPayment = (percentage: number) => {
    const amount = (estimatedHomePrice * percentage) / 100;
    form.setValue("downPayment", amount);
  };

  const onSubmit = (data: z.infer<typeof assetsSchema>) => {
    const assetsData = {
      downPayment: data.downPayment,
      checkingAccounts: data.checkingAccounts,
      savingsAccounts: data.savingsAccounts,
      investments: data.hasInvestments ? data.investments : 0,
      retirement: data.hasRetirement ? data.retirementAccounts : 0,
    };

    updateAssets(assetsData);
    saveProgress();
    toast.success(t('assets.toast.saved'));
    navigate("/application/debts");
  };

  const handleSaveAndExit = () => {
    const values = form.getValues();
    updateAssets({
      downPayment: values.downPayment,
      checkingAccounts: values.checkingAccounts,
      savingsAccounts: values.savingsAccounts,
      investments: values.hasInvestments ? values.investments : 0,
      retirement: values.hasRetirement ? values.retirementAccounts : 0,
    });
    saveProgress();
    toast.success(t('assets.toast.progressSaved'));
    navigate("/dashboard");
  };

  const getReserveStatus = () => {
    if (reserveMonths >= 6) return { color: "text-success", icon: "✓", message: t('assets.summary.excellentReserves') };
    if (reserveMonths >= 3) return { color: "text-warning", icon: "⚠", message: t('assets.summary.goodReserves') };
    return { color: "text-destructive", icon: "✗", message: t('assets.summary.lowReserves') };
  };

  const reserveStatus = getReserveStatus();

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <ApplicationProgress currentStep={3} totalSteps={7} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('assets.title')}</CardTitle>
          <CardDescription>
            {t('assets.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Down Payment Section */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="downPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('assets.downPayment.label')} *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder={t('assets.downPayment.placeholder')}
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {t('assets.downPayment.description', { price: estimatedHomePrice.toLocaleString() })}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDownPayment(5)}
                  >
                    {t('assets.downPayment.quickButtons.5percent', { amount: (estimatedHomePrice * 0.05).toLocaleString() })}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDownPayment(10)}
                  >
                    {t('assets.downPayment.quickButtons.10percent', { amount: (estimatedHomePrice * 0.10).toLocaleString() })}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDownPayment(20)}
                  >
                    {t('assets.downPayment.quickButtons.20percent', { amount: (estimatedHomePrice * 0.20).toLocaleString() })}
                  </Button>
                </div>

                {pmiRequired && (
                  <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm text-warning-foreground">
                          {t('assets.downPayment.pmiWarning')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">{t('assets.currentAssets.title')}</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkingAccounts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('assets.currentAssets.checking.label')} *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              placeholder={t('assets.currentAssets.checking.placeholder')}
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="savingsAccounts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('assets.currentAssets.savings.label')} *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              placeholder={t('assets.currentAssets.savings.placeholder')}
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Optional Assets */}
              <div className="space-y-4">
                <h4 className="font-medium">{t('assets.otherAssets.title')}</h4>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="hasRetirement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer">
                            {t('assets.otherAssets.retirement.label')}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    {form.watch("hasRetirement") && (
                      <FormField
                        control={form.control}
                        name="retirementAccounts"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder={t('assets.otherAssets.retirement.placeholder')}
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="hasInvestments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer">
                            {t('assets.otherAssets.investments.label')}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    {form.watch("hasInvestments") && (
                      <FormField
                        control={form.control}
                        name="investments"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder={t('assets.otherAssets.investments.placeholder')}
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="hasRealEstate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer">
                            {t('assets.otherAssets.realEstate.label')}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    {form.watch("hasRealEstate") && (
                      <FormField
                        control={form.control}
                        name="otherRealEstate"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder={t('assets.otherAssets.realEstate.placeholder')}
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Gift Funds */}
              <FormField
                control={form.control}
                name="hasGiftFunds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('assets.giftFunds.label')}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no-gift" />
                          <label htmlFor="no-gift" className="cursor-pointer">{t('assets.giftFunds.no')}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes-gift" />
                          <label htmlFor="yes-gift" className="cursor-pointer">
                            {t('assets.giftFunds.yes')}
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("hasGiftFunds") === "yes" && (
                <FormField
                  control={form.control}
                  name="giftAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('assets.giftFunds.amount')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder={t('assets.giftFunds.amountPlaceholder')}
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {t('assets.giftFunds.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Summary */}
              {totalAssets > 0 && (
                <div className="border-t pt-6">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{t('assets.summary.totalAssets')}</span>
                      <span className="text-xl font-bold">${totalAssets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('assets.summary.downPayment', { percent: downPaymentPercent.toFixed(1) })}</span>
                      <span className="font-semibold">${(watchedValues.downPayment || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('assets.summary.remainingReserves')}</span>
                      <span className="font-semibold">${remainingReserves.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between items-center ${reserveStatus.color}`}>
                      <span>{t('assets.summary.reserveStatus')}</span>
                      <span className="font-semibold">
                        {reserveStatus.icon} {reserveStatus.message} ({reserveMonths.toFixed(1)} months)
                      </span>
                    </div>
                  </div>

                  {reserveMonths < 3 && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm text-destructive-foreground">
                            {t('assets.summary.lowReservesWarning', { months: reserveMonths.toFixed(1) })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/application/employment")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('common.back')}
                </Button>
                <Button type="submit">
                  {t('assets.continueButton')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </div >
  );
};

export default Assets;
