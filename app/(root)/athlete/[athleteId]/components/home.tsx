"use client";
import Loader from "@/components/common/loader";
import AthleteDashboard from "@/features/athlete/coomponents/dashboard";
import { useGetAthleteByUniqueId } from "@/features/onboarding/hooks";

const AthleteHome = ({ athleteId }: { athleteId: string }) => {
  const { data: athleteData, isLoading } = useGetAthleteByUniqueId(athleteId);

  // Show loader while data is loading
  if (isLoading || !athleteData) {
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
      <AthleteDashboard />
    </div>
  );
};

export default AthleteHome;
