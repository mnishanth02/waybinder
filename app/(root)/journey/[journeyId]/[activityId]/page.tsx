import { getJourneyByUniqueId } from "@/features/athlete/api";
import { ActivityClient } from "@/features/athlete/components/activity/activity-client";
import { Suspense } from "react";

interface ActivityDetailsPageProps {
  params: Promise<{
    journeyId: string;
    activityId: string;
  }>;
}

const ActivityDetailsPage = async ({ params }: ActivityDetailsPageProps) => {
  const { journeyId, activityId } = await params;

  // Fetch journey details for the header
  const journey = await getJourneyByUniqueId(journeyId);

  const isNewActivity = activityId === "new";

  return (
    <div className="wrapper px-4 py-6 sm:px-6">
      <Suspense fallback={<div>Loading...</div>}>
        <ActivityClient activityId={activityId} journey={journey} isNewActivity={isNewActivity} />
      </Suspense>
    </div>
  );
};

export default ActivityDetailsPage;
