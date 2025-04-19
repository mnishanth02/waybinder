import { getAthleteByUniqueId } from "@/features/onboarding/api";
import { athleteKeys } from "@/features/onboarding/hooks/query-keys";
import { getQueryClient } from "@/lib/utils/get-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import AthleteHome from "./components/home";

interface AthletePageProps {
  params: Promise<{ athleteId: string }>;
}

const AthletePage = async ({ params }: AthletePageProps) => {
  const { athleteId } = await params;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: athleteKeys.unique(athleteId),
    queryFn: () => getAthleteByUniqueId(athleteId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AthleteHome athleteId={athleteId} />
    </HydrationBoundary>
  );
};

export default AthletePage;
