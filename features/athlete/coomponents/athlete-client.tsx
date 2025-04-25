"use client";
import Loader from "@/components/common/loader";
import AthleteDashboard from "@/features/athlete/coomponents/dashboard";
import { useGetAthleteByUniqueId } from "@/features/onboarding/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const AthleteClient = ({ athleteId }: { athleteId: string }) => {
  const router = useRouter();

  const {
    data: athleteData,
    isLoading,
    error,
  } = useGetAthleteByUniqueId(athleteId, {
    enabled: !!athleteId,
    retry: false,
  });

  // Handle any client-side errors that weren't caught during prefetching
  useEffect(() => {
    if (error) {
      toast.error(`Error loading athlete: ${error.message}`);
      console.error("Client-side error fetching athlete:", error);
    }
  }, [error]);

  // Show loading state
  if (isLoading) {
    return <Loader />;
  }

  if (!athleteData) {
    toast.error("Athlete data not available");
    router.push("/");
    return null;
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
      <AthleteDashboard />
    </div>
  );
};

export default AthleteClient;
