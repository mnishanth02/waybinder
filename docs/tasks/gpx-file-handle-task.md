# GPS File Management System - Implementation Tasks

This document outlines the step-by-step tasks required to implement the GPS file management system for WayBinder, as described in the implementation plan in `docs/guides/enhanced-mapgl.md`. The tasks are organized into phases, with each phase building upon the previous one.

## Overview

The GPS file management system will allow users to:

1. Upload GPS files (GPX, KML, FIT, TCX) as part of activity creation/editing
2. Automatically extract and display statistics (distance, elevation, duration)
3. View activities on interactive maps with elevation profiles
4. Edit GPS data (add/remove/modify points)
5. Merge multiple GPS files for complex activities
6. Download processed files in various formats

## Key Improvements and Considerations

Based on research and best practices, this implementation plan includes the following key improvements:

1. **Modern Library Selection:** Using gpxjs over gpx-parse for better TypeScript support and modern JavaScript features
2. **Performance Optimization:** Implementing server-side simplification with Turf.js for large GPS files
3. **Responsive Processing:** Using Web Workers for client-side processing to prevent UI blocking
4. **User Experience:** Enhanced progress tracking for large file uploads and processing
5. **Error Handling:** Comprehensive error handling with user-friendly messages
6. **Accessibility:** Ensuring map components are accessible with keyboard navigation and screen reader support
7. **Testing:** Adding comprehensive unit and integration tests for GPS utilities and endpoints

## Phase 1: Foundation Setup (1-2 weeks)

### 1.1 Environment Setup

- [✅] **Task 1.1.1:** Install required dependencies:

```bash
bun add @tmcw/togeojson @turf/turf tokml fit-file-parser tcx-js @types/geojson maplibre-gl react-map-gl gpxparser gpx-parse web-worker
```

- [✅] **Task 1.1.2:** Set up OpenStreetMap tile server configuration in environment variables:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_if_needed
NEXT_PUBLIC_MAP_STYLE=https://api.maptiler.com/maps/outdoor/style.json?key=your_maptiler_key
```

### 1.2 Database Schema Updates

- [✅] **Task 1.2.1:** Create a new migration file to extend the activities table with GPS-related fields:

```bash
bun db:generate
```

- [✅] **Task 1.2.2:** Update the activity schema in `server/db/schema/activity-schema.ts` to include:
  - `geoJsonData` field (JSON type with GeoJSON FeatureCollection)
  - `originalFileName` field
  - `originalFileType` field
  - `processedStats` field with detailed statistics:

  ```typescript
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
    simplifiedGeoJson: GeoJSON.FeatureCollection; // For faster rendering at different zoom levels
  }>(),
  ```

- [✅] **Task 1.2.3:** Run the migration:

```bash
bun db:migrate
```

### 1.3 Backend API Setup

- [✅] **Task 1.3.1:** Create GPS route and controller files:
  - `server/routes/gps/gps.route.ts`
  - `server/routes/gps/gps.controller.ts`

- [✅] **Task 1.3.2:** Create Zod validation schemas for GPS endpoints in `server/routes/gps/gps.route.ts`

- [✅] **Task 1.3.3:** Implement basic file upload endpoint with multipart form handling and progress tracking

- [✅] **Task 1.3.4:** Implement file parsing utilities in `server/routes/gps/parsers.ts` for:
  - GPX parsing using gpxparser for better TypeScript support
  - KML parsing with @tmcw/togeojson
  - FIT parsing with fit-file-parser
  - TCX parsing with tcx-js

- [✅] **Task 1.3.5:** Implement GeoJSON conversion and simplification utilities in `server/routes/gps/parsers.ts`:
  - Convert all formats to standardized GeoJSON
  - Use Turf.js to simplify tracks for different zoom levels
  - Create optimized versions for map rendering

- [✅] **Task 1.3.6:** Implement comprehensive statistics calculation in `server/routes/gps/parsers.ts`:
  - Distance calculations with proper geodesic formulas
  - Elevation analysis with smoothing for sensor errors
  - Time and pace calculations with moving vs. total time

- [✅] **Task 1.3.7:** Add GPS router to the main app in `app/api/[[...route]]/route.ts`

- [✅] **Task 1.3.8:** Implement error handling middleware for GPS operations

### 1.4 Frontend Components - Basic

- [✅] **Task 1.4.1:** Create a basic GPS file upload component in `features/athlete/components/activity/gps-file-upload.tsx`:
  - Drag and drop interface
  - Progress indicator for uploads
  - File type validation
  - Preview of file metadata

- [✅] **Task 1.4.2:** Create a basic map component in `features/athlete/components/map/activity-map.tsx`:
  - MapLibre GL integration
  - Basic controls (zoom, pan)
  - Track rendering from GeoJSON
  - Responsive design for different screen sizes

- [✅] **Task 1.4.3:** Create a statistics display component in `features/athlete/components/activity/activity-stats.tsx`:
  - Formatted display of key metrics
  - Unit conversion options
  - Visual indicators for elevation and pace

- [✅] **Task 1.4.4:** Integrate the GPS file upload component into the activity form

### 1.5 API Integration

- [✅] **Task 1.5.1:** Create GPS API client functions in `features/athlete/api/gps-api.ts`:
  - File upload with progress tracking
  - GeoJSON and statistics fetching
  - Error handling and retry logic

- [✅] **Task 1.5.2:** Create TanStack Query hooks in `features/athlete/hooks/use-gps-queries.ts`:
  - Upload mutation with progress callback
  - GeoJSON query with caching
  - Statistics query with automatic refetching

- [✅] **Task 1.5.3:** Integrate the API with the GPS file upload component

### 1.6 Web Worker Implementation

- [✅] **Task 1.6.1:** Create Web Worker setup for client-side processing:
  - Set up worker configuration in `features/athlete/workers/gps-worker.ts`
  - Implement message passing interface

- [✅] **Task 1.6.2:** Implement client-side parsing in workers:
  - Basic file validation
  - Preview generation
  - Initial statistics calculation

- [✅] **Task 1.6.3:** Create a hook to use the Web Worker in `features/athlete/hooks/use-gps-worker.ts`

### Phase 1 Summary

Phase 1 has been successfully completed. We have:

1. Set up the environment with all required dependencies
2. Updated the database schema to support GPS data
3. Implemented backend API endpoints for GPS file handling
4. Created frontend components for GPS file upload, map display, and statistics
5. Integrated the API with the frontend components
6. Implemented Web Worker support for client-side processing
7. Fixed TypeScript errors and implementation issues

The foundation for the GPS file management system is now in place. Users can upload GPS files (GPX, KML, FIT, TCX) as part of activity creation/editing, and the system will automatically extract and display statistics (distance, elevation, duration) and show the track on an interactive map.

#### Implementation Notes and Fixes

1. **Type Definitions**:
   - Created proper type definitions for GeoJSON data in `types/geo.ts`
     - Added `EnhancedGeometry` type to handle different geometry types
     - Changed `any` to `unknown` for better type safety
     - Fixed the `EnhancedProperties` interface to not extend `GeoJSON.GeoJsonProperties`
   - Added type declarations for external libraries in `types/declarations.d.ts`
     - Added more specific types for all external libraries (FitParser, GpxParser, TcxParser)
     - Replaced `any` with `unknown` or more specific types
     - Fixed the Map shadowing issue by renaming to MapGL

2. **Backend Fixes**:
   - Fixed the GPS controller to use proper type casting for Drizzle ORM
     - Replaced `any` casts with proper type assertions using `unknown as typeof activities.$inferInsert.geoJsonData`
     - Fixed Date type issues in the insert and update statements
     - Added proper null handling for date fields
   - Updated the route handler to correctly extract user ID from the auth context
   - Improved error handling in the parsers
     - Fixed the coordinates property access by checking the geometry type first
     - Fixed the Date constructor issues with nullable/undefined values
     - Fixed the turf.js type issues
     - Added proper type annotations for parameters
     - Fixed the elevation calculation to handle undefined values

3. **Frontend Fixes**:
   - Updated the activity form to handle GPS data correctly
   - Fixed dependency arrays in useEffect and useCallback hooks
   - Added proper type definitions for component props
   - Fixed the coordinates property access in the map component by checking the geometry type first
   - Added proper type assertions for coordinates
   - Fixed the ref type and unused parameters

4. **Web Worker Implementation**:
   - Created a simulated Web Worker implementation for development
   - Added proper type definitions for worker messages and responses

#### Phase 1 Completion Status

All TypeScript errors have been fixed, and the basic functionality is working correctly. The remaining warnings about function complexity are not critical and can be addressed in a future refactoring if needed. We are now ready to proceed to Phase 2.

## Phase 2: Enhanced Visualization (1-2 weeks)

### 2.1 Backend Enhancements

- [🔄] **Task 2.1.1:** Implement trackpoints endpoint with pagination and filtering:
  - Support for different density levels based on zoom
  - Filtering by time ranges
  - Sorting and ordering options

- [ ] **Task 2.1.2:** Implement detailed statistics calculation with improved algorithms:
  - Kalman filtering for noisy GPS data
  - Improved elevation gain/loss calculation with noise reduction
  - Advanced pace and speed calculations with outlier detection

- [ ] **Task 2.1.3:** Implement elevation profile data extraction:
  - Smoothed elevation profiles for better visualization
  - Grade (steepness) calculation
  - Segment identification (climbs, descents, flats)

- [ ] **Task 2.1.4:** Implement caching strategy for frequently accessed data:
  - Redis or in-memory caching for GeoJSON data
  - Cache invalidation on updates
  - Tiered caching strategy based on access patterns

### 2.2 Map Components

- [ ] **Task 2.2.1:** Create an enhanced map viewer component with:
  - Custom controls with accessibility support
  - Layer toggling with visibility presets
  - Marker placement with custom icons
  - Popup information with rich content
  - Keyboard navigation support
  - Screen reader compatibility

- [ ] **Task 2.2.2:** Implement map state management using Zustand in `features/athlete/store/use-map-store.ts`:
  - Persistent viewport settings
  - Layer visibility state
  - Selected features
  - Interaction modes

- [ ] **Task 2.2.3:** Implement URL state management using nuqs for map position and selected activities:
  - Shareable map views
  - Deep linking to specific features
  - State restoration on page reload

- [ ] **Task 2.2.4:** Implement responsive map layout:
  - Adaptive controls based on screen size
  - Mobile-friendly interaction patterns
  - Touch gesture support

### 2.3 Elevation Profile

- [ ] **Task 2.3.1:** Create an elevation profile component using Recharts in `features/athlete/components/map/elevation-profile.tsx`:
  - Interactive chart with zoom and pan
  - Gradient coloring based on steepness
  - Distance and elevation markers
  - Customizable display options

- [ ] **Task 2.3.2:** Implement interactive highlighting between elevation profile and map:
  - Synchronized highlighting on hover
  - Click to navigate to point on map
  - Visual indicators for current position
  - Segment highlighting

- [ ] **Task 2.3.3:** Add elevation analysis features:
  - Climb categorization (similar to cycling categories)
  - Steepest sections identification
  - Cumulative elevation gain visualization
  - Comparison with elevation databases for accuracy

### 2.4 Activity Details Panel

- [ ] **Task 2.4.1:** Create an activity details panel component in `features/athlete/components/activity/activity-details-panel.tsx`:
  - Collapsible sections for different data categories
  - Tabbed interface for different views
  - Responsive layout for different screen sizes

- [ ] **Task 2.4.2:** Implement statistics display with formatted values:
  - Unit conversion options (metric/imperial)
  - Visual indicators for key metrics
  - Comparative statistics (personal bests, averages)
  - Graphical representations where appropriate

- [ ] **Task 2.4.3:** Implement activity metadata display:
  - File information and processing details
  - Equipment and condition tags
  - Weather data integration if available
  - User notes and annotations

- [ ] **Task 2.4.4:** Implement accessibility features:
  - Keyboard navigation
  - Screen reader support
  - High contrast mode
  - Focus management

## Phase 3: Editing & Advanced Features (1-2 weeks)

### 3.1 Backend Advanced Features

- [ ] **Task 3.1.1:** Implement GPS data editing endpoints:
  - Point addition, removal, and modification
  - Track segment operations (split, join, reverse)
  - Batch operations for efficiency
  - Validation to ensure data integrity

- [ ] **Task 3.1.2:** Implement merge functionality for combining multiple files:
  - Smart time-based merging
  - Duplicate point detection and handling
  - Gap detection and interpolation options
  - Conflict resolution strategies

- [ ] **Task 3.1.3:** Implement export endpoints for different formats:
  - GPX with extended metadata
  - KML with styling options
  - GeoJSON with additional properties
  - FIT and TCX for device compatibility
  - CSV for data analysis

- [ ] **Task 3.1.4:** Implement track analysis algorithms:
  - Loop detection
  - Out-and-back identification
  - Intersection points
  - Segment matching with known routes

### 3.2 Map Editing Interface

- [ ] **Task 3.2.1:** Create a GPS editor component in `features/athlete/components/map/gps-editor.tsx`:
  - Toolbar with editing tools
  - Mode switching (view, edit, select)
  - Visual feedback for editable elements
  - Context menus for operations

- [ ] **Task 3.2.2:** Implement point editing features:
  - Add points with precise positioning
  - Remove points with confirmation
  - Move points with snapping options
  - Batch selection and editing
  - Elevation editing with validation

- [ ] **Task 3.2.3:** Implement track segment editing:
  - Split tracks at selected points
  - Join segments with options for handling gaps
  - Reverse segment direction
  - Simplify segments with adjustable tolerance
  - Smooth segments to reduce noise

- [ ] **Task 3.2.4:** Implement undo/redo functionality:
  - Command pattern for edit operations
  - History management with state snapshots
  - Batch operations as single undo steps
  - Persistent history across sessions

- [ ] **Task 3.2.5:** Implement advanced editing tools:
  - Route snapping to roads/trails
  - Automatic gap filling
  - Noise reduction tools
  - Elevation correction using terrain data

### 3.3 File Merging Interface

- [ ] **Task 3.3.1:** Create a GPS file merger component in `features/athlete/components/map/gps-file-merger.tsx`:
  - Multi-file selection interface
  - Drag-and-drop reordering
  - Visual preview of files to be merged
  - Options panel for merge settings

- [ ] **Task 3.3.2:** Implement activity selection interface:
  - Filterable list of user activities
  - Search by name, date, type
  - Preview thumbnails of routes
  - Batch selection capabilities

- [ ] **Task 3.3.3:** Implement merge preview:
  - Side-by-side comparison view
  - Combined route visualization
  - Conflict highlighting
  - Statistics comparison

- [ ] **Task 3.3.4:** Implement merge confirmation and processing:
  - Progress indication for long operations
  - Conflict resolution interface
  - Result validation
  - Option to save as new activity or update existing

- [ ] **Task 3.3.5:** Implement advanced merge options:
  - Time offset adjustments
  - Speed normalization
  - Elevation smoothing between segments
  - Metadata merging strategies

### 3.4 Download Options

- [ ] **Task 3.4.1:** Create a file export component in `features/athlete/components/activity/file-export.tsx`:
  - Format selection with format details
  - Options panel for format-specific settings
  - Preview of output file size and content
  - Batch export capabilities

- [ ] **Task 3.4.2:** Implement format-specific export options:
  - GPX: version, extensions, metadata fields
  - KML: styling, folder structure, description formatting
  - GeoJSON: property inclusion, simplification level
  - FIT/TCX: device compatibility options
  - CSV: column selection, delimiter options

- [ ] **Task 3.4.3:** Implement download functionality:
  - Direct download for small files
  - Background processing with notification for large files
  - Email option for very large files
  - Shareable links with expiration

- [ ] **Task 3.4.4:** Implement export presets:
  - Save user preferences for future exports
  - Device-specific presets (Garmin, Wahoo, etc.)
  - Quick export options for common scenarios

## Phase 4: Polish & Integration (1-2 weeks)

### 4.1 Performance Optimization

- [ ] **Task 4.1.1:** Optimize large file processing:
  - Implement streaming for large file uploads with chunked processing
  - Add detailed progress tracking with time estimates
  - Use Web Workers for all CPU-intensive client-side operations
  - Implement cancelable operations for long-running processes

- [ ] **Task 4.1.2:** Implement advanced track simplification:
  - Use Turf.js to create multiple simplification levels for different zoom levels
  - Implement vector tiling for extremely large datasets
  - Create adaptive rendering based on device capabilities
  - Implement WebGL acceleration for track rendering

- [ ] **Task 4.1.3:** Add comprehensive performance enhancements:
  - Implement tiered caching strategy (memory, localStorage, IndexedDB)
  - Add background processing queue with priority levels
  - Use virtualization for large data tables and lists
  - Implement lazy loading for map features
  - Add performance monitoring and analytics

- [ ] **Task 4.1.4:** Optimize mobile experience:
  - Reduce network payload sizes for mobile connections
  - Implement offline capabilities for viewing downloaded tracks
  - Optimize touch interactions for small screens
  - Add battery-efficient rendering modes

### 4.2 Error Handling & Validation

- [ ] **Task 4.2.1:** Implement comprehensive error handling:
  - Detailed file validation with specific error messages
  - Graceful recovery from parsing errors with partial data
  - Structured API error responses with error codes and solutions
  - Client-side error boundary components
  - Error logging and monitoring

- [ ] **Task 4.2.2:** Add robust validation:
  - Real-time validation during file uploads
  - Schema validation for all API requests and responses
  - Data integrity checks before saving to database
  - Cross-field validation rules
  - Custom validation for GPS-specific constraints

- [ ] **Task 4.2.3:** Create user-friendly error experiences:
  - Contextual error messages with suggested actions
  - Visual error indicators in the UI
  - Automatic retry mechanisms with backoff
  - Data recovery options when possible
  - Guided troubleshooting for common issues

- [ ] **Task 4.2.4:** Implement data quality warnings:
  - Detection of poor GPS signal sections
  - Identification of potentially incorrect elevation data
  - Warnings for unrealistic speed or pace values
  - Suggestions for data cleaning operations

### 4.3 Journey Integration

- [ ] **Task 4.3.1:** Integrate GPS activities with journey maps:
  - Combined view of all journey activities on a single map
  - Day-by-day progression visualization
  - Statistics aggregation across activities
  - Timeline view with activity markers

- [ ] **Task 4.3.2:** Create an enhanced journey map component:
  - Color-coded tracks by activity type or day
  - Animated playback of journey progression
  - Elevation profile for the entire journey
  - Points of interest markers from activities

- [ ] **Task 4.3.3:** Implement comprehensive filtering:
  - Filter by day, activity type, distance, elevation
  - Save and share filter presets
  - Quick filters for common scenarios
  - Combined filters with logical operators

- [ ] **Task 4.3.4:** Add journey statistics and insights:
  - Daily distance and elevation summaries
  - Trend analysis across the journey
  - Achievement highlights and milestones
  - Comparative analysis between journey segments

### 4.4 User Profile Integration

- [ ] **Task 4.4.1:** Add GPS activity statistics to user profiles:
  - Activity heatmaps by location
  - Cumulative statistics with visualizations
  - Personal records and achievements
  - Activity type distribution charts

- [ ] **Task 4.4.2:** Create a user activity map component:
  - All-time activity heatmap
  - Clustered activity markers
  - Favorite routes highlighting
  - Most visited locations

- [ ] **Task 4.4.3:** Implement activity discovery:
  - Advanced search with multiple criteria
  - Similar route suggestions
  - Nearby activity recommendations
  - Seasonal activity patterns

- [ ] **Task 4.4.4:** Add social sharing features:
  - Route sharing with privacy controls
  - Embeddable maps for external sites
  - Activity challenges and comparisons
  - Group activity visualization

### 4.5 Testing & Documentation

- [ ] **Task 4.5.1:** Implement comprehensive testing:
  - Unit tests for all GPS utilities and algorithms
  - Integration tests for API endpoints
  - Component tests for UI elements
  - End-to-end tests for critical user flows
  - Performance benchmarks and thresholds

- [ ] **Task 4.5.2:** Create test fixtures and tools:
  - Sample GPS files of various formats and complexities
  - Mock services for external dependencies
  - Test helpers for common testing scenarios
  - Visual regression testing for map components

- [ ] **Task 4.5.3:** Create user documentation:
  - Getting started guides with examples
  - Feature walkthroughs with screenshots
  - Troubleshooting guides for common issues
  - FAQ section based on user feedback
  - Video tutorials for complex operations

- [ ] **Task 4.5.4:** Create developer documentation:
  - API reference with examples
  - Component usage guidelines
  - Architecture overview
  - Extension points for future development
  - Performance optimization guidelines

- [ ] **Task 4.5.5:** Implement accessibility documentation and testing:
  - Accessibility compliance checklist
  - Screen reader testing documentation
  - Keyboard navigation guides
  - Color contrast verification
  - WCAG 2.1 AA compliance report

## Implementation Details

### Component Structure

```tsx
// Basic map viewer for activities with accessibility support
<ActivityMap
  activityId={activityId}
  height="400px"
  width="100%"
  interactive={true}
  accessibilityFeatures={true}
  renderOptions={{
    simplificationLevel: "auto", // auto, high, medium, low
    colorScheme: "elevation", // elevation, speed, gradient, custom
    lineOptions: { width: 3, opacity: 0.8 }
  }}
  onMapLoad={(map) => setMapInstance(map)}
/>

// Enhanced map with editing capabilities
<GpsEditor
  activityId={activityId}
  editMode="advanced" // basic, advanced
  tools={["point", "segment", "simplify", "smooth", "snap"]}
  undoLevels={50}
  onSave={(editedData) => handleSave(editedData)}
  onCancel={() => setEditMode(false)}
  onProgress={(progress) => setProgress(progress)}
/>

// Elevation profile component with advanced features
<ElevationProfile
  activityId={activityId}
  height="200px"
  width="100%"
  highlightPoint={(index) => highlightPointOnMap(index)}
  showGradient={true}
  smoothing="medium" // none, low, medium, high
  compareWith={compareActivityId} // optional comparison activity
  segments={automaticSegments} // auto-detected climbs/descents
  interactionMode="zoom" // select, zoom, pan
  metricUnits={useMetricUnits} // toggle between metric/imperial
/>

// GPS file upload component with progress and preview
<GpsFileUpload
  acceptedFormats={["gpx", "kml", "fit", "tcx"]}
  maxFileSize="50MB"
  multiple={true}
  dragAndDrop={true}
  showPreview={true}
  previewType="map" // map, stats, both
  onProgress={(progress) => setUploadProgress(progress)}
  onFileProcessed={(stats) => {
    form.setValue('distanceKm', stats.totalDistance);
    form.setValue('elevationGainM', stats.elevationGain);
    form.setValue('movingTimeSeconds', stats.movingTime);
    form.setValue('startTime', stats.startTime);
    form.setValue('endTime', stats.endTime);
  }}
  onError={(error) => handleUploadError(error)}
/>

// GPS file merger component with advanced options
<GpsFileMerger
  activityIds={selectedActivityIds}
  mergeStrategy="smart" // time, spatial, manual
  conflictResolution="auto" // auto, manual, prefer-first, prefer-last
  showPreview={true}
  timeAdjustment={timeOffsets} // optional time adjustments
  onMergeProgress={(progress) => setMergeProgress(progress)}
  onMergeComplete={(newActivityId) => router.push(`/activity/${newActivityId}`)}
  onMergeError={(error) => handleMergeError(error)}
/>

// Journey map with all activities
<JourneyMap
  journeyId={journeyId}
  showAllActivities={true}
  colorBy="day" // day, activity-type, elevation, custom
  showTimeline={true}
  animateProgression={false}
  fitBounds={true}
  interactiveTimeline={true}
  onDaySelect={(day) => setSelectedDay(day)}
  onActivitySelect={(activityId) => setSelectedActivity(activityId)}
/>
```

### Data Flow

1. **File Upload Flow:**
   - User uploads GPS file(s) in the activity creation/editing form
   - Client-side Web Worker performs initial validation and preview generation
   - Frontend sends the file to the `/api/gps/upload` endpoint using TanStack Query mutation with progress tracking
   - Backend processes the file with streaming:
     - Parses the file format (GPX, KML, FIT, TCX) with appropriate parser
     - Extracts track data and converts to standardized GeoJSON
     - Applies noise filtering and data cleaning
     - Creates multiple simplification levels for different zoom levels
     - Calculates comprehensive statistics (distance, elevation, duration, etc.)
     - Stores the processed data in the database
   - Backend returns success response with statistics and simplified preview data
   - Frontend updates the form with the extracted statistics and shows map preview

2. **Viewing Flow:**
   - When viewing an activity with GPS data:
     - Frontend fetches appropriate GeoJSON detail level based on viewport
     - Map component renders the track using MapLibre GL with optimized rendering
     - Statistics are displayed with proper formatting and unit conversion
     - Elevation profile is rendered with interactive highlighting
     - Additional data layers (speed, grade, heart rate) are available for toggle

3. **Editing Flow:**
   - User enters edit mode for an activity
   - Full-resolution GeoJSON is fetched if not already cached
   - User makes changes in the map editor interface:
     - Point additions, removals, or modifications
     - Segment operations (split, join, reverse)
     - Track simplification or smoothing
   - Changes are tracked in an undo/redo history
   - On save, changes are sent to the backend for processing
   - Backend recalculates statistics and simplification levels
   - Updated GeoJSON and statistics are returned and stored
   - UI is updated with the new data and edit mode is exited

4. **Merging Flow:**
   - User selects multiple activities to merge
   - Preview is generated showing the combined route
   - User configures merge options (time adjustments, conflict resolution)
   - Merge request is sent to the backend
   - Backend processes the merge with progress updates:
     - Combines trackpoints from all sources
     - Resolves conflicts according to strategy
     - Creates a new unified GeoJSON
     - Calculates combined statistics
   - New or updated activity is created with the merged data
   - User is redirected to the new activity view

### State Management Strategy

- **TanStack Query:** Will manage server state including:
  - GPS file upload mutations with progress tracking
  - GeoJSON data fetching with detail level parameters
  - Statistics and trackpoint data with caching
  - Analysis and merge operations with cancellation support
  - Background processing status monitoring

- **Zustand:** Will manage client-side UI state:
  - Map viewport settings (zoom, center, bearing, pitch)
  - Selected activities/layers with visibility toggles
  - UI mode (viewing, editing, merging, analyzing)
  - Panel visibility and layout options
  - Edit history and undo/redo stack
  - User preferences and settings

- **nuqs:** Will manage URL state for:
  - Selected activity IDs for sharing specific views
  - Map position, zoom, and bearing for shareable map states
  - Active view mode and selected panels
  - Filter settings for activity lists
  - Comparison mode parameters

### API Structure

```typescript
// gps.route.ts
const gpsRouter = new Hono()
  // Upload GPS file with progress tracking
  .post("/upload", protect, zValidator("form", uploadGpsSchema), uploadGpsFile)

  // Get GeoJSON for an activity with detail level
  .get("/activity/:id/geojson", zValidator("param", idParamSchema),
       zValidator("query", geoJsonQuerySchema), getActivityGeoJson)

  // Get detailed statistics for an activity
  .get("/activity/:id/stats", zValidator("param", idParamSchema), getActivityStats)

  // Get trackpoints for an activity (paginated)
  .get("/activity/:id/trackpoints", zValidator("param", idParamSchema),
       zValidator("query", trackpointsQuerySchema), getActivityTrackpoints)

  // Get elevation profile data
  .get("/activity/:id/elevation", zValidator("param", idParamSchema),
       zValidator("query", elevationQuerySchema), getElevationProfile)

  // Analyze activity (segments, climbs, etc.)
  .get("/activity/:id/analyze", zValidator("param", idParamSchema),
       zValidator("query", analysisQuerySchema), analyzeActivity)

  // Analyze overlap between multiple activities
  .post("/analyze/overlap", protect, zValidator("json", overlapAnalysisSchema), analyzeOverlap)

  // Merge multiple GPS files
  .post("/merge", protect, zValidator("json", mergeFilesSchema), mergeGpsFiles)

  // Get merge preview
  .post("/merge/preview", protect, zValidator("json", mergePreviewSchema), getMergePreview)

  // Edit GPS data
  .put("/activity/:id/edit", protect, zValidator("param", idParamSchema),
       zValidator("json", editGpsSchema), editGpsData)

  // Simplify track with custom parameters
  .post("/activity/:id/simplify", protect, zValidator("param", idParamSchema),
        zValidator("json", simplifyParamsSchema), simplifyTrack)

  // Export GPS data in different formats
  .get("/activity/:id/export", zValidator("param", idParamSchema),
       zValidator("query", exportQuerySchema), exportGpsFile)

  // Get processing status for long-running operations
  .get("/process/:processId/status", zValidator("param", processIdSchema), getProcessStatus);
```

## Progress Tracking

To track progress on this implementation, we'll use the following status indicators:

- [ ] Not started
- [🔄] In progress
- [✅] Completed

Team members should update the status of tasks as they work on them, and add comments or notes about any challenges or decisions made during implementation.

## Technical Considerations

### Performance Optimization

- Use streaming for file uploads and processing to handle large files efficiently
- Implement multiple detail levels for GeoJSON to optimize rendering at different zoom levels
- Use Web Workers for CPU-intensive operations to keep the UI responsive
- Implement efficient caching strategies for frequently accessed data
- Use virtualization for large data tables and lists
- Consider using WebGL for rendering complex tracks

### Security Considerations

- Validate all file uploads for size, type, and content
- Implement proper authentication and authorization for all endpoints
- Sanitize user input to prevent injection attacks
- Implement rate limiting for API endpoints
- Consider privacy implications of GPS data sharing

### Accessibility

- Ensure all components are keyboard navigable
- Add proper ARIA attributes to custom controls
- Provide alternative text descriptions for map features
- Support screen readers for important data and interactions
- Maintain good color contrast for all UI elements
- Provide alternative ways to access information shown on maps

## Conclusion

This comprehensive task list provides a detailed roadmap for implementing a state-of-the-art GPS file management system in WayBinder. By following these tasks in sequence and incorporating the recommended improvements, we can ensure a systematic and organized approach to development.

The implementation will result in a robust, performant, and user-friendly feature that:

1. Provides excellent user experience with intuitive interfaces
2. Handles large and complex GPS files efficiently
3. Offers advanced editing and analysis capabilities
4. Integrates seamlessly with the existing journey and activity features
5. Works well across different devices and connection speeds
6. Is accessible to users with disabilities
7. Can be extended with new capabilities in the future

This feature will significantly enhance the overall application experience and provide users with powerful tools for managing their outdoor activities.
