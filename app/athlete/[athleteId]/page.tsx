interface AthletePageProps {
  params: Promise<{ athleteId: string }>;
}

const AthletePage = async ({ params }: AthletePageProps) => {
  const { athleteId } = await params;

  return <div>AthletePage - {athleteId}</div>;
};

export default AthletePage;
