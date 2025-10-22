import { ApplicationProgress } from "@/components/ApplicationProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApplication } from "@/contexts/ApplicationContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Home, Info, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const employmentSchema = z.object({
  status: z.enum(["employed", "self-employed", "retired", "other"]),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  yearsEmployed: z.number().min(0).optional(),
  monthsEmployed: z.number().min(0).max(11).optional(),
  monthlyIncome: z.number().min(1, "Monthly income is required"),
  hasAdditionalIncome: z.enum(["no", "yes"]),
  additionalIncome: z.number().optional(),
  additionalIncomeSource: z.string().optional(),
}).refine((data) => {
  if (data.status === "employed") {
    return data.employer && data.jobTitle;
  }
  return true;
}, {
  message: "Employer and job title are required for employed status",
  path: ["employer"],
});

const Employment = () => {
  const navigate = useNavigate();
  const { applicationData, updateEmployment, saveProgress } = useApplication();
  const [totalIncome, setTotalIncome] = useState(0);

  const form = useForm<z.infer<typeof employmentSchema>>({
    resolver: zodResolver(employmentSchema),
    defaultValues: {
      status: applicationData.employment.status,
      employer: applicationData.employment.employer || "",
      jobTitle: applicationData.employment.jobTitle || "",
      yearsEmployed: applicationData.employment.yearsEmployed || 0,
      monthsEmployed: 0,
      monthlyIncome: applicationData.employment.monthlyIncome || 0,
      hasAdditionalIncome: "no",
      additionalIncome: applicationData.employment.additionalIncome || 0,
      additionalIncomeSource: "",
    },
  });

  const watchedValues = form.watch();
  const employmentStatus = form.watch("status");
  const hasAdditionalIncome = form.watch("hasAdditionalIncome");
  const monthlyIncome = form.watch("monthlyIncome") || 0;
  const additionalIncome = form.watch("additionalIncome") || 0;

  // Update total income when values change
  useEffect(() => {
    const total = monthlyIncome + (hasAdditionalIncome === "yes" ? additionalIncome : 0);
    setTotalIncome(total);
  }, [monthlyIncome, additionalIncome, hasAdditionalIncome]);

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^\d.]/g, ""));
    return isNaN(number) ? "" : number.toLocaleString();
  };

  const onSubmit = (data: z.infer<typeof employmentSchema>) => {
    const employmentData = {
      status: data.status,
      employer: data.employer,
      jobTitle: data.jobTitle,
      yearsEmployed: data.yearsEmployed,
      monthlyIncome: data.monthlyIncome,
      additionalIncome: data.hasAdditionalIncome === "yes" ? data.additionalIncome : 0,
    };

    updateEmployment(employmentData);
    saveProgress();
    toast.success("Employment information saved!");
    navigate("/application/assets");
  };

  const handleSaveAndExit = () => {
    const values = form.getValues();
    updateEmployment({
      status: values.status,
      employer: values.employer,
      jobTitle: values.jobTitle,
      yearsEmployed: values.yearsEmployed,
      monthlyIncome: values.monthlyIncome,
      additionalIncome: values.hasAdditionalIncome === "yes" ? values.additionalIncome : 0,
    });
    saveProgress();
    toast.success("Progress saved! You can resume anytime.");
    navigate("/dashboard");
  };

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
                onClick={() => navigate("/application/personal-info")}
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
        <ApplicationProgress currentStep={2} totalSteps={7} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Employment & Income</CardTitle>
            <CardDescription>
              This helps us calculate how much you can borrow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="employed" id="employed" />
                            <label htmlFor="employed" className="cursor-pointer">Employed (W-2)</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="self-employed" id="self-employed" />
                            <label htmlFor="self-employed" className="cursor-pointer">Self-Employed</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="retired" id="retired" />
                            <label htmlFor="retired" className="cursor-pointer">Retired</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <label htmlFor="other" className="cursor-pointer">Other</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {employmentStatus === "employed" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employer Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC Company Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="yearsEmployed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years with Employer</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="monthsEmployed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Months</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="6"
                                max="11"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {employmentStatus === "self-employed" && (
                  <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning-foreground">
                          Self-Employment Notice
                        </p>
                        <p className="text-sm text-warning-foreground mt-1">
                          Self-employment may require additional documentation such as tax returns and profit/loss statements.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {employmentStatus === "self-employed"
                          ? "Average Monthly Net Income *"
                          : "Gross Monthly Income *"
                        }
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder="8500"
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {employmentStatus === "self-employed"
                          ? "After business expenses"
                          : "Before taxes and deductions"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasAdditionalIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you have additional income?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no-additional" />
                            <label htmlFor="no-additional" className="cursor-pointer">No</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes-additional" />
                            <label htmlFor="yes-additional" className="cursor-pointer">
                              Yes (bonuses, commissions, rental, etc.)
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {hasAdditionalIncome === "yes" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <FormField
                      control={form.control}
                      name="additionalIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Monthly Income</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                placeholder="1500"
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
                      name="additionalIncomeSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select income source" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bonus">Bonus/Commission</SelectItem>
                              <SelectItem value="rental">Rental Income</SelectItem>
                              <SelectItem value="investment">Investment Income</SelectItem>
                              <SelectItem value="pension">Pension</SelectItem>
                              <SelectItem value="social-security">Social Security</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {totalIncome > 0 && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total Monthly Income:</span>
                      <span className="text-2xl font-bold text-success">
                        ${totalIncome.toLocaleString()}
                      </span>
                    </div>
                    {totalIncome > 0 && (
                      <p className="text-sm text-success-foreground mt-2">
                        ✓ Income verified: ${totalIncome.toLocaleString()}/month
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/application/personal-info")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit">
                    Continue to Assets
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

export default Employment;
