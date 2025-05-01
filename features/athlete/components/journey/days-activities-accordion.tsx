"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetActivitiesByJourneyId } from "@/features/athlete/hooks";
import { cn } from "@/lib/utils";
import {
  calculateDayNumber,
  generateDayLabels,
  sortActivitiesByDateAndTime,
} from "@/lib/utils/date-utils";
import type { ActivityTypeSelect } from "@/server/db/schema";
import type { ActivityType } from "@/types/enums";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { createContext, memo, useCallback, useContext, useMemo, useState } from "react";

// Define a type for the day labels
interface DayLabel {
  dayNumber: number;
  date: string;
  formattedDate: string;
}

// Create a context for accordion state management
interface AccordionContextType {
  expandedDays: string[];
  expandAllDays: boolean;
  toggleExpandAll: () => void;
  handleAccordionChange: (value: string[]) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

// Custom hook to use the accordion context
const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("useAccordionContext must be used within an AccordionProvider");
  }
  return context;
};

// Helper function to get activity icon based on type
const getActivityIcon = (type: ActivityType | null | undefined) => {
  switch (type) {
    case "hikeing": // Note: There's a typo in the enum definition, should be "hiking"
      return "🥾";
    case "running":
      return "🏃";
    case "cycling":
      return "🚴";
    case "driving":
      return "🚗";
    case "flying":
      return "✈️";
    case "boating":
      return "🚣";
    case "rest":
      return "😴";
    case "camping":
      return "⛺";
    case "climbing":
      return "🧗";
    case "mountaineer": // Note: Should be "mountaineering" in the enum
      return "🏔️";
    case "sightseeing":
      return "🔭";
    case "travel":
      return "🧳";
    case "other":
      return "📍";
    default:
      return "📍";
  }
};

// Format activity type for display
const formatActivityType = (type: ActivityType | null | undefined) => {
  if (!type) return "Other";

  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Activity component (memoized to prevent unnecessary re-renders)
const Activity = memo(
  ({ activity, journeyId }: { activity: ActivityTypeSelect; journeyId: string }) => {
    return (
      <div className="rounded-md border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
              <span role="img" aria-label={activity.activityType || "activity"} className="text-xl">
                {getActivityIcon(activity.activityType)}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-base">{activity.title}</h4>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                <span className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-2.5 py-0.5 font-medium text-xs">
                  {formatActivityType(activity.activityType)}
                </span>
                {activity.distanceKm && (
                  <span className="inline-flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z" />
                      <path d="M12 13v8" />
                      <path d="M12 3v3" />
                    </svg>
                    {activity.distanceKm} km
                  </span>
                )}
                {activity.elevationGainM && (
                  <span className="inline-flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m2 22 10-10 2 2 7-7" />
                      <path d="m16 7 5 0 0 5" />
                    </svg>
                    {activity.elevationGainM}m gain
                  </span>
                )}
                {activity.movingTimeSeconds && (
                  <span className="inline-flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {Math.floor(activity.movingTimeSeconds / 60)} min
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <Link
              href={`/journey/${journeyId}/${activity.activityUniqueId}`}
              className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-3 py-1 font-medium text-xs shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/10"
            >
              <PencilIcon className="mr-1.5 h-3 w-3" />
              Edit
            </Link>
          </div>
        </div>
        {activity.content && (
          <div className="mt-4 rounded-md border border-border/30 bg-muted/20 p-3 text-muted-foreground text-sm">
            <div className="mb-1 font-medium text-muted-foreground text-xs">Notes:</div>
            <div className="whitespace-pre-wrap">{activity.content}</div>
          </div>
        )}
      </div>
    );
  }
);

Activity.displayName = "Activity";

// Day content component
const DayContent = memo(
  ({
    day,
    dayActivities,
    journeyId,
  }: {
    day: { dayNumber: number; date: string };
    dayActivities: ActivityTypeSelect[];
    journeyId: string;
  }) => {
    const hasActivities = dayActivities.length > 0;

    // Get the first activity's content as the day summary note (if any)
    const daySummaryNote = dayActivities.length > 0 ? dayActivities[0]?.content || "" : "";

    return (
      <div className="space-y-4 py-2">
        {daySummaryNote && (
          <div className="rounded-md border border-border/50 bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">Day Summary Note</h3>
            </div>
            <div className="min-h-24 whitespace-pre-wrap rounded-md border border-border/30 bg-background p-4 shadow-sm">
              {daySummaryNote}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="flex items-center gap-2 font-medium text-sm">
              <CalendarDaysIcon className="h-4 w-4 text-primary" />
              Activities
            </h3>
          </div>

          {hasActivities ? (
            <div className="space-y-3">
              {dayActivities.map((activity) => (
                <Activity key={activity.id} activity={activity} journeyId={journeyId} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border bg-muted/30 p-4 text-center">
              <p className="text-muted-foreground text-sm">No activities for this day yet.</p>
            </div>
          )}

          <Link
            href={`/journey/${journeyId}/new?day=${day.dayNumber}&date=${day.date}`}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-md border border-dashed p-3 font-medium text-sm transition-all duration-200",
              "bg-muted/30 hover:border-primary hover:bg-primary/10 hover:text-primary",
              "group relative overflow-hidden"
            )}
          >
            <span className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <span className="relative flex items-center justify-center rounded-full border border-border bg-background p-1 shadow-sm transition-colors duration-200 group-hover:border-primary/30">
              <PlusIcon className="h-3 w-3" />
            </span>
            <span className="relative">Add Activity</span>
          </Link>
        </div>
      </div>
    );
  }
);

DayContent.displayName = "DayContent";

// AccordionProvider component to manage accordion state
const AccordionProvider = memo(
  ({
    children,
    filteredDayLabels,
  }: { children: React.ReactNode; filteredDayLabels: DayLabel[] }) => {
    const [expandedDays, setExpandedDays] = useState<string[]>([]);
    const [expandAllDays, setExpandAllDays] = useState(false);

    // Toggle expand/collapse all days
    const toggleExpandAll = useCallback(() => {
      if (expandAllDays) {
        // Collapse all
        setExpandedDays([]);
      } else {
        // Expand all
        setExpandedDays(filteredDayLabels.map((day) => `day-${day.dayNumber}`));
      }
      setExpandAllDays(!expandAllDays);
    }, [expandAllDays, filteredDayLabels]);

    // Handle accordion value change
    const handleAccordionChange = useCallback(
      (value: string[]) => {
        setExpandedDays(value);
        // Update expandAllDays state based on whether all days are expanded
        setExpandAllDays(value.length > 0 && value.length === filteredDayLabels.length);
      },
      [filteredDayLabels.length]
    );

    // We're removing the auto-expand behavior to allow all items to be closed
    // This was causing the issue where at least one accordion item had to be open

    const contextValue = useMemo(
      () => ({
        expandedDays,
        expandAllDays,
        toggleExpandAll,
        handleAccordionChange,
      }),
      [expandedDays, expandAllDays, toggleExpandAll, handleAccordionChange]
    );

    return <AccordionContext.Provider value={contextValue}>{children}</AccordionContext.Provider>;
  }
);

AccordionProvider.displayName = "AccordionProvider";

// Header component
const Header = memo(
  ({ hasAnyActivities, journeyId }: { hasAnyActivities: boolean; journeyId: string }) => {
    const { expandAllDays, toggleExpandAll } = useAccordionContext();

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CalendarDaysIcon className="h-5 w-5" />
          </div>
          <h2 className="font-semibold text-xl">Days & Activities</h2>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/journey/${journeyId}/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add New Activity</span>
          </Link>
          {hasAnyActivities && (
            <Button
              variant="outline"
              onClick={toggleExpandAll}
              className="flex items-center gap-1.5 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            >
              {expandAllDays ? (
                <>
                  <ChevronUpIcon className="h-4 w-4" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4" />
                  <span>Expand All</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }
);

Header.displayName = "Header";

// Create the accordion content component
const AccordionContentWrapper = memo(
  ({
    filteredDayLabels,
    activitiesByDay,
    journeyId,
  }: {
    filteredDayLabels: DayLabel[];
    activitiesByDay: Record<number, ActivityTypeSelect[]>;
    journeyId: string;
  }) => {
    const { expandedDays, handleAccordionChange } = useAccordionContext();

    return (
      <Accordion
        type="multiple"
        value={expandedDays}
        onValueChange={handleAccordionChange}
        className="space-y-2"
      >
        {filteredDayLabels.map((day) => {
          const dayActivities = activitiesByDay[day.dayNumber] || [];
          const hasActivities = dayActivities.length > 0;

          return (
            <AccordionItem
              key={`day-${day.dayNumber}`}
              value={`day-${day.dayNumber}`}
              className="overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <AccordionTrigger className="bg-secondary/30 px-4 py-4 transition-colors hover:bg-secondary/50 hover:no-underline">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="font-semibold text-sm">{day.dayNumber}</span>
                    </div>
                    <span className="font-semibold">{day.formattedDate}</span>
                  </div>
                  {hasActivities && (
                    <Badge variant="outline" className="ml-3 bg-primary/10">
                      {dayActivities.length}{" "}
                      {dayActivities.length === 1 ? "Activity" : "Activities"}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <DayContent day={day} dayActivities={dayActivities} journeyId={journeyId} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  }
);

AccordionContentWrapper.displayName = "AccordionContentWrapper";

// No activities placeholder
const NoActivitiesPlaceholder = memo(({ journeyId }: { journeyId: string }) => (
  <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
      <CalendarDaysIcon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="mb-2 font-medium text-lg">No Activities Yet</h3>
    <p className="mb-6 text-muted-foreground">
      Start adding activities to your journey to track your adventures.
    </p>
    <Link
      href={`/journey/${journeyId}/new`}
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
    >
      <PlusIcon className="h-4 w-4" />
      <span>Add Your First Activity</span>
    </Link>
  </div>
));

NoActivitiesPlaceholder.displayName = "NoActivitiesPlaceholder";

interface DaysActivitiesAccordionProps {
  journeyId: string;
  startDate: string;
  endDate: string;
}

// Main component
const DaysActivitiesAccordion = ({
  journeyId,
  startDate,
  endDate,
}: DaysActivitiesAccordionProps) => {
  // Fetch activities for this journey
  const { data, isLoading, error } = useGetActivitiesByJourneyId(journeyId, {
    limit: 100, // Get all activities
    sortBy: "dayNumber", // Sort by day number (falls back to activityDate if not available)
    sortOrder: "asc", // Ascending order
  });

  // Helper function to get day number from activity
  const getDayNumber = useCallback(
    (activity: ActivityTypeSelect): number => {
      // If activity has a dayNumber field, use it
      if (activity.dayNumber !== null && activity.dayNumber !== undefined) {
        return activity.dayNumber;
      }

      // Otherwise calculate it from the activity date
      const dayNum = calculateDayNumber(activity.activityDate, startDate);
      return dayNum !== null ? dayNum : 1; // Default to day 1 if calculation fails
    },
    [startDate]
  );

  // Group activities by day number
  const activitiesByDay = useMemo(() => {
    if (!data?.activities || data.activities.length === 0) {
      return {};
    }

    // Group activities by day number
    const grouped: Record<number, ActivityTypeSelect[]> = {};

    // Process each activity
    for (const activity of data.activities) {
      // Get day number from activity (use stored dayNumber field if available)
      const dayNum = activity.dayNumber || getDayNumber(activity);

      // Initialize array if needed
      if (!grouped[dayNum]) {
        grouped[dayNum] = [];
      }

      // Add activity to the group
      grouped[dayNum]?.push(activity);
    }

    // Sort activities within each day based on startTime
    for (const day of Object.keys(grouped)) {
      const dayNum = Number.parseInt(day);
      // Use the sortActivitiesByDateAndTime utility function
      grouped[dayNum] = sortActivitiesByDateAndTime(grouped[dayNum] || []);
    }

    return grouped;
  }, [data, getDayNumber]);

  // Generate day labels based on journey start/end dates
  const dayLabels = useMemo(() => {
    return generateDayLabels(startDate, endDate);
  }, [startDate, endDate]);

  // Get days that have activities
  const daysWithActivities = useMemo(() => {
    return Object.keys(activitiesByDay).map(Number);
  }, [activitiesByDay]);

  // Filter day labels to only show days with activities or the first day if no activities
  const filteredDayLabels = useMemo(() => {
    if (daysWithActivities.length === 0) {
      // If no activities, just show the first day
      return dayLabels.slice(0, 1);
    }

    // Otherwise, only show days that have activities
    return dayLabels.filter((day) => daysWithActivities.includes(day.dayNumber));
  }, [dayLabels, daysWithActivities]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-xl">Days & Activities</h2>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        <p>Error loading activities. Please try again later.</p>
      </div>
    );
  }

  // Check if there are any activities
  const hasAnyActivities = Object.keys(activitiesByDay).length > 0;

  return (
    <div className="space-y-4">
      <AccordionProvider filteredDayLabels={filteredDayLabels}>
        <Header hasAnyActivities={hasAnyActivities} journeyId={journeyId} />

        {!hasAnyActivities ? (
          <NoActivitiesPlaceholder journeyId={journeyId} />
        ) : (
          <AccordionContentWrapper
            filteredDayLabels={filteredDayLabels}
            activitiesByDay={activitiesByDay}
            journeyId={journeyId}
          />
        )}
      </AccordionProvider>
    </div>
  );
};

export default DaysActivitiesAccordion;
