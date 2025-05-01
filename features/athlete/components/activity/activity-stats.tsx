"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrackStatistics } from "@/types/geo";
import { ArrowDown, ArrowUp, Calendar, Clock, Gauge, MountainSnow, Ruler } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ActivityStatsProps {
  activityId: string;
  compact?: boolean;
  metricUnits?: boolean;
  showVisualIndicators?: boolean;
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export const ActivityStats = ({
  activityId,
  compact = false,
  metricUnits = true,
  showVisualIndicators = true,
}: ActivityStatsProps) => {
  const [stats, setStats] = useState<TrackStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch statistics for the activity
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gps/activity/${activityId}/stats`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch activity statistics");
        }

        const data = await response.json();
        if (data.success && data.data) {
          setStats(data.data as TrackStatistics);
        } else {
          throw new Error(data.error || "Failed to fetch activity statistics");
        }
      } catch (error) {
        console.error("Error fetching activity statistics:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error fetching activity statistics";
        setError(errorMessage);

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      fetchStats();
    }
  }, [activityId, toast]);

  // Format distance
  const formatDistance = (distance: number) => {
    if (!metricUnits) {
      // Convert to miles
      const miles = distance * 0.621371;
      return `${miles.toFixed(1)} mi`;
    }
    return `${distance.toFixed(1)} km`;
  };

  // Format elevation
  const formatElevation = (elevation: number) => {
    if (!metricUnits) {
      // Convert to feet
      const feet = elevation * 3.28084;
      return `${Math.round(feet)} ft`;
    }
    return `${Math.round(elevation)} m`;
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (compact) {
      return hours > 0
        ? `${hours}h ${minutes}m`
        : minutes > 0
          ? `${minutes}m ${secs}s`
          : `${secs}s`;
    }

    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format speed
  const formatSpeed = (speed: number) => {
    if (!metricUnits) {
      // Convert to mph
      const mph = speed * 0.621371;
      return `${mph.toFixed(1)} mph`;
    }
    return `${speed.toFixed(1)} km/h`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format time of day
  const formatTimeOfDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: compact ? 4 : 8 }).map((_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive">Error loading statistics: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">No statistics available for this activity</p>
        </CardContent>
      </Card>
    );
  }

  // Determine which stats to show based on compact mode
  const statsToShow: StatItem[] = compact
    ? [
        {
          label: "Distance",
          value: formatDistance(stats.totalDistance),
          icon: <Ruler className="h-4 w-4" />,
        },
        {
          label: "Elevation",
          value: formatElevation(stats.elevationGain),
          icon: <ArrowUp className="h-4 w-4" />,
        },
        {
          label: "Moving Time",
          value: formatTime(stats.movingTime),
          icon: <Clock className="h-4 w-4" />,
        },
        {
          label: "Avg Speed",
          value: formatSpeed(stats.averageSpeed),
          icon: <Gauge className="h-4 w-4" />,
        },
      ]
    : [
        {
          label: "Distance",
          value: formatDistance(stats.totalDistance),
          icon: <Ruler className="h-4 w-4" />,
        },
        {
          label: "Elevation Gain",
          value: formatElevation(stats.elevationGain),
          icon: <ArrowUp className="h-4 w-4" />,
        },
        {
          label: "Elevation Loss",
          value: formatElevation(stats.elevationLoss),
          icon: <ArrowDown className="h-4 w-4" />,
        },
        {
          label: "Max Elevation",
          value: formatElevation(stats.maxElevation),
          icon: <MountainSnow className="h-4 w-4" />,
        },
        {
          label: "Moving Time",
          value: formatTime(stats.movingTime),
          icon: <Clock className="h-4 w-4" />,
        },
        {
          label: "Total Time",
          value: formatTime(stats.totalTime),
          icon: <Clock className="h-4 w-4" />,
        },
        {
          label: "Avg Speed",
          value: formatSpeed(stats.averageSpeed),
          icon: <Gauge className="h-4 w-4" />,
        },
        {
          label: "Max Speed",
          value: formatSpeed(stats.maxSpeed),
          icon: <Gauge className="h-4 w-4" />,
        },
      ];

  return (
    <div>
      {/* Date and Time */}
      {!compact && (
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              {formatDate(stats.startTime)} • {formatTimeOfDay(stats.startTime)} to{" "}
              {formatTimeOfDay(stats.endTime)}
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div
        className={`grid gap-4 ${
          compact ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {statsToShow.map((stat, index) => (
          <Card key={`stat-${stat.label}-${index}`}>
            <CardContent className="p-4">
              <div className="mb-1 flex items-center gap-1.5">
                {showVisualIndicators && <span className="text-muted-foreground">{stat.icon}</span>}
                <span className="text-muted-foreground text-xs">{stat.label}</span>
              </div>
              <p className="font-medium text-base">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
