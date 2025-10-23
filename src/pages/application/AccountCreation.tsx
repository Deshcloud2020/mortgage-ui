import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Home } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const accountSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number").optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[0-9])/, "Password must contain at least one number")
    .regex(/(?=.*[!@#$%^&*])/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must accept the terms to continue"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AccountCreation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    return strength;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const onSubmit = async (data: z.infer<typeof accountSchema>) => {
    try {
      // Simulate API call
      toast.success(t('accountCreation.toast.sendingCode'));

      // Store account data in localStorage for now
      localStorage.setItem('accountData', JSON.stringify({
        email: data.email,
        phone: data.phone,
      }));

      // Navigate to email verification
      navigate("/application/email-verification");
    } catch (error) {
      toast.error(t('accountCreation.toast.error'));
    }
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
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('common.back')}
              </Button>
              <div className="flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">{t('brand.name')}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">{t('common.help')}</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>{t('common.exit')}</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('progress.stepOf', { current: 1, total: 7 })}</span>
            <span className="text-muted-foreground">{t('progress.percentComplete', { percent: 14 })}</span>
          </div>
          <div className="flex gap-1">
            <div className="h-2 flex-1 bg-primary rounded-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-2 flex-1 bg-muted rounded-full" />
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('accountCreation.title')}</CardTitle>
            <CardDescription>
              {t('accountCreation.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('accountCreation.email.label')} *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('accountCreation.email.placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('accountCreation.email.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('accountCreation.phone.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder={t('accountCreation.phone.placeholder')}
                          {...field}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('accountCreation.phone.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('accountCreation.password.label')} *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('accountCreation.password.placeholder')}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setPasswordStrength(calculatePasswordStrength(e.target.value));
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      {field.value && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Progress value={passwordStrength} className="flex-1" />
                            <span className="text-sm text-muted-foreground">
                              {passwordStrength < 50 ? t('accountCreation.password.strength.weak') : passwordStrength < 75 ? t('accountCreation.password.strength.good') : t('accountCreation.password.strength.strong')}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>{t('accountCreation.password.requirements.length')}</div>
                            <div>{t('accountCreation.password.requirements.special')}</div>
                          </div>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('accountCreation.password.confirmLabel')} *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('accountCreation.password.confirmPlaceholder')}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          {t('accountCreation.terms.label')}{" "}
                          <a href="/terms" className="text-primary hover:underline">
                            {t('accountCreation.terms.termsLink')}
                          </a>{" "}
                          {t('accountCreation.terms.and')}{" "}
                          <a href="/privacy" className="text-primary hover:underline">
                            {t('accountCreation.terms.privacyLink')}
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!form.formState.isValid}
                >
                  {t('accountCreation.continueButton')}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('accountCreation.alreadyHaveAccount')}{" "}
                <Button variant="link" className="p-0 h-auto">
                  {t('accountCreation.signIn')}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            {t('accountCreation.securityNotice')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountCreation;
