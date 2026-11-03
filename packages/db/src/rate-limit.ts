import { sql, type SQL } from 'drizzle-orm';

// Type minimal : accepte le client de la base métier comme celui de la base d'administration.
type Executor = { execute(query: SQL): Promise<{ rows: Record<string, unknown>[] }> };

/**
 * Fenêtre fixe atomique (un seul INSERT … ON CONFLICT) : renvoie le nombre d'appels dans la fenêtre courante.
 * La clé ne doit contenir aucune donnée personnelle en clair (IP et email hachés par l'appelant).
 */
export async function hitRateLimit(db: Executor, key: string, windowSeconds: number): Promise<number> {
  const window = `${Math.max(1, Math.trunc(windowSeconds))} seconds`;
  const result = await db.execute(sql`
    INSERT INTO rate_limit_buckets (key, window_start, hits)
    VALUES (${key}, now(), 1)
    ON CONFLICT (key) DO UPDATE SET
      hits = CASE WHEN rate_limit_buckets.window_start < now() - ${window}::interval THEN 1 ELSE rate_limit_buckets.hits + 1 END,
      window_start = CASE WHEN rate_limit_buckets.window_start < now() - ${window}::interval THEN now() ELSE rate_limit_buckets.window_start END
    RETURNING hits
  `);
  return Number(result.rows[0]?.hits ?? 0);
}
