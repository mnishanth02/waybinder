import { getAthleteByUniqueId } from "@/features/onboarding/api";
import { athleteKeys } from "@/features/onboarding/hooks/query-keys";
import { getQueryClient } from "@/lib/utils/get-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import AthleteHome from "./components/home";

interface AthletePageProps {
  params: Promise<{ athleteId: string }>;
}

const AthletePage = async ({ params }: AthletePageProps) => {
  const { athleteId } = await params;
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: athleteKeys.unique(athleteId),
      queryFn: () => getAthleteByUniqueId(athleteId),
      retry: (failureCount, _error) => {
        return failureCount < 2;
      },
    });

    // Check if the query was successful by trying to get the data
    const athleteData = queryClient.getQueryData(athleteKeys.unique(athleteId));

    if (!athleteData) {
      notFound();
    }

    // If we have data, render the athlete home component
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AthleteHome athleteId={athleteId} />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error(`Error in athlete page for ID ${athleteId}:`, error);
    throw error;
  }
};

export default AthletePage;
