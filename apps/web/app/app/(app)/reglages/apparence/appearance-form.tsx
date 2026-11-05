'use client';
/* eslint-disable @next/next/no-img-element -- aperçus locaux et images déjà optimisées du stockage */

import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { Toast } from '@/components/toast';
import { saveAppearanceAction } from '@/lib/settings/actions';
import { compressImage } from '../../menu/compress-image';
import { formCard, SaveBar, Section, ToggleRow } from '../_components/settings-form';
import { useSettingsForm } from '../_components/use-settings-form';

type Settings = { name: string; bannerUrl: string | null; logoUrl: string | null; showPhotos: boolean; showDescriptions: boolean };
type Picked = { blob: Blob; url: string };

export function AppearanceForm({ settings }: { settings: Settings }) {
  const t = useTranslations('settingsPages');
  const router = useRouter();
  const [banner, setBanner] = useState<Picked | null>(null);
  const [logo, setLogo] = useState<Picked | null>(null);
  const [showPhotos, setShowPhotos] = useState(settings.showPhotos);
  const [showDescriptions, setShowDescriptions] = useState(settings.showDescriptions);
  const [imageError, setImageError] = useState(0);
  const bannerInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const { state, pending, saved, formProps } = useSettingsForm(saveAppearanceAction, (data) => {
    if (banner) data.set('banner', banner.blob, 'banner.jpg');
    if (logo) data.set('logo', logo.blob, 'logo.jpg');
  });

  const pick = (set: (value: Picked) => void) => async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = await compressImage(file);
    if ('error' in result) {
      setImageError((count) => count + 1);
      return;
    }
    set({ blob: result.blob, url: URL.createObjectURL(result.blob) });
  };

  const bannerSrc = banner?.url ?? settings.bannerUrl;
  const logoSrc = logo?.url ?? settings.logoUrl;
  const accept = 'image/jpeg,image/png,image/webp';
  const radio = 'flex min-h-[60px] items-center gap-3 rounded-md border border-line bg-surface px-4 py-2.5 has-checked:border-ink has-checked:shadow-[0_0_0_1px_var(--color-ink)]';
  return (
    <form {...formProps} className={formCard}>
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      {imageError > 0 && <Toast key={`image-${imageError}`} tone="error">{t('appearance.imageError')}</Toast>}
      {saved > 0 && !pending && <Toast key={saved} tone="success">{t('saved')}</Toast>}
      <Section title={t('appearance.cover')}>
        <div className="relative overflow-hidden rounded-md">
          {bannerSrc ? <img src={bannerSrc} alt={t('appearance.coverAlt')} className="h-[180px] w-full object-cover" /> : <div aria-hidden="true" className="h-[180px] bg-sunken" />}
          <Button size="sm" className="absolute bottom-3 right-3" onClick={() => bannerInput.current?.click()}>
            <ImageIcon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            {bannerSrc ? t('appearance.change') : t('appearance.add')}
          </Button>
          <input ref={bannerInput} type="file" accept={accept} onChange={pick(setBanner)} className="sr-only" tabIndex={-1} aria-hidden="true" />
        </div>
        <p className="text-[0.8125rem] text-text-2">{t('appearance.coverHint')}</p>
      </Section>
      <Section title={t('appearance.logo')}>
        <div className="flex items-center gap-4">
          {logoSrc ? <img src={logoSrc} alt="" className="size-24 shrink-0 rounded-[24px] object-cover" /> : <span aria-hidden="true" className="grid size-24 shrink-0 place-items-center rounded-[24px] bg-ink text-[2.5rem] font-black text-lime">{settings.name.trim().charAt(0).toUpperCase()}</span>}
          <div className="grid min-w-0 gap-2">
            <div>
              <Button size="sm" onClick={() => logoInput.current?.click()}>
                <Upload aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                {t('appearance.importLogo')}
              </Button>
            </div>
            <p className="text-[0.8125rem] text-text-2">{t('appearance.logoHint')}</p>
          </div>
          <input ref={logoInput} type="file" accept={accept} onChange={pick(setLogo)} className="sr-only" tabIndex={-1} aria-hidden="true" />
        </div>
      </Section>
      <Section title={t('appearance.theme')}>
        <div className="grid gap-2">
          <label className={radio}>
            <input type="radio" name="theme" defaultChecked className="size-5 shrink-0 accent-ink" />
            <span className="min-w-0 flex-1"><b className="block text-base">{t('appearance.light')}</b><span className="block text-sm text-text-2">{t('appearance.lightHint')}</span></span>
          </label>
          <label className={`${radio} cursor-not-allowed opacity-60`}>
            <input type="radio" name="theme" disabled className="size-5 shrink-0 accent-ink" />
            <span className="min-w-0 flex-1"><b className="block text-base">{t('appearance.dark')}</b><span className="block text-sm text-text-2">{t('appearance.darkHint')}</span></span>
          </label>
        </div>
      </Section>
      <Section title={t('appearance.display')}>
        <div>
          <ToggleRow title={t('appearance.photos')} hint={t('appearance.photosHint')} name="showPhotos" checked={showPhotos} onChange={setShowPhotos} />
          <ToggleRow title={t('appearance.descriptions')} hint={t('appearance.descriptionsHint')} name="showDescriptions" checked={showDescriptions} onChange={setShowDescriptions} />
        </div>
      </Section>
      <SaveBar label={t('save')} loadingLabel={t('saving')} pending={pending} cancelLabel={t('cancel')} onCancel={() => router.push('/reglages')} />
    </form>
  );
}
