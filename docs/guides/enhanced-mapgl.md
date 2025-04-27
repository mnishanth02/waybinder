# GPS File Management System - WayBinder Implementation Plan

This document outlines the implementation plan for integrating a comprehensive GPS file management system into the WayBinder application. The system will allow users to upload, view, analyze, edit, merge, and download GPX, KML, and FIT files as part of journey activities, using an interactive map interface. Processing-intensive tasks will be handled by the server-side Hono.js backend, ensuring a responsive client-side experience.

## 1. Overview

The GPS file management system will extend the existing activity functionality in WayBinder, allowing users to:

1. Upload GPS files (GPX, KML, FIT, TCX) as part of activity creation/editing
2. Automatically extract and display statistics (distance, elevation, duration)
3. View activities on interactive maps with elevation profiles
4. Edit GPS data (add/remove/modify points)
5. Merge multiple GPS files for complex activities
6. Download processed files in various formats

This implementation will integrate seamlessly with the existing journey and activity features, following established project patterns and coding standards.

## 2. Scope Clarification

* **Integration Focus:** This feature extends the existing activity system in WayBinder, integrating with journeys, activities, and user profiles.
* **Backend Responsibilities:** Parsing uploaded files, calculating statistics, performing geospatial analysis, merging files, converting between formats, and storing processed data in the database.
* **Frontend Responsibilities:** Rendering the UI (map, activity forms, statistics), handling user interactions, managing UI state, and displaying data received from the backend.
* **Limitations:** Large files or complex operations may require background processing. The implementation will include progress indicators and appropriate error handling.

## 3. Technology Stack

### Frontend
* **Next.js:** Application framework
* **React:** UI library
* **shadcn UI:** Component library with Tailwind CSS
* **React Map GL:** Map rendering using MapLibre GL
* **TanStack Query:** Data fetching, caching, and mutations
* **Zustand:** Client-side UI state management
* **nuqs:** URL state management
* **React Hook Form:** Form handling with Zod validation

### Backend
* **Hono.js:** API routes within Next.js
* **Better Auth:** Authentication and authorization
* **Drizzle ORM:** Database access with PostgreSQL
* **@tmcw/togeojson:** Convert GPX/KML to GeoJSON
* **gpx-parse:** Parse GPX files for detailed statistics
* **Turf.js:** Geospatial analysis and manipulation
* **tokml:** Convert GeoJSON back to KML
* **fit-file-parser:** Parse FIT files (for Garmin devices)
* **tcx-js:** Parse TCX files

## 4. Database Schema Extensions

We'll extend the existing database schema to support GPS data:

```typescript
// Extension to the activities table
export const activities = pgTable(
  "activities",
  {
    // Existing fields...

    // New or updated fields
    geoJsonData: jsonb("geo_json_data").$type<GeoJSON.FeatureCollection>(),
    originalFileName: text("original_file_name"),
    originalFileType: text("original_file_type"), // "gpx", "kml", "fit", "tcx"
    processedStats: jsonb("processed_stats").$type<{
      totalDistance: number;
      elevationGain: number;
      elevationLoss: number;
      maxElevation: number;
      minElevation: number;
      startTime: string;
      endTime: string;
      movingTime: number;
      totalTime: number;
      averageSpeed: number;
      maxSpeed: number;
    }>(),
  }
);
```

## 5. API Structure

Following the existing pattern in WayBinder, we'll create a new route in `/server/routes/gps/`:

```typescript
// gps.route.ts
const gpsRouter = new Hono()
  // Upload GPS file
  .post("/upload", protect, zValidator("form", uploadGpsSchema), uploadGpsFile)

  // Get GeoJSON for an activity
  .get("/activity/:id/geojson", zValidator("param", idParamSchema), getActivityGeoJson)

  // Get detailed statistics for an activity
  .get("/activity/:id/stats", zValidator("param", idParamSchema), getActivityStats)

  // Get trackpoints for an activity (paginated)
  .get("/activity/:id/trackpoints", zValidator("param", idParamSchema),
       zValidator("query", trackpointsQuerySchema), getActivityTrackpoints)

  // Analyze overlap between multiple activities
  .post("/analyze/overlap", protect, zValidator("json", overlapAnalysisSchema), analyzeOverlap)

  // Merge multiple GPS files
  .post("/merge", protect, zValidator("json", mergeFilesSchema), mergeGpsFiles)

  // Edit GPS data
  .put("/activity/:id/edit", protect, zValidator("param", idParamSchema),
       zValidator("json", editGpsSchema), editGpsData)

  // Export GPS data in different formats
  .get("/activity/:id/export", zValidator("param", idParamSchema),
       zValidator("query", exportQuerySchema), exportGpsFile);

// Add to app/api/[[...route]]/route.ts
const routes = app
  // Existing routes...
  .route("/gps", gpsRouter);
```

## 6. State Management Strategy

* **TanStack Query:** Will manage server state including:
  * GPS file upload mutations
  * GeoJSON data fetching
  * Statistics and trackpoint data
  * Analysis and merge operations

* **Zustand:** Will manage client-side UI state:
  * Map viewport settings (zoom, center, bearing)
  * Selected activities/layers
  * UI mode (viewing, editing, merging)
  * Panel visibility and layout options

* **nuqs:** Will manage URL state for:
  * Selected activity IDs
  * Map position and zoom
  * Active view mode

## 7. Implementation Phases

### Phase 1: Basic GPS File Upload & Display (2 weeks)

1. **Database Schema Updates:**
   * Extend the activities table with GPS-related fields
   * Create migration scripts

2. **Backend Implementation:**
   * Create `/server/routes/gps/gps.route.ts` and `/server/routes/gps/gps.controller.ts`
   * Implement file upload endpoint with multipart form handling
   * Implement parsing logic for GPX, KML, FIT, and TCX files
   * Extract basic statistics and convert to GeoJSON
   * Store processed data in the database

3. **Frontend Implementation:**
   * Enhance the existing activity form with GPS file upload
   * Create a basic map component for displaying GPS tracks
   * Implement statistics display in the activity form
   * Use TanStack Query for data fetching and mutations

### Phase 2: Enhanced Visualization & Analysis (2 weeks)

1. **Backend Implementation:**
   * Implement trackpoints endpoint with pagination
   * Create detailed statistics calculation
   * Implement elevation profile data extraction

2. **Frontend Implementation:**
   * Create an enhanced map viewer component
   * Implement elevation profile chart using recharts
   * Add map controls (zoom, pan, layer toggling)
   * Create activity details panel with statistics

### Phase 3: Editing & Advanced Features (2 weeks)

1. **Backend Implementation:**
   * Implement GPS data editing endpoints
   * Create merge functionality for combining multiple files
   * Add export endpoints for different formats

2. **Frontend Implementation:**
   * Implement map editing interface
   * Create UI for merging multiple GPS files
   * Add download options for processed files
   * Implement progress tracking for long operations

### Phase 4: Polish & Integration (2 weeks)

1. **Performance Optimization:**
   * Optimize large file processing
   * Implement caching for frequently accessed data
   * Add background processing for complex operations

2. **Error Handling & Validation:**
   * Implement comprehensive error handling
   * Add validation for all inputs
   * Create user-friendly error messages

3. **Testing & Documentation:**
   * Write unit and integration tests
   * Create user documentation
   * Document API endpoints

## 8. Component Structure

### Map Components

```tsx
// Basic map viewer for activities
<ActivityMap
  activityId={activityId}
  height="400px"
  width="100%"
  interactive={true}
/>

// Enhanced map with editing capabilities
<GpsEditor
  activityId={activityId}
  onSave={(editedData) => handleSave(editedData)}
/>

// Elevation profile component
<ElevationProfile
  activityId={activityId}
  height="200px"
  width="100%"
  highlightPoint={(index) => highlightPointOnMap(index)}
/>
```

### Form Components

```tsx
// GPS file upload component for activity form
<GpsFileUpload
  onFileProcessed={(stats) => {
    form.setValue('distanceKm', stats.totalDistance);
    form.setValue('elevationGainM', stats.elevationGain);
    form.setValue('movingTimeSeconds', stats.movingTime);
  }}
/>

// GPS file merger component
<GpsFileMerger
  activityIds={selectedActivityIds}
  onMergeComplete={(newActivityId) => router.push(`/activity/${newActivityId}`)}
/>
```

## 9. Data Flow

1. User uploads a GPS file in the activity creation/editing form
2. Frontend sends the file to the `/api/gps/upload` endpoint using TanStack Query mutation
3. Backend processes the file:
   * Parses the file format (GPX, KML, FIT, TCX)
   * Extracts track data and converts to GeoJSON
   * Calculates statistics (distance, elevation, duration)
   * Stores the processed data in the database
4. Backend returns success response with basic statistics
5. Frontend updates the form with the extracted statistics
6. When viewing an activity with GPS data:
   * Frontend fetches GeoJSON data from `/api/gps/activity/:id/geojson`
   * Map component renders the track using React Map GL
   * Statistics are displayed from the activity data
   * Elevation profile is rendered using the trackpoint data

## 10. Error Handling

* **File Validation:** Check file type, size, and content before processing
* **Processing Errors:** Handle parsing errors gracefully with meaningful messages
* **API Errors:** Follow the existing pattern of returning structured error responses
* **UI Feedback:** Provide clear error messages and recovery options in the UI

## 11. Performance Considerations

* **Large File Handling:** Implement streaming for large file uploads and processing
* **Simplification:** Use Turf.js to simplify complex tracks for display at different zoom levels
* **Pagination:** Implement pagination for trackpoint data to avoid large payload sizes
* **Background Processing:** Consider using background jobs for complex operations

## 12. Integration with Existing Features

* **Activities:** GPS data will be directly integrated with the activity system
* **Journeys:** Activities with GPS data will be displayed on journey maps
* **User Profiles:** Users can view their GPS activities on their profile

## 13. Conclusion

This implementation plan provides a roadmap for integrating comprehensive GPS file management into the WayBinder application. By following the existing project structure and patterns, we ensure a seamless integration that enhances the user experience while maintaining code quality and performance.
