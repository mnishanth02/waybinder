# Date Handling in WayBinder

This guide explains how to handle dates consistently throughout the WayBinder application.

## Overview

Date handling in web applications can be complex due to:

- Different timezones across users
- Various date formats and representations
- The need for consistent date calculations
- Specific requirements for displaying dates in the UI

WayBinder uses a unified approach to date handling through a comprehensive set of utility functions in `lib/utils/date-utils.ts`. This ensures consistent date handling across the application, with proper timezone support.

> **Important**:
>
> - The date utility functions use `date-fns` v4.x and `date-fns-tz` v3.x libraries. Make sure you're using the correct versions of these libraries in your project.
> - All date utility functions are consolidated in a single file: `lib/utils/date-utils.ts`.
> - Legacy files and redundant functions have been removed to simplify maintenance.

## Key Functions

### Timezone Handling

- `getUserTimeZone()`: Get the user's timezone from the browser
- `toUTC(date, sourceTimeZone)`: Convert a date to UTC, considering the source timezone
- `fromUTC(date, targetTimeZone)`: Convert a UTC date to a specific timezone

### Date Formatting

- `formatDate(date, formatStr, timeZone)`: Format a date with timezone awareness
- `formatDateForDisplay(date, formatStr)`: Format a date for display in a user-friendly format
- `formatDateRange(startDate, endDate)`: Format a date range for display
- `formatDateOnly(date)`: Format a date as YYYY-MM-DD for use with date-only fields

### Date Parsing

- `parseDate(dateStr)`: Parse a date string to a Date object
- `normalizeDate(dateStr)`: Normalize a date string to ISO format (YYYY-MM-DD)
- `formatToISOString(date)`: Ensure a date is in ISO format
- `parseDateToUTC(dateStr, timeZone)`: Parse a date string and convert it to UTC

### Date Calculations

- `calculateDayNumber(activityDate, journeyStartDate)`: Calculate the day number for an activity based on the journey start date
- `prepareDayNumber(activityDate, journeyStartDate)`: Calculate and prepare day number for an activity
- `isDateWithinRange(date, startDate, endDate)`: Check if a date is within a date range
- `calculateDaysBetween(startDate, endDate)`: Calculate the number of days between two dates (inclusive)
- `generateDateRange(startDate, endDate)`: Generate an array of dates between start and end dates
- `getStartOfDayUTC(date, timeZone)`: Get start of day in UTC for a given local date
- `getEndOfDayUTC(date, timeZone)`: Get end of day in UTC for a given local date

### Sorting

- `sortActivitiesByDateAndTime(activities)`: Sort activities by date and start time

### Day Labels Generation

- `generateDayLabels(startDate, endDate)`: Generate day labels for a journey

## Database Schema

Date fields in the database schema use either `date` or `timestamp with timezone` type depending on whether time information is needed:

- In the `journeys` table:
  - `startDate` and `endDate` are stored as `date` (without time component)
  - `createdAt`, `updatedAt`, and `publishedAt` are stored as `timestamp with timezone`

- In the `activities` table:
  - `activityDate` is stored as `date` (without time component)
  - `startTime` and `endTime` are stored as `timestamp with timezone` (for time information extracted from GPX files)
  - `createdAt` and `updatedAt` are stored as `timestamp with timezone`

- In the `athleteProfiles` table:
  - `dateOfBirth` is stored as `date`
  - `createdAt` and `updatedAt` are stored as `timestamp with timezone`

The `activities` table includes a `dayNumber` field that stores the calculated day number for each activity. This field is automatically calculated when creating or updating activities, based on the activity date and the journey start date.

## Migration

The database schema has been updated to use `date` type for fields that don't need time components:

- In the `journeys` table, `startDate` and `endDate` fields are now `date` type instead of `timestamp with timezone`
- In the `activities` table, `activityDate` field is now `date` type instead of `timestamp with timezone`

This change simplifies date handling in the application, as we don't need to worry about time components for these fields. The `startTime` and `endTime` fields in the `activities` table remain as `timestamp with timezone` to store time information extracted from GPX files.

## Best Practices

1. **Always use the date utility functions** for date operations, rather than implementing your own date logic.
2. **Store dates in UTC format** in the database.
3. **Display dates in the user's timezone** in the UI.
4. **Use the `dayNumber` field** for sorting and grouping activities, rather than calculating it on the fly.
5. **Validate date ranges** when creating or updating activities to ensure they fall within the journey's date range.
6. **Format dates consistently** using the provided utility functions.
7. **Use `formatDateOnly()` instead of `toISOString()`** when submitting date-only fields to the server to prevent timezone-related date shifts.

## Example Usage

### In React Components

```tsx
import {
  formatDateForDisplay,
  formatDateRange,
  formatDateOnly,
  isDateWithinRange,
  getUserTimeZone,
  fromUTC
} from "@/lib/utils/date-utils";

// Format a date for display
const formattedDate = formatDateForDisplay(activity.activityDate);

// Format a date range
const dateRangeText = formatDateRange(journey.startDate, journey.endDate);

// Format a date as YYYY-MM-DD for date-only fields
const dateOnlyStr = formatDateOnly(selectedDate);

// Check if a date is within a range
if (!isDateWithinRange(activityDate, journey.startDate, journey.endDate)) {
  toast.error("Activity date must be within journey dates");
  return;
}

// Get user's timezone
const userTimeZone = getUserTimeZone();

// Convert UTC date to user's timezone for display
const localDate = fromUTC(utcDate, userTimeZone);

// IMPORTANT: When submitting form data with dates to the server,
// use formatDateOnly to prevent timezone-related date shifts
const handleSubmit = (data) => {
  const formattedData = {
    ...data,
    startDate: formatDateOnly(data.startDate),
    endDate: formatDateOnly(data.endDate),
  };

  // Send formattedData to the server
  createJourney(formattedData);
};
```

### In API Controllers

```tsx
import {
  prepareDayNumber,
  formatDateOnly,
  isDateWithinRange
} from "@/lib/utils/date-utils";

// Calculate day number when creating an activity
const dayNumber = prepareDayNumber(body.activityDate, journey.startDate);

// Validate date range
if (!isDateWithinRange(body.activityDate, journey.startDate, journey.endDate)) {
  return {
    success: false,
    message: "Invalid activity date",
    error: "Activity date must be within the journey date range",
    statusCode: ApiStatusCode.BAD_REQUEST,
  };
}

const newActivity = {
  ...body,
  journeyId: journey.id,
  dayNumber,
};

// For date-only fields, format the date as YYYY-MM-DD
const formattedDate = formatDateOnly(new Date(date));

// Query activities for a specific date
const activities = await db.query.activities.findMany({
  where: and(
    eq(activities.journeyId, journeyId),
    eq(activities.activityDate, formattedDate)
  )
});
```

### In Database Queries

```tsx
import { sortActivitiesByDateAndTime } from "@/lib/utils/date-utils";

// Sort activities by day number and start time
const activityList = await db.query.activities.findMany({
  where: whereClause,
  orderBy: [
    asc(activities.dayNumber),
    asc(activities.startTime),
  ],
});

// Or sort activities after fetching
const sortedActivities = sortActivitiesByDateAndTime(activityList);
```

### Working with Date Ranges

```tsx
import {
  generateDateRange,
  generateDayLabels,
  calculateDaysBetween
} from "@/lib/utils/date-utils";

// Generate an array of dates between start and end dates
const dateRange = generateDateRange(journey.startDate, journey.endDate);

// Generate day labels for a journey
const dayLabels = generateDayLabels(journey.startDate, journey.endDate);
// Result: [{ dayNumber: 1, date: "2023-04-01", formattedDate: "Sat, Apr 1, 2023" }, ...]

// Calculate the number of days in a journey
const totalDays = calculateDaysBetween(journey.startDate, journey.endDate);
```

## Common Scenarios in WayBinder

### Activity Day Number Calculation

When an activity is created or updated, we need to calculate which day of the journey it belongs to:

```tsx
// In activity.controller.ts
import { prepareDayNumber, isDateWithinRange } from "@/lib/utils/date-utils";

// Validate that the activity date is within the journey date range
if (!isDateWithinRange(body.activityDate, journey.startDate, journey.endDate)) {
  return {
    success: false,
    message: "Invalid activity date",
    error: "Activity date must be within the journey date range",
    statusCode: ApiStatusCode.BAD_REQUEST,
  };
}

// When creating an activity
const dayNumber = prepareDayNumber(body.activityDate, journey.startDate);

// Add the day number to the activity data
const newActivity = {
  ...body,
  journeyId: journey.id,
  dayNumber,
};
```

### Displaying Activities by Day

When displaying activities in a journey, we group them by day number and sort them by start time:

```tsx
// In days-activities-accordion.tsx
import { sortActivitiesByDateAndTime } from "@/lib/utils/date-utils";

// Group activities by day number
const activitiesByDay: Record<number, ActivityTypeSelect[]> = {};

// Process each activity
for (const activity of activities) {
  const dayNum = activity.dayNumber || getDayNumber(activity);

  if (!activitiesByDay[dayNum]) {
    activitiesByDay[dayNum] = [];
  }

  activitiesByDay[dayNum]?.push(activity);
}

// Sort activities within each day by start time
Object.keys(activitiesByDay).forEach((dayKey) => {
  const dayNum = parseInt(dayKey);
  if (activitiesByDay[dayNum]) {
    activitiesByDay[dayNum] = sortActivitiesByDateAndTime(activitiesByDay[dayNum] || []);
  }
});
```

### Date Range Validation

When creating or updating an activity, we need to validate that the activity date is within the journey's date range:

```tsx
// In activity-client.tsx
import { isDateWithinRange, formatDateForDisplay } from "@/lib/utils/date-utils";

// Validate that the activity date is within the journey date range
if (journey.startDate && journey.endDate) {
  if (!isDateWithinRange(data.activityDate, journey.startDate, journey.endDate)) {
    toast.error(
      `Activity date must be between ${formatDateForDisplay(journey.startDate)} and ${formatDateForDisplay(journey.endDate)}`
    );
    return;
  }
}
```

## Troubleshooting

### Common Issues

1. **Date parsing errors**: Ensure that dates are in a consistent format before parsing. Use `parseDate` or `parseISO` to parse date strings.

2. **Timezone issues**: Always be explicit about timezones when converting dates. Use `toUTC` and `fromUTC` to convert between timezones.

3. **Date comparison issues**: Use `isDateWithinRange` for date range validation to avoid timezone-related comparison issues.

4. **Day number calculation issues**: Use `prepareDayNumber` to calculate day numbers consistently.

5. **Date shifting when submitting forms**: When submitting dates from forms, avoid using `toISOString()` directly on Date objects as it can cause timezone-related date shifts. Instead, use `formatDateOnly()` to convert dates to YYYY-MM-DD format without timezone information.

### Timezone-Related Date Shifting

A common issue occurs when dates are selected in one timezone (e.g., India/UTC+5:30) but displayed as one day earlier. This happens because:

1. When a user selects a date (e.g., April 1st) in a date picker, a JavaScript Date object is created with that date in the local timezone.
2. If `toISOString()` is called on this Date object, it converts the date to UTC, which can shift the date backward by one day if the local time is before the UTC offset (e.g., before 5:30 AM in India).
3. When the date is stored in the database as a date-only field, the time component is truncated, resulting in the previous day's date.

**Solution:**

- Use `formatDateOnly(date)` instead of `date.toISOString()` when sending dates to the server.
- This preserves the date as selected by the user without timezone conversion.

**Example Fix:**

```tsx
// INCORRECT - May cause timezone issues
const formattedData = {
  ...data,
  startDate: data.startDate.toISOString(),
  endDate: data.endDate.toISOString(),
};

// CORRECT - Preserves the selected date regardless of timezone
const formattedData = {
  ...data,
  startDate: formatDateOnly(data.startDate),
  endDate: formatDateOnly(data.endDate),
};
```

### Debugging Tips

1. Use `console.log` to inspect date objects and their string representations.
2. Check the timezone of date objects using `getUserTimeZone()`.
3. Verify that dates are being stored in UTC format in the database.
4. Use browser developer tools to inspect date objects in the UI.
5. Compare dates before and after conversion to identify potential timezone shifts.

## Conclusion

By following these guidelines and using the provided utility functions, you can ensure consistent date handling throughout the WayBinder application. This will help avoid common date-related issues and provide a better user experience.
