'use client';

import { useSyncExternalStore, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Monitor, Smartphone } from 'lucide-react';
import { PREF_REMINDER, PREF_SOUND, playChime, readPref, writePref } from '@/components/use-new-order-alert';
import { formCard, Section, ToggleRow } from '../_components/settings-form';

const noop = () => () => {};
const permissionState = () => ('Notification' in window ? Notification.permission : 'denied');

// Préférences propres à l'appareil : la salle et la cuisine n'ont pas forcément les mêmes besoins.
export function NotificationPrefs() {
  const t = useTranslations('settingsPages.notif');
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const [, rerender] = useState(0);
  const [permission, setPermission] = useState<string | null>(null);
  const current = permission ?? (ready ? permissionState() : 'default');
  const isPhone = useSyncExternalStore(noop, () => window.matchMedia('(pointer: coarse)').matches, () => false);

  function setPref(key: string, on: boolean) {
    writePref(key, on);
    if (key === PREF_SOUND && on) playChime();
    rerender((count) => count + 1);
  }

  async function toggleDevice(on: boolean) {
    if (!on || !('Notification' in window)) return;
    setPermission(await Notification.requestPermission());
  }

  const DeviceIcon = isPhone ? Smartphone : Monitor;
  const enabled = current === 'granted';
  return (
    <div className={formCard}>
      <Section title={t('orders')}>
        <div>
          <ToggleRow title={t('device')} hint={t('deviceHint')} checked={enabled} onChange={toggleDevice} disabled={current === 'denied' || enabled} />
          <ToggleRow title={t('sound')} hint={t('soundHint')} checked={ready ? readPref(PREF_SOUND) : true} onChange={(on) => setPref(PREF_SOUND, on)} />
          <ToggleRow title={t('reminder')} hint={t('reminderHint')} checked={ready ? readPref(PREF_REMINDER) : true} onChange={(on) => setPref(PREF_REMINDER, on)} />
        </div>
      </Section>
      <Section title={t('devices')}>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-sm bg-sunken">
            <DeviceIcon className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block font-medium">{t('thisDevice')}</b>
            <span className="text-sm text-text-2">{current === 'denied' ? t('blocked') : enabled ? t('enabled') : t('disabled')}</span>
          </div>
          {enabled && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-status-ok-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-ok">
              <Check aria-hidden="true" className="size-[15px]" strokeWidth={2} />
              {t('enabled')}
            </span>
          )}
        </div>
      </Section>
      <Section title={t('email')}>
        <ToggleRow title={t('digest')} hint={t('digestHint')} checked={false} onChange={() => undefined} disabled />
      </Section>
    </div>
  );
}
