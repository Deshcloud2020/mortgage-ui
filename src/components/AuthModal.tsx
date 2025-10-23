import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setAuthentication } from '@/lib/auth';
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

const createLoginSchema = (t: any) => z.object({
  email: z.string().email(t('auth.validation.emailInvalid')),
  password: z.string().min(1, t('auth.validation.passwordRequired')),
});

const createRegisterSchema = (t: any) => z.object({
  email: z.string().email(t('auth.validation.emailInvalid')),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, t('auth.validation.phoneInvalid')).optional(),
  password: z.string()
    .min(8, t('auth.validation.passwordMinLength'))
    .regex(/(?=.*[0-9])/, t('auth.validation.passwordNumber'))
    .regex(/(?=.*[!@#$%^&*])/, t('auth.validation.passwordSpecial')),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, t('auth.validation.termsRequired')),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.validation.passwordMismatch'),
  path: ["confirmPassword"],
});

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: () => void;
}

export const AuthModal = ({ open, onOpenChange, onAuthSuccess }: AuthModalProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const loginSchema = createLoginSchema(t);
  const registerSchema = createRegisterSchema(t);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
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

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store auth data in sessionStorage
      setAuthentication(data.email);

      toast.success(t('auth.modal.loginSuccess'));
      onAuthSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(t('auth.modal.loginError'));
    }
  };

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store account data in sessionStorage
      setAuthentication(data.email);
      sessionStorage.setItem('accountData', JSON.stringify({
        email: data.email,
        phone: data.phone,
      }));

      toast.success(t('accountCreation.toast.sendingCode'));
      onAuthSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(t('accountCreation.toast.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{t('auth.modal.title')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('auth.modal.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.modal.loginTab')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.modal.registerTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.login.emailLabel')} *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('auth.login.emailPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.login.passwordLabel')} *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth.login.passwordPlaceholder')}
                            {...field}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg">
                  {t('auth.modal.loginButton')}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
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
                      <FormDescription className="text-xs">
                        {t('accountCreation.email.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
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
                            <span className="text-xs text-muted-foreground">
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
                  control={registerForm.control}
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
                  control={registerForm.control}
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
                        <FormLabel className="text-xs">
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
                  disabled={!registerForm.formState.isValid}
                >
                  {t('auth.modal.registerButton')}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
