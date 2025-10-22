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
import { ArrowLeft, Home, Info, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
          message: "Excellent! Your DTI is well below the 36% limit",
          icon: "✓"
        });
      } else if (ratio <= 36) {
        setDtiStatus({
          color: "text-success",
          message: "Good! Your DTI is within standard limits",
          icon: "✓"
        });
      } else if (ratio <= 43) {
        setDtiStatus({
          color: "text-warning",
          message: "DTI above standard 36% limit but may qualify for FHA (43% limit)",
          icon: "⚠"
        });
      } else {
        setDtiStatus({
          color: "text-destructive",
          message: "DTI exceeds most lender limits",
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
    toast.success("Debt information saved!");
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
    toast.success("Progress saved! You can resume anytime.");
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/application/assets")}
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
        <ApplicationProgress currentStep={4} totalSteps={7} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Monthly Debts & Obligations</CardTitle>
            <CardDescription>
              Help us calculate your debt-to-income ratio. Only include minimum monthly payments.
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
                        <strong>Do not include:</strong> utilities, groceries, gas, insurance, or other living expenses
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
                            I have no monthly debts
                          </FormLabel>
                          <FormDescription>
                            Check this if you have no recurring debt payments
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
                            <FormLabel>Credit Card Minimum Payments</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder="200"
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>Total across all cards</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="autoLoans"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auto Loan / Lease</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder="450"
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
                            <FormLabel>Student Loans</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder="300"
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
                            <FormLabel>Personal Loans</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder="150"
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
                            <FormLabel>Child Support / Alimony</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder="500"
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
                            <FormLabel>Other Monthly Obligations</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder="100"
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>Timeshares, court-ordered payments, etc.</FormDescription>
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
                          <FormLabel>Do you currently pay rent?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="no-rent" />
                                <label htmlFor="no-rent" className="cursor-pointer">No</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="yes-rent" />
                                <label htmlFor="yes-rent" className="cursor-pointer">Yes</label>
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
                            <FormLabel>Monthly Rent</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder="1800"
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Rent is not counted in DTI for home purchase
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
                      <h3 className="text-lg font-semibold">Debt Summary</h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Monthly Income:</span>
                            <span className="font-semibold">${monthlyIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Monthly Debts:</span>
                            <span className="font-semibold">${totalDebts.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Debt-to-Income Ratio:</span>
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
                                Debt Payoff Scenario
                              </p>
                              <p className="text-sm text-info-foreground mt-1">
                                Paying off ${payoffScenario.amount}/month in debts would reduce your DTI to {payoffScenario.newDTI}%
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
                    Back
                  </Button>
                  <Button type="submit">
                    Continue to Property
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

export default Debts;
