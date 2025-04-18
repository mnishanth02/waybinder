import { useState } from "react";

export type Step = {
  id: string;
  title: string;
  description?: string;
};

export function useMultiStepForm<T extends Record<string, unknown>>(
  steps: Step[],
  initialValues: T
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<T>(initialValues);

  const step = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  function next() {
    if (!isLastStep) {
      setCurrentStepIndex((i) => i + 1);
    }
  }

  function back() {
    if (!isFirstStep) {
      setCurrentStepIndex((i) => i - 1);
    }
  }

  function goTo(index: number) {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }

  function updateFormData(stepId: string, data: Partial<T[keyof T]>) {
    setFormData((prev) => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || {}),
        ...data,
      },
    }));
  }

  return {
    currentStepIndex,
    step,
    steps,
    isFirstStep,
    isLastStep,
    formData,
    next,
    back,
    goTo,
    updateFormData,
  };
}
