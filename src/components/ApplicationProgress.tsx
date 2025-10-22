import { cn } from "@/lib/utils";

interface ApplicationProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  "Personal Info",
  "Employment",
  "Assets",
  "Debts",
  "Review",
  "Documents",
  "Results"
];

export const ApplicationProgress = ({ currentStep, totalSteps }: ApplicationProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-muted-foreground">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
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
        {currentStep < totalSteps && <span>Next: {steps[currentStep]}</span>}
      </div>
    </div>
  );
};
