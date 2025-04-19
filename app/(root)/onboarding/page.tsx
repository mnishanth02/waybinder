import Loader from "@/components/common/loader";
import { getUserWithAthleteUsingFetch } from "@/features/auth/api/auth-server-api";
import { AthleteOnboardingForm } from "@/features/onboarding/components/athlete-onboarding-form";
import { auth } from "@/server/auth";
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

  const user = await getUserWithAthleteUsingFetch(session.user.id);

  if (user?.athleteProfile?.athleteUniqueId) {
    redirect(`/athlete/${user.athleteProfile.athleteUniqueId}`);
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
