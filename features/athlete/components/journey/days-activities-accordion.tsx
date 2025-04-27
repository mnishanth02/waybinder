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
import { Textarea } from "@/components/ui/textarea";
import { useGetActivitiesByJourneyId } from "@/features/athlete/hooks";
import { cn } from "@/lib/utils";
import type { ActivityTypeSelect } from "@/server/db/schema";
import type { ActivityType } from "@/types/enums";
import { format, isValid, parseISO } from "date-fns";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface DaysActivitiesAccordionProps {
  journeyId: string;
  startDate: string;
  endDate: string;
}

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

const DaysActivitiesAccordion = ({
  journeyId,
  startDate,
  endDate,
}: DaysActivitiesAccordionProps) => {
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [expandAllDays, setExpandAllDays] = useState(false);

  // Fetch activities for this journey
  console.log("Fetching activities for journey ID:", journeyId);

  const { data, isLoading, error } = useGetActivitiesByJourneyId(journeyId, {
    limit: 100, // Get all activities
    sortBy: "activityDate", // Sort by date
    sortOrder: "asc", // Ascending order
  });

  // Debug API response
  useEffect(() => {
    if (data) {
      console.log("API response data:", data);
    }
    if (error) {
      console.error("API error:", error);
    }
  }, [data, error]);

  // Helper function to calculate day number
  const calculateDayNumberFromDate = useCallback(
    (activityDate: string): number => {
      try {
        const actDate = new Date(activityDate);
        const journeyStartDate = new Date(startDate);

        // Calculate the difference in days
        const diffTime = actDate.getTime() - journeyStartDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Day number is 1-based (first day is day 1)
        return diffDays + 1;
      } catch (e) {
        console.error("Error calculating day number:", e);
        return 1; // Default to day 1 if calculation fails
      }
    },
    [startDate]
  );

  // Group activities by day number
  const activitiesByDay = useMemo(() => {
    console.log("Activities data:", data);

    if (!data?.activities || data.activities.length === 0) {
      console.log("No activities data found");
      return {};
    }

    console.log("Number of activities:", data.activities.length);

    // Group activities by day number
    const grouped: Record<number, ActivityTypeSelect[]> = {};

    // Process each activity
    for (const activity of data.activities) {
      // Get or calculate day number
      const dayNum = activity.dayNumber || calculateDayNumberFromDate(activity.activityDate);

      // Initialize array if needed
      if (!grouped[dayNum]) {
        grouped[dayNum] = [];
      }

      // Add activity to the group
      grouped[dayNum]?.push(activity);
    }

    // Sort activities within each day
    for (const day of Object.keys(grouped)) {
      const dayNum = Number.parseInt(day);
      grouped[dayNum]?.sort((a, b) => (a.orderWithinDay || 0) - (b.orderWithinDay || 0));
    }

    console.log("Grouped activities by day:", grouped);
    return grouped;
  }, [data, calculateDayNumberFromDate]);

  // Generate day labels based on journey start/end dates
  const dayLabels = useMemo(() => {
    const labels: { dayNumber: number; date: string; formattedDate: string }[] = [];

    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      if (!isValid(start) || !isValid(end)) {
        return labels;
      }

      // Calculate the number of days in the journey
      const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < dayCount; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);

        labels.push({
          dayNumber: i + 1,
          date: format(currentDate, "yyyy-MM-dd"),
          formattedDate: format(currentDate, "EEE, MMM d, yyyy"),
        });
      }
    } catch (e) {
      console.error("Error generating day labels:", e);
    }

    return labels;
  }, [startDate, endDate]);

  // Get days that have activities
  const daysWithActivities = useMemo(() => {
    return Object.keys(activitiesByDay).map(Number);
  }, [activitiesByDay]);

  // Filter day labels to only show days with activities or the first day if no activities
  const filteredDayLabels = useMemo(() => {
    console.log("Days with activities:", daysWithActivities);
    console.log("All day labels:", dayLabels);

    if (daysWithActivities.length === 0) {
      // If no activities, just show the first day
      return dayLabels.slice(0, 1);
    }

    // Otherwise, only show days that have activities
    const filtered = dayLabels.filter((day) => daysWithActivities.includes(day.dayNumber));
    console.log("Filtered day labels:", filtered);
    return filtered;
  }, [dayLabels, daysWithActivities]);

  // Auto-expand days with activities when they are loaded
  useEffect(() => {
    if (daysWithActivities.length > 0 && expandedDays.length === 0) {
      // Auto-expand the first day with activities
      setExpandedDays([`day-${daysWithActivities[0]}`]);
    }
  }, [daysWithActivities, expandedDays]);

  // Toggle expand/collapse all days
  const toggleExpandAll = useCallback(() => {
    if (expandAllDays) {
      setExpandedDays([]);
    } else {
      setExpandedDays(filteredDayLabels.map((day) => `day-${day.dayNumber}`));
    }
    setExpandAllDays(!expandAllDays);
  }, [expandAllDays, filteredDayLabels]);

  // Handle accordion value change
  const handleAccordionChange = useCallback(
    (value: string[]) => {
      setExpandedDays(value);
      setExpandAllDays(value.length === filteredDayLabels.length);
    },
    [filteredDayLabels.length]
  );

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
              size="sm"
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

      {!hasAnyActivities ? (
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
      ) : (
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
                className="rounded-lg border bg-card shadow-sm"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center">
                    <span className="font-semibold">
                      Day {day.dayNumber}: {day.formattedDate}
                    </span>
                    {hasActivities && (
                      <Badge variant="outline" className="ml-3">
                        {dayActivities.length}{" "}
                        {dayActivities.length === 1 ? "Activity" : "Activities"}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted/50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-sm">Day Summary Note</h3>
                      </div>
                      <Textarea
                        placeholder="Add notes about this day..."
                        className="min-h-24 bg-background"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-medium text-sm">
                          <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                          Activities
                        </h3>
                      </div>

                      {hasActivities ? (
                        <div className="space-y-3">
                          {dayActivities.map((activity) => (
                            <div
                              key={activity.id}
                              className="rounded-md border bg-card p-3 shadow-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <span
                                      role="img"
                                      aria-label={activity.activityType || "activity"}
                                      className="text-lg"
                                    >
                                      {getActivityIcon(activity.activityType)}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{activity.title}</h4>
                                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium text-xs">
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
                                <div className="flex gap-2">
                                  <Link
                                    href={`/journey/${journeyId}/${activity.activityUniqueId}/edit`}
                                    className="inline-flex items-center rounded-md border border-input bg-background px-2.5 py-0.5 font-medium text-xs shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                  >
                                    <PencilIcon className="mr-1 h-3 w-3" />
                                    Edit
                                  </Link>
                                  <Link
                                    href={`/journey/${journeyId}/${activity.activityUniqueId}`}
                                    className="inline-flex items-center rounded-md border border-input bg-background px-2.5 py-0.5 font-medium text-xs shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                  >
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
                                      className="mr-1"
                                    >
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    View
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-md border bg-muted/30 p-4 text-center">
                          <p className="text-muted-foreground text-sm">
                            No activities for this day yet.
                          </p>
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
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default DaysActivitiesAccordion;
