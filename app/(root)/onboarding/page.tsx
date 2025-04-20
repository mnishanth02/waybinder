import Loader from "@/components/common/loader";
import { AthleteOnboardingForm } from "@/features/onboarding/components/athlete-onboarding-form";
import { auth } from "@/server/auth";
import { getAthleteIdByUserId } from "@/server/routes/athlete/athlete.controller";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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

  const response = await getAthleteIdByUserId(session.user.id);

  if (!response.success || !response.data) {
    return redirect("/");
  }

  if (response.data.athleteUniqueId) {
    redirect(`/athlete/${response.data.athleteUniqueId}`);
  }

  return (
    <Suspense fallback={<Loader />}>
      <div className="container mx-auto max-w-5xl p-4">
        <div className="mb-4 text-center">
          <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl">
            Join the Waybinder Community
          </h1>
        </div>
        <div className="rounded-xl border bg-card shadow-sm">
          <AthleteOnboardingForm />
        </div>
      </div>
    </Suspense>
  );
}
