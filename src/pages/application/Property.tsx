import { ApplicationProgress } from "@/components/ApplicationProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowLeft, Info } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    toast.success(t('property.toast.saved'));
    navigate("/application/review");
  };

  const handleSaveAndExit = () => {
    toast.success(t('property.toast.progressSaved'));
    navigate("/dashboard");
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <ApplicationProgress currentStep={6} totalSteps={7} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('property.title')}</CardTitle>
          <CardDescription>
            {t('property.subtitle')}
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
                    <FormLabel>{t('property.hasFoundProperty.label')}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no-property" />
                          <label htmlFor="no-property" className="cursor-pointer">{t('property.hasFoundProperty.no')}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes-property" />
                          <label htmlFor="yes-property" className="cursor-pointer">{t('property.hasFoundProperty.yes')}</label>
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
                      <FormLabel>{t('property.propertyAddress.label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('property.propertyAddress.placeholder')} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t('property.propertyAddress.description')}
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
                    <FormLabel>{t('property.desiredHomePrice.label')} *</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder={t('property.desiredHomePrice.placeholder')}
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
                      <FormLabel>{t('property.state.label')} *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('property.state.placeholder')} />
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
                      <FormLabel>{t('property.zipCode.label')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('property.zipCode.placeholder')} maxLength={5} {...field} />
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
                    <FormLabel>{t('property.propertyType.label')} *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="single-family" id="single-family" />
                          <label htmlFor="single-family" className="cursor-pointer">{t('property.propertyType.singleFamily')}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="townhouse" id="townhouse" />
                          <label htmlFor="townhouse" className="cursor-pointer">{t('property.propertyType.townhouse')}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="condo" id="condo" />
                          <label htmlFor="condo" className="cursor-pointer">{t('property.propertyType.condo')}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="multi-unit" id="multi-unit" />
                          <label htmlFor="multi-unit" className="cursor-pointer">{t('property.propertyType.multiUnit')}</label>
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
                        {t('property.propertyType.multiUnitWarning')}
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
                    <FormLabel>{t('property.intendedUse.label')} *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="primary" id="primary" />
                          <label htmlFor="primary" className="cursor-pointer">{t('property.intendedUse.primary')}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="second-home" id="second-home" />
                          <label htmlFor="second-home" className="cursor-pointer">{t('property.intendedUse.secondHome')}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="investment" id="investment" />
                          <label htmlFor="investment" className="cursor-pointer">{t('property.intendedUse.investment')}</label>
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
                        {t('property.intendedUse.investmentWarning')}
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
                    <FormLabel>{t('property.firstTimeBuyer.label')}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes-first-time" />
                          <label htmlFor="yes-first-time" className="cursor-pointer">{t('property.firstTimeBuyer.yes')}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no-first-time" />
                          <label htmlFor="no-first-time" className="cursor-pointer">{t('property.firstTimeBuyer.no')}</label>
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
                        {t('property.firstTimeBuyer.benefit')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">{t('property.loanPreferences.title')}</h3>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="loanTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('property.loanPreferences.term.label')} *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col gap-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="30-year" id="30-year" />
                              <label htmlFor="30-year" className="cursor-pointer">
                                {t('property.loanPreferences.term.30year')}
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="15-year" id="15-year" />
                              <label htmlFor="15-year" className="cursor-pointer">
                                {t('property.loanPreferences.term.15year')}
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="not-sure" id="not-sure-term" />
                              <label htmlFor="not-sure-term" className="cursor-pointer">
                                {t('property.loanPreferences.term.notSure')}
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
                        <FormLabel>{t('property.loanPreferences.type.label')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col gap-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="conventional" id="conventional" />
                              <label htmlFor="conventional" className="cursor-pointer">
                                {t('property.loanPreferences.type.conventional')}
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fha" id="fha" />
                              <label htmlFor="fha" className="cursor-pointer">
                                {t('property.loanPreferences.type.fha')}
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="va" id="va" />
                              <label htmlFor="va" className="cursor-pointer">
                                {t('property.loanPreferences.type.va')}
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="usda" id="usda" />
                              <label htmlFor="usda" className="cursor-pointer">
                                {t('property.loanPreferences.type.usda')}
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="not-sure" id="not-sure-type" />
                              <label htmlFor="not-sure-type" className="cursor-pointer">
                                {t('property.loanPreferences.type.notSure')}
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
                  {t('common.back')}
                </Button>
                <Button type="submit">
                  {t('property.continueButton')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Property;
