import { ApplicationProgress } from "@/components/ApplicationProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowLeft, Home, Info, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const propertySchema = z.object({
  hasFoundProperty: z.enum(["no", "yes"]),
  propertyAddress: z.string().optional(),
  desiredHomePrice: z.number().min(50000, "Home price must be at least $50,000"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
  propertyType: z.enum(["single-family", "townhouse", "condo", "multi-unit"]),
  intendedUse: z.enum(["primary", "second-home", "investment"]),
  isFirstTimeBuyer: z.enum(["yes", "no"]),
  loanTerm: z.enum(["30-year", "15-year", "not-sure"]),
  loanType: z.enum(["conventional", "fha", "va", "usda", "not-sure"]),
});

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const Property = () => {
  const navigate = useNavigate();
  const [homePrice, setHomePrice] = useState(400000);

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      hasFoundProperty: "no",
      propertyAddress: "",
      desiredHomePrice: 400000,
      state: "",
      zipCode: "",
      propertyType: "single-family",
      intendedUse: "primary",
      isFirstTimeBuyer: "no",
      loanTerm: "30-year",
      loanType: "not-sure",
    },
  });

  const hasFoundProperty = form.watch("hasFoundProperty");
  const propertyType = form.watch("propertyType");
  const intendedUse = form.watch("intendedUse");
  const isFirstTimeBuyer = form.watch("isFirstTimeBuyer");

  const onSubmit = (data: z.infer<typeof propertySchema>) => {
    toast.success("Property preferences saved!");
    navigate("/application/review");
  };

  const handleSaveAndExit = () => {
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
                onClick={() => navigate("/application/debts")}
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
        <ApplicationProgress currentStep={6} totalSteps={7} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Property & Loan Preferences</CardTitle>
            <CardDescription>
              Tell us about the home you want to buy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="hasFoundProperty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Have you found a property?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no-property" />
                            <label htmlFor="no-property" className="cursor-pointer">No, I'm still looking</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes-property" />
                            <label htmlFor="yes-property" className="cursor-pointer">Yes, I have an address</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {hasFoundProperty === "yes" && (
                  <FormField
                    control={form.control}
                    name="propertyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State ZIP" {...field} />
                        </FormControl>
                        <FormDescription>
                          Start typing to see suggestions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="desiredHomePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Home Price *</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              placeholder="400000"
                              className="pl-8"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                field.onChange(value);
                                setHomePrice(value);
                              }}
                            />
                          </div>
                          <div className="px-2">
                            <Slider
                              value={[homePrice]}
                              onValueChange={(values) => {
                                const value = values[0];
                                field.onChange(value);
                                setHomePrice(value);
                              }}
                              min={200000}
                              max={800000}
                              step={10000}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>$200K</span>
                              <span>${(homePrice / 1000).toFixed(0)}K</span>
                              <span>$800K</span>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="94102" maxLength={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single-family" id="single-family" />
                            <label htmlFor="single-family" className="cursor-pointer">Single-Family Home</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="townhouse" id="townhouse" />
                            <label htmlFor="townhouse" className="cursor-pointer">Townhouse</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="condo" id="condo" />
                            <label htmlFor="condo" className="cursor-pointer">Condominium</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multi-unit" id="multi-unit" />
                            <label htmlFor="multi-unit" className="cursor-pointer">Multi-Unit (2-4 units)</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {propertyType === "multi-unit" && (
                  <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm text-warning-foreground">
                          Multi-unit properties may require larger down payments (15-25%)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="intendedUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intended Use *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col gap-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="primary" id="primary" />
                            <label htmlFor="primary" className="cursor-pointer">Primary Residence</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="second-home" id="second-home" />
                            <label htmlFor="second-home" className="cursor-pointer">Second Home / Vacation</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="investment" id="investment" />
                            <label htmlFor="investment" className="cursor-pointer">Investment Property</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {intendedUse === "investment" && (
                  <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm text-warning-foreground">
                          Investment properties require 20-25% down, higher rates, and stricter qualification
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="isFirstTimeBuyer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First-time Homebuyer?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes-first-time" />
                            <label htmlFor="yes-first-time" className="cursor-pointer">Yes</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no-first-time" />
                            <label htmlFor="no-first-time" className="cursor-pointer">No</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isFirstTimeBuyer === "yes" && (
                  <div className="bg-info/10 border border-info/20 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-info mt-0.5" />
                      <div>
                        <p className="text-sm text-info-foreground">
                          May qualify for special programs and benefits
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Loan Preferences</h3>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="loanTerm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Term *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col gap-3"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="30-year" id="30-year" />
                                <label htmlFor="30-year" className="cursor-pointer">
                                  30-year fixed (Lower monthly payment)
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="15-year" id="15-year" />
                                <label htmlFor="15-year" className="cursor-pointer">
                                  15-year fixed (Pay off faster, less interest)
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="not-sure" id="not-sure-term" />
                                <label htmlFor="not-sure-term" className="cursor-pointer">
                                  Not sure (We'll show options)
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="loanType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Type Preference</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col gap-3"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="conventional" id="conventional" />
                                <label htmlFor="conventional" className="cursor-pointer">
                                  Conventional (Standard, 620+ credit)
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fha" id="fha" />
                                <label htmlFor="fha" className="cursor-pointer">
                                  FHA (Lower down payment, 580+ credit)
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="va" id="va" />
                                <label htmlFor="va" className="cursor-pointer">
                                  VA (Military veterans, 0% down)
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="usda" id="usda" />
                                <label htmlFor="usda" className="cursor-pointer">
                                  USDA (Rural properties, 0% down)
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="not-sure" id="not-sure-type" />
                                <label htmlFor="not-sure-type" className="cursor-pointer">
                                  Not sure (Show me all options)
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/application/debts")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit">
                    Continue to Review
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

export default Property;
