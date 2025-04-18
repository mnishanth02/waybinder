import type { Step } from "@/features/onboarding/hooks/use-multi-step-form";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import { memo } from "react";

interface StepNavigationProps {
  steps: Step[];
  currentStepIndex: number;
  goTo: (index: number) => void;
}

export const StepNavigation = memo(function StepNavigation({
  steps,
  currentStepIndex,
  goTo,
}: StepNavigationProps) {
  return (
    <div className="hidden border-b md:flex">
      <div className="flex px-6">
        {steps.map((s, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isClickable = index <= currentStepIndex;
          return (
            <button
              key={s.id}
              onClick={() => isClickable && !isActive && goTo(index)}
              disabled={!isClickable}
              className={cn(
                "-mb-px relative flex items-center border-b-2 px-2 py-4 font-medium text-sm transition-colors",
                isActive ? "border-primary text-primary" : "border-transparent",
                isCompleted
                  ? "text-muted-foreground hover:cursor-pointer hover:text-primary"
                  : !isClickable
                    ? "text-muted-foreground/40"
                    : "text-muted-foreground hover:border-muted hover:text-foreground",
                index !== 0 && "ml-8"
              )}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "mr-2 flex h-6 w-6 items-center justify-center rounded-full border text-center text-xs",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground "
                      : isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                  )}
                >
                  {isCompleted ? (
                    <span className="p-1.5 text-xs">
                      <Check className="h-4 w-4 " />
                    </span>
                  ) : (
                    <span className="p-2 text-xs">{index + 1}</span>
                  )}
                </div>
                <span>{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight
                  className={cn(
                    "ml-6 h-4 w-4 text-muted-foreground/40",
                    isCompleted ? "text-muted-foreground" : ""
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
