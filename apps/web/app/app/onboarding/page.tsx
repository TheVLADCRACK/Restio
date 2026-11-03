import { requireUser } from '@/lib/auth/session';
import { signOutAction } from '@/lib/auth/actions';

export const dynamic = 'force-dynamic';

// Étape provisoire : le parcours d'inscription du restaurant arrive en Phase 6.
export default async function Onboarding() {
  const user = await requireUser();
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-4">
      <h1 className="text-display font-bold">Créons votre restaurant</h1>
      <p className="text-lg text-text-2">Compte vérifié : {user.email}. La création du restaurant sera disponible très bientôt.</p>
      <form action={signOutAction}>
        <button className="h-12 rounded-full border border-line-strong bg-surface px-5 font-bold">Se déconnecter</button>
      </form>
    </main>
  );
}
