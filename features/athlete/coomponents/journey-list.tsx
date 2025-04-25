"use client";

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
import { CalendarIcon, Edit, Eye, MapPinIcon, TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useGetJourneys } from "../hooks/use-journey-queries";

const JourneyList: React.FC = () => {
  const router = useRouter();

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

  // Handle view journey
  const handleViewJourney = (journeyUniqueId: string) => {
    router.push(`/journey/${journeyUniqueId}`);
  };

  // Handle edit journey
  const handleEditJourney = (journeyUniqueId: string) => {
    router.push(`/journey/${journeyUniqueId}/edit`);
  };

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render a skeleton card
  const renderSkeletonCard = (id: string) => (
    <Card key={id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
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
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-1">{journey.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formatDate(journey.startDate)} - {formatDate(journey.endDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                {journey.location && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPinIcon className="h-3 w-3" />
                    <span className="line-clamp-1">{journey.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TagIcon className="h-3 w-3" />
                  <span>{journey.journeyType.replace(/_/g, " ")}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleViewJourney(journey.journeyUniqueId)}
              >
                <Eye className="mr-1 h-4 w-4" /> View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEditJourney(journey.journeyUniqueId)}
              >
                <Edit className="mr-1 h-4 w-4" /> Edit
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default JourneyList;
