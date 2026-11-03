import { requireAdmin } from '@/lib/auth/session';
import { adminSignOutAction } from '@/lib/auth/actions';

// Tableau de bord provisoire : le contenu de l'administration arrive en Phase 8.
export default async function AdminHome() {
  const admin = await requireAdmin();
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-4">
      <h1 className="text-display font-bold">Administration</h1>
      <p className="text-lg text-text-2">Connecté : {admin.email}</p>
      <form action={adminSignOutAction}>
        <button className="h-12 rounded-full border border-line-strong bg-surface px-5 font-bold">Se déconnecter</button>
      </form>
    </main>
  );
}
