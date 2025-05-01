/**
 * Unified date utility functions for WayBinder
 *
 * This file provides a comprehensive set of date utility functions
 * with proper timezone handling using date-fns and date-fns-tz.
 *
 * All date-related operations should use these functions to ensure
 * consistent date handling across the application.
 */

import {
  addDays,
  differenceInDays,
  endOfDay,
  format as formatDateFns,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

// ===== Timezone Utilities =====

/**
 * Get the user's timezone from the browser
 * @returns The user's timezone (e.g., "America/New_York")
 */
export const getUserTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convert a date to UTC, considering the source timezone
 * @param date Date to convert
 * @param sourceTimeZone Source timezone (defaults to user's timezone)
 * @returns Date in UTC
 */
export const toUTC = (date: Date | string, sourceTimeZone: string = getUserTimeZone()): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return fromZonedTime(dateObj, sourceTimeZone);
};

/**
 * Convert a UTC date to a specific timezone
 * @param date UTC date to convert
 * @param targetTimeZone Target timezone (defaults to user's timezone)
 * @returns Date in the target timezone
 */
export const fromUTC = (date: Date | string, targetTimeZone: string = getUserTimeZone()): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return toZonedTime(dateObj, targetTimeZone);
};

// ===== Date Formatting =====

/**
 * Format a date with timezone awareness
 * @param date Date to format
 * @param formatStr Format string (default: "yyyy-MM-dd")
 * @param timeZone Timezone (default: user's timezone)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  formatStr = "yyyy-MM-dd",
  timeZone: string = getUserTimeZone()
): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      console.warn("Invalid date provided to formatDate:", date);
      return "";
    }

    return formatInTimeZone(dateObj, timeZone, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Format a date for display in a user-friendly format
 * @param date Date to format
 * @param formatStr Format string (default: "MMM d, yyyy")
 * @returns Formatted date string
 */
export const formatDateForDisplay = (date: Date | string, formatStr = "MMM d, yyyy"): string => {
  return formatDate(date, formatStr);
};

/**
 * Format a date range for display
 * @param startDate Start date
 * @param endDate End date
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
  if (!startDate || !endDate) return "";

  try {
    const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    if (!isValid(start) || !isValid(end)) {
      return "";
    }

    // If same year, only show year once
    if (start.getFullYear() === end.getFullYear()) {
      return `${formatDate(start, "MMM d")} - ${formatDate(end, "MMM d, yyyy")}`;
    }

    return `${formatDate(start, "MMM d, yyyy")} - ${formatDate(end, "MMM d, yyyy")}`;
  } catch (error) {
    console.error("Error formatting date range:", error);
    return "";
  }
};

// ===== Date Parsing =====

/**
 * Parse a date string to a Date object
 * @param dateStr Date string to parse
 * @returns Parsed Date object or null if invalid
 */
export const parseDate = (dateStr: string): Date | null => {
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};

/**
 * Normalize a date string to ISO format (YYYY-MM-DD)
 * @param dateStr Date string to normalize
 * @returns Normalized date string or empty string if invalid
 */
export const normalizeDate = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? formatDateFns(date, "yyyy-MM-dd") : "";
  } catch (error) {
    console.error("Error normalizing date:", error);
    return "";
  }
};

/**
 * Ensure a date is in ISO format
 * @param date Date to format
 * @returns ISO formatted date string
 */
export const formatToISOString = (date: Date | string | unknown): string => {
  if (date instanceof Date) {
    return date.toISOString();
  }

  if (typeof date === "string") {
    try {
      const parsedDate = parseISO(date);
      if (isValid(parsedDate)) {
        return parsedDate.toISOString();
      }
      return date;
    } catch (_) {
      return date;
    }
  }

  return new Date().toISOString();
};

/**
 * Parse a date string and convert it to UTC
 * @param dateStr Date string to parse
 * @param timeZone Source timezone (defaults to user's timezone)
 * @returns UTC date string in ISO format
 */
export const parseDateToUTC = (dateStr: string, timeZone: string = getUserTimeZone()): string => {
  try {
    const localDate = parseISO(dateStr);
    const utcDate = toUTC(localDate, timeZone);
    return utcDate.toISOString();
  } catch (error) {
    console.error("Error parsing date to UTC:", error);
    return new Date().toISOString();
  }
};

// ===== Date Calculations =====

/**
 * Calculate the day number for an activity based on the journey start date
 * @param activityDate The date of the activity
 * @param journeyStartDate The start date of the journey
 * @returns The day number (1-based) or null if dates are invalid
 */
export const calculateDayNumber = (
  activityDate: string | Date,
  journeyStartDate: string | Date
): number | null => {
  if (!activityDate || !journeyStartDate) {
    return null;
  }

  try {
    // Parse dates
    const activityDateObj =
      typeof activityDate === "string" ? parseISO(activityDate) : activityDate;
    const journeyStartDateObj =
      typeof journeyStartDate === "string" ? parseISO(journeyStartDate) : journeyStartDate;

    if (!isValid(activityDateObj) || !isValid(journeyStartDateObj)) {
      return null;
    }

    // For date-only fields, we don't need to normalize to start of day
    // as they already don't have time components

    // Calculate difference in days
    const diffDays = differenceInDays(activityDateObj, journeyStartDateObj);
    const dayNumber = diffDays + 1; // Day 1 is the start date

    // Return null if the activity date is before the journey start date
    if (dayNumber < 1) {
      return null;
    }

    return dayNumber;
  } catch (error) {
    console.error("Error calculating day number:", error);
    return null;
  }
};

/**
 * Calculate and prepare day number for an activity
 * This function is used when creating or updating activities
 * @param activityDate The activity date
 * @param journeyStartDate The journey start date
 * @returns The calculated day number or undefined if calculation fails
 */
export const prepareDayNumber = (
  activityDate: string | Date,
  journeyStartDate: string | Date
): number | undefined => {
  const dayNumber = calculateDayNumber(activityDate, journeyStartDate);
  return dayNumber !== null ? dayNumber : undefined;
};

/**
 * Check if a date is within a date range
 * @param date Date to check
 * @param startDate Start date of range
 * @param endDate End date of range
 * @returns True if date is within range, false otherwise
 */
export const isDateWithinRange = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const startDateObj = typeof startDate === "string" ? parseISO(startDate) : startDate;
    const endDateObj = typeof endDate === "string" ? parseISO(endDate) : endDate;

    if (!isValid(dateObj) || !isValid(startDateObj) || !isValid(endDateObj)) {
      return false;
    }

    // For date-only fields, we don't need to normalize to start/end of day
    // as they already don't have time components
    // Just compare the dates directly
    return dateObj >= startDateObj && dateObj <= endDateObj;
  } catch (error) {
    console.error("Error checking date range:", error);
    return false;
  }
};

/**
 * Calculate the number of days between two dates (inclusive)
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days or 0 if dates are invalid
 */
export const calculateDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  try {
    const startDateObj = typeof startDate === "string" ? parseISO(startDate) : startDate;
    const endDateObj = typeof endDate === "string" ? parseISO(endDate) : endDate;

    if (!isValid(startDateObj) || !isValid(endDateObj)) {
      return 0;
    }

    // Add 1 to include both start and end dates
    return differenceInDays(endDateObj, startDateObj) + 1;
  } catch (error) {
    console.error("Error calculating days between:", error);
    return 0;
  }
};

/**
 * Generate an array of dates between start and end dates
 * @param startDate Start date
 * @param endDate End date
 * @returns Array of dates
 */
export const generateDateRange = (startDate: string | Date, endDate: string | Date): Date[] => {
  try {
    const startDateObj = typeof startDate === "string" ? parseISO(startDate) : startDate;
    const endDateObj = typeof endDate === "string" ? parseISO(endDate) : endDate;

    if (!isValid(startDateObj) || !isValid(endDateObj)) {
      return [];
    }

    const dates: Date[] = [];
    let currentDate = startOfDay(startDateObj);
    const lastDate = startOfDay(endDateObj);

    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  } catch (error) {
    console.error("Error generating date range:", error);
    return [];
  }
};

/**
 * Format a date as YYYY-MM-DD for use with date-only fields
 * @param date Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateOnly = (date: Date | string): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDateFns(dateObj, "yyyy-MM-dd");
  } catch (error) {
    console.error("Error formatting date-only:", error);
    return formatDateFns(new Date(), "yyyy-MM-dd");
  }
};

/**
 * Get start of day in UTC for a given local date
 * @param date Date to convert
 * @param timeZone Source timezone (defaults to user's timezone)
 * @returns Start of day in UTC
 */
export const getStartOfDayUTC = (
  date: Date | string,
  timeZone: string = getUserTimeZone()
): Date => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const localStartOfDay = startOfDay(dateObj);
    return toUTC(localStartOfDay, timeZone);
  } catch (error) {
    console.error("Error getting start of day UTC:", error);
    return new Date();
  }
};

/**
 * Get end of day in UTC for a given local date
 * @param date Date to convert
 * @param timeZone Source timezone (defaults to user's timezone)
 * @returns End of day in UTC
 */
export const getEndOfDayUTC = (date: Date | string, timeZone: string = getUserTimeZone()): Date => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const localEndOfDay = endOfDay(dateObj);
    return toUTC(localEndOfDay, timeZone);
  } catch (error) {
    console.error("Error getting end of day UTC:", error);
    return new Date();
  }
};

// ===== Sorting =====

/**
 * Sort activities by date and start time
 * @param activities Array of activities to sort
 * @returns Sorted array of activities
 */
export const sortActivitiesByDateAndTime = <
  T extends { activityDate: string | Date; startTime?: Date | string | null },
>(
  activities: T[]
): T[] => {
  return [...activities].sort((a, b) => {
    // Convert dates to comparable format
    const aDate =
      typeof a.activityDate === "string" ? a.activityDate : a.activityDate.toISOString();
    const bDate =
      typeof b.activityDate === "string" ? b.activityDate : b.activityDate.toISOString();

    // First sort by activity date
    const dateComparison = aDate.localeCompare(bDate);
    if (dateComparison !== 0) return dateComparison;

    // If dates are the same, sort by start time if available
    if (a.startTime && b.startTime) {
      const aTime = new Date(a.startTime).getTime();
      const bTime = new Date(b.startTime).getTime();
      return aTime - bTime;
    }

    // If only one has start time, prioritize it
    if (a.startTime) return -1;
    if (b.startTime) return 1;

    // If neither has start time, they're considered equal in terms of time
    return 0;
  });
};

// ===== Day Labels Generation =====

/**
 * Generate day labels for a journey
 * @param startDate Journey start date
 * @param endDate Journey end date
 * @returns Array of day labels with day number, date, and formatted date
 */
export const generateDayLabels = (
  startDate: string | Date,
  endDate: string | Date
): Array<{ dayNumber: number; date: string; formattedDate: string }> => {
  try {
    const startDateObj = typeof startDate === "string" ? parseISO(startDate) : startDate;
    const endDateObj = typeof endDate === "string" ? parseISO(endDate) : endDate;

    if (!isValid(startDateObj) || !isValid(endDateObj)) {
      return [];
    }

    const dateRange = generateDateRange(startDateObj, endDateObj);

    return dateRange.map((date, index) => ({
      dayNumber: index + 1,
      date: formatDateFns(date, "yyyy-MM-dd"),
      formattedDate: formatDateFns(date, "EEE, MMM d, yyyy"),
    }));
  } catch (error) {
    console.error("Error generating day labels:", error);
    return [];
  }
};

// No additional functions needed - all redundant functions removed
