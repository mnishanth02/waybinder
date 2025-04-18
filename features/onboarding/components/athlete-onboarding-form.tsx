"use client";
import { Skeleton } from "@/components/ui/skeleton";
import type { Step } from "@/features/onboarding/hooks/use-multi-step-form";
import { useAthleteOnboardingStore } from "@/features/onboarding/store/athlete-onboarding-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useCallback } from "react";
import { FormStepRenderer } from "./form-step-renderer";
import { ProgressIndicator } from "./progress-indicator";
import { StepNavigation } from "./step-navigation";

const steps: Step[] = [
  {
    id: "introduction",
    title: "Introduction",
    description: "What it means to register as an Athlete",
  },
  {
    id: "basicInfo",
    title: "Personal Information",
    description: "Tell us about yourself",
  },
  {
    id: "sportsActivity",
    title: "Sports & Activities",
    description: "Tell us about your sports interests",
  },
  {
    id: "additionalInfo",
    title: "Additional Information",
    description: "Other details that help complete your profile",
  },
  {
    id: "welcome",
    title: "Welcome",
    description: "You're all set to start your journey",
  },
];

export function AthleteOnboardingForm() {
  // Only get currentStepIndex and setCurrentStepIndex from the store
  const { currentStepIndex, setCurrentStepIndex } = useAthleteOnboardingStore();

  // For hydration safety, track if component is mounted
  const isMounted = useMounted();

  const totalSteps = steps.length;
  const step = steps[currentStepIndex];

  // Navigation functions (memoized to prevent unnecessary re-renders)
  const next = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, totalSteps, setCurrentStepIndex]);

  const back = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex, setCurrentStepIndex]);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setCurrentStepIndex(index);
      }
    },
    [totalSteps, setCurrentStepIndex]
  );

  if (!isMounted) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="mb-2 h-8 w-2/3" />
        <Skeleton className="mb-6 h-4 w-1/2" />
        <Skeleton className="mb-4 h-3 w-full" />
        <div className="mb-6 flex space-x-4">
          <Skeleton className="h-16 w-1/4" />
          <Skeleton className="h-16 w-1/4" />
          <Skeleton className="h-16 w-1/4" />
          <Skeleton className="h-16 w-1/4" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!step) {
    return <div className="p-6">Invalid step configuration</div>;
  }

  return (
    <div className="relative">
      {/* Progress indicator */}
      <ProgressIndicator currentStepIndex={currentStepIndex} totalSteps={totalSteps} />

      {/* Step navigation */}
      <StepNavigation steps={steps} currentStepIndex={currentStepIndex} goTo={goTo} />

      {/* Form content */}
      <div className="p-6">
        <FormStepRenderer step={step} next={next} back={back} />
      </div>
    </div>
  );
}
