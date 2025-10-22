import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ApplicationProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const ApplicationProgress = ({ currentStep, totalSteps }: ApplicationProgressProps) => {
  const { t } = useTranslation();

  const steps = [
    t('steps.personalInfo'),
    t('steps.employment'),
    t('steps.assets'),
    t('steps.debts'),
    t('steps.review'),
    t('steps.documents'),
    t('steps.results')
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t('progress.stepOf', { current: currentStep, total: totalSteps })}
        </span>
        <span className="text-muted-foreground">
          {t('progress.percentComplete', { percent: Math.round((currentStep / totalSteps) * 100) })}
        </span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              index < currentStep
                ? "bg-primary"
                : index === currentStep - 1
                  ? "bg-primary/50"
                  : "bg-muted"
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{steps[currentStep - 1]}</span>
        {currentStep < totalSteps && <span>{t('progress.next', { step: steps[currentStep] })}</span>}
      </div>
    </div>
  );
};
