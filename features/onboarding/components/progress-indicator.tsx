import { Progress } from "@/components/ui/progress";
import { memo } from "react";

interface ProgressIndicatorProps {
  currentStepIndex: number;
  totalSteps: number;
}

export const ProgressIndicator = memo(function ProgressIndicator({
  currentStepIndex,
  totalSteps,
}: ProgressIndicatorProps) {
  const progressPercentage = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div className="border-b px-6 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <span className="font-medium text-sm">{progressPercentage}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
});
