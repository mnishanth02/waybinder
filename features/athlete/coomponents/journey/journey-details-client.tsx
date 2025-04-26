"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import JourneySheet from "@/features/athlete/coomponents/journey-sheet";
import { useGetJourneyByUniqueId } from "@/features/athlete/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import DeleteJourneyDialog from "./delete-journey-dialog";
import JourneyHeader from "./journey-header";

interface JourneyDetailsClientProps {
  journeyId: string;
}

const JourneyDetailsClient = ({ journeyId }: JourneyDetailsClientProps) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch journey data
  const {
    data: journeyData,
    isLoading,
    error,
  } = useGetJourneyByUniqueId(journeyId, {
    onNotFound: () => {
      toast.error("Journey not found");
      router.push("/");
    },
  });

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-5xl p-4">
        <Card>
          <CardContent className="p-6">
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p>
                Error loading journey details. The journey may not exist or you may not have
                permission to view it.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading || !journeyData) {
    return (
      <div className="container mx-auto max-w-5xl p-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-10 w-3/4" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4">
      <div className="mb-8">
        <JourneyHeader journey={journeyData} onDeleteClick={() => setIsDeleteDialogOpen(true)} />
      </div>

      {/* Activities Section Placeholder */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold text-xl">Activities</h2>
          <p className="text-muted-foreground">
            This section will be implemented in the future to manage journey activities.
          </p>
        </CardContent>
      </Card>

      {/* Delete Journey Dialog */}
      <DeleteJourneyDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        journeyId={journeyId}
        journeyTitle={journeyData.title}
      />

      {/* Journey Sheet for editing */}
      <JourneySheet />
    </div>
  );
};

export default JourneyDetailsClient;
