import { requireMembership } from '@/lib/auth/session';

// Toute page de l'application restaurateur exige une session vérifiée ET un restaurant.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireMembership();
  return children;
}
