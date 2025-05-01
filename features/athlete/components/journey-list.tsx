"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateDaysBetween, formatDateForDisplay } from "@/lib/utils/date-utils";
import { CalendarIcon, Eye, MountainIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useGetJourneys } from "../hooks/use-journey-queries";

interface JourneyListProps {
  onViewJourney: (journeyId: string) => void;
  onAddActivity?: (journeyId: string) => void;
}

const JourneyList: React.FC<JourneyListProps> = ({ onViewJourney, onAddActivity }) => {
  // Get current date and date from 12 months ago
  const currentDate = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);

  // Fetch journeys with limit of 12
  const { data, isLoading, error } = useGetJourneys({ limit: 12 });

  // Filter journeys from the past 12 months
  const journeys =
    data?.journeys.filter((journey) => {
      const journeyStartDate = new Date(journey.startDate);
      return journeyStartDate >= twelveMonthsAgo;
    }) || [];

  // Format date to display in a readable format using our date utility
  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString, "MMM d, yyyy");
  };

  // Calculate number of days between start and end dates using our date utility
  const calculateDays = (startDate: string, endDate: string) => {
    return calculateDaysBetween(startDate, endDate);
  };

  // Get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle add activity click
  const handleAddActivity = (journeyId: string) => {
    if (onAddActivity) {
      onAddActivity(journeyId);
    } else {
      // Fallback if handler not provided
      console.log("Add activity clicked for journey:", journeyId);
    }
  };

  // Render a skeleton card
  const renderSkeletonCard = (id: string) => (
    <Card key={id} className="overflow-hidden">
      <div className="relative h-40 w-full bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="flex">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="ml-[-8px] h-8 w-8 rounded-full" />
          <Skeleton className="ml-[-8px] h-8 w-8 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-full flex-1" />
        <Skeleton className="h-9 w-full flex-1" />
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {renderSkeletonCard("skeleton-1")}
        {renderSkeletonCard("skeleton-2")}
        {renderSkeletonCard("skeleton-3")}
        {renderSkeletonCard("skeleton-4")}
        {renderSkeletonCard("skeleton-5")}
        {renderSkeletonCard("skeleton-6")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/10 p-4 text-destructive">
        <p>Error loading journeys: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {journeys.length === 0 ? (
        <div className="col-span-full text-center text-muted-foreground">
          No journeys found from the past 12 months.
        </div>
      ) : (
        journeys.map((journey) => (
          <Card key={journey.id} className="overflow-hidden">
            {/* Journey Image */}
            <div className="relative h-40 w-full bg-muted">
              {journey.coverImageUrl ? (
                <Image
                  src={journey.coverImageUrl}
                  alt={journey.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/50">
                  <MountainIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                </div>
              )}
              {/* Journey Type Badge */}
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  {journey.journeyType.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-1">{journey.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formatDate(journey.startDate)} - {formatDate(journey.endDate)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pb-2">
              {/* Stats Section */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Total Distance */}
                <div className="flex flex-col items-center">
                  <span className="font-bold text-xl">{journey.totalDistanceKm || "0"}</span>
                  <span className="text-muted-foreground text-xs">km</span>
                </div>

                {/* Number of Days */}
                <div className="flex flex-col items-center">
                  <span className="font-bold text-xl">
                    {calculateDays(journey.startDate, journey.endDate)}
                  </span>
                  <span className="text-muted-foreground text-xs">days</span>
                </div>

                {/* Number of Activities (placeholder) */}
                <div className="flex flex-col items-center">
                  <span className="font-bold text-xl">0</span>
                  <span className="text-muted-foreground text-xs">activities</span>
                </div>
              </div>

              {/* Team Avatars */}
              <div className="flex items-center">
                {/* Show buddies and members with a maximum of 3 visible */}
                {[...(journey.buddyIds || []), ...(journey.memberNames || [])]
                  .slice(0, 3)
                  .map((item, index) => (
                    <Avatar
                      key={`${journey.id}-team-${item}-${index}`}
                      className={
                        index > 0
                          ? "ml-[-8px] border-2 border-background"
                          : "border-2 border-background"
                      }
                    >
                      <AvatarImage src={`/placeholder-avatar-${index + 1}.png`} alt="Team member" />
                      <AvatarFallback>
                        {typeof item === "string" && item.includes(" ")
                          ? getInitials(item)
                          : item.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}

                {/* Show +X more if there are more than 3 team members */}
                {(journey.buddyIds?.length || 0) + (journey.memberNames?.length || 0) > 3 && (
                  <div className="ml-1 flex h-8 items-center text-muted-foreground text-sm">
                    +{(journey.buddyIds?.length || 0) + (journey.memberNames?.length || 0) - 3}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 pt-2">
              {/* Add Activity Button */}
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => handleAddActivity(journey.journeyUniqueId)}
              >
                <PlusIcon className="mr-1 h-4 w-4" /> Add Activity
              </Button>

              {/* View Journey Button */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onViewJourney(journey.journeyUniqueId)}
              >
                <Eye className="mr-1 h-4 w-4" /> View
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default JourneyList;
