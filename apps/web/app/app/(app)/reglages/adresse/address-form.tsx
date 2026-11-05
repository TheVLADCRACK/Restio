'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Copy, Link as LinkIcon, TriangleAlert } from 'lucide-react';
import { Button } from '@restio/ui/components/button';
import { Field } from '@restio/ui/components/field';
import { Toast } from '@/components/toast';
import { saveAddressAction } from '@/lib/settings/actions';
import { formCard, SaveBar, Section, ToggleRow } from '../_components/settings-form';
import { useSettingsForm } from '../_components/use-settings-form';

function SlugInput({ host, ...props }: { host: string; id?: string; defaultValue: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) {
  return (
    <div className="flex h-12 items-center overflow-hidden rounded-md border border-line-strong bg-surface focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(15,15,15,.12)] has-aria-invalid:border-status-danger">
      <span className="hidden whitespace-nowrap pl-3.5 text-text-2 sm:block">{host}/@</span>
      <span className="pl-3.5 text-text-2 sm:hidden">@</span>
      <input {...props} name="slug" maxLength={40} spellCheck={false} autoCapitalize="none" required className="h-full w-full min-w-0 bg-transparent pl-px pr-3.5 text-base text-ink focus:outline-none" />
    </div>
  );
}

export function AddressForm({ slug, isPublished, host, url }: { slug: string; isPublished: boolean; host: string; url: string }) {
  const t = useTranslations('settingsPages');
  const router = useRouter();
  const [published, setPublished] = useState(isPublished);
  const [copied, setCopied] = useState(false);
  const { state, pending, saved, formProps } = useSettingsForm(saveAddressAction);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('[settings] copie impossible', error);
    }
  }
  return (
    <form {...formProps} className={formCard}>
      {state?.error && !pending && <Toast tone="error">{state.error}</Toast>}
      {saved > 0 && !pending && <Toast key={saved} tone="success">{t('saved')}</Toast>}
      <Section title={t('address.section')}>
        <div className="flex items-center gap-2.5 rounded-md border border-line bg-ground py-1.5 pl-3.5 pr-1.5 text-[0.9375rem] font-medium">
          <LinkIcon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate">{host}/@{slug}</span>
          <Button size="sm" variant="ghost" onClick={copy}>
            <Copy aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
            {copied ? t('address.copied') : t('address.copy')}
          </Button>
        </div>
        <Field id="slug" label={t('address.slug')} hint={t('address.slugHint')} error={state?.fieldErrors?.slug}>
          <SlugInput host={host} defaultValue={slug} />
        </Field>
        <p role="note" className="flex gap-2.5 rounded-md bg-status-new-bg px-3.5 py-3 text-sm font-medium text-status-new">
          <TriangleAlert aria-hidden="true" className="mt-px size-[18px] shrink-0" strokeWidth={1.75} />
          {t('address.warning')}
        </p>
      </Section>
      <Section title={t('address.visibility')}>
        <ToggleRow title={t('address.published')} hint={t('address.publishedHint')} name="isPublished" checked={published} onChange={setPublished} />
      </Section>
      <SaveBar label={t('address.save')} loadingLabel={t('saving')} pending={pending} cancelLabel={t('cancel')} onCancel={() => router.push('/reglages')} />
    </form>
  );
}
