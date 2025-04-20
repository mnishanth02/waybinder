import { getAthleteByUniqueId } from "@/features/onboarding/api";
import { athleteKeys } from "@/features/onboarding/hooks/query-keys";
import { AthleteNotFoundError } from "@/lib/errors/athlete-error";
import { getQueryClient } from "@/lib/utils/get-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
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
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AthleteHome athleteId={athleteId} />
      </HydrationBoundary>
    );
  } catch (error) {
    // Handle athlete not found error specifically
    if (error instanceof AthleteNotFoundError) {
      console.log(`Athlete with ID ${athleteId} not found, redirecting to home page`);
      redirect("/");
    }

    // Handle other errors
    console.error(`Error loading athlete ${athleteId}:`, error);

    // For any error, redirect to home page
    redirect("/");
  }
};

export default AthletePage;
