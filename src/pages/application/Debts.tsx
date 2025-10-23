import { ApplicationProgress } from "@/components/ApplicationProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApplication } from "@/contexts/ApplicationContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const debtsSchema = z.object({
  creditCards: z.number().min(0, "Amount must be positive"),
  autoLoans: z.number().min(0, "Amount must be positive"),
  studentLoans: z.number().min(0, "Amount must be positive"),
  personalLoans: z.number().min(0, "Amount must be positive"),
  childSupport: z.number().min(0, "Amount must be positive"),
  otherDebts: z.number().min(0, "Amount must be positive"),
  currentRent: z.number().min(0, "Amount must be positive"),
  paysRent: z.enum(["no", "yes"]),
  noMonthlyDebts: z.boolean().optional(),
});

const Debts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { applicationData, updateDebts, saveProgress, calculateDTI } = useApplication();
  const [totalDebts, setTotalDebts] = useState(0);
  const [dtiRatio, setDtiRatio] = useState(0);
  const [dtiStatus, setDtiStatus] = useState({ color: "", message: "", icon: "" });

  const monthlyIncome = applicationData.employment.monthlyIncome + (applicationData.employment.additionalIncome || 0);

  const form = useForm<z.infer<typeof debtsSchema>>({
    resolver: zodResolver(debtsSchema),
    defaultValues: {
      creditCards: applicationData.debts.creditCards || 0,
      autoLoans: applicationData.debts.carLoans || 0,
      studentLoans: applicationData.debts.studentLoans || 0,
      personalLoans: 0,
      childSupport: 0,
      otherDebts: applicationData.debts.otherDebts || 0,
      currentRent: 0,
      paysRent: "no",
      noMonthlyDebts: false,
    },
  });

  const watchedValues = form.watch();
  const noDebts = form.watch("noMonthlyDebts");

  // Calculate DTI when values change
  useEffect(() => {
    if (noDebts) {
      setTotalDebts(0);
      setDtiRatio(0);
      return;
    }

    const total = (watchedValues.creditCards || 0) +
      (watchedValues.autoLoans || 0) +
      (watchedValues.studentLoans || 0) +
      (watchedValues.personalLoans || 0) +
      (watchedValues.childSupport || 0) +
      (watchedValues.otherDebts || 0);

    setTotalDebts(total);

    if (monthlyIncome > 0) {
      const ratio = (total / monthlyIncome) * 100;
      setDtiRatio(ratio);

      // Set DTI status
      if (ratio <= 28) {
        setDtiStatus({
          color: "text-success",
          message: t('debts.summary.excellent'),
          icon: "✓"
        });
      } else if (ratio <= 36) {
        setDtiStatus({
          color: "text-success",
          message: t('debts.summary.good'),
          icon: "✓"
        });
      } else if (ratio <= 43) {
        setDtiStatus({
          color: "text-warning",
          message: t('debts.summary.fair'),
          icon: "⚠"
        });
      } else {
        setDtiStatus({
          color: "text-destructive",
          message: t('debts.summary.high'),
          icon: "✗"
        });
      }
    }
  }, [watchedValues, monthlyIncome, noDebts]);

  const getDTIColor = () => {
    if (dtiRatio <= 28) return "bg-success";
    if (dtiRatio <= 36) return "bg-success";
    if (dtiRatio <= 43) return "bg-warning";
    return "bg-destructive";
  };

  const clearAllDebts = (checked: boolean) => {
    if (checked) {
      form.setValue("creditCards", 0);
      form.setValue("autoLoans", 0);
      form.setValue("studentLoans", 0);
      form.setValue("personalLoans", 0);
      form.setValue("childSupport", 0);
      form.setValue("otherDebts", 0);
    }
  };

  const onSubmit = (data: z.infer<typeof debtsSchema>) => {
    const debtsData = {
      creditCards: data.noMonthlyDebts ? 0 : data.creditCards,
      carLoans: data.noMonthlyDebts ? 0 : data.autoLoans,
      studentLoans: data.noMonthlyDebts ? 0 : data.studentLoans,
      otherDebts: data.noMonthlyDebts ? 0 : (data.personalLoans + data.childSupport + data.otherDebts),
    };

    updateDebts(debtsData);
    saveProgress();
    toast.success(t('debts.toast.saved'));
    navigate("/application/property");
  };

  const handleSaveAndExit = () => {
    const values = form.getValues();
    updateDebts({
      creditCards: values.noMonthlyDebts ? 0 : values.creditCards,
      carLoans: values.noMonthlyDebts ? 0 : values.autoLoans,
      studentLoans: values.noMonthlyDebts ? 0 : values.studentLoans,
      otherDebts: values.noMonthlyDebts ? 0 : (values.personalLoans + values.childSupport + values.otherDebts),
    });
    saveProgress();
    toast.success(t('debts.toast.progressSaved'));
    navigate("/dashboard");
  };

  const getDebtPayoffScenario = () => {
    if (dtiRatio <= 36) return null;

    const targetDTI = 32; // Target DTI
    const targetDebtAmount = (monthlyIncome * targetDTI) / 100;
    const debtReduction = totalDebts - targetDebtAmount;

    if (debtReduction > 0) {
      return {
        amount: Math.ceil(debtReduction),
        newDTI: targetDTI
      };
    }
    return null;
  };

  const payoffScenario = getDebtPayoffScenario();

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <ApplicationProgress currentStep={4} totalSteps={7} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('debts.title')}</CardTitle>
          <CardDescription>
            {t('debts.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-info/10 border border-info/20 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-info mt-0.5" />
                  <div>
                    <p className="text-sm text-info-foreground">
                      <strong>{t('debts.doNotInclude')}</strong> {t('debts.doNotIncludeText')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="noMonthlyDebts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            clearAllDebts(checked as boolean);
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-base font-medium cursor-pointer">
                          {t('debts.noDebts.label')}
                        </FormLabel>
                        <FormDescription>
                          {t('debts.noDebts.description')}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {!noDebts && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="creditCards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('debts.creditCards.label')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder={t('debts.creditCards.placeholder')}
                                className="pl-8"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>{t('debts.creditCards.description')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoLoans"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('debts.autoLoans.label')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder={t('debts.autoLoans.placeholder')}
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
                      name="studentLoans"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('debts.studentLoans.label')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder={t('debts.studentLoans.placeholder')}
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
                      name="personalLoans"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('debts.personalLoans.label')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder={t('debts.personalLoans.placeholder')}
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
                      name="childSupport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('debts.childSupport.label')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder={t('debts.childSupport.placeholder')}
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
                      name="otherDebts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('debts.otherDebts.label')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder={t('debts.otherDebts.placeholder')}
                                className="pl-8"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>{t('debts.otherDebts.description')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="paysRent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('debts.rent.label')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="no-rent" />
                              <label htmlFor="no-rent" className="cursor-pointer">{t('debts.rent.no')}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="yes-rent" />
                              <label htmlFor="yes-rent" className="cursor-pointer">{t('debts.rent.yes')}</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("paysRent") === "yes" && (
                    <FormField
                      control={form.control}
                      name="currentRent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('debts.rent.amount')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder={t('debts.rent.amountPlaceholder')}
                                className="pl-8"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            {t('debts.rent.description')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* DTI Summary */}
              {monthlyIncome > 0 && (
                <div className="border-t pt-6">
                  <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold">{t('debts.summary.title')}</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{t('debts.summary.monthlyIncome')}</span>
                          <span className="font-semibold">${monthlyIncome.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('debts.summary.totalDebts')}</span>
                          <span className="font-semibold">${totalDebts.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{t('debts.summary.dtiRatio')}</span>
                          <span className={`text-xl font-bold ${dtiStatus.color}`}>
                            {dtiRatio.toFixed(1)}% {dtiStatus.icon}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <Progress
                            value={Math.min(dtiRatio, 50)}
                            className="h-3"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>28%</span>
                            <span>36%</span>
                            <span>43%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`p-3 rounded-md ${dtiRatio <= 36
                      ? "bg-success/10 border border-success/20"
                      : dtiRatio <= 43
                        ? "bg-warning/10 border border-warning/20"
                        : "bg-destructive/10 border border-destructive/20"
                      }`}>
                      <p className={`text-sm ${dtiStatus.color}`}>
                        {dtiStatus.message}
                      </p>
                    </div>

                    {payoffScenario && (
                      <div className="bg-info/10 border border-info/20 rounded-md p-3">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-info mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-info-foreground">
                              {t('debts.summary.payoffScenario.title')}
                            </p>
                            <p className="text-sm text-info-foreground mt-1">
                              {t('debts.summary.payoffScenario.message', { amount: payoffScenario.amount, newDti: payoffScenario.newDTI })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/application/assets")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('common.back')}
                </Button>
                <Button type="submit">
                  {t('debts.continueButton')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Debts;
