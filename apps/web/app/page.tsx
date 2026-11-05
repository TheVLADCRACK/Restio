import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('home');
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-4">
      <h1 className="text-display font-bold">Restio</h1>
      <p className="text-lg text-text-2">{t('lead')}</p>
    </main>
  );
}
