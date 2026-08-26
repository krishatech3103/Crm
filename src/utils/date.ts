import { format, isToday, isPast, isFuture, parseISO, addHours, addDays, startOfDay, endOfDay } from 'date-fns';

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Not set';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return 'Not set';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

export type FollowUpCategory = 'overdue' | 'today' | 'upcoming' | 'none';

export function getFollowUpCategory(dateString?: string | null): FollowUpCategory {
  if (!dateString) return 'none';
  try {
    const date = parseISO(dateString);
    const now = new Date();
    
    // If it's today (regardless of exact hour)
    if (isToday(date)) {
      return 'today';
    }
    
    // If it's in the past (before start of today)
    if (isPast(date) && date < startOfDay(now)) {
      return 'overdue';
    }
    
    // If it's in the future (after end of today)
    if (isFuture(date) && date > endOfDay(now)) {
      return 'upcoming';
    }
    
    return 'today';
  } catch {
    return 'none';
  }
}

export function getPresetDateISO(key: 'later_today' | 'tomorrow' | 'in_2_days' | 'next_week'): string {
  const now = new Date();
  let targetDate: Date;
  
  switch (key) {
    case 'later_today':
      targetDate = addHours(now, 4);
      break;
    case 'tomorrow':
      targetDate = addDays(now, 1);
      targetDate.setHours(10, 0, 0, 0);
      break;
    case 'in_2_days':
      targetDate = addDays(now, 2);
      targetDate.setHours(10, 0, 0, 0);
      break;
    case 'next_week':
      targetDate = addDays(now, 7);
      targetDate.setHours(10, 0, 0, 0);
      break;
  }
  
  return targetDate.toISOString();
}

/**
 * Format ISO string suitable for datetime-local input fields (YYYY-MM-DDTHH:mm)
 */
export function toInputDateTimeLocal(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return '';
  }
}
