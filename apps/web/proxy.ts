import { NextResponse, type NextRequest } from 'next/server';
import { resolveRoute } from '@/lib/routing';

// Hôtes lus à l'exécution ; les valeurs par défaut ne servent qu'au développement local.
const rootHost = (process.env.ROOT_HOST ?? 'localhost:3000').toLowerCase();
const appHost = (process.env.APP_HOST ?? 'app.localhost:3000').toLowerCase();

export function proxy(request: NextRequest) {
  const decision = resolveRoute(request.headers.get('host'), request.nextUrl.pathname, { rootHost, appHost });
  const url = request.nextUrl.clone();
  switch (decision.kind) {
    case 'rewrite':
      url.pathname = decision.pathname;
      return NextResponse.rewrite(url);
    case 'redirect':
      url.pathname = decision.pathname;
      return NextResponse.redirect(url, 308);
    case 'not-found':
      url.pathname = '/404';
      return NextResponse.rewrite(url, { status: 404 });
    default:
      return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|sw.js).*)'],
};
