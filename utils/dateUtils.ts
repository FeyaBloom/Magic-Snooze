/**
 * Utility functions for date manipulation and formatting
 */

/**
 * Converts a Date to YYYY-MM-DD string format in local timezone
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets the previous day as YYYY-MM-DD string
 */
export const getPreviousDay = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return getLocalDateString(date);
};

/**
 * Gets the next day as YYYY-MM-DD string
 */
export const getNextDay = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return getLocalDateString(date);
};

/**
 * Formats a date string or Date object to localized format
 */
export const formatDate = (
  dateInput: string | Date,
  locale: string = 'en'
): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a timestamp to localized date and time
 */
export const formatDateTime = (timestamp: number, locale: string = 'en'): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
