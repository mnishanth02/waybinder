import { getJourneyByUniqueId } from "@/features/athlete/api";
import { ActivityClient } from "@/features/athlete/components/activity/activity-client";

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
      <ActivityClient
        journeyId={journeyId}
        activityId={activityId}
        journey={journey}
        isNewActivity={isNewActivity}
      />
    </div>
  );
};

export default ActivityDetailsPage;
