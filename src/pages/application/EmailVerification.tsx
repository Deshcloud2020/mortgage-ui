import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Home, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EmailVerification = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = JSON.parse(localStorage.getItem('accountData') || '{}').email || 'your email';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== "") && !isVerifying) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setCode(newCode);

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    setIsVerifying(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, accept any 6-digit code
      if (verificationCode.length === 6) {
        toast.success(t('emailVerification.toast.success'));
        navigate("/application/personal-info");
      } else {
        throw new Error("Invalid code");
      }
    } catch (error) {
      toast.error(t('emailVerification.toast.error'));
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      // Simulate API call
      toast.success(t('emailVerification.toast.resent'));
      setTimeLeft(600);
      setCanResend(false);
      setResendCooldown(30);
    } catch (error) {
      toast.error(t('emailVerification.toast.resentError'));
    }
  };

  const handleChangeEmail = () => {
    navigate("/application/account-creation");
  };

  return (
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
          <CardTitle className="text-2xl">{t('emailVerification.title')}</CardTitle>
          <CardDescription>
            {t('emailVerification.subtitle')}{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
          <Button
            variant="link"
            className="p-0 h-auto text-sm"
            onClick={handleChangeEmail}
          >
            {t('emailVerification.changeEmail')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <label className="text-sm font-medium">{t('emailVerification.enterCode')}</label>
            </div>

            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  disabled={isVerifying}
                />
              ))}
            </div>

            {timeLeft > 0 ? (
              <div className="text-center text-sm text-muted-foreground">
                {t('emailVerification.codeExpires')} <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            ) : (
              <div className="text-center text-sm text-destructive">
                {t('emailVerification.codeExpired')}
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{t('emailVerification.didntReceive')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={!canResend || timeLeft === 0}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {canResend ? t('emailVerification.resendButton') : t('emailVerification.resendIn', { seconds: resendCooldown })}
            </Button>
          </div>

          {isVerifying && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                {t('emailVerification.verifying')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="mt-6 text-center">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>{t('emailVerification.tips.checkSpam')}</p>
          <p>{t('emailVerification.tips.checkEmail', { email })}</p>
        </div>
      </div>
    </div>
    </div >
  );
};

export default EmailVerification;
