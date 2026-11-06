// Réseau instable ou base qui se réveille : une lecture ratée ne doit pas casser la page du client.
const TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 300;

/**
 * Réservé aux lectures (client HTTP) : deux essais, chacun borné dans le temps.
 * Seules les pannes réseau sont rejouées ; une réponse HTTP, même en erreur, est renvoyée telle quelle.
 */
export async function resilientFetch(input: RequestInfo | URL, init?: RequestInit, fetcher: typeof fetch = fetch): Promise<Response> {
  try {
    return await fetcher(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return fetcher(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  }
}
