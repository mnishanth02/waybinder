import { AthleteOnboardingForm } from "../../features/onboarding/components/athlete-onboarding-form";

export const metadata = {
  title: "Athlete Onboarding",
  description: "Complete your athlete profile and join the Waybinder community",
};

export default async function OnboardingPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:py-16">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl">Join the Waybinder Community</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Complete your athlete profile to start sharing your outdoor adventures with explorers
          worldwide
        </p>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        <AthleteOnboardingForm />
      </div>
    </div>
  );
}
