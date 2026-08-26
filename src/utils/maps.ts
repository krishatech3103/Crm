/**
 * Generate Google Maps search URL from an address safely
 */
export function getGoogleMapsUrl(address: string): string {
  if (!address || !address.trim()) return '#';
  const query = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Validate and clean external URLs (GBP, Instagram, Website)
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url) return '';
  let cleanUrl = url.trim();
  if (!cleanUrl) return '';
  
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }
  return cleanUrl;
}
