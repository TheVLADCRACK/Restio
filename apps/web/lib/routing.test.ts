import { describe, expect, it } from 'vitest';
import { resolveRoute } from './routing';

const hosts = { rootHost: 'restio-app.com', appHost: 'app.restio-app.com' };

describe('resolveRoute', () => {
  it("réécrit l'application restaurateur vers le dossier interne", () => {
    expect(resolveRoute('app.restio-app.com', '/', hosts)).toEqual({ kind: 'rewrite', pathname: '/app' });
    expect(resolveRoute('APP.restio-app.com', '/commandes', hosts)).toEqual({ kind: 'rewrite', pathname: '/app/commandes' });
  });

  it('réécrit /@slug vers le menu public', () => {
    expect(resolveRoute('restio-app.com', '/@le-comptoir', hosts)).toEqual({ kind: 'rewrite', pathname: '/m/le-comptoir' });
  });

  it('normalise la casse et la barre finale par redirection', () => {
    expect(resolveRoute('restio-app.com', '/@Le-Comptoir', hosts)).toEqual({ kind: 'redirect', pathname: '/@le-comptoir' });
    expect(resolveRoute('restio-app.com', '/@le-comptoir/', hosts)).toEqual({ kind: 'redirect', pathname: '/@le-comptoir' });
  });

  it('refuse les slugs invalides, réservés ou mal encodés', () => {
    expect(resolveRoute('restio-app.com', '/@admin', hosts)).toEqual({ kind: 'not-found' });
    expect(resolveRoute('restio-app.com', '/@a', hosts)).toEqual({ kind: 'not-found' });
    expect(resolveRoute('restio-app.com', '/@..%2f..%2fetc', hosts)).toEqual({ kind: 'not-found' });
    expect(resolveRoute('restio-app.com', '/@%E0%A4%A', hosts)).toEqual({ kind: 'not-found' });
  });

  it("n'expose jamais les dossiers internes sur le domaine public", () => {
    expect(resolveRoute('restio-app.com', '/app', hosts)).toEqual({ kind: 'not-found' });
    expect(resolveRoute('restio-app.com', '/app/commandes', hosts)).toEqual({ kind: 'not-found' });
    expect(resolveRoute('restio-app.com', '/m/le-comptoir', hosts)).toEqual({ kind: 'not-found' });
    expect(resolveRoute('preview.vercel.app', '/app', hosts)).toEqual({ kind: 'not-found' });
  });

  it('bloque aussi les dossiers internes encodés', () => {
    expect(resolveRoute('restio-app.com', '/%61pp', hosts)).toEqual({ kind: 'not-found' });
    expect(resolveRoute('restio-app.com', '/%61pp/commandes', hosts)).toEqual({ kind: 'not-found' });
    expect(resolveRoute('restio-app.com', '/%6D/le-comptoir', hosts)).toEqual({ kind: 'not-found' });
    expect(resolveRoute('restio-app.com', '/%E0%A4%A', hosts)).toEqual({ kind: 'not-found' });
  });

  it("ne confond pas un chemin qui commence par « app » avec l'application", () => {
    expect(resolveRoute('restio-app.com', '/application', hosts)).toEqual({ kind: 'next' });
  });

  it('sert les pages légales telles quelles sur l’hôte de l’application', () => {
    expect(resolveRoute('app.restio-app.com', '/legal/conditions', hosts)).toEqual({ kind: 'next' });
  });

  it('laisse passer les API et le site', () => {
    expect(resolveRoute('restio-app.com', '/api/auth/session', hosts)).toEqual({ kind: 'next' });
    expect(resolveRoute('restio-app.com', '/', hosts)).toEqual({ kind: 'next' });
  });
});
