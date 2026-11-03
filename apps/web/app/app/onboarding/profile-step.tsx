import { AuthShell } from '@restio/ui/components/auth-shell';
import { countryOptions, pick } from './_components/options';
import { ProfileForm } from './_components/profile-form';
import { StepIndicator } from './_components/step-indicator';

export function ProfileStep({ suggestedCountry }: { suggestedCountry?: string }) {
  const countries = countryOptions();
  return (
    <AuthShell title="Faisons connaissance" description="Quelques informations sur vous avant de créer votre restaurant.">
      <StepIndicator step={1} total={2} />
      <ProfileForm countries={countries} initialCountry={pick(suggestedCountry, countries)} />
    </AuthShell>
  );
}
