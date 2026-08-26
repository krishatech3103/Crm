/**
 * Phone number normalization utilities for WhatsApp and Direct Calls
 */

export function normalizePhoneNumber(phone: string): string {
  // Extract digits only for duplicate checking and comparisons
  const digits = phone.replace(/\D/g, '');
  // If 10 digits, assume standard national 10-digit number
  if (digits.length === 10) {
    return digits;
  }
  // If 12 digits starting with 91, extract last 10 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.substring(2);
  }
  return digits;
}

export function normalizePhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Handle default country code (e.g., India +91 if 10 digits starting with 6-9)
  if (digits.length === 10) {
    digits = '91' + digits;
  }
  
  return digits;
}

export function getWhatsAppUrl(phone: string, text?: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  let url = `https://wa.me/${normalized}`;
  if (text) {
    url += `?text=${encodeURIComponent(text)}`;
  }
  return url;
}

export function getTelUrl(phone: string): string {
  const clean = phone.replace(/[^\d+]/g, '');
  return `tel:${clean}`;
}

export function formatPhoneNumber(phone: string): string {
  const clean = phone.trim();
  return clean;
}
