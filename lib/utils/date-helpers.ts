import { differenceInDays, isValid, parseISO } from "date-fns";

/**
 * Calculate the day number for an activity based on the journey start date
 * @param activityDate The date of the activity (YYYY-MM-DD format)
 * @param journeyStartDate The start date of the journey (YYYY-MM-DD format)
 * @returns The day number (1-based) or null if dates are invalid
 */
export function calculateDayNumber(activityDate: string, journeyStartDate: string): number | null {
  if (
    typeof activityDate !== "string" ||
    typeof journeyStartDate !== "string" ||
    !activityDate.trim() ||
    !journeyStartDate.trim()
  ) {
    return null;
  }

  try {
    const activityDateObj = parseISO(activityDate);
    const journeyStartDateObj = parseISO(journeyStartDate);

    if (!isValid(activityDateObj) || !isValid(journeyStartDateObj)) {
      return null;
    }

    // Calculate the difference in days and add 1 (day 1 is the start date)
    const dayNumber = differenceInDays(activityDateObj, journeyStartDateObj) + 1;

    // Return null if the activity date is before the journey start date
    if (dayNumber < 1) {
      return null;
    }

    return dayNumber;
  } catch (error) {
    console.error("Error calculating day number:", error);
    return null;
  }
}

/**
 * Validate if a date is within the journey date range
 * @param date The date to validate (YYYY-MM-DD format)
 * @param startDate The journey start date (YYYY-MM-DD format)
 * @param endDate The journey end date (YYYY-MM-DD format)
 * @returns True if the date is within range, false otherwise
 */
export function isDateWithinJourneyRange(
  date: string,
  startDate: string,
  endDate: string
): boolean {
  try {
    const dateObj = parseISO(date);
    const startDateObj = parseISO(startDate);
    const endDateObj = parseISO(endDate);

    if (!isValid(dateObj) || !isValid(startDateObj) || !isValid(endDateObj)) {
      return false;
    }

    return dateObj >= startDateObj && dateObj <= endDateObj;
  } catch (error) {
    console.error("Error validating date range:", error);
    return false;
  }
}

/**
 * Format a date string for display
 * @param dateString The date string to format (YYYY-MM-DD format)
 * @param fallback Optional fallback text if date is invalid
 * @returns Formatted date string or fallback text
 */
export function formatDateString(dateString: string, fallback = "Invalid date"): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return fallback;
    }

    // Format: "Mon, Apr 28, 2023"
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return fallback;
  }
}
