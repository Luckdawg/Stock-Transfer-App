/**
 * Safely format a date value to a localized date string.
 * Handles Date objects, strings, numbers, and null/undefined values.
 * This prevents React error #31 when rendering Date objects directly.
 */
export function formatDate(value: unknown, fallback = '-'): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  // If it's already a string, return it (might be pre-formatted)
  if (typeof value === 'string') {
    // Check if it's a valid date string
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    return value || fallback;
  }
  
  // If it's a Date object
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) {
      return value.toLocaleDateString();
    }
    return fallback;
  }
  
  // If it's a number (timestamp)
  if (typeof value === 'number') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    return fallback;
  }
  
  // For any other type, try to convert to string
  return String(value) || fallback;
}

/**
 * Safely format a date value to a localized date and time string.
 */
export function formatDateTime(value: unknown, fallback = '-'): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString();
    }
    return value || fallback;
  }
  
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) {
      return value.toLocaleString();
    }
    return fallback;
  }
  
  if (typeof value === 'number') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString();
    }
    return fallback;
  }
  
  return String(value) || fallback;
}
