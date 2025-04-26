# Activity Feature Implementation Plan

This document outlines the implementation details for the Activity feature in the WayBinder application. It serves as a reference for both developers and LLMs when building the UI and integrating with the backend.

## Overview

The Activity feature allows users to create, update, delete, and view activities within journeys. An activity represents a specific event or action during a journey, such as hiking, running, cycling, etc.

## Database Schema

The activity schema is defined in `server/db/schema/activity-schema.ts` with the following key fields:

```typescript
export const activities = pgTable(
  "activities",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    journeyId: text("journey_id").notNull().references(() => journeys.id, { onDelete: "cascade" }),
    activityUniqueId: text("activity_unique_id").notNull().unique(),
    title: text("title").notNull(),
    activityDate: text("start_date").notNull(),
    dayNumber: integer("day_number"),
    orderWithinDay: integer("order_within_day").default(0).notNull(),
    activityType: activityTypeEnum("activity_type"),
    content: text("content"),
    distanceKm: real("distance_km"),
    elevationGainM: real("elevation_gain_m"),
    elevationLossM: real("elevation_loss_m"),
    movingTimeSeconds: integer("moving_time_seconds"),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  }
);
```

## API Endpoints

### 1. Create Activity

- **Endpoint**: `POST /api/activity`
- **Authentication**: Required
- **Request Body**:
  ```typescript
  {
    journeyId: string;
    title: string;
    activityDate: string;
    dayNumber?: number;
    orderWithinDay?: number;
    activityType?: "hikeing" | "running" | "cycling" | "driving" | "flying" | "boating" | "rest" | "camping" | "climbing" | "mountaineer" | "sightseeing" | "travel" | "other";
    content?: string;
    distanceKm?: number;
    elevationGainM?: number;
    elevationLossM?: number;
    movingTimeSeconds?: number;
    startTime?: Date;
    endTime?: Date;
  }
  ```
- **Response**:
  ```typescript
  {
    success: true;
    message: "Activity created successfully";
    data: {
      id: string;
      activityUniqueId: string;
    }
  }
  ```

### 2. Get All Activities

- **Endpoint**: `GET /api/activity`
- **Authentication**: Not required
- **Query Parameters**:
  - `limit`: Number of activities to return (default: 10)
  - `page`: Page number (default: 1)
  - `journeyId`: Filter by journey ID
  - `activityType`: Filter by activity type
  - `search`: Search term for title or content
  - `sortBy`: Field to sort by (default: "activityDate")
  - `sortOrder`: "asc" or "desc" (default: "asc")
- **Response**:
  ```typescript
  {
    success: true;
    data: Activity[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    }
  }
  ```

### 3. Get Activities by Journey ID

- **Endpoint**: `GET /api/activity/journey/:journeyId`
- **Authentication**: Not required
- **Query Parameters**: Same as "Get All Activities"
- **Response**: Same as "Get All Activities"

### 4. Get Activity by ID

- **Endpoint**: `GET /api/activity/:id`
- **Authentication**: Not required
- **Response**:
  ```typescript
  {
    success: true;
    data: Activity;
  }
  ```

### 5. Get Activity by Unique ID

- **Endpoint**: `GET /api/activity/unique/:id`
- **Authentication**: Not required
- **Response**: Same as "Get Activity by ID"

### 6. Update Activity

- **Endpoint**: `PUT /api/activity/:id`
- **Authentication**: Required
- **Request Body**: Same as "Create Activity" but all fields are optional
- **Response**:
  ```typescript
  {
    success: true;
    message: "Activity updated successfully";
    data: Activity;
  }
  ```

### 7. Delete Activity

- **Endpoint**: `DELETE /api/activity/:id`
- **Authentication**: Required
- **Response**:
  ```typescript
  {
    success: true;
    message: "Activity deleted successfully";
  }
  ```

## Validation Schemas

The validation schemas for activity creation and updates are defined in `features/api-types/activity.ts`:

```typescript
export const CreateActivitySchema = insertActivitySchema.omit({
  id: true,
  activityUniqueId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateActivitySchema = insertActivitySchema.partial().omit({
  id: true,
  journeyId: true,
  activityUniqueId: true,
  createdAt: true,
  updatedAt: true,
});
```

## Controller Implementation

The activity controller is implemented in `server/routes/activity/activity.controller.ts` with the following functions:

1. `createActivity`: Creates a new activity
2. `getActivities`: Gets all activities with pagination, filtering, and sorting
3. `getActivitiesByJourneyId`: Gets activities for a specific journey
4. `getActivityById`: Gets an activity by its ID
5. `getActivityByUniqueId`: Gets an activity by its unique ID
6. `updateActivity`: Updates an activity
7. `deleteActivity`: Deletes an activity

## Route Implementation

The activity routes are defined in `server/routes/activity/activity.route.ts` and handle all the API endpoints described above.

## Error Handling

All controller functions include proper error handling for negative scenarios:

- Not found errors return a 404 status code
- Unauthorized access returns a 401 status code
- Forbidden access returns a 403 status code
- Bad requests return a 400 status code

## Security Considerations

1. **Authentication**: All mutation endpoints (create, update, delete) require authentication
2. **Authorization**: Users can only update or delete activities in their own journeys unless they are admins
3. **Input Validation**: All input is validated using Zod schemas
4. **Error Handling**: Proper error messages are returned for all error cases

## Performance Considerations

1. **Pagination**: All list endpoints support pagination to limit the amount of data returned
2. **Filtering**: Filtering is done at the database level for efficiency
3. **Relations**: Only necessary relations are loaded to minimize data transfer
4. **Indexing**: The database schema includes indexes for commonly queried fields
