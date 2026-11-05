'use client';

import { useState, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronRight, CircleCheck, Copy, Download, FileText, Hash, Link as LinkIcon, Plus, Printer, ScanLine, Share2, Sticker, Tent, X } from 'lucide-react';
import { Button, buttonClass } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import { Switch } from '@restio/ui/components/switch';
import { Sheet } from '@/components/sheet';
import { Toast } from '@/components/toast';
import { saveQrTablesAction } from '@/lib/qr/actions';
import type { QrSettings } from '@/lib/qr/queries';
import { MobileHead } from '../_components/mobile-head';
import { NotificationBell } from '../_components/notification-bell';
import { PageHeader } from '../_components/page-header';

type Support = 'tent' | 'sticker' | 'poster';
const file = (params: string) => `/qr-code/file?${params}`;

export function QrWorkspace({ settings, href, address, unreadCount, qr, miniQr }: { settings: QrSettings; href: string; address: string; unreadCount: number; qr: ReactNode; miniQr: ReactNode }) {
  const t = useTranslations('qr');
  const [support, setSupport] = useState<Support>('tent');
  const [perTable, setPerTable] = useState(settings.perTable);
  const [tables, setTables] = useState(settings.tables);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [managing, setManaging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; tone: 'error' | 'success' } | null>(null);
  const [, start] = useTransition();
  const notify = (message: string, tone: 'error' | 'success' = 'error') => setToast((previous) => ({ id: (previous?.id ?? 0) + 1, message, tone }));
  const tableName = (name: string) => (/^\d+$/.test(name) ? t('tableNumber', { number: name }) : name);

  function save(nextTables: string[], nextPerTable: boolean) {
    setTables(nextTables);
    setPerTable(nextPerTable);
    start(async () => {
      const result = await saveQrTablesAction(nextTables, nextPerTable);
      if (result.error) notify(result.error);
    });
  }

  function addTable() {
    const name = draft.trim();
    setDraft('');
    setAdding(false);
    if (name && !tables.includes(name)) save([...tables, name], perTable);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('[qr] copie impossible', error);
      notify(t('errors.copy'));
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: settings.name, url: href });
      } catch (error) {
        // Partage annulé par l'utilisateur : rien à signaler.
        if (error instanceof Error && error.name !== 'AbortError') notify(t('errors.copy'));
      }
      return;
    }
    await copy();
    notify(t('copied'), 'success');
  }

  const art = (kind: Support) => {
    const light = kind === 'poster';
    return (
      <span className="grid h-[190px] place-items-center rounded-md bg-ground">
        <span className={cn('grid justify-items-center gap-1.5 text-center shadow-[var(--shadow-rest)]', light ? 'w-[120px] rounded-[10px] border border-line bg-surface px-3 py-4 text-ink' : 'bg-ink text-surface', kind === 'tent' && 'w-28 rounded-[10px] px-2.5 py-3', kind === 'sticker' && 'w-[104px] rounded-[14px] px-2.5 py-3')}>
          <span className="block size-[72px] rounded-[6px] bg-surface p-1">{miniQr}</span>
          <b className={cn('text-[0.625rem] leading-[1.2]', light ? 'text-[0.6875rem] text-ink' : 'text-lime')}>{t('cta')}</b>
          <small className={cn('text-[0.5625rem]', light ? 'text-text-2' : 'text-on-dark-2')}>{kind === 'tent' ? t('tableNumber', { number: '7' }) : settings.name}</small>
        </span>
      </span>
    );
  };

  const tablesBlock = (
    <>
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <b className="block text-base font-medium">{t('perTable')}</b>
          <span className="block text-sm text-text-2">{t('perTableHint')}</span>
        </div>
        <Switch checked={perTable} onCheckedChange={(on) => save(tables, on)} aria-label={t('perTable')} />
      </div>
      {perTable && (
        <div className="flex flex-wrap gap-1.5">
          {tables.map((name) => (
            <span key={name} className="inline-flex h-[30px] items-center gap-1 rounded-full border border-line-strong bg-surface pl-3 pr-1 text-[0.8125rem] font-bold tabular">
              {tableName(name)}
              <button type="button" aria-label={t('removeTable', { name: tableName(name) })} onClick={() => save(tables.filter((table) => table !== name), perTable)} className="grid size-6 cursor-pointer place-items-center rounded-full text-text-2 hover:bg-sunken">
                <X aria-hidden="true" className="size-3.5" strokeWidth={2} />
              </button>
            </span>
          ))}
          {adding ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                addTable();
              }}
              className="inline-flex"
            >
              <input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={addTable} maxLength={20} aria-label={t('addTable')} placeholder={t('tablePlaceholder')} className="h-[30px] w-32 rounded-full border border-ink bg-surface px-3 text-[0.8125rem] font-bold focus:outline-none" />
            </form>
          ) : (
            <button type="button" onClick={() => setAdding(true)} className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 text-[0.8125rem] font-bold text-text-2 hover:bg-sunken">
              <Plus aria-hidden="true" className="size-3.5" strokeWidth={2} />
              {t('add')}
            </button>
          )}
        </div>
      )}
    </>
  );
  const downloadAll = perTable && tables.length > 0;

  const supports: { kind: Support; icon: typeof Tent }[] = [
    { kind: 'tent', icon: Tent },
    { kind: 'sticker', icon: Sticker },
    { kind: 'poster', icon: FileText },
  ];

  return (
    <>
      {toast && <Toast key={toast.id} tone={toast.tone}>{toast.message}</Toast>}
      <MobileHead
        title={t('title')}
        start={
          <Link href="/reglages" aria-label={t('back')} className="grid size-12 place-items-center rounded-full hover:bg-sunken">
            <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </Link>
        }
      />
      <div className="hidden md:block">
        <PageHeader
          title={t('title')}
          subtitle={t('subtitle')}
          actions={
            <NotificationBell count={unreadCount} />
          }
        />
      </div>

      {/* Bureau : le QR Code à gauche, les supports à droite. */}
      <div className="mt-6 hidden items-start gap-6 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 rounded-lg border border-line bg-surface p-5">
          <div className="grid place-items-center rounded-lg border border-line bg-surface p-6">
            <div className="w-full max-w-[300px]">{qr}</div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-ground py-1 pl-3 pr-1 text-sm text-text-2">
            <LinkIcon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="min-w-0 flex-1 truncate">{address}</span>
            <Button size="sm" variant="ghost" onClick={copy}>
              <Copy aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
              {copied ? t('copied') : t('copy')}
            </Button>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <a href={file('format=png')} download className={buttonClass({ variant: 'primary' })}>
              <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
              {t('downloadPng')}
            </a>
            <a href={file(`format=pdf&support=${support}`)} download className={buttonClass()}>
              {t('pdf')}
            </a>
          </div>
          <p className="flex gap-2.5 rounded-md bg-ground px-3.5 py-3 text-sm text-text-2">
            <ScanLine aria-hidden="true" className="mt-px size-[18px] shrink-0 text-ink" strokeWidth={1.75} />
            {t('testHint')}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-lg font-bold leading-[1.3]">{t('supports')}</h2>
          <p className="mt-0.5 text-sm text-text-2">{t('supportsHint')}</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {supports.map(({ kind }) => (
              <button key={kind} type="button" aria-pressed={support === kind} onClick={() => setSupport(kind)} className={cn('grid cursor-pointer gap-2.5 rounded-lg border border-line bg-surface p-3 text-left', support === kind && 'border-ink shadow-[0_0_0_1px_var(--color-ink)]')}>
                {art(kind)}
                <b className="flex items-center justify-between text-[0.9375rem]">
                  {t(`support.${kind}`)}
                  {support === kind && <CircleCheck aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />}
                </b>
                <span className="text-[0.8125rem] text-text-2">{t(`support.${kind}Hint`)}</span>
              </button>
            ))}
          </div>
          <section className="mt-6 grid gap-3 border-t border-line pt-6">
            {tablesBlock}
            <div className="mt-1 flex flex-wrap gap-2">
              {downloadAll ? (
                <a href={file(`format=pdf&support=${support}&all=1`)} download className={buttonClass({ variant: 'dark' })}>
                  <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  {t('downloadAll', { count: tables.length, support: t(`support.${support}Plural`) })}
                </a>
              ) : (
                <a href={file(`format=pdf&support=${support}`)} download className={buttonClass({ variant: 'dark' })}>
                  <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  {t('downloadOne')}
                </a>
              )}
              <a href={file(`format=pdf&support=${support}${downloadAll ? '&all=1' : ''}`)} target="_blank" rel="noopener" className={buttonClass({ variant: 'ghost' })}>
                <Printer aria-hidden="true" className="size-5" strokeWidth={1.75} />
                {t('print')}
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile et tablette. */}
      <div className="-mx-4 pb-4 md:mx-0 md:mt-6 lg:hidden">
        <div className="mx-3 grid grid-cols-[minmax(0,1fr)] gap-3 rounded-lg border border-line bg-surface p-4 md:mx-0">
          <div className="size-[210px] justify-self-center">{qr}</div>
          <p className="mb-1 flex items-center justify-center gap-2 text-sm text-text-2">
            <LinkIcon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">@{settings.slug}</span>
          </p>
          <a href={file('format=png')} download className={buttonClass({ variant: 'primary', block: true })}>
            <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t('downloadPng')}
          </a>
          <Button block onClick={share}>
            <Share2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t('share')}
          </Button>
        </div>
        <h3 className="px-4 pb-2.5 pt-[22px] text-lg font-bold md:px-0">{t('supports')}</h3>
        <div className="mx-3 overflow-hidden rounded-lg border border-line bg-surface md:mx-0">
          {supports.map(({ kind, icon: Icon }) => (
            <a key={kind} href={file(`format=pdf&support=${kind}`)} download className="flex min-h-14 items-center gap-3 border-t border-line px-3 py-2 first:border-t-0">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-sm bg-sunken">
                <Icon className="size-[18px]" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-[0.9375rem] font-medium">{t(`support.${kind}`)}</b>
                <span className="block text-sm text-text-2">{t(`support.${kind}HintShort`)}</span>
              </span>
              <ChevronRight aria-hidden="true" className="size-[18px] shrink-0 text-text-3" strokeWidth={1.75} />
            </a>
          ))}
          <button type="button" onClick={() => setManaging(true)} className="flex min-h-14 w-full cursor-pointer items-center gap-3 border-t border-line px-3 py-2 text-left">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-sm bg-sunken">
              <Hash className="size-[18px]" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[0.9375rem] font-medium">{t('tablesRow')}</b>
              <span className="block text-sm text-text-2">{t('tablesRowHint', { count: tables.length })}</span>
            </span>
            <ChevronRight aria-hidden="true" className="size-[18px] shrink-0 text-text-3" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {managing && (
        <Sheet
          title={t('tablesRow')}
          closeLabel={t('close')}
          onClose={() => setManaging(false)}
          footer={
            downloadAll ? (
              <a href={file('format=pdf&support=tent&all=1')} download className={buttonClass({ variant: 'dark', block: true })}>
                <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
                {t('downloadAll', { count: tables.length, support: t('support.tentPlural') })}
              </a>
            ) : undefined
          }
        >
          <div className="grid gap-3 rounded-lg border border-line bg-surface p-4">{tablesBlock}</div>
        </Sheet>
      )}
    </>
  );
}
