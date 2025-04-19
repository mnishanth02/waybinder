"use client";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { useCreateAthlete } from "@/features/onboarding/hooks/use-athlete-queries";
import { useAthleteOnboardingStore } from "@/features/onboarding/store/athlete-onboarding-store";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

export function AthleteWelcome() {
  const basicInfo = useAthleteOnboardingStore((state) => state.basicInfo);
  const sportsActivity = useAthleteOnboardingStore((state) => state.sportsActivity);
  const additionalInfo = useAthleteOnboardingStore((state) => state.additionalInfo);

  const profileImageUrl =
    basicInfo.profileImageUrl ||
    (basicInfo.profileImage ? URL.createObjectURL(basicInfo.profileImage) : undefined);
  const coverPhotoUrl =
    basicInfo.coverPhotoUrl ||
    (basicInfo.coverPhoto ? URL.createObjectURL(basicInfo.coverPhoto) : undefined);

  const { mutate: createAthlete, isPending } = useCreateAthlete({
    onSuccess: (data) => {
      console.log("Final returned data from API ->", data);
    },
    redirectPath: "/admin",
    transformResponse: true,
  });

  const handleComplete = () => {
    if (isPending) return;

    // Prepare data from the onboarding store in the expected format
    const athleteData = {
      basicInfo,
      sportsActivity,
      additionalInfo,
    };
    // Call the API to create the athlete profile
    createAthlete(athleteData);
  };

  return (
    <div className="mb-8 space-y-8">
      {/* Cover Photo Banner */}
      {coverPhotoUrl && (
        <div className="relative mb-[-64px] h-40 w-full overflow-hidden rounded-xl">
          <Image
            src={coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover"
            style={{ objectFit: "cover" }}
            priority={true}
          />
        </div>
      )}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="mb-2 font-bold text-2xl">Welcome, {basicInfo.firstName}!</h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          Your athlete profile has been created. You're now ready to explore the Waybinder community
          and connect with other outdoor enthusiasts.
        </p>
      </div>

      <div className="rounded-lg border bg-card shadow">
        <div className="p-6">
          <h3 className="mb-4 font-medium text-lg">Your Profile Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {profileImageUrl ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-background bg-secondary">
                    <Image
                      src={profileImageUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                      style={{ objectFit: "cover" }}
                      priority={true}
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <span className="font-medium text-muted-foreground text-xl">
                      {basicInfo.firstName?.charAt(0).toUpperCase()}
                      {basicInfo.lastName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium">
                  {basicInfo.firstName} {basicInfo.lastName}
                </div>
                <div className="text-muted-foreground">{basicInfo.email}</div>
                {basicInfo.location && (
                  <div className="text-muted-foreground text-sm">{basicInfo.location}</div>
                )}
              </div>
            </div>

            {sportsActivity && (
              <div>
                <h4 className="mb-1 font-medium text-sm">Primary Activity</h4>
                <div className="text-muted-foreground">
                  {sportsActivity?.primaryActivity1?.activity} (
                  {sportsActivity?.primaryActivity1?.experienceLevel})
                </div>
              </div>
            )}

            {additionalInfo?.bio && (
              <div>
                <h4 className="mb-1 font-medium text-sm">Bio</h4>
                <div className="text-muted-foreground">{additionalInfo.bio}</div>
              </div>
            )}
          </div>
        </div>

        <CardFooter className="bg-muted/50 px-6 py-4">
          <Button onClick={handleComplete} disabled={isPending} className="w-full">
            {isPending ? "Completing Registration..." : "Complete Registration"}
          </Button>
        </CardFooter>
      </div>

      <div className="text-center text-muted-foreground text-sm">
        <p>
          You can update your profile information anytime from your profile settings after
          registration is complete.
        </p>
      </div>
    </div>
  );
}
