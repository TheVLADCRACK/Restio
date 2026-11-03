import { describe, it, expect } from 'vitest';
import { profileInputSchema } from './profile-input';

const valid = { firstName: 'Awa', lastName: 'Ndiaye', phoneCountry: 'CM', phone: '6 71 23 45 67', whatsapp: '+33 6 12 34 56 78' };

describe('profileInputSchema', () => {
  it('normalises names and both phone numbers to E.164', () => {
    const r = profileInputSchema.safeParse({ ...valid, firstName: '  Awa ', phoneCountry: 'cm' });
    expect(r.success && r.data).toEqual({
      firstName: 'Awa',
      lastName: 'Ndiaye',
      phoneE164: '+237671234567',
      whatsappE164: '+33612345678',
    });
  });

  it('keeps phone and WhatsApp as separate values even when identical', () => {
    const r = profileInputSchema.safeParse({ ...valid, whatsapp: valid.phone });
    expect(r.success && r.data.phoneE164).toBe('+237671234567');
    expect(r.success && r.data.whatsappE164).toBe('+237671234567');
  });

  it('reports invalid numbers on the right field', () => {
    const r = profileInputSchema.safeParse({ ...valid, whatsapp: '123' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path.join('.'))).toEqual(['whatsapp']);
  });

  it('enforces name lengths', () => {
    expect(profileInputSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false);
    expect(profileInputSchema.safeParse({ ...valid, lastName: '   ' }).success).toBe(false);
    expect(profileInputSchema.safeParse({ ...valid, lastName: 'x'.repeat(81) }).success).toBe(false);
    expect(profileInputSchema.safeParse({ ...valid, lastName: 'x'.repeat(80) }).success).toBe(true);
  });

  it('rejects oversized or malicious phone input', () => {
    expect(profileInputSchema.safeParse({ ...valid, phone: '6'.repeat(100_000) }).success).toBe(false);
    expect(profileInputSchema.safeParse({ ...valid, phone: '<script>alert(1)</script>' }).success).toBe(false);
    expect(profileInputSchema.safeParse({ ...valid, phoneCountry: 'ZZ' }).success).toBe(false);
  });
});
