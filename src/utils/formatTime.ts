/**
 * Formats a timestamp into a human-readable relative time string
 * like "2 minutes ago", "1 hour ago", "3 days ago", etc.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const secondsAgo = Math.floor((now - timestamp) / 1000);
  
  // Less than a minute
  if (secondsAgo < 60) {
    return secondsAgo <= 1 ? 'just now' : `${secondsAgo} seconds ago`;
  }
  
  // Less than an hour
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return minutesAgo === 1 ? 'a minute ago' : `${minutesAgo} minutes ago`;
  }
  
  // Less than a day
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return hoursAgo === 1 ? 'an hour ago' : `${hoursAgo} hours ago`;
  }
  
  // Less than a week
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) {
    return daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`;
  }
  
  // Less than a month (assuming 30 days)
  if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7);
    return weeksAgo === 1 ? 'a week ago' : `${weeksAgo} weeks ago`;
  }
  
  // Less than a year
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return monthsAgo === 1 ? 'a month ago' : `${monthsAgo} months ago`;
  }
  
  // More than a year
  const yearsAgo = Math.floor(monthsAgo / 12);
  return yearsAgo === 1 ? 'a year ago' : `${yearsAgo} years ago`;
}

/**
 * Formats a timestamp as a full date string
 */
export function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 