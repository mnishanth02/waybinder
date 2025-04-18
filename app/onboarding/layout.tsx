import { cn } from "@/lib/utils";

export const metadata = {
  title: {
    template: "%s | WayBinder",
    default: "Athlete Onboarding | WayBinder",
  },
  description:
    "Complete your athlete profile to start sharing your outdoor adventures with explorers worldwide",
};

const OnboardingLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/10"
      )}
    >
      {children}
    </div>
  );
};

export default OnboardingLayout;
