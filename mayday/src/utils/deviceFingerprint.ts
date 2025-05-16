// Generate a fingerprint of the current device
export const generateDeviceFingerprint = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Collect stable device information
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const vendor = navigator.vendor;
  
  // Combine the data into a single string
  const rawFingerprint = [
    userAgent,
    platform,
    language,
    timezone,
    vendor
  ].join('|');
  
  // Create a hash of the fingerprint for storage
  return hashString(rawFingerprint);
};

// Compare the current device fingerprint with a stored one
export const matchesDeviceFingerprint = (storedFingerprint: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const currentFingerprint = generateDeviceFingerprint();
  return currentFingerprint === storedFingerprint;
};

// Simple hash function for the fingerprint
// This is not cryptographically secure, but adequate for our use case
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16); // Convert to hex
}; 