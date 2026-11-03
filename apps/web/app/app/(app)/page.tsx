import { requireMembership } from '@/lib/auth/session';
import { signOutAction } from '@/lib/auth/actions';

export const dynamic = 'force-dynamic';

// Accueil provisoire : le tableau de bord arrive en Phase 6.
export default async function AppHome() {
  const { user } = await requireMembership();
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-4">
      <h1 className="text-display font-bold">Bonjour</h1>
      <p className="text-lg text-text-2">Connecté avec {user.email}.</p>
      <form action={signOutAction}>
        <button className="h-12 rounded-full border border-line-strong bg-surface px-5 font-bold">Se déconnecter</button>
      </form>
    </main>
  );
}
