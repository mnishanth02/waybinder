"use client";
import Loader from "@/components/common/loader";
import { useGetAthleteByUniqueId } from "@/features/onboarding/hooks";
import { AthleteNotFoundError } from "@/lib/errors/athlete-error";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AthleteHome = ({ athleteId }: { athleteId: string }) => {
  const router = useRouter();
  const { data: athleteData, error, isError, isLoading } = useGetAthleteByUniqueId(athleteId);

  // Handle error case - redirect to home page
  useEffect(() => {
    if (isError) {
      // Check if it's an athlete not found error
      if (error instanceof AthleteNotFoundError) {
        console.log(`Athlete with ID ${athleteId} not found, redirecting to home page`);
      } else {
        console.error("Error loading athlete:", error);
      }

      // Redirect to home page for any error
      router.push("/");
    }
  }, [isError, error, router, athleteId]);

  // Show loader while data is loading
  if (isLoading) {
    return <Loader />;
  }

  // If data is not available but not in error state yet, show loader
  if (!athleteData) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-bold text-2xl">
        {athleteData.basicInfo.displayName ||
          `${athleteData.basicInfo.firstName} ${athleteData.basicInfo.lastName}`}
      </h1>
      <div className="rounded-lg bg-card p-6 shadow-sm">
        <p>Athlete ID: {athleteId}</p>
        <p>
          Name: {athleteData.basicInfo.firstName} {athleteData.basicInfo.lastName}
        </p>
        <p>Email: {athleteData.basicInfo.email}</p>
        {athleteData.basicInfo.location && <p>Location: {athleteData.basicInfo.location}</p>}
      </div>
    </div>
  );
};

export default AthleteHome;
