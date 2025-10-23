import { ApplicationProgress } from "@/components/ApplicationProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useApplication } from "@/contexts/ApplicationContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().optional(),
  skipSSN: z.boolean().optional(),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "State must be 2 letters (e.g., CA)"),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
});

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { applicationData, updatePersonalInfo, saveProgress } = useApplication();
  const [skipSSN, setSkipSSN] = useState(false);

  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: applicationData.personalInfo,
  });

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const onSubmit = (data: z.infer<typeof personalInfoSchema>) => {
    updatePersonalInfo(data);
    saveProgress();
    toast.success(t('personalInfo.toast.saved'));
    navigate("/application/employment");
  };

  const handleSaveAndExit = () => {
    updatePersonalInfo(form.getValues());
    saveProgress();
    toast.success(t('personalInfo.toast.progressSaved'));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <ApplicationProgress currentStep={1} totalSteps={7} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('personalInfo.title')}</CardTitle>
            <CardDescription>
              {t('personalInfo.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('personalInfo.firstName.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('personalInfo.firstName.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('personalInfo.lastName.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('personalInfo.lastName.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('personalInfo.dateOfBirth.label')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} max={new Date().toISOString().split('T')[0]} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ssn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('personalInfo.ssn.label')}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t('personalInfo.ssn.placeholder')}
                            disabled={skipSSN}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('personalInfo.ssn.description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skipSSN"
                      checked={skipSSN}
                      onCheckedChange={(checked) => setSkipSSN(checked as boolean)}
                    />
                    <label htmlFor="skipSSN" className="text-sm text-muted-foreground cursor-pointer">
                      {t('personalInfo.ssn.skipLabel')}
                    </label>
                  </div>
                  {skipSSN && (
                    <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                      <p className="text-sm text-warning-foreground">
                        {t('personalInfo.ssn.warning')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('personalInfo.phone.label')}</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder={t('personalInfo.phone.placeholder')}
                            {...field}
                            onChange={(e) => field.onChange(formatPhone(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('personalInfo.email.label')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('personalInfo.email.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('personalInfo.address.label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('personalInfo.address.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('personalInfo.city.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('personalInfo.city.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('personalInfo.state.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('personalInfo.state.placeholder')} maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('personalInfo.zipCode.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('personalInfo.zipCode.placeholder')} maxLength={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveAndExit}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t('common.saveAndExit')}
                  </Button>
                  <Button type="submit">
                    {t('personalInfo.continueButton')}
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

export default PersonalInfo;
