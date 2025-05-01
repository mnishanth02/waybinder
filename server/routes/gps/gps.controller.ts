import { generateActivityUniqueId } from "@/lib/utils/slug";
import { db } from "@/server/db";
import { activities } from "@/server/db/schema/activity-schema";
import { journeys } from "@/server/db/schema/journey-schema";
import { ApiStatusCode } from "@/types/api";
import type {
  EnhancedGeoJSON,
  SimplificationLevel,
  TrackStatistics,
  Trackpoint,
} from "@/types/geo";
import { eq } from "drizzle-orm";
import { parseGpsFile } from "./parsers";

/**
 * @api {post} /gps/upload Upload GPS File
 * @apiGroup GPS
 * @access Private
 */
export const uploadGpsFile = async (
  file: File,
  journeyId: string,
  userId: string,
  activityId?: string
) => {
  try {
    // Verify that the journey exists and the user has access to it
    const journey = await db.query.journeys.findFirst({
      where: eq(journeys.journeyUniqueId, journeyId),
    });

    if (!journey) {
      return {
        success: false,
        message: "Journey not found",
        error: "No journey found with the provided ID",
        statusCode: ApiStatusCode.NOT_FOUND,
      };
    }

    // Verify that the user is the creator of the journey
    if (journey.creatorId !== userId) {
      return {
        success: false,
        message: "Unauthorized",
        error: "You do not have permission to add activities to this journey",
        statusCode: ApiStatusCode.FORBIDDEN,
      };
    }

    // Parse the GPS file
    const fileBuffer = await file.arrayBuffer();
    const fileType = file.name.split(".").pop()?.toLowerCase();

    if (!fileType || !["gpx", "kml", "fit", "tcx"].includes(fileType)) {
      return {
        success: false,
        message: "Invalid file type",
        error: "Please upload a GPX, KML, FIT, or TCX file",
        statusCode: ApiStatusCode.BAD_REQUEST,
      };
    }

    // Parse the file and extract data
    const parsedData = await parseGpsFile(fileBuffer, fileType);

    if (!parsedData.success || !parsedData.data) {
      return {
        success: false,
        message: "Failed to parse GPS file",
        error: parsedData.error || "Unknown parsing error",
        statusCode: ApiStatusCode.BAD_REQUEST,
      };
    }

    const { geoJson, stats } = parsedData.data;

    // If updating an existing activity
    if (activityId) {
      const activity = await db.query.activities.findFirst({
        where: eq(activities.activityUniqueId, activityId),
      });

      if (!activity) {
        return {
          success: false,
          message: "Activity not found",
          error: "No activity found with the provided ID",
          statusCode: ApiStatusCode.NOT_FOUND,
        };
      }

      // Update the activity with GPS data
      await db
        .update(activities)
        .set({
          geoJsonData: geoJson as unknown as typeof activities.$inferInsert.geoJsonData,
          originalFileName: file.name,
          originalFileType: fileType,
          processedStats: stats as unknown as typeof activities.$inferInsert.processedStats,
          distanceKm: stats.totalDistance,
          elevationGainM: stats.elevationGain,
          elevationLossM: stats.elevationLoss,
          movingTimeSeconds: stats.movingTime,
          startTime: stats.startTime ? new Date(stats.startTime) : null,
          endTime: stats.endTime ? new Date(stats.endTime) : null,
          updatedAt: new Date(),
        })
        .where(eq(activities.id, activity.id));

      return {
        success: true,
        message: "GPS data updated successfully",
        data: {
          activityId: activity.activityUniqueId,
          stats,
        },
      };
    }

    // Create a new activity with GPS data
    const activityUniqueId = generateActivityUniqueId(file.name.split(".")[0] || "Activity");

    // Determine the day number based on the activity date
    const activityDate = new Date(stats.startTime);
    const journeyStartDate = new Date(journey.startDate);
    const dayNumber =
      Math.floor((activityDate.getTime() - journeyStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Get the highest order within the day
    const activitiesOnSameDay = await db.query.activities.findMany({
      where: eq(activities.journeyId, journey.id),
      columns: {
        orderWithinDay: true,
      },
    });

    const highestOrder = activitiesOnSameDay.length
      ? Math.max(...activitiesOnSameDay.map((a) => a.orderWithinDay || 0))
      : 0;

    // Create the new activity
    await db.insert(activities).values({
      id: crypto.randomUUID(),
      journeyId: journey.id,
      activityUniqueId,
      title: file.name.split(".")[0] || "Activity",
      activityDate: activityDate.toISOString(),
      dayNumber,
      orderWithinDay: highestOrder + 1,
      activityType: "other", // Default to "other", can be updated later
      distanceKm: stats.totalDistance,
      elevationGainM: stats.elevationGain,
      elevationLossM: stats.elevationLoss,
      movingTimeSeconds: stats.movingTime,
      startTime: stats.startTime ? new Date(stats.startTime) : null,
      endTime: stats.endTime ? new Date(stats.endTime) : null,
      geoJsonData: geoJson as unknown as typeof activities.$inferInsert.geoJsonData,
      originalFileName: file.name,
      originalFileType: fileType,
      processedStats: stats as unknown as typeof activities.$inferInsert.processedStats,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: "GPS file uploaded and processed successfully",
      data: {
        activityId: activityUniqueId,
        stats,
      },
    };
  } catch (error) {
    console.error("Error uploading GPS file:", error);
    return {
      success: false,
      message: "Failed to upload GPS file",
      error: error instanceof Error ? error.message : "Unknown error",
      statusCode: ApiStatusCode.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * @api {get} /gps/activity/:id/geojson Get Activity GeoJSON
 * @apiGroup GPS
 * @access Public
 */
export const getActivityGeoJson = async (
  activityId: string,
  simplificationLevel: SimplificationLevel = "medium"
) => {
  try {
    const activity = await db.query.activities.findFirst({
      where: eq(activities.activityUniqueId, activityId),
    });

    if (!activity || !activity.geoJsonData) {
      return {
        success: false,
        message: "Activity or GPS data not found",
        error: "No GPS data found for the provided activity ID",
        statusCode: ApiStatusCode.NOT_FOUND,
      };
    }

    // Return the appropriate level of simplification
    if (
      simplificationLevel === "none" ||
      !activity.processedStats ||
      !(activity.processedStats as TrackStatistics).simplifiedGeoJson
    ) {
      return {
        success: true,
        data: activity.geoJsonData,
      };
    }

    // In a real implementation, we would have different levels of simplification
    // For now, we'll just return the simplified version if it exists
    return {
      success: true,
      data: (activity.processedStats as TrackStatistics).simplifiedGeoJson || activity.geoJsonData,
    };
  } catch (error) {
    console.error("Error getting activity GeoJSON:", error);
    return {
      success: false,
      message: "Failed to get activity GeoJSON",
      error: error instanceof Error ? error.message : "Unknown error",
      statusCode: ApiStatusCode.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * @api {get} /gps/activity/:id/stats Get Activity Statistics
 * @apiGroup GPS
 * @access Public
 */
export const getActivityStats = async (activityId: string) => {
  try {
    const activity = await db.query.activities.findFirst({
      where: eq(activities.activityUniqueId, activityId),
    });

    if (!activity || !activity.processedStats) {
      return {
        success: false,
        message: "Activity or GPS statistics not found",
        error: "No GPS statistics found for the provided activity ID",
        statusCode: ApiStatusCode.NOT_FOUND,
      };
    }

    return {
      success: true,
      data: activity.processedStats,
    };
  } catch (error) {
    console.error("Error getting activity statistics:", error);
    return {
      success: false,
      message: "Failed to get activity statistics",
      error: error instanceof Error ? error.message : "Unknown error",
      statusCode: ApiStatusCode.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * @api {get} /gps/activity/:id/trackpoints Get Activity Trackpoints
 * @apiGroup GPS
 * @access Public
 */
export const getActivityTrackpoints = async (
  activityId: string,
  options: {
    limit: number;
    page: number;
    timeRange?: { start: string; end: string } | undefined;
  }
) => {
  try {
    const { limit, page, timeRange } = options;
    const activity = await db.query.activities.findFirst({
      where: eq(activities.activityUniqueId, activityId),
    });

    if (!activity || !activity.geoJsonData) {
      return {
        success: false,
        message: "Activity or GPS data not found",
        error: "No GPS data found for the provided activity ID",
        statusCode: ApiStatusCode.NOT_FOUND,
      };
    }

    // Extract trackpoints from GeoJSON
    // This is a simplified implementation - in a real app, we would have a more efficient way to store and query trackpoints
    const geoJson = activity.geoJsonData as EnhancedGeoJSON;
    let trackpoints: Trackpoint[] = [];

    if (geoJson.features && geoJson.features.length > 0) {
      // Find the first LineString feature
      const trackFeature = geoJson.features.find(
        (f) => f.geometry && f.geometry.type === "LineString"
      );

      if (trackFeature && trackFeature.geometry.type === "LineString") {
        trackpoints = trackFeature.geometry.coordinates.map((coord, index) => {
          // Extract time from properties if available
          const time = trackFeature.properties?.coordTimes?.[index] || null;
          const [longitude, latitude, elevation] = coord as [number, number, number | null];
          return {
            index,
            longitude,
            latitude,
            elevation: elevation || null,
            time,
          };
        });

        // Apply time range filter if provided
        if (timeRange?.start && timeRange?.end) {
          trackpoints = trackpoints.filter((tp) => {
            if (!tp.time) return true;
            return tp.time >= timeRange.start && tp.time <= timeRange.end;
          });
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        const paginatedTrackpoints = trackpoints.slice(offset, offset + limit);

        return {
          success: true,
          data: paginatedTrackpoints,
          meta: {
            total: trackpoints.length,
            page,
            limit,
            pages: Math.ceil(trackpoints.length / limit),
          },
        };
      }
    }

    return {
      success: false,
      message: "No trackpoints found",
      error: "The GPS data does not contain valid trackpoints",
      statusCode: ApiStatusCode.NOT_FOUND,
    };
  } catch (error) {
    console.error("Error getting activity trackpoints:", error);
    return {
      success: false,
      message: "Failed to get activity trackpoints",
      error: error instanceof Error ? error.message : "Unknown error",
      statusCode: ApiStatusCode.INTERNAL_SERVER_ERROR,
    };
  }
};
