import { getLocale, getTranslations } from 'next-intl/server';
import { countryOptions, pick } from './_components/options';
import { OnboardingFrame } from './_components/onboarding-frame';
import { ProfileForm } from './_components/profile-form';

export async function ProfileStep({ suggestedCountry, initial }: { suggestedCountry?: string; initial?: { firstName: string; lastName: string; phone: string; country: string } }) {
  const t = await getTranslations('onboarding');
  const countries = countryOptions(await getLocale());
  return (
    <OnboardingFrame step={1} label={t('stepYou')} back="/auth/sign-in" title={t('profile.title')} description={t('profile.description')}>
      <ProfileForm countries={countries} initialCountry={initial?.country || pick(suggestedCountry, countries)} initial={initial} />
    </OnboardingFrame>
  );
}
