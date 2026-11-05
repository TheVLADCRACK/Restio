import type { Metadata } from 'next';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireMembership } from '@/lib/auth/session';
import { getProfile } from '@/lib/onboarding/state';
import { countryOptions } from '../../../onboarding/_components/options';
import { SettingsShell } from '../_components/settings-shell';
import { ProfileSettingsForm } from './profile-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('settingsPages.profile'))('title') };
}

export default async function ProfilePage() {
  const { user } = await requireMembership();
  const [profile, t, locale] = await Promise.all([getProfile(user.id), getTranslations('settingsPages.profile'), getLocale()]);
  const phone = profile?.phoneE164 ? parsePhoneNumberFromString(profile.phoneE164) : undefined;
  return (
    <SettingsShell title={t('title')} subtitle={t('subtitle')}>
      <ProfileSettingsForm
        firstName={profile?.firstName ?? ''}
        lastName={profile?.lastName ?? ''}
        email={user.email}
        phone={phone?.formatNational() ?? ''}
        phoneCountry={phone?.country ?? ''}
        countries={countryOptions(locale).map(({ code, name, dial }) => ({ code, name, dial }))}
      />
    </SettingsShell>
  );
}
