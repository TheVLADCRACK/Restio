import { describe, expect, it } from 'vitest';
import { isBlockedAuthPath } from './blocked-paths';

describe('isBlockedAuthPath', () => {
  it('laisse passer uniquement les routes utilisées par le navigateur', () => {
    for (const p of ['get-session', 'sign-in/social', 'callback/google', 'sign-out']) {
      expect(isBlockedAuthPath(p), p).toBe(false);
    }
  });

  it('bloque les routes qui contourneraient les server actions ou sont dangereuses', () => {
    for (const p of [
      'sign-in/email', 'sign-up/email', 'email-otp/send-verification-otp', 'email-otp/verify-email', 'sign-in/email-otp',
      'forget-password/email-otp', 'request-password-reset', 'reset-password', 'change-email', 'update-user', 'change-password',
      'list-sessions', 'link-social', 'token', 'admin/impersonate-user', 'organization/create', 'delete-user', 'sign-in/../admin/list-users',
    ]) {
      expect(isBlockedAuthPath(p), p).toBe(true);
    }
  });
});
