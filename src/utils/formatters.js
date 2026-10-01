/**
 * Formats time in seconds into MM:SS string
 * @param {number} totalSeconds 
 * @returns {string} e.g. "09:45"
 */
export function formatTimer(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats seconds into human-readable duration e.g. "4m 12s"
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0s';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/**
 * Formats ISO date string to clean readable date time
 */
export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return isoString;
  }
}

/**
 * Masks mobile number for privacy (e.g., +91 98****1234)
 */
export function maskMobile(mobile) {
  if (!mobile) return '***';
  const str = String(mobile).trim();
  if (str.length < 8) return '****';
  const prefix = str.slice(0, 3);
  const suffix = str.slice(-2);
  return `${prefix}****${suffix}`;
}
