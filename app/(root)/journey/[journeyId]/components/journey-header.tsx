"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useJourneySheetStore } from "@/features/athlete/store/use-journey-sheet-store";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import type { JourneyTypeSelect } from "@/server/db/schema";
import { CalendarIcon, Edit, MapPinIcon, Trash2 } from "lucide-react";
import Image from "next/image";

interface JourneyHeaderProps {
  journey: JourneyTypeSelect;
  onDeleteClick?: () => void;
}

const JourneyHeader = ({ journey, onDeleteClick }: JourneyHeaderProps) => {
  const { openSheet } = useJourneySheetStore();
  // Format journey type for display
  const formatJourneyType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Calculate the number of days
  const calculateDays = () => {
    if (journey.startDate && journey.endDate) {
      return (
        Math.ceil(
          (new Date(journey.endDate).getTime() - new Date(journey.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      );
    }
    return 0;
  };

  return (
    <Card className="overflow-hidden">
      {/* Cover Image with Overlay Content */}
      <div className="relative h-[350px] w-full">
        {journey.coverImageUrl ? (
          <Image
            src={journey.coverImageUrl}
            alt={journey.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No cover image</span>
          </div>
        )}

        {/* Journey Type Badge - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-background/80 px-3 py-1.5 font-medium text-foreground text-sm backdrop-blur-sm">
            {formatJourneyType(journey.journeyType)}
          </Badge>
        </div>

        {/* Action Buttons - Top Left */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "bg-background/30 backdrop-blur-sm hover:bg-background/50",
              "border-white/30 text-white"
            )}
            onClick={() => openSheet(journey.journeyUniqueId, "edit")}
          >
            <Edit className="mr-1.5 h-4 w-4" />
            Edit
          </Button>

          {onDeleteClick && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 bg-destructive/30 text-white backdrop-blur-sm hover:bg-destructive/50"
              onClick={onDeleteClick}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>

        {/* Title and Date Overlay - Bottom */}
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6">
          <div className="space-y-2 text-white">
            <h1 className="font-bold text-4xl">{journey.title}</h1>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {formatDate(journey.startDate)} - {formatDate(journey.endDate)}
              </span>
            </div>
            <div>
              {journey.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{journey.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="px-6 py-0">
        {/* Journey Stats */}
        <div className="rounded-lg bg-muted/50 p-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            <div className="text-center">
              <div className="font-bold text-2xl">{journey.totalDistanceKm || "0"}</div>
              <div className="text-muted-foreground text-xs">Distance (km)</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl">{journey.totalElevationGainM || "0"}</div>
              <div className="text-muted-foreground text-xs">Elevation (m)</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl">{calculateDays()}</div>
              <div className="text-muted-foreground text-xs">Days</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl">0</div>
              <div className="text-muted-foreground text-xs">Activities</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JourneyHeader;
