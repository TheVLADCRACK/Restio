import { z } from 'zod';
import { PhoneError, normalizePhone } from './phone';
import { countryCodeSchema } from './restaurant-input';

const personName = z.string().trim().min(1).max(80);
const phoneText = z.string().trim().min(1).max(40);

// Les numéros sans « + » sont lus avec `phoneCountry` ; téléphone et WhatsApp restent deux champs distincts.
export const profileInputSchema = z
  .object({
    firstName: personName,
    lastName: personName,
    phoneCountry: countryCodeSchema,
    phone: phoneText,
    whatsapp: phoneText,
  })
  .transform((v, ctx) => {
    const phoneE164 = tryNormalize(v.phone, v.phoneCountry);
    const whatsappE164 = tryNormalize(v.whatsapp, v.phoneCountry);
    if (!phoneE164) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'invalid_phone' });
    if (!whatsappE164) ctx.addIssue({ code: 'custom', path: ['whatsapp'], message: 'invalid_phone' });
    if (!phoneE164 || !whatsappE164) return z.NEVER;
    return { firstName: v.firstName, lastName: v.lastName, phoneE164, whatsappE164 };
  });

export type ProfileInput = z.input<typeof profileInputSchema>;
export type Profile = z.output<typeof profileInputSchema>;

function tryNormalize(input: string, country: string): string | null {
  try {
    return normalizePhone(input, country);
  } catch (e) {
    if (e instanceof PhoneError) return null;
    throw e;
  }
}
