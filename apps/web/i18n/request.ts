import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALE_COOKIE, resolveLocale } from './locale';

// Sans préfixe d'URL : la langue vient du cookie de choix, sinon de l'appareil.
export default getRequestConfig(async () => {
  const locale = resolveLocale((await cookies()).get(LOCALE_COOKIE)?.value, (await headers()).get('accept-language'));
  return { locale, messages: (await import(`../messages/${locale}.json`)).default };
});
