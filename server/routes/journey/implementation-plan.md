# Journey Feature Implementation Plan

This document outlines the implementation details for the Journey feature in the WayBinder application. It serves as a reference for both developers and LLMs when building the UI and integrating with the backend.

## Overview

The Journey feature allows users to create, update, delete, and view journeys. A journey represents an outdoor adventure with details such as title, description, dates, location, and more.

## Database Schema

The journey schema is defined in `server/db/schema/journey-schema.ts` with the following key fields:

```typescript
export const journeys = pgTable(
  "journeys",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    journeyUniqueId: text("journey_unique_id").notNull().unique(),
    title: text("title").unique().notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    journeyType: journeyTypeEnum("journey_type").notNull(),
    tags: text("tags").array(),
    privacyStatus: privacyStatusEnum("privacy_status").default("private").notNull(),
    coverImageUrl: text("cover_image_url"),
    location: text("location"),
    totalDistanceKm: text("total_distance_km"),
    totalElevationGainM: text("total_elevation_gain_m"),
    buddyIds: text("buddy_ids").array(),
    memberNames: text("member_names").array(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  }
);
```

## API Endpoints

### 1. Create Journey

- **Endpoint**: `POST /api/journey`
- **Authentication**: Required
- **Request Body**:
  ```typescript
  {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    journeyType: "trekking" | "trail_running" | "mountaineering" | "cycling_touring" | "cycling_road" | "cycling_mountain" | "climbing_expedition" | "road_trip" | "travel" | "weekend_getaway" | "single_day_outing" | "other";
    tags?: string[];
    privacyStatus?: "private" | "public";
    coverImageUrl?: string;
    location?: string;
    totalDistanceKm?: string;
    totalElevationGainM?: string;
    buddyIds?: string[];
    memberNames?: string[];
  }
  ```
- **Response**:
  ```typescript
  {
    success: true;
    message: "Journey created successfully";
    data: {
      id: string;
      uniqueId: string;
      slug: string;
    }
  }
  ```

### 2. Get All Journeys

- **Endpoint**: `GET /api/journey`
- **Authentication**: Not required
- **Query Parameters**:
  - `limit`: Number of journeys to return (default: 10)
  - `page`: Page number (default: 1)
  - `journeyType`: Filter by journey type
  - `search`: Search term for title, description, or location
  - `sortBy`: Field to sort by (default: "createdAt")
  - `sortOrder`: "asc" or "desc" (default: "desc")
- **Response**:
  ```typescript
  {
    success: true;
    data: Journey[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    }
  }
  ```

### 3. Get Journey by ID

- **Endpoint**: `GET /api/journey/:id`
- **Authentication**: Not required
- **Response**:
  ```typescript
  {
    success: true;
    data: Journey;
  }
  ```

### 4. Get Journey by Unique ID

- **Endpoint**: `GET /api/journey/unique/:id`
- **Authentication**: Not required
- **Response**:
  ```typescript
  {
    success: true;
    data: Journey;
  }
  ```

### 5. Get Journey by Slug

- **Endpoint**: `GET /api/journey/slug/:slug`
- **Authentication**: Not required
- **Response**:
  ```typescript
  {
    success: true;
    data: Journey;
  }
  ```

### 6. Get Current User's Journeys

- **Endpoint**: `GET /api/journey/me`
- **Authentication**: Required
- **Query Parameters**: Same as "Get All Journeys"
- **Response**: Same as "Get All Journeys" but filtered to the current user's journeys

### 7. Update Journey

- **Endpoint**: `PUT /api/journey/:id`
- **Authentication**: Required
- **Request Body**: Same as "Create Journey" but all fields are optional
- **Response**:
  ```typescript
  {
    success: true;
    message: "Journey updated successfully";
    data: Journey;
  }
  ```

### 8. Delete Journey

- **Endpoint**: `DELETE /api/journey/:id`
- **Authentication**: Required
- **Response**:
  ```typescript
  {
    success: true;
    message: "Journey deleted successfully";
    data: { id: string };
  }
  ```

## Validation Schemas

The validation schemas for journey creation and updates are defined in `features/types/journey.ts`:

```typescript
export const CreateJourneySchema = insertJourneySchema.omit({
  id: true,
  creatorId: true,
  journeyUniqueId: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const UpdateJourneySchema = insertJourneySchema.partial().omit({
  id: true,
  creatorId: true,
  journeyUniqueId: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});
```

## Utility Functions

### Slug Generation

The utility functions for generating slugs and unique IDs are defined in `lib/utils/slug.ts`:

```typescript
export function generateSlug(title: string): string {
  // Convert to lowercase and replace spaces with hyphens
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens

  // Add a short random string to ensure uniqueness
  return `${baseSlug}-${nanoid(6)}`;
}

export function generateJourneyUniqueId(title?: string): string {
  const prefix = title
    ? title.substring(0, 10).toLowerCase().replace(/[^\w]/g, "_")
    : "journey";

  return `${prefix}_${nanoid(10)}`;
}
```

## Controller Implementation

The journey controller is implemented in `server/routes/journey/journey.controller.ts` with the following functions:

1. `createJourney`: Creates a new journey
2. `getJourneys`: Gets all journeys with pagination, filtering, and sorting
3. `getJourneyById`: Gets a journey by its ID
4. `getJourneyByUniqueId`: Gets a journey by its unique ID
5. `getJourneyBySlug`: Gets a journey by its slug
6. `getMyJourneys`: Gets journeys created by the current user
7. `updateJourney`: Updates a journey
8. `deleteJourney`: Deletes a journey

## Route Implementation

The journey routes are defined in `server/routes/journey/journey.route.ts` and handle all the API endpoints described above.

## Error Handling

All controller functions include proper error handling for negative scenarios:

- Not found errors return a 404 status code
- Unauthorized access returns a 401 status code
- Forbidden access returns a 403 status code
- Bad requests return a 400 status code

### API Response Type Pattern

To ensure proper type inference between the Hono backend and Next.js frontend, we use a discriminated union type for API responses:

```typescript
// Define a discriminated union type for API responses
export type ApiResponse<T> =
  | { success: true; message?: string; data: T; meta?: PaginationMeta }
  | { success: false; message: string; error?: string; statusCode?: number };
```

This pattern allows TypeScript to properly infer the response structure based on the `success` property:

```typescript
// In your API functions
if (!result.success) {
  // TypeScript knows that result.message exists and is a string
  throw new Error(result.message || "Default error message");
}

// TypeScript knows that result.data exists and is of type T
return result.data;
```

#### Implementation in Hono Backend

When returning responses from the Hono backend, always follow this pattern:

```typescript
// Success response
return c.json({
  success: true,
  message: "Operation successful",
  data: someData
});

// Error response
return c.json({
  success: false,
  message: "Operation failed",
  error: "Detailed error information"
}, ApiStatusCode.BAD_REQUEST);
```

#### Implementation in Next.js Frontend

When using the Hono client in the Next.js frontend, properly type the responses:

```typescript
import type { ApiResponse } from '@/types/api';

const response = await client.api.journey.$post({
  json: data,
});

const result = await response.json() as ApiResponse<YourDataType>;

if (!result.success) {
  throw new Error(result.message || "Default error message");
}

return result.data;
```

## Field Descriptions

- **buddyIds**: An array of user IDs representing registered users who are tagged as buddies for the journey. These users are part of the platform.
- **memberNames**: An array of plain text names representing people who are part of the journey but may not be registered on the platform.

## UI Integration Guidelines

When building the UI for journeys, consider the following:

1. **Journey Creation Form**:
   - Include all required fields: title, startDate, endDate, journeyType
   - Validate dates to ensure endDate is after startDate
   - Provide a dropdown for journeyType with all available options
   - Allow for optional fields like description, tags, location, etc.
   - Implement a user search/select component for buddyIds to tag registered users
   - Provide a text input field for memberNames to add non-registered participants

2. **Journey Listing**:
   - Implement pagination controls
   - Add filtering options for journeyType
   - Include a search box for title, description, and location
   - Add sorting options for different fields
   - Display journey cards with title, dates, and a brief description

3. **Journey Detail View**:
   - Show all journey details
   - Include edit and delete buttons for the journey creator
   - Display related data like activities, media, etc.
   - Show a list of buddies with their profile information
   - Display the list of non-registered members

4. **My Journeys View**:
   - Similar to the journey listing but filtered to the current user's journeys
   - Include creation date and last update date
   - Show journey status (draft, published, etc.)

5. **Journey Edit Form**:
   - Pre-populate the form with existing journey data
   - Allow updating any field
   - Validate changes before submission

## Data Fetching with TanStack Query

When implementing data fetching in the frontend, use TanStack Query for efficient caching and state management:

```typescript
// Example query key structure
export const journeyKeys = {
  all: ['journeys'] as const,
  lists: () => [...journeyKeys.all, 'list'] as const,
  list: (filters: JourneyFilters) => [...journeyKeys.lists(), filters] as const,
  details: () => [...journeyKeys.all, 'detail'] as const,
  detail: (id: string) => [...journeyKeys.details(), id] as const,
  unique: (uniqueId: string) => [...journeyKeys.details(), 'unique', uniqueId] as const,
  slug: (slug: string) => [...journeyKeys.details(), 'slug', slug] as const,
};

// Example query for fetching a journey by ID
const useJourney = (id: string) => {
  return useQuery({
    queryKey: journeyKeys.detail(id),
    queryFn: () => getJourneyById(id),
  });
};
```

## Security Considerations

1. **Authentication**: All mutation endpoints (create, update, delete) require authentication
2. **Authorization**: Users can only update or delete their own journeys unless they are admins
3. **Input Validation**: All input is validated using Zod schemas
4. **Error Handling**: Proper error messages are returned for all error cases

## Performance Considerations

1. **Pagination**: All list endpoints support pagination to limit the amount of data returned
2. **Filtering**: Filtering is done at the database level for efficiency
3. **Relations**: Only necessary relations are loaded to minimize data transfer
4. **Indexing**: The database schema includes indexes for commonly queried fields

## Future Enhancements

1. **Advanced Filtering**: Add more filtering options like date ranges, tags, etc.
2. **Full-Text Search**: Implement full-text search for better search results
3. **Sorting**: Add more sorting options
4. **Favorites/Bookmarks**: Allow users to bookmark journeys
5. **Sharing**: Add functionality to share journeys with specific users or groups
6. **Comments**: Add commenting functionality to journeys
7. **Media Management**: Add support for uploading and managing media files
8. **Activity Tracking**: Add support for tracking activities within a journey
9. **Export/Import**: Add functionality to export and import journeys
