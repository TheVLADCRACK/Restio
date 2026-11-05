'use client';

import { useTranslations } from 'next-intl';
import { Alert, type AlertProps } from '@restio/ui/components/alert';

/** Toast de la planche, libellé de fermeture traduit. */
export function Toast(props: Omit<AlertProps, 'closeLabel'>) {
  const t = useTranslations('common');
  return <Alert {...props} closeLabel={t('closeMessage')} />;
}
