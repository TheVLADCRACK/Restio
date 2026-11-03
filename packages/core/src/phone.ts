import { ParseError, getCountryCallingCode, isSupportedCountry, parsePhoneNumberWithError, type CountryCode } from 'libphonenumber-js';

export type PhoneErrorCode = 'invalid_country' | 'invalid_phone';

export class PhoneError extends Error {
  readonly code: PhoneErrorCode;
  constructor(code: PhoneErrorCode) {
    super(code);
    this.name = 'PhoneError';
    this.code = code;
  }
}

export const E164_RE = /^\+[1-9][0-9]{6,14}$/;
const MAX_PHONE_INPUT = 40;

export function toCountryCode(country: string): CountryCode {
  if (!isSupportedCountry(country)) throw new PhoneError('invalid_country');
  return country;
}

export function callingCodeFor(country: string): string {
  return getCountryCallingCode(toCountryCode(country));
}

// Un numéro saisi avec « + » garde son indicatif : le pays par défaut ne s'applique qu'aux numéros nationaux.
export function normalizePhone(input: string, defaultCountry: string): string {
  const defaultCode = toCountryCode(defaultCountry);
  const text = input.trim();
  if (text.length === 0 || text.length > MAX_PHONE_INPUT) throw new PhoneError('invalid_phone');
  let e164: string;
  try {
    const parsed = parsePhoneNumberWithError(text, { defaultCountry: defaultCode, extract: false });
    if (!parsed.isValid() || parsed.ext) throw new PhoneError('invalid_phone');
    e164 = parsed.number;
  } catch (e) {
    if (e instanceof ParseError) throw new PhoneError('invalid_phone');
    throw e;
  }
  if (!E164_RE.test(e164)) throw new PhoneError('invalid_phone');
  return e164;
}

export function isValidPhone(input: string, defaultCountry: string): boolean {
  try {
    normalizePhone(input, defaultCountry);
    return true;
  } catch (e) {
    if (e instanceof PhoneError) return false;
    throw e;
  }
}
