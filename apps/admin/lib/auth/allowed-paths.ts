// L'administration se connecte par server action : le navigateur n'a besoin que de la session et de la déconnexion.
const ALLOWED = new Set(['get-session', 'sign-out']);

export function isAllowedAdminAuthPath(path: string): boolean {
  return ALLOWED.has(path.toLowerCase().replace(/^\/+|\/+$/g, ''));
}
