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
    toast.success("Assets information saved!");
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
    toast.success("Progress saved! You can resume anytime.");
    navigate("/dashboard");
  };

  const getReserveStatus = () => {
    if (reserveMonths >= 6) return { color: "text-success", icon: "✓", message: "Excellent reserves" };
    if (reserveMonths >= 3) return { color: "text-warning", icon: "⚠", message: "Good reserves" };
    return { color: "text-destructive", icon: "✗", message: "Low reserves" };
  };

  const reserveStatus = getReserveStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/application/employment")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">uSign</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleSaveAndExit}>
                <Save className="h-4 w-4 mr-2" />
                Save & Exit
              </Button>
              <Button variant="ghost" size="sm">Help</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-3xl mx-auto px-4 py-8">
        <ApplicationProgress currentStep={3} totalSteps={7} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Assets & Down Payment</CardTitle>
            <CardDescription>
              Show us what funds you have available for your home purchase
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
                        <FormLabel>How much can you put down? *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              placeholder="80000"
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Based on estimated home price of ${estimatedHomePrice.toLocaleString()}
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
                      5% (${(estimatedHomePrice * 0.05).toLocaleString()})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDownPayment(10)}
                    >
                      10% (${(estimatedHomePrice * 0.10).toLocaleString()})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDownPayment(20)}
                    >
                      20% (${(estimatedHomePrice * 0.20).toLocaleString()})
                    </Button>
                  </div>

                  {pmiRequired && (
                    <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-warning mt-0.5" />
                        <div>
                          <p className="text-sm text-warning-foreground">
                            20% down avoids PMI insurance (~$140/month savings)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Current Assets</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkingAccounts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Checking Account(s) *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder="25000"
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
                          <FormLabel>Savings Account(s) *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder="75000"
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
                  <h4 className="font-medium">Other Assets (Optional)</h4>

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
                              Retirement Accounts (401k, IRA)
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
                                    placeholder="50000"
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
                              Investments (Stocks, Bonds)
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
                                    placeholder="25000"
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
                              Other Real Estate
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
                                    placeholder="100000"
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
                      <FormLabel>Gift Funds?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no-gift" />
                            <label htmlFor="no-gift" className="cursor-pointer">No gift funds</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes-gift" />
                            <label htmlFor="yes-gift" className="cursor-pointer">
                              Yes, receiving gift funds for down payment
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
                        <FormLabel>Gift Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              placeholder="10000"
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Gift funds must be documented and cannot be a loan
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
                        <span className="font-medium">Total Available Assets:</span>
                        <span className="text-xl font-bold">${totalAssets.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Down Payment ({downPaymentPercent.toFixed(1)}%):</span>
                        <span className="font-semibold">${(watchedValues.downPayment || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Remaining Reserves:</span>
                        <span className="font-semibold">${remainingReserves.toLocaleString()}</span>
                      </div>
                      <div className={`flex justify-between items-center ${reserveStatus.color}`}>
                        <span>Reserve Status:</span>
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
                              Low reserves ({reserveMonths.toFixed(1)} months). Lenders prefer 6+ months of payments in reserves.
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
                    Back
                  </Button>
                  <Button type="submit">
                    Continue to Debts
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assets;
