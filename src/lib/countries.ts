/**
 * ISO 3166-1 alpha-2 → display name, for the codes the property actually sees.
 * Framework-free so it can be unit-tested and reused server-side.
 */
const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates',
  AU: 'Australia',
  BR: 'Brazil',
  CN: 'China',
  DE: 'Germany',
  EG: 'Egypt',
  ES: 'Spain',
  FR: 'France',
  GB: 'United Kingdom',
  GH: 'Ghana',
  IE: 'Ireland',
  IN: 'India',
  IT: 'Italy',
  JP: 'Japan',
  KR: 'South Korea',
  LB: 'Lebanon',
  MA: 'Morocco',
  RU: 'Russia',
  SE: 'Sweden',
  UA: 'Ukraine',
  US: 'United States',
};

export function countryName(code: string | undefined): string {
  if (!code) return '';
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}

/** Two-letter initials from a display name, e.g. 'Aisha Nour' → 'AN'. */
export function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}
