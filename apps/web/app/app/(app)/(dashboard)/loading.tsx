import { getTranslations } from 'next-intl/server';
// Squelettes fidèles au tableau de bord (Creux, pulsation lente, figée si mouvement réduit).
const bone = 'animate-[pulse_1.6s_ease-in-out_infinite] rounded-full bg-sunken';
const card = 'min-w-0 rounded-lg border border-line bg-surface';

export default async function DashboardLoading() {
  const t = await getTranslations('dashboard');
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('loading')}</span>
      <div aria-hidden="true">
        <div className="flex flex-col gap-4 sm:min-h-14 sm:flex-row sm:items-center">
          <div className="grid gap-2.5">
            <span className={`${bone} h-8 w-56`} />
            <span className={`${bone} h-4 w-40`} />
          </div>
          <span className={`${bone} h-12 w-44 sm:ml-auto`} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${i === 3 ? 'order-first col-span-2 border-ink bg-ink md:order-none md:col-span-1' : card} ${i === 1 ? 'col-span-2 md:col-span-1' : ''} flex flex-col gap-3.5 rounded-lg border p-4 md:p-5`}>
              <div className="flex min-h-11 items-center">
                <span className={`${bone} h-4 w-24 ${i === 3 ? 'bg-ink-2' : ''}`} />
              </div>
              <span className={`${bone} h-8 w-28 ${i === 3 ? 'bg-ink-2' : ''}`} />
              <span className={`${bone} mt-1 h-4 w-20 ${i === 3 ? 'bg-ink-2' : ''}`} />
            </div>
          ))}
        </div>

        <div className="mt-8 flex min-h-11 items-center">
          <span className={`${bone} h-6 w-52`} />
        </div>
        <div className="mt-3.5 grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${card} grid gap-3 p-4 ${i === 1 ? 'hidden md:grid' : ''} ${i === 2 ? 'hidden xl:grid' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="grid gap-2">
                  <span className={`${bone} h-6 w-14`} />
                  <span className={`${bone} h-4 w-32`} />
                </div>
                <span className={`${bone} h-7 w-24`} />
              </div>
              <span className={`${bone} h-4 w-full`} />
              <span className={`${bone} h-4 w-3/4`} />
              <span className={`${bone} mt-1 h-5 w-full`} />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className={`${card} p-5 md:col-span-2`}>
            <span className={`${bone} block h-5 w-56`} />
            <span className={`${bone} mt-3 block h-7 w-40`} />
            <div className="mt-6 grid h-[196px] grid-cols-7 items-end gap-2 pl-10 sm:gap-4 sm:pl-12">
              {[60, 48, 70, 88, 99, 40, 32].map((h, i) => (
                <span key={i} className="mx-auto block w-full max-w-11 animate-[pulse_1.6s_ease-in-out_infinite] rounded-[10px_10px_4px_4px] bg-sunken" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          {[0, 1].map((i) => (
            <div key={i} className={`${card} grid content-start gap-4 p-5`}>
              <span className={`${bone} h-5 w-40`} />
              {[0, 1, 2, 3].map((j) => (
                <span key={j} className={`${bone} h-4 w-full`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
