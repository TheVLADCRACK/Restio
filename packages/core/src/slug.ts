export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$/;
export const SLUG_MAX_LENGTH = 48;
const FALLBACK_SLUG = 'restaurant';

export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  'about', 'account', 'admin', 'api', 'app', 'assets', 'auth', 'billing', 'blog', 'cdn', 'contact',
  'dashboard', 'docs', 'help', 'home', 'legal', 'login', 'logout', 'm', 'mail', 'menu', 'new',
  'null', 'order', 'orders', 'pricing', 'privacy', 'register', 'restio', 'root', 'settings',
  'signin', 'signup', 'static', 'status', 'support', 'system', 'terms', 'test', 'undefined', 'www',
]);

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, '');
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && !RESERVED_SLUGS.has(slug);
}

// `taken` doit inclure les slugs actuels ET archivés (slug_history) : un slug retiré n'est jamais réattribué.
export function suggestSlug(base: string, taken: ReadonlySet<string>): string {
  const root = slugify(base) || FALLBACK_SLUG;
  if (isValidSlug(root) && !taken.has(root)) return root;
  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const candidate = root.slice(0, SLUG_MAX_LENGTH - suffix.length).replace(/-+$/, '') + suffix;
    if (isValidSlug(candidate) && !taken.has(candidate)) return candidate;
  }
}
