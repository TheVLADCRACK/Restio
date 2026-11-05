import { getLocale, getTranslations } from 'next-intl/server';
import { countryOptions, currencyOptions, pick } from './_components/options';
import { OnboardingFrame } from './_components/onboarding-frame';
import { RestaurantForm } from './_components/restaurant-form';

type Props = { suggestedCountry?: string; suggestedCurrency?: string };

export async function RestaurantStep({ suggestedCountry, suggestedCurrency }: Props) {
  const t = await getTranslations('onboarding');
  const locale = await getLocale();
  const countries = countryOptions(locale);
  const currencies = currencyOptions(locale);
  return (
    <OnboardingFrame step={2} label={t('stepRestaurant')} back="/onboarding?etape=profil" title={t('restaurant.title')} description={t('restaurant.description')}>
      <RestaurantForm countries={countries} currencies={currencies} initialCountry={pick(suggestedCountry, countries)} initialCurrency={pick(suggestedCurrency, currencies)} />
    </OnboardingFrame>
  );
}
