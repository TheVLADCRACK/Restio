import type fr from '../messages/fr.json';
import type { Locale } from './locale';

// Clés de traduction typées : une clé absente ou mal orthographiée casse la compilation.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof fr;
  }
}
