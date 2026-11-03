import { WebAuthShell } from '../auth/_components/web-auth-shell';
import { countryOptions, currencyOptions, pick } from './_components/options';
import { RestaurantForm } from './_components/restaurant-form';
import { StepIndicator } from './_components/step-indicator';

type Props = { firstName: string; suggestedCountry?: string; suggestedCurrency?: string };

export function RestaurantStep({ firstName, suggestedCountry, suggestedCurrency }: Props) {
  const countries = countryOptions();
  const currencies = currencyOptions();
  return (
    <WebAuthShell dish="grill" title={`Votre restaurant, ${firstName}`} description="Ces informations servent à préparer votre menu et vos prix.">
      <StepIndicator step={2} total={2} />
      <RestaurantForm
        countries={countries}
        currencies={currencies}
        initialCountry={pick(suggestedCountry, countries)}
        initialCurrency={pick(suggestedCurrency, currencies)}
      />
    </WebAuthShell>
  );
}
