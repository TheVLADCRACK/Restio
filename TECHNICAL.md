# STACK TECHNIQUE

## Technologies principales

| Domaine | Technologie |
|---|---|
| Framework Frontend et Backend | Next.js 16 — App Router |
| Langage | TypeScript |
| Design et styles | Tailwind CSS 4 |
| Bibliothèque de composants | shadcn/ui |
| Backend | Next.js Route Handlers et Server Actions |
| Base de données | Neon Postgres |
| ORM | Drizzle ORM |
| Driver PostgreSQL | `@neondatabase/serverless` |
| Authentification | Neon Auth |
| Stockage des photos | Neon Object Storage |
| Temps réel | Neon Realtime |
| Notifications push | Web Push — VAPID et `web-push` |
| PWA | `manifest.ts`, service worker `sw.js` et bouton « Installer l'app » |

## Infrastructure et déploiement

| Domaine | Solution |
|---|---|
| Gestion du code source | GitHub |
| Hébergement et déploiement | Vercel |
| Intégration continue | Déploiement automatique depuis GitHub via Vercel |
| Nom de domaine et configuration DNS | Vercel |
| Base de données | Neon |
| Authentification | Neon Auth |
| Stockage des fichiers | Neon Object Storage |
| Temps réel | Neon Realtime |

## Principes d'implémentation

- Utiliser TypeScript dans l'ensemble du projet, avec une configuration stricte.
- Respecter l'architecture App Router de Next.js 16.
- Utiliser les Route Handlers et Server Actions selon la nature des opérations, sans multiplier inutilement les points d'entrée.
- Utiliser Drizzle ORM pour les requêtes et la gestion du schéma de base de données.
- Utiliser `@neondatabase/serverless` conformément aux recommandations de Neon et de Drizzle.
- Centraliser et sécuriser les accès aux services Neon côté serveur lorsque cela est nécessaire.
- Utiliser Neon Auth pour l'authentification et la gestion des sessions. Ne pas introduire un autre fournisseur d'authentification sans décision explicite.
- Utiliser Neon Object Storage pour les photos des restaurants et des plats, avec validation des fichiers, contrôle des accès et optimisation des images.
- Utiliser Neon Realtime pour les mises à jour nécessitant une synchronisation en temps réel, notamment les commandes et leur évolution.
- Implémenter les notifications push avec Web Push, VAPID et `web-push`, en tenant compte des permissions du navigateur et des limites des plateformes.
- Garantir le fonctionnement progressif de la PWA, y compris lorsque les notifications push ne sont pas disponibles.
- Maintenir une séparation claire entre les interfaces publiques, les espaces authentifiés et les opérations administratives.
- Ne jamais exposer les clés privées, secrets VAPID, identifiants de connexion ou variables sensibles dans le code client.

Toute évolution de cette stack doit être justifiée par un besoin réel et documentée avant son adoption.

## Architecture retenue (Phase 2 — 3 novembre 2026)

### Dépôt

Monorepo **npm workspaces** (pas d'outil d'orchestration supplémentaire) :

| Dossier | Rôle | Déploiement |
|---|---|---|
| `apps/web` | Site `restio-app.com`, menus publics `restio-app.com/@slug`, application restaurateur `app.restio-app.com` (routage par hôte dans le proxy Next.js) | Projet Vercel `restio-web` |
| `apps/admin` | Administration `admin.restio-app.com` | Projet Vercel `restio-admin`, variables et secrets séparés |
| `packages/db` | Schémas Drizzle (métier et admin), migrations, clients Neon | — |
| `packages/core` | Règles métier pures (prix, statuts, slug, validations Zod), testées unitairement | — |
| `packages/ui` | Composants shadcn/ui partagés et tokens Tailwind 4 | — |
| `demo/` | Images libres de droits et données de démonstration, jamais chargées en production | — |

`/@slug` n'est pas un dossier Next.js (un dossier `@nom` est un *parallel route slot*) : le proxy réécrit `/@:slug` vers `/m/:slug`. À confirmer sur la documentation Next.js 16 en Phase 4.

### Neon

| Branche | Base | Services | Consommateur |
|---|---|---|---|
| `production` | `neondb` | Postgres, Neon Auth (restaurateurs), Object Storage, Realtime | `apps/web` (rôle `restio_app`), `apps/admin` (rôle `restio_admin_ops`) |
| `admin` (branche racine « schéma seulement », sans données copiées) | `restio_admin` | Postgres, Neon Auth (administration, inscriptions désactivées) | `apps/admin` uniquement |

Détail des tables, rôles et droits : `DATABASE.md`.

### Variables d'environnement (noms indicatifs, valeurs jamais commitées)

| Variable | `apps/web` | `apps/admin` | Secret |
|---|---|---|---|
| `DATABASE_URL` (rôle `restio_app`) | ✅ | — | Oui |
| `PROD_DATABASE_URL` (rôle `restio_admin_ops`) | — | ✅ | Oui |
| `ADMIN_DATABASE_URL` (rôle `restio_admin_app`) | — | ✅ | Oui |
| `NEON_AUTH_BASE_URL` | ✅ (instance restaurateurs) | ✅ (instance admin) | Non |
| `NEON_AUTH_COOKIE_SECRET` (nom exact selon le SDK) | ✅ | ✅ (valeur différente) | Oui |
| `ADMIN_ALLOWED_EMAILS` | — | ✅ | Oui |
| Identifiants Object Storage | ✅ | ✅ (suppression de fichiers) | Oui |
| `NEON_REALTIME_URL` / secret Realtime | ✅ | — | Le secret : oui |
| `VAPID_PUBLIC_KEY` | ✅ | — | Non |
| `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | ✅ | ✅ (envoi d'annonces) | La clé privée : oui |
| `IP_HASH_SALT` | ✅ | ✅ | Oui |

Aucune clé d'API Neon n'est déployée dans une application (voir `DATABASE.md` §5.3).

Les noms exacts des variables Neon Auth, Realtime et Object Storage seront repris de la documentation officielle et de `neon deploy` en Phase 4. `.env.example` en sera la référence.

### Règles de sécurité structurantes

- Rôles Postgres d'exécution créés en SQL, jamais depuis la console (sinon membres de `neon_superuser`, avec lecture de toutes les données).
- Neon Realtime : la requête live est construite et scellée **par le serveur** avec le `restaurant_id` de la session ; le navigateur ne choisit jamais la requête. Repli par rafraîchissement périodique.
- Pixels publicitaires uniquement sur le site vitrine, après consentement, sous CSP.
- Branches de développement et de prévisualisation en « schéma seulement » ou avec données de démonstration.

### Vercel

- Compte `vladcrack`, équipe `nerix-technology`, plan Hobby : aucun projet ni domaine existant.
- Le domaine `restio-app.com` est à acheter.
- L'usage commercial nécessitera probablement le plan Pro (conditions à vérifier avant le lancement).
