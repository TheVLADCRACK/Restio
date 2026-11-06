import { describe, expect, it, vi } from 'vitest';
import { resilientFetch } from './resilient-fetch';

describe('resilientFetch', () => {
  it('rejoue une fois une panne réseau', async () => {
    const ok = new Response('ok');
    const fetcher = vi.fn<typeof fetch>().mockRejectedValueOnce(new TypeError('fetch failed')).mockResolvedValueOnce(ok);
    await expect(resilientFetch('https://x', undefined, fetcher)).resolves.toBe(ok);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('abandonne après le second échec', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed'));
    await expect(resilientFetch('https://x', undefined, fetcher)).rejects.toThrow('fetch failed');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('ne rejoue pas une réponse HTTP en erreur', async () => {
    const failed = new Response('nope', { status: 500 });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(failed);
    await expect(resilientFetch('https://x', undefined, fetcher)).resolves.toBe(failed);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
