import { getLocale, getTranslations } from 'next-intl/server';
import { formatMoney, sumAmounts } from '@restio/core';
import { cn } from '@restio/ui/cn';
import { averageAmount, compactNumber, dayLabel, niceMax } from '../(dashboard)/format';

type Day = { day: string; sales: string };

/** Barres de ventes de la planche ; le jour en cours en citron. `compact` : mini-barres mobile sans axe. */
export async function SalesBars({ days, currency, compact }: { days: Day[]; currency: string; compact?: boolean }) {
  const t = await getTranslations('dashboard.sales');
  const locale = await getLocale();
  const total = sumAmounts(days.map((d) => d.sales));
  const values = days.map((d) => Number(d.sales));
  const top = niceMax(Math.max(...values, 0));
  const average = averageAmount(total, days.length) ?? '0';
  const avgPct = (Number(average) / top) * 100;
  const labels = days.map((d) => dayLabel(d.day, locale));
  const last = days.length - 1;
  const dense = days.length > 14;
  const fmt = (amount: string) => formatMoney(amount, currency, locale);
  const summary = t('summary', {
    days: days.map((d, i) => `${i === last ? t('today') : `${labels[i]?.weekday} ${labels[i]?.date}`} ${fmt(d.sales)}`).join(', '),
    average: fmt(average),
  });
  const columns = { gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` };
  const showLabel = (index: number) => !dense || index === last || (last - index) % 5 === 0;

  if (compact) {
    const peak = Math.max(...values, 1);
    return (
      <>
        <div role="img" aria-label={summary} className="grid h-[120px] items-end gap-2" style={columns}>
          {values.map((v, i) => (
            <i key={days[i]?.day} className={cn('block rounded-[6px_6px_2px_2px]', i === last ? 'bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink)]' : 'bg-ink-2')} style={{ height: `${v > 0 ? Math.max((v / peak) * 100, 2) : 0}%` }} />
          ))}
        </div>
        <div aria-hidden="true" className="mt-1.5 grid gap-2 text-center text-[0.6875rem] text-text-3" style={columns}>
          {labels.map((l, i) => (i === last ? <b key={i} className="text-ink">{t('todayShort')}</b> : <span key={i}>{showLabel(i) ? l.weekday : ''}</span>))}
        </div>
      </>
    );
  }

  return (
    <figure className="mt-6">
      <div role="img" aria-label={summary} className="pl-10 sm:pl-12">
        <div className="relative h-[196px]">
          {[0, 0.5, 1].map((f) => (
            <span key={f} aria-hidden="true" className={cn('absolute inset-x-0 border-t', f === 0 ? 'border-line-strong' : 'border-line')} style={{ bottom: `${f * 100}%` }}>
              <em className="absolute right-[calc(100%+8px)] -top-2.5 whitespace-nowrap text-xs not-italic text-text-3 tabular">{compactNumber(top * f, locale)}</em>
            </span>
          ))}
          <div aria-hidden="true" className={cn('absolute inset-0 grid px-1 sm:px-2', dense ? 'gap-1' : 'gap-2 sm:gap-4')} style={columns}>
            {values.map((v, i) => {
              const pct = v > 0 ? Math.max((v / top) * 100, 1.5) : 0;
              return (
                <div key={days[i]?.day} className="relative flex items-end justify-center">
                  <i className={cn('block w-full max-w-11', dense ? 'rounded-[4px_4px_2px_2px]' : 'rounded-[10px_10px_4px_4px]', i === last ? 'bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink)]' : 'bg-ink-2')} style={{ height: `${pct}%` }} />
                  {i === last && v > 0 && (
                    <span className="absolute right-0 z-[3] whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-surface tabular" style={{ bottom: `calc(${pct}% + 8px)` }}>
                      {fmt(days[i]?.sales ?? '0')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <span aria-hidden="true" className="absolute inset-x-0 z-[2] border-t-[1.5px] border-dashed border-text-2" style={{ bottom: `${avgPct}%` }} />
        </div>
        <div aria-hidden="true" className={cn('grid px-1 pt-2.5 text-center text-xs leading-tight text-text-3 sm:px-2', dense ? 'gap-1' : 'gap-2 sm:gap-4')} style={columns}>
          {labels.map((l, i) =>
            i === last ? (
              <b key={i} className="text-ink">
                <span className="sm:hidden">{t('todayShort')}</span>
                <span className={cn('hidden', !dense && 'sm:inline')}>{t('todayLong')}</span>
                {dense && <span className="hidden sm:inline">{t('todayShort')}</span>}
              </b>
            ) : (
              <span key={i}>
                {showLabel(i) && (
                  <>
                    {!dense && <span className="block sm:inline">{l.weekday}</span>} <span className="tabular">{l.date}</span>
                  </>
                )}
              </span>
            ),
          )}
        </div>
      </div>
      <figcaption className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.8125rem] text-text-2 sm:pl-12">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <i aria-hidden="true" className="size-3 rounded-[4px] bg-ink-2" />
          {t('pastDays')}
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <i aria-hidden="true" className="size-3 rounded-[4px] bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink)]" />
          {t('todayLegend')}
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <i aria-hidden="true" className="w-4 border-t-[1.5px] border-dashed border-text-2" />
          <span className="tabular">{t('average', { amount: fmt(average) })}</span>
        </span>
      </figcaption>
    </figure>
  );
}
