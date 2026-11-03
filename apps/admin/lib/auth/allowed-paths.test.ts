import { describe, expect, it } from 'vitest';
import { isAllowedAdminAuthPath } from './allowed-paths';

describe('isAllowedAdminAuthPath', () => {
  it('autorise uniquement la session et la déconnexion', () => {
    expect(isAllowedAdminAuthPath('get-session')).toBe(true);
    expect(isAllowedAdminAuthPath('sign-out')).toBe(true);
  });

  it("refuse l'inscription et toute autre fonction", () => {
    for (const p of ['sign-in/email', 'sign-up/email', 'sign-in/social', 'callback/google', 'admin/list-users', 'request-password-reset', 'update-user', 'sign-in/email/../sign-up/email']) {
      expect(isAllowedAdminAuthPath(p), p).toBe(false);
    }
  });
});
