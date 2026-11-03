# RESTIO — Rapport d'audit (Phase 1) et plan de développement

> Date : 3 novembre 2026 · Statut : **à valider avant toute implémentation**
> Périmètre : dépôt local, dossiers `figma/` et `tools/`, projet Neon `purple-sunset-30734372` (lecture seule).

---

## 1. État réel du dépôt

| Élément | Constat |
|---|---|
| Code applicatif | **Aucun.** Pas de `package.json`, pas de Next.js, pas de schéma, pas de tests. |
| `package-lock.json` | Vide (`packages: {}`), sans `package.json` associé. |
| Git | **Non initialisé.** Aucun dépôt GitHub relié. |
| Documentation | `CLAUDE.md`, `PROJECT.md`, `TECHNICAL.md`, `UML.md`, `DESING.md` (nom mal orthographié : tous les documents référencent `DESIGN.md`). |
| Absents | `README.md`, `DATABASE.md`, `.env.example`, `.gitignore`, CI. |
| `figma/` | 1 image d'identité (palette), 2 logos, 19 interfaces d'inspiration, 3 exemples de supports QR, 1 prototype Figma Make (React + Vite, 2 433 lignes dans `App.tsx`). |
| `tools/` | `neon.md` (procédure `neon init` / `neon deploy`), `clerk.md` (procédure d'installation Clerk + application Clerk pré-sélectionnée). |

**Conclusion : il n'existe rien à préserver côté code. Le projet part de zéro, sur une base documentaire riche mais contradictoire (§3).**

## 2. État réel de l'infrastructure Neon (vérifié via MCP)

| Service | État | Détail |
|---|---|---|
| Projet | ✅ `Restio`, AWS `eu-central-1` (Francfort), Postgres 18, plan **free** (10 branches max, 1 Go par branche). |
| Branches | 1 seule : `production` (`br-lucky-flower-ba70jd61`). |
| Bases | 1 seule : `neondb` (propriétaire `neondb_owner`). |
| Neon Auth | ✅ Provisionné (Managed Better Auth) sur `neondb` de la branche `production`. |
| Object Storage | ✅ Activé (endpoint S3 compatible, `force_path_style`). |
| Realtime | ✅ Activé, **`allowed_origins` vide** → à configurer avant usage navigateur. |

### Capacités Neon Auth vérifiées dans la documentation officielle

- **Une seule instance d'authentification par branche** (« Every database branch gets its own isolated auth environment »). Il n'est donc **pas possible** d'avoir deux applications Neon Auth indépendantes dans la même branche.
- Méthodes supportées : email/mot de passe, Email OTP, Magic Link, **Phone Number**, OAuth Google / Apple / GitHub / Microsoft / Vercel, plugin Admin, JWT.
- **Apple** exige vos propres identifiants (compte Apple Developer payant). **Téléphone** exige un fournisseur SMS (coût par SMS). Google peut utiliser l'app OAuth partagée de Neon en développement, mais vos propres identifiants sont recommandés en production.
- **MFA : pas encore disponible** (« Coming soon ») → impact direct sur la sécurité de l'espace administrateur (§5.3).
- Sessions par cookies HTTP-only : impose que le frontend et le backend soient servis par le même domaine (Next.js App Router : compatible).

## 3. Contradictions à arbitrer (bloquantes)

| # | Sujet | Source A | Source B | Recommandation |
|---|---|---|---|---|
| C1 | Authentification | `PROJECT.md` §8, `UML.md`, `tools/clerk.md` : **Clerk** | `TECHNICAL.md`, mega-prompt, Neon déjà provisionné : **Neon Auth** | **Neon Auth.** Déjà actif, données dans votre base, pas de fournisseur supplémentaire. Mettre à jour `PROJECT.md` et `UML.md`. |
| C2 | Modèle économique | `PROJECT.md` §7 : essai 14 j, 5 000 FCFA / 15 € / 15 $, annuel −20 % | Mega-prompt §25 : **aucun paiement au lancement**, 3 plans à définir | **Mega-prompt** (plus récent). Modéliser `plans`/`subscriptions` sans activation ni restriction. |
| C3 | Direction artistique | `DESING.md` + image d'identité : **noir `#0F0F0F` + vert citron `#C7FF2E`, Satoshi** | Prototype Figma Make : **vert forêt `#173F35` + or `#C6A574`, Manrope + DM Serif** | **Noir + citron, Satoshi** (identité explicitement fournie). Le prototype sert uniquement pour la structure des écrans. |
| C4 | Logo | `figma/logo/` : symbole **noir** seul | Prototype : symbole + logotype **vert** serif | Symbole noir. **Il manque une version vectorielle (SVG)** : indispensable pour le centre du QR Code et les impressions. |
| C5 | Séparation admin | Mega-prompt : 2 applications Neon Auth, 1 projet Neon | Neon : 1 instance Auth **par branche** | Voir §5.3 — décision requise. |

## 4. Analyse des ressources visuelles

- **Image d'identité** : style très contrasté, grands titres, cartes arrondies, accent citron réservé à l'action principale, contenus noirs pour les éléments forts. Confirme `DESING.md`.
- **Interfaces d'inspiration** : à retenir — en-têtes à salutation forte, cartes KPI compactes, navigation basse mobile, listes de commandes par statut, menu public avec catégories en pilules et grandes photos, panier en tiroir. À ne pas retenir — couleurs (l'utilisateur le précise lui-même dans un nom de fichier), densité excessive de cartes du dashboard « Relix ».
- **Supports QR** : chevalet de table noir, présentoir acrylique, carte A5 photo + QR. Trois gabarits imprimables pertinents.
- **Prototype Figma Make** : utile comme inventaire d'écrans (Commandes, Menu, Statistiques, QR, Paramètres, Menu public, Auth, flux de nouvelle commande). Défauts à corriger : fichier monolithique, données en dur, icônes Phosphor (alors que `DESING.md` recommande Lucide), tailles de texte de 9–11 px trop petites sur mobile, aucun état vide ni skeleton.

## 5. Architecture cible proposée

### 5.1. Structure du dépôt (monorepo npm workspaces, sans outil supplémentaire)

```
restio/
├─ apps/
│  ├─ web/      → restio-app.com (site), restio-app.com/@slug (menus), app.restio-app.com (restaurateurs)
│  └─ admin/    → admin.restio-app.com (déploiement Vercel séparé, secrets séparés)
├─ packages/
│  ├─ db/       → schémas Drizzle « métier » et « admin », migrations, client Neon
│  ├─ ui/       → composants shadcn/ui partagés + tokens Tailwind 4
│  └─ core/     → validations Zod, règles métier pures (prix, statuts, slug), testées unitairement
└─ demo/        → images et données de démonstration (jamais chargées en production)
```

Pourquoi deux applications et non une : variables d'environnement, cookies, domaine et surface d'attaque réellement séparés ; une faille dans l'app restaurateur ne donne aucun code admin à exploiter.

### 5.2. Points techniques vérifiés ou à vérifier en Phase 4

- **`/@slug` ne peut pas être un dossier Next.js** : dans l'App Router, un dossier `@nom` désigne un *parallel route slot*. Solution : réécriture `/@:slug → /m/:slug` dans le proxy Next.js. À confirmer sur la documentation Next.js 16 avant implémentation.
- Routage par hôte (`restio-app.com` / `app.restio-app.com`) dans le même projet `web` via le proxy.
- Montants en `numeric(12,2)` + devise ISO, jamais en `float`.
- Commandes : création en transaction, prix recalculés côté serveur, clé d'idempotence unique `(restaurant_id, idempotency_key)`, snapshots nom/prix dans `order_items`.
- Machine à états des commandes centralisée dans `packages/core` (transitions refusées côté serveur).
- Rate limiting sur la création de commande publique : **aucune solution Neon/Vercel n'est encore choisie** → décision Phase 4 (table Postgres de compteurs, ou Vercel Firewall).
- Géolocalisation pays : en-tête `x-vercel-ip-country` fourni par Vercel (aucun service tiers, aucune donnée GPS). À confirmer en déploiement.
- Neon Realtime : requêtes « live » scellées côté serveur, filtrées par `restaurant_id` ; repli par rafraîchissement périodique.
- Images : recadrage côté client, conversion WebP + vérification réelle du format côté serveur (`sharp`), upload vers Object Storage par URL présignée, clés générées par le serveur.

### 5.3. Séparation administrateur — trois options

| Option | Description | Séparation | Complexité | Limites |
|---|---|---|---|---|
| **A (retenue)** | Branche Neon dédiée `admin` dans le même projet (**racine, « schéma seulement »** depuis la Phase 2 : aucune donnée copiée, pas de reset possible), avec sa propre base `restio_admin`, **sa propre instance Neon Auth**, son propre endpoint. L'admin lit les données métier via un **rôle Postgres en lecture seule** sur la branche `production`, et écrit uniquement via des actions serveur ciblées et journalisées. | Forte (compute, auth, base, secrets distincts) | Moyenne | Une branche « enfant » peut être réinitialisée depuis son parent : il faudra la **protéger** et ne jamais la réinitialiser. Inscription désactivée (`--disable-sign-up`), compte créé par CLI. |
| B | Neon Auth pour les restaurateurs ; l'admin utilise la bibliothèque Better Auth auto-hébergée sur une base `restio_admin` de la même branche. | Bonne | Moyenne | Ce n'est plus « Neon Auth » côté admin ; même compute que la production. |
| C | Un seul Neon Auth avec rôle `admin`. | Faible | Faible | **Contraire à vos exigences** — écarté. |

Pour compenser l'absence de MFA dans Neon Auth : accès admin limité à l'email autorisé (liste blanche serveur), réauthentification exigée pour les actions destructrices, Vercel Deployment Protection ou restriction IP en option, journal d'audit immuable.

### 5.4. Modèle de données (base métier) — corrections de `UML.md`

Ajouts justifiés : `profiles` (prénom, nom, téléphone, WhatsApp séparés, lien vers l'utilisateur Neon Auth), `restaurant_members` (prépare le multi-collaborateurs sans le développer), `slug_history` (redirection des anciennes URL), `order_status_events` (horodatage et traçabilité des transitions), `push_subscriptions`, `notification_reads`, `onboarding_progress` (champ JSON sur le restaurant suffit), `plans` / `subscriptions` (non activés). `payments` reporté (aucun prestataire choisi).
Corrections : `dish.restaurant_id` ajouté (contrôle d'isolation direct sans jointure), `order_items.dish_id` nullable (`ON DELETE SET NULL`) pour conserver l'historique, `orders.order_number` unique par restaurant, index `(restaurant_id, created_at)` et `(restaurant_id, status)`.

Base admin : `admin_settings` (configuration dynamique : WhatsApp communauté, contacts, réseaux sociaux, pixels), `announcements`, `announcement_views`, `audit_log` (append-only), `analytics_daily` (agrégats sans données personnelles).

## 6. Plan de développement par phases

| Phase | Contenu | Agent(s) | Dépend de | Critère de validation |
|---|---|---|---|---|
| 2 | Arbitrages §3 et §5.3, mise à jour `PROJECT.md`, `UML.md`, création `DATABASE.md` | Principal + Base de données | Vos réponses | Documents cohérents entre eux |
| 3 | `DESIGN.md` définitif (tokens, composants, états, responsive) + maquettes clés en HTML | UX/UI | Phase 2 | Contrastes AA vérifiés, validation visuelle par vous |
| 4 | Monorepo, Next.js 16, TS strict, Tailwind 4, shadcn/ui, Drizzle, migrations, Vitest, Playwright, ESLint, CI GitHub Actions, `.env.example`, git + GitHub | Backend + Base de données | Phase 2 | `lint`, `typecheck`, `test`, `build` verts |
| 5 | Neon Auth restaurateur, séparation admin, rôles Postgres moindre privilège, tests d'accès croisés | Sécurité + Backend | Phase 4 | Tests IDOR et élévation de privilèges verts |
| 6 | App restaurateur : onboarding, menu, images, QR, commandes, stats, paramètres, notifications | Frontend + Backend (par lots) | Phase 5 | Parcours 1–13 du mega-prompt testés au navigateur |
| 7 | Menu public `/@slug`, panier, commande, SEO | Frontend | Phase 6 (menu) | Commande bout-en-bout, Lighthouse mobile |
| 8 | Application admin | Frontend + Sécurité | Phase 5 | Suppression en 3 étapes, audit log, pixels sans JS arbitraire |
| 9 | PWA, Web Push VAPID, Realtime, badges | PWA | Phases 6–7 | Tests Android/desktop ; **iOS non testable ici sans appareil réel** |
| 10 | Audits sécurité, performance, accessibilité, responsive, non-régression | Tests + Sécurité | Tout | Rapport final §32 |

Règle de coordination : un seul agent écrit dans un même dossier à la fois ; chaque lot est relu par un agent distinct avant validation.

## 7. Risques identifiés

- **Sécurité** : endpoint public de commande (spam, faux montants) → validation serveur stricte, prix recalculés, rate limiting, idempotence. Pixels administrables → identifiants validés par regex, scripts générés par le code, jamais de JS saisi.
- **Plan gratuit Neon** : 1 Go par branche, mise en veille du compute (latence au réveil) → acceptable pour le lancement, à surveiller.
- **iOS** : Web Push uniquement pour une PWA installée sur l'écran d'accueil (iOS 16.4+) ; impossible à valider sans iPhone réel.
- **Logo raster** : risque de QR flou à l'impression sans SVG.
- **Données personnelles (RGPD)** : téléphones et WhatsApp des restaurateurs, analytics, pixels → bandeau de consentement requis avant tout pixel publicitaire.

## 8. Skills et outils pertinents identifiés

Disponibles et utiles : `neon:neon-auth`, `neon:neon-postgres`, `neon:neon-object-storage`, MCP Neon (vérifications d'infrastructure), MCP Vercel (déploiement, logs), `impeccable` / `anthropic-skills:ui-ux-pro-max` / `taste-skill` (design), `agent-skills:frontend-ui-engineering`, `agent-skills:security-and-hardening`, `agent-skills:test-driven-development`, `agent-skills:browser-testing-with-devtools` + navigateur intégré (tests responsive), `searchfit-seo:*` (SEO du site public), `dataviz` (graphiques).
Non disponibles comme décrits dans `CLAUDE.md` : `apple-design` existe sous `anthropic-skills:apple-design`. MCP Figma : connecté, mais aucun fichier Figma (URL/fileKey) n'est fourni — les ressources sont locales.

## 9. Décisions validées (3 novembre 2026)

| # | Décision |
|---|---|
| C1 | **Neon Auth** pour les restaurateurs. Clerk abandonné ; `PROJECT.md` et `UML.md` à corriger. |
| C3/C4 | **Noir `#0F0F0F` + citron `#C7FF2E`, Satoshi**, logo symbole noir. SVG du logo à produire. |
| C5 | **Option A** : branche Neon `admin` protégée, base `restio_admin`, instance Neon Auth dédiée, lecture seule sur la production. |
| Connexion | **Email + Google** au lancement. Apple et téléphone reportés (coûts). |
| C2 | Non tranché explicitement : appliqué par défaut le mega-prompt (aucun paiement au lancement), à confirmer. |

## 10. État Vercel (vérifié via MCP le 3 novembre 2026)

- MCP Vercel connecté au compte `vladcrack` (plan **Hobby**). Compte personnel : **aucun projet, aucun domaine**.
- Équipe par défaut `nerix-technology` (nom affiché « VLADIMIR », plan Hobby) : vérifiée via CLI → **aucun projet, aucun domaine**. Le MCP reste refusé (403) sur cette équipe ; le CLI suffit.
- **`restio-app.com` est disponible à l'enregistrement : il n'appartient à personne aujourd'hui.** Achat à décider (aucun achat effectué).
- Plan Hobby : usage **non commercial** selon les conditions Vercel → un plan Pro sera nécessaire pour exploiter Restio commercialement (à confirmer sur les conditions en vigueur).
- `tools/vercel.md` : guide d'installation de l'agent Vercel. MCP connecté (compte personnel) ; CLI 65.10.0 installé et connecté (`vladcrack`) ; plugin non installé (facultatif).

## 11. Ce qui n'a pas été vérifié
- Contenu de la table `neon_auth` (présence éventuelle d'utilisateurs de test).
- Comportement exact du proxy Next.js 16 et de Neon Realtime avec Drizzle (Phase 4).

## 12. Phase 2 — terminée (3 novembre 2026)

Documents mis à jour : `PROJECT.md` (§5, §7, §8, §10, §13, §14), `UML.md` (§3 à §7), `TECHNICAL.md` (architecture, variables, règles de sécurité). Créé : `DATABASE.md`.

Revue indépendante par l'agent Sécurité : 7 points élevés, 6 moyens, 4 faibles, tous intégrés. Points vérifiés directement sur Neon :

- **Confirmé** : tout rôle créé depuis la console Neon hérite de `pg_read_all_data` / `pg_write_all_data` → rôles d'exécution créés en SQL, contrôles automatiques.
- `PUBLIC` n'a aucun droit sur le schéma `neon_auth` ; `neon_auth.jwks` est vide.
- Plugins Neon Auth configurés mais inutiles (`magicLink`, `phoneNumber`, `organization`, `oauthProvider`) → à désactiver en Phase 5.
- Branches « schéma seulement » disponibles → la branche `admin` sera une branche racine, sans aucune donnée copiée.

Décisions prises par défaut, à confirmer :

- Aucun paiement au lancement (mega-prompt prioritaire sur l'ancien `PROJECT.md` §7).
- Machine à états : ajout de `Nouvelle → En préparation` et `Prête → Annulée`.
- Aucune clé d'API Neon dans les applications : la suppression de l'identité Neon Auth d'un restaurateur reste une action manuelle du propriétaire.
- Suppression d'un restaurant définitive ; seuls les slugs retirés sont conservés (jamais réattribués).

Restent ouverts : durée légale de conservation des commandes, liste des devises, achat du domaine, plan Vercel.

Non vérifié : la syntaxe Mermaid des diagrammes n'a pas été validée par un moteur de rendu.

## 13. Phase 3 — design system (3 novembre 2026)

Livrables : `PRODUCT.md` (contexte produit : marchés internationaux, FR + EN, appareils mixtes), `DESIGN.md` (référence visuelle, tokens en frontmatter), `.impeccable/design.json` (compagnon : rampes, ombres, mouvement, composants), `design/board.html` (planche de validation : 3 écrans mobiles, couleurs, typographie, composants).

Méthode : skill `impeccable` (mode Operate, construction code d'abord), direction imposée par le propriétaire, détecteur automatique, deux passes de revue par un relecteur indépendant (disposition « fix » puis 8/8 correctifs résolus ; 2 régressions mineures corrigées ensuite et vérifiées par script : noms de plats sur 2 lignes, âge du ticket sur sa propre ligne).

Vérifié : aucun débordement horizontal à 375 et 390 px ; contrastes calculés (texte ≥ 4,79:1) ; animation du ticket active et neutralisée par `prefers-reduced-motion`.

Non vérifié : navigation au clavier et lecteur d'écran sur la planche ; rendu Safari iOS ; écrans tablette et ordinateur de l'application (prévus en Phase 6). Le détecteur garde 2 avertissements jugés faux positifs (rangées typographiques, spécimen posé dans un panneau).

À décider : le tirage du skill proposait une autre forme signature (« ardoise du jour ») ; le ticket de service a été conservé. Licence Satoshi (Fontshare) à confirmer avant auto-hébergement en Phase 4.

## 14. Phase 4 — fondations (3 novembre 2026)

**Livré**
- Dépôt git initialisé (branche `main`, aucun commit), `.gitignore` (secrets, builds, captures), monorepo npm workspaces.
- `apps/web` et `apps/admin` : Next.js 16.4.4, React 19.3, TypeScript 5.9 strict, Tailwind 4.3 avec les tokens de `DESIGN.md`, ESLint (core-web-vitals + typescript), en-têtes de sécurité (CSP, HSTS sans preload, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy ; admin en `noindex`).
- Routage par hôte dans `proxy.ts` (`app.` → application, `/@slug` → menu public, dossiers internes en 404, chemins encodés décodés avant contrôle).
- Neon Auth : instance serveur et route `/api/auth/[...path]` dans les deux applications (SDK `@neon/auth` 0.8.2 épinglé). Protection des routes : Phase 5.
- `packages/core` (agent Backend) : statuts de commande, argent en centimes BigInt, validation des commandes publiques (prix uniquement depuis la base), slugs, téléphones, formulaires d'onboarding.
- `packages/db` (agent Base de données) : schéma Drizzle complet des deux bases, migrations générées + migrations manuelles (fonctions, clé composite `SET NULL (dish_id)`, rôles colonne par colonne, triggers de garde, assertions).
- CI GitHub Actions (`lint`, `typecheck`, `test`, `npm audit --audit-level=high`, `build`), `.env.example`, `README.md`.

**Vérifié**
- 75 tests unitaires verts ; lint, typecheck et build des deux applications verts ; routage et en-têtes testés sur un serveur de production local.
- Sur la branche Neon `test-migrations` (Postgres 18) : toutes les migrations s'appliquent ; assertions de droits OK ; `restio_app` refusé pour : modifier le statut d'un restaurant, supprimer un restaurant, écrire un abonnement, lire `neon_auth`, appeler `next_order_number`, réutiliser un slug retiré ; commande forgée (`999`, `completed`) enregistrée en `1`, `new` ; double envoi ignoré ; suppression en cascade par `restio_admin_ops` OK.

**Revues indépendantes** : agent Sécurité (0 critique, 0 élevée, 3 moyennes, 6 faibles). Corrigés : CSP, slug non réattribuable en base, `@neon/auth` épinglé, garde des commandes en base, caractères NUL refusés, pool de connexions unique, chemins encodés, HSTS sans preload.

**Restant / non vérifié**
- Assertions de droits encore en liste noire (amélioration : comparaison complète à la matrice §5.2).
- `npm audit` : 4 vulnérabilités modérées dans `esbuild` via `drizzle-kit` (outil de développement, non déployé).
- CSP avec `'unsafe-inline'` pour les scripts : passage aux nonces avant tout contenu tiers.
- Branche `admin` et base `restio_admin` non créées : l'outil Neon disponible ne crée pas de branche « schéma seulement » ; à faire depuis la console Neon (Phase 5).
- Migrations **non appliquées à `production`** ; rôles sans mot de passe (NOLOGIN) tant que le propriétaire ne les a pas activés hors dépôt.
- Sur la branche de test seulement : `neondb_owner` a reçu le droit `SET ROLE` vers les rôles d'exécution pour les tests.
- Police Satoshi non téléchargée : licence vérifiée (ITF FFL 2.0, auto-hébergement autorisé pour nos interfaces, interdit comme police proposée aux restaurants) ; le téléchargement demande votre accord.
- Aucun dépôt GitHub ni projet Vercel créé.

## 15. Phase 5 — authentification et séparation (3 novembre 2026)

**Neon**
- Branche `test-migrations` = environnement de développement : Neon Auth configuré (vérification email par code obligatoire, organisations désactivées), rôle `restio_app` activé, `restio_admin_ops` activé.
- Branche `admin` (`br-solitary-heart-bahaxbwh`) : enfant de `production` (la branche « schéma seulement » a été essayée puis supprimée : Neon refuse d'y activer Neon Auth). Instance Neon Auth dédiée : inscription désactivée, Google supprimé, organisations désactivées ; un compte administrateur créé (vladimirdjiedeu@gmail.com, sans mot de passe : premier accès par code email). Schéma admin migré, rôle `restio_admin_app` activé, assertions OK.
- Aucun secret n'a transité par la conversation : mots de passe générés localement dans `.env.local` (ignorés par git), rôles activés par `packages/db/scripts/activate-role.mjs` avec la chaîne propriétaire passée directement par la CLI Neon.
- Production : **non modifiée** (Neon Auth y garde vérification email désactivée et organisations activées tant que vous n'avez pas validé).

**Application restaurateur (`apps/web`)**
- Gardes serveur `requireUser` (session + email vérifié) et `requireMembership` (restaurant issu de la session uniquement).
- Actions serveur : inscription (réponse identique si l'adresse existe), vérification par code, renvoi de code, connexion (message générique), déconnexion, mot de passe oublié par code. Limitation en base par IP et par email pseudonymisés. Email en attente dans un cookie httpOnly, jamais dans l'URL.
- Route `/api/auth/*` : fonctions Better Auth inutiles bloquées (admin, organisations, OAuth serveur, liens magiques, téléphone, suppression de compte, jeton anonyme).
- Écrans (agent Frontend) : connexion, inscription, vérification, mot de passe oublié, réinitialisation ; composants partagés `packages/ui`.

**Administration (`apps/admin`)**
- Garde `requireAdmin` : session de l'instance admin + email vérifié + liste blanche `ADMIN_ALLOWED_EMAILS` ; un compte non autorisé est déconnecté aussitôt.
- Route `/api/auth/*` en liste blanche stricte (session, connexion, déconnexion). Premier accès / mot de passe oublié par code envoyé uniquement aux adresses autorisées, mot de passe ≥ 14 caractères, limitation en base admin.

**Vérifié** : 80 tests ; lint et typage ; tests en conditions réelles (chemins bloqués en 404, redirections, message générique, écriture des compteurs de limitation sans donnée personnelle).

**Non vérifié** : parcours complet avec réception d'un vrai code email (inscription restaurateur et premier accès admin : à faire par vous) ; connexion Google réelle ; Safari iOS.

**Corrigé en route** : débordement du compilateur TypeScript sur les types Drizzle (types explicites des clients).

**Revue de sécurité indépendante (Phase 5)** : 2 élevées, 4 moyennes, 3 faibles, 3 informations.
- Corrigé et vérifié en local :
  - route `/api/auth/*` des restaurateurs en **liste blanche** (`get-session`, `sign-in/social`, `callback/google`, `sign-out`) : la connexion par email, l'inscription et les codes passent uniquement par les server actions limitées ;
  - route admin réduite à `get-session` et `sign-out` ;
  - session admin vérifiée auprès de Neon Auth à chaque requête (sans cache de 5 minutes) ;
  - limites par compte 4× plus larges que par IP (anti-blocage à distance) ;
  - script d'activation : la chaîne de connexion n'est jamais affichée en cas d'erreur ;
  - DATABASE.md : préfixe `__Secure-` imposé par le SDK, secrets de cookie distincts entre web et admin.
- **À vérifier sur une branche de test avant la production** :
  - liaison implicite d'un compte Google à un compte email non vérifié (risque de prise de compte) ;
  - révocation des sessions après réinitialisation du mot de passe ;
  - domaines de confiance Neon Auth sans `localhost` ni joker en production ;
  - Data API Neon désactivée (jeton `token`).
- Accepté pour l'instant : énumération possible par le temps de réponse (faible) ; IP lue depuis les en-têtes Vercel (à revoir si un CDN est placé devant).

**Correctifs après vos premiers tests (3 novembre 2026)**
- Inscription refusée par Neon (403) : l'origine `app.localhost` n'est pas couverte par `allow_localhost`. Ajouté aux domaines de confiance de la branche de test. **En production, ajouter `https://app.restio-app.com` (restaurateurs) et `https://admin.restio-app.com` (branche admin) aux domaines de confiance.**
- Codes d'erreur du SDK normalisés en minuscules (`user_already_exists`, `email_not_confirmed`) : les contrôles d'anti-énumération et de reprise de vérification sont corrigés.
- Connexion admin : la liste blanche est désormais vérifiée sur l'utilisateur renvoyé par la connexion (la session n'est lisible qu'à la requête suivante).
- Un compte de test non vérifié (`restio-test-signup@example.invalid`) existe sur la branche de test.
