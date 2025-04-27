import JourneyDetailsClient from "../../../../features/athlete/components/journey/journey-details-client";

interface JourneyDetailsPageProps {
  params: Promise<{
    journeyId: string;
  }>;
}

const JourneyDetailsPage = async ({ params }: JourneyDetailsPageProps) => {
  const { journeyId } = await params;

  return <JourneyDetailsClient journeyId={journeyId} />;
};

export default JourneyDetailsPage;
