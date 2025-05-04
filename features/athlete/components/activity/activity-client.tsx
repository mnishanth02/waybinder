"use client";
import Loader from "@/components/common/loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityForm } from "@/features/athlete/components/activity/activity-form-enhanced";
import {
  useCreateActivity,
  useDeleteActivity,
  useGetActivityByUniqueId,
  useUpdateActivity,
} from "@/features/athlete/hooks/use-activity-queries";
import {
  formatDateForDisplay,
  formatDateOnly,
  formatDateRange,
  isDateWithinRange,
} from "@/lib/utils/date-utils";
import type { ActivityTypeSelect, JourneyTypeSelect } from "@/server/db/schema";
import { ArrowLeft, Calendar, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { ActivitySchemaValues } from "../../athlete-validator";

interface ActivityClientProps {
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
  journey,
}: {
  isNewActivity: boolean;
  activityData: ActivityTypeSelect | null;
  isLoadingActivity: boolean;
  onSubmit: (data: ActivitySchemaValues) => void;
  journey: JourneyTypeSelect;
}) {
  // Use nuqs for URL query parameters

  // Default date is either from URL params, or current date

  if (isNewActivity) {
    return (
      <ActivityForm
        onSubmit={onSubmit}
        defaultValues={{
          activityDate: new Date(),
          activityType: "other",
          content: "",
          title: "",
        }}
        journey={journey}
      />
    );
  }

  if (isLoadingActivity) {
    return <Loader />;
  }

  if (!activityData) {
    return <div className="py-8 text-center">Activity not found</div>;
  }

  return (
    <ActivityForm
      onSubmit={onSubmit}
      defaultValues={{
        title: activityData.title,
        activityDate: new Date(activityData.activityDate),
        activityType: activityData.activityType,
        content: activityData.content || "",
      }}
      journey={journey}
    />
  );
}

export function ActivityClient({ activityId, journey, isNewActivity }: ActivityClientProps) {
  const router = useRouter();
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Format dates for display
  const startDate = journey.startDate ? new Date(journey.startDate) : null;
  const endDate = journey.endDate ? new Date(journey.endDate) : null;

  // Use the new date range formatter
  const dateRangeText = startDate && endDate ? formatDateRange(startDate, endDate) : "No dates set";

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
        router.push(`/journey/${journey.journeyUniqueId}`);
      }
    },
  });

  const updateActivity = useUpdateActivity({
    onSuccess: () => {
      router.push(`/journey/${journey.journeyUniqueId}`);
    },
  });

  // Delete activity mutation
  const { mutate: deleteActivity, isPending: isDeleting } = useDeleteActivity({
    journeyId: journey.journeyUniqueId,
    onSuccess: () => {
      // Navigate back to journey page after deletion
      router.push(`/journey/${journey.journeyUniqueId}`);
    },
  });

  const isSubmitting = createActivity.isPending || updateActivity.isPending;

  // Event handlers
  const handleSubmit = (data: ActivitySchemaValues) => {
    setSaveAndAddAnother(false);

    // Validate that the activity date is within the journey date range
    if (journey.startDate && journey.endDate) {
      // Use the new date range validation function
      if (!isDateWithinRange(data.activityDate, journey.startDate, journey.endDate)) {
        toast.error(
          `Activity date must be between ${formatDateForDisplay(journey.startDate)} and ${formatDateForDisplay(journey.endDate)}`
        );
        return;
      }
    }

    if (isNewActivity) {
      const formattedData = {
        ...data,
        journeyId: journey.journeyUniqueId,
        activityDate: formatDateOnly(data.activityDate),
      };

      createActivity.mutate(formattedData);
    } else if (activityData) {
      const formattedData = {
        ...data,
        activityDate: formatDateOnly(data.activityDate),
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
    router.push(`/journey/${journey.journeyUniqueId}`);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    if (!isNewActivity && activityData) {
      setIsDeleteDialogOpen(true);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!isNewActivity && activityData) {
      deleteActivity(activityData.id);
    }
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
              className="h-9 w-9 cursor-pointer rounded-full"
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
            {!isNewActivity && (
              <Button
                variant="outline"
                onClick={handleDeleteClick}
                className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 sm:flex-none"
                disabled={isDeleting}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{activityData?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity form */}
      <div className=" mx-auto max-w-6xl">
        <ActivityFormSection
          isNewActivity={isNewActivity}
          activityData={activityData || null}
          isLoadingActivity={isLoadingActivity}
          onSubmit={handleSubmit}
          journey={journey}
        />
      </div>
    </div>
  );
}
