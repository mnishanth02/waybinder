"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ActivityCreationFormValues } from "@/features/athlete/athlete-validator";
import { ActivityForm } from "@/features/athlete/components/activity/activity-form";
import {
  useCreateActivity,
  useGetActivityByUniqueId,
  useUpdateActivity,
} from "@/features/athlete/hooks/use-activity-queries";
import type { JourneyTypeSelect } from "@/server/db/schema";
import { format } from "date-fns";
import { ArrowLeft, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Helper function for formatting dates
const formatUTCForDisplay = (date: Date | string | null, formatString = "PPP"): string => {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatString);
};

interface ActivityClientProps {
  journeyId: string;
  activityId: string;
  journey: JourneyTypeSelect;
  isNewActivity: boolean;
}

// Helper component to render the activity form
function ActivityFormSection({
  isNewActivity,
  activityData,
  isLoadingActivity,
  onSubmit,
}: {
  isNewActivity: boolean;
  activityData: Record<string, unknown> | null;
  isLoadingActivity: boolean;
  onSubmit: (data: ActivityCreationFormValues) => void;
}) {
  if (isNewActivity) {
    return (
      <ActivityForm
        onSubmit={onSubmit}
        defaultValues={{
          activityDate: new Date(),
        }}
      />
    );
  }

  if (isLoadingActivity) {
    return <div className="py-8 text-center">Loading activity data...</div>;
  }

  if (!activityData) {
    return <div className="py-8 text-center">Activity not found</div>;
  }

  // Type assertion to handle the activity data
  const typedActivityData = activityData as {
    title: string;
    journeyId: string;
    activityDate: Date;
    activityType?: string;
    content?: string;
    distanceKm?: number;
    elevationGainM?: number;
    elevationLossM?: number;
    movingTimeSeconds?: number;
    dayNumber?: number;
    orderWithinDay?: number;
    startTime?: string;
    endTime?: string;
  };

  return (
    <ActivityForm
      onSubmit={onSubmit}
      defaultValues={{
        title: typedActivityData.title,
        activityDate: typedActivityData.activityDate,
        activityType: typedActivityData.activityType,
        content: typedActivityData.content,
        dayNumber: typedActivityData.dayNumber,
        orderWithinDay: typedActivityData.orderWithinDay,
      }}
    />
  );
}

export function ActivityClient({
  journeyId,
  activityId,
  journey,
  isNewActivity,
}: ActivityClientProps) {
  const router = useRouter();
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);

  // Format dates for display
  const startDate = journey.startDate ? new Date(journey.startDate) : null;
  const endDate = journey.endDate ? new Date(journey.endDate) : null;

  const dateRangeText =
    startDate && endDate
      ? `${formatUTCForDisplay(startDate, "MMM d")} - ${formatUTCForDisplay(endDate, "MMM d, yyyy")}`
      : "No dates set";

  // Fetch activity data if editing an existing activity
  const { data: activityData, isLoading: isLoadingActivity } = useGetActivityByUniqueId(
    activityId,
    { enabled: !isNewActivity }
  );

  // Mutations for creating and updating activities
  const createActivity = useCreateActivity({
    onSuccess: () => {
      if (saveAndAddAnother) {
        // Reset form and stay on the page
        router.refresh();
      } else {
        // Navigate back to journey page
        router.push(`/journey/${journeyId}`);
      }
    },
  });

  const updateActivity = useUpdateActivity({
    onSuccess: () => {
      // Navigate back to journey page
      router.push(`/journey/${journeyId}`);
    },
  });

  const isSubmitting = createActivity.isPending || updateActivity.isPending;

  // Event handlers
  const handleSubmit = (data: ActivityCreationFormValues) => {
    if (isNewActivity) {
      const formattedData = {
        ...data,
        journeyId,
        activityDate: data.activityDate.toISOString(),
      };
      createActivity.mutate(formattedData);
    } else if (activityData) {
      // Format date before sending to API
      const formattedData = {
        ...data,
        activityDate: data.activityDate.toISOString(),
      };
      updateActivity.mutate({ id: activityData.id, data: formattedData });
    }
  };

  const handleSaveAndAddAnother = () => {
    setSaveAndAddAnother(true);
    // Trigger form submission
    document
      .querySelector("form")
      ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  };

  const handleCancel = () => {
    router.push(`/journey/${journeyId}`);
  };

  return (
    <div>
      {/* Sticky header with journey info */}
      <Card className="sticky top-0 z-20 mb-6 border-b bg-card/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-9 w-9 rounded-full"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-card-foreground text-xl">
                {isNewActivity ? "Adding activity to" : "Editing activity in"}{" "}
                <span className="text-primary">{journey.title}</span>
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline" className="font-normal">
                  {journey.journeyType}
                </Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{dateRangeText}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              type="submit"
              form="activity-form"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleSaveAndAddAnother}
              disabled={isSubmitting}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              Save & Add Another
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity form */}
      <div className=" mx-auto max-w-6xl">
        <ActivityFormSection
          isNewActivity={isNewActivity}
          activityData={activityData || null}
          isLoadingActivity={isLoadingActivity}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
