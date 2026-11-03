// Devises par défaut des marchés prioritaires ; ailleurs, le restaurateur choisit lui-même.
const XAF = ['CM', 'GA', 'CG', 'CF', 'TD', 'GQ'];
const XOF = ['SN', 'CI', 'BJ', 'BF', 'ML', 'NE', 'TG', 'GW'];
const EUR = ['FR', 'BE', 'LU', 'DE', 'ES', 'IT', 'PT', 'NL', 'AT', 'IE', 'FI', 'GR', 'MC', 'RE', 'GP', 'MQ', 'GF', 'YT'];
const OTHER: Record<string, string> = {
  US: 'USD', CA: 'CAD', GB: 'GBP', CH: 'CHF', MA: 'MAD', DZ: 'DZD', TN: 'TND', CD: 'CDF', GN: 'GNF', MG: 'MGA',
  RW: 'RWF', BI: 'BIF', DJ: 'DJF', KM: 'KMF', MR: 'MRU', NG: 'NGN', GH: 'GHS', KE: 'KES', HT: 'HTG',
};

export function defaultCurrencyFor(country: string): string | undefined {
  const c = country.toUpperCase();
  if (XAF.includes(c)) return 'XAF';
  if (XOF.includes(c)) return 'XOF';
  if (EUR.includes(c)) return 'EUR';
  return OTHER[c];
}

// Accepte aussi les anciens noms encore reconnus (ex. « Asia/Calcutta »), comme Postgres.
// Pays à fuseau unique des marchés prioritaires : le restaurant peut être configuré depuis l'étranger.
const SINGLE_TIME_ZONE: Record<string, string> = {
  CM: 'Africa/Douala', GA: 'Africa/Libreville', CG: 'Africa/Brazzaville', CF: 'Africa/Bangui', TD: 'Africa/Ndjamena', GQ: 'Africa/Malabo',
  SN: 'Africa/Dakar', CI: 'Africa/Abidjan', BJ: 'Africa/Porto-Novo', BF: 'Africa/Ouagadougou', ML: 'Africa/Bamako', NE: 'Africa/Niamey',
  TG: 'Africa/Lome', GW: 'Africa/Bissau', GN: 'Africa/Conakry', MA: 'Africa/Casablanca', DZ: 'Africa/Algiers', TN: 'Africa/Tunis',
  NG: 'Africa/Lagos', GH: 'Africa/Accra', KE: 'Africa/Nairobi', RW: 'Africa/Kigali', BI: 'Africa/Bujumbura', MG: 'Indian/Antananarivo',
  FR: 'Europe/Paris', BE: 'Europe/Brussels', CH: 'Europe/Zurich', LU: 'Europe/Luxembourg', MC: 'Europe/Monaco', GB: 'Europe/London',
  DE: 'Europe/Berlin', IT: 'Europe/Rome', NL: 'Europe/Amsterdam', IE: 'Europe/Dublin', HT: 'America/Port-au-Prince',
};

/** Fuseau du pays s'il est unique ; sinon undefined (le navigateur ou le restaurateur décide). */
export function defaultTimeZoneFor(country: string): string | undefined {
  return SINGLE_TIME_ZONE[country.toUpperCase()];
}

export function isValidTimeZone(tz: string): boolean {
  if (!/^[A-Za-z0-9_+\-/]{1,64}$/.test(tz)) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
