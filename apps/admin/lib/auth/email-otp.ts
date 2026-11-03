import 'server-only';
import { auth } from './server';

type Result = Promise<{ error: unknown }>;
type EmailOtpApi = {
  verifyEmail(input: { email: string; otp: string }): Result;
  sendVerificationOtp(input: { email: string; type: 'email-verification' | 'forget-password' }): Result;
  resetPassword(input: { email: string; otp: string; password: string }): Result;
};

// Le SDK expose l'API email OTP à l'exécution mais la type en `unknown` côté serveur (plugin non inféré).
export function emailOtp(): EmailOtpApi {
  const api: unknown = auth.emailOtp;
  const ok =
    typeof api === 'object' &&
    api !== null &&
    (['verifyEmail', 'sendVerificationOtp', 'resetPassword'] as const).every(
      (m) => typeof (api as Record<string, unknown>)[m] === 'function',
    );
  if (!ok) throw new Error('Neon Auth email OTP API unavailable');
  return api as EmailOtpApi;
}
