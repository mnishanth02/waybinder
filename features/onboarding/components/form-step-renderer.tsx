import type { Step } from "@/features/onboarding/hooks/use-multi-step-form";
import { memo } from "react";
import { AthleteAdditionalInfoForm } from "./steps/athlete-additional-info-form";
import { AthleteBasicInfoForm } from "./steps/athlete-basic-info-form";
import { AthleteIntroduction } from "./steps/athlete-introduction";
import { AthleteSportsActivityForm } from "./steps/athlete-sports-activity-form";
import { AthleteWelcome } from "./steps/athlete-welcome";

interface FormStepRendererProps {
  step: Step;
  next: () => void;
  back: () => void;
}

export const FormStepRenderer = memo(function FormStepRenderer({
  step,
  next,
  back,
}: FormStepRendererProps) {
  if (!step) return null;

  switch (step.id) {
    case "introduction":
      return <AthleteIntroduction onNext={next} />;
    case "basicInfo":
      return <AthleteBasicInfoForm key={step.id} onNext={next} />;
    case "sportsActivity":
      return <AthleteSportsActivityForm key={step.id} onNext={next} onBack={back} />;
    case "additionalInfo":
      return <AthleteAdditionalInfoForm key={step.id} onNext={next} onBack={back} />;
    case "welcome":
      return <AthleteWelcome />;
    default:
      return null;
  }
});
