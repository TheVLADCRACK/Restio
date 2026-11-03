// Liste blanche : le navigateur n'appelle que ces routes Better Auth. Tout le reste (connexion par email,
// inscription, codes, mot de passe…) passe par les server actions, qui appliquent nos limites et messages.
const ALLOWED = new Set(['get-session', 'sign-in/social', 'callback/google', 'sign-out']);

export function isBlockedAuthPath(path: string): boolean {
  return !ALLOWED.has(path.toLowerCase().replace(/^\/+|\/+$/g, ''));
}
