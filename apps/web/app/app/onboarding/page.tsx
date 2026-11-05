import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { redirect } from 'next/navigation';
import { defaultCurrencyFor } from '@restio/core';
import { requireUser } from '@/lib/auth/session';
import { suggestCountry } from '@/lib/geo';
import { getProfile, hasRestaurant } from '@/lib/onboarding/state';
import { ProfileStep } from './profile-step';
import { RestaurantStep } from './restaurant-step';

export const dynamic = 'force-dynamic';

// Étape décidée par le serveur à chaque visite : le restaurateur reprend là où il s'est arrêté.
export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ etape?: string | string[] }> }) {
  const { etape } = await searchParams;
  const user = await requireUser();
  if (await hasRestaurant(user.id)) redirect('/');

  const suggested = (await suggestCountry()) ?? undefined;
  const profile = await getProfile(user.id);
  if (!profile) return <ProfileStep suggestedCountry={suggested} />;
  if (etape === 'profil') {
    const phone = parsePhoneNumberFromString(profile.phoneE164);
    return <ProfileStep suggestedCountry={suggested} initial={{ firstName: profile.firstName, lastName: profile.lastName, phone: phone?.formatNational() ?? '', country: phone?.country ?? '' }} />;
  }

  return (
    <RestaurantStep
      suggestedCountry={suggested}
      suggestedCurrency={suggested ? defaultCurrencyFor(suggested) : undefined}
    />
  );
}
