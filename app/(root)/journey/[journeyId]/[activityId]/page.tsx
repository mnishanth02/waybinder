interface ActivityDetailsPageProps {
  params: Promise<{
    journeyId: string;
    activityId: string;
  }>;
}

const ActivityDetailsPage = async ({ params }: ActivityDetailsPageProps) => {
  const { journeyId, activityId } = await params;

  return (
    <div>
      ActivityDetailsPage - {journeyId} - {activityId}
    </div>
  );
};

export default ActivityDetailsPage;
