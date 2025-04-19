import { AthleteOnboardingForm } from "@/features/onboarding/components/athlete-onboarding-form";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Athlete Onboarding",
  description: "Complete your athlete profile and join the Waybinder community",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  if (session?.user?.role === "athlete") {
    redirect("/admin");
  }

  return (
    <div className="container mx-auto max-w-5xl p-4">
      <div className="mb-4 text-center">
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl">Join the Waybinder Community</h1>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        <AthleteOnboardingForm />
      </div>
    </div>
  );
}
