# RESTIO — Structure des données

> Référence de la structure de la base. Les diagrammes sont dans `UML.md`. Les choix d'architecture sont dans `TECHNICAL.md`.
> Statut : **conception validée en Phase 2 (3 novembre 2026), pas encore implémentée.** Les migrations Drizzle feront foi dès la Phase 4.

## 1. Topologie Neon

Un seul projet Neon : `Restio` (`purple-sunset-30734372`), AWS `eu-central-1`, Postgres 18.

| Branche | Base | Contenu | Neon Auth | Utilisée par |
|---|---|---|---|---|
| `production` | `neondb` | Données métier des restaurants + schéma `neon_auth` géré par Neon | Instance **restaurateurs** | `apps/web` (lecture/écriture), `apps/admin` (accès restreint, §5) |
| `admin` (`br-solitary-heart-bahaxbwh`, branche enfant de `production`) | `neondb` | Données internes de l'administration + schéma `neon_auth` | Instance **administration**, inscriptions désactivées | `apps/admin` uniquement |

Règles :

- `apps/web` ne possède **aucun** identifiant vers la branche `admin`.
- **Écart constaté le 3 novembre 2026** : Neon refuse d'activer Neon Auth sur une branche « schéma seulement » (« permission denied for database », non documenté). La branche `admin` est donc une **branche enfant** de `production`, créée alors que `production` ne contenait aucune donnée (0 utilisateur, 0 table) : rien de sensible n'a été copié. Elle a sa propre instance Neon Auth (inscription désactivée, Google supprimé) et sa propre base `neondb`.
- **Ne jamais exécuter « Reset from parent » sur la branche `admin`** : cela effacerait les données d'administration. La protection de branche n'est pas disponible sur le plan gratuit de Neon.
- Les branches de développement et de prévisualisation sont aussi créées en **« schéma seulement »** (ou avec des données de démonstration) : jamais de données réelles de restaurateurs hors de `production`.
- Aucune branche de développement n'a accès à la branche `admin`.

## 2. Conventions

| Sujet | Règle |
|---|---|
| Identifiants | `uuid` généré par `uuidv7()` (natif Postgres 18) : unique et trié dans le temps, ce qui garde des index compacts. |
| Dates | `timestamptz`, colonnes `created_at` et `updated_at` (`updated_at` mise à jour par l'application). |
| Montants | `numeric(12,2)`, jamais `float`. La devise est un code ISO 4217 sur 3 lettres (`XOF`, `XAF`, `EUR`, `USD`…). |
| Textes libres | Longueur maximale imposée par une contrainte `CHECK` **et** par la validation Zod côté serveur. |
| Statuts | Types `enum` Postgres. Toute transition est validée par `packages/core` avant écriture. |
| Isolation | Chaque table métier porte `restaurant_id`. Chaque requête de l'application filtre sur le `restaurant_id` de la session, jamais sur une valeur envoyée par le navigateur. |
| Cohérence inter-tables | Clés étrangères **composites** `(id, restaurant_id)` : un plat ne peut pas pointer vers la catégorie d'un autre restaurant, même en cas de bug applicatif. |
| Schéma `neon_auth` | Géré par Neon. **Aucune clé étrangère** vers ses tables (pour ne pas bloquer les migrations internes de Neon) et aucune lecture directe par l'application. Il contient des mots de passe hachés et des clés privées de signature (`jwks`). |

## 3. Base métier — branche `production`, base `neondb`

### 3.1. Comptes et restaurants

**`profiles`** — informations personnelles du restaurateur (une ligne par utilisateur Neon Auth).

| Colonne | Type | Contraintes |
|---|---|---|
| `user_id` | uuid | PK. Identifiant de l'utilisateur Neon Auth. |
| `first_name` | text | NOT NULL, 1–80 caractères |
| `last_name` | text | NOT NULL, 1–80 caractères |
| `phone_e164` | text | NOT NULL, format E.164 (`^\+[1-9][0-9]{6,14}$`) |
| `whatsapp_e164` | text | NOT NULL, format E.164. Distinct de `phone_e164` dans le modèle, même si la valeur est identique. |
| `tour_completed_at` | timestamptz | NULL tant que la présentation interactive n'est pas terminée ou ignorée |
| `created_at`, `updated_at` | timestamptz | NOT NULL |

**`restaurants`**

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK. Identifiant interne, jamais exposé comme moyen d'accès. |
| `slug` | text | NOT NULL, UNIQUE, `^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$`, hors liste de mots réservés (`admin`, `app`, `api`, `www`…) contrôlée côté serveur |
| `name` | text | NOT NULL, 2–80 caractères |
| `country_code` | char(2) | NOT NULL, ISO 3166-1 alpha-2 |
| `city` | text | NOT NULL, 1–80 caractères |
| `address` | text | NULL, ≤ 200 caractères |
| `opened_on` | date | NULL (date d'ouverture du restaurant) |
| `currency` | char(3) | NOT NULL (déduite du pays, modifiable) |
| `timezone` | text | NOT NULL, ex. `Africa/Douala`. Indispensable pour calculer les statistiques « du jour ». |
| `description` | text | NULL, ≤ 500 caractères |
| `logo_key`, `banner_key` | text | NULL. Clés d'objets dans le stockage, générées par le serveur. |
| `public_phone`, `public_whatsapp` | text | NULL, E.164. Coordonnées affichées sur le menu public, distinctes de celles du gérant. |
| `appearance` | jsonb | NOT NULL, défaut `{}`. Réglages du menu public, validés par un schéma Zod **strict** : couleurs hexadécimales et valeurs énumérées uniquement, aucune URL ni CSS libre. |
| `is_published` | boolean | NOT NULL, défaut `false`. Le menu public n'est accessible qu'une fois publié. |
| `is_indexable` | boolean | NOT NULL, défaut `true` |
| `status` | enum `restaurant_status` (`active`, `suspended`) | NOT NULL, défaut `active`. Seule l'administration peut le modifier. |
| `onboarding` | jsonb | NOT NULL, défaut `{}`. Progression du premier menu (étapes terminées). |
| `order_seq` | integer | NOT NULL, défaut 0. Compteur des numéros de commande. Modifiable **uniquement** par la fonction `next_order_number(restaurant_id)` (`SECURITY DEFINER`), appelée dans la transaction de création. |
| `created_at`, `updated_at` | timestamptz | NOT NULL |

**`restaurant_members`** — lien utilisateur ↔ restaurant. Prépare les collaborateurs sans les développer.

| Colonne | Type | Contraintes |
|---|---|---|
| `restaurant_id` | uuid | FK → `restaurants.id` ON DELETE CASCADE |
| `user_id` | uuid | NOT NULL |
| `role` | enum `member_role` (`owner`) | NOT NULL. D'autres rôles seront ajoutés le jour où les collaborateurs existeront. |
| `created_at` | timestamptz | NOT NULL |

PK `(restaurant_id, user_id)`. **UNIQUE `(user_id)`** : un compte = un restaurant en V1 (contrainte à retirer le jour du multi-restaurant).

**`slug_history`** — anciennes adresses publiques, redirigées vers l'adresse actuelle.

| Colonne | Type | Contraintes |
|---|---|---|
| `slug` | text | PK |
| `restaurant_id` | uuid | NULL. FK → `restaurants.id` ON DELETE SET NULL |
| `retired_at` | timestamptz | NOT NULL |

Un slug ne peut être ni le slug actuel d'un autre restaurant ni un slug archivé : vérification dans la même transaction que le changement, avec verrou sur la ligne du restaurant.
**Les slugs retirés ne sont jamais réattribués**, même après suppression du restaurant (`restaurant_id` devient NULL) : un QR Code déjà imprimé ne doit jamais mener au menu d'un autre établissement. Un slug orphelin affiche une page « Ce menu n'est plus disponible ».

### 3.2. Menu

**`categories`**

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `restaurant_id` | uuid | FK → `restaurants.id` ON DELETE CASCADE |
| `name` | text | NOT NULL, 1–60 caractères |
| `position` | integer | NOT NULL |
| `is_visible` | boolean | NOT NULL, défaut `true` |
| `created_at`, `updated_at` | timestamptz | NOT NULL |

UNIQUE `(id, restaurant_id)` (cible des clés composites). Index `(restaurant_id, position)`.

**`dishes`**

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `restaurant_id` | uuid | NOT NULL. FK → `restaurants.id` ON DELETE CASCADE |
| `category_id` | uuid | NOT NULL. FK `(category_id, restaurant_id)` → `categories(id, restaurant_id)` ON DELETE NO ACTION |
| `name` | text | NOT NULL, 1–80 caractères |
| `description` | text | NULL, ≤ 300 caractères |
| `price` | numeric(12,2) | NOT NULL, `>= 0` |
| `image_key` | text | NULL |
| `is_available` | boolean | NOT NULL, défaut `true` |
| `is_featured` | boolean | NOT NULL, défaut `false` |
| `position` | integer | NOT NULL |
| `created_at`, `updated_at` | timestamptz | NOT NULL |

UNIQUE `(id, restaurant_id)`. Index `(restaurant_id, category_id, position)`.
Supprimer une catégorie qui contient des plats est refusé : l'interface propose de déplacer ou supprimer les plats d'abord. `NO ACTION` (et non `RESTRICT`) est volontaire : le contrôle a lieu en fin d'instruction, ce qui laisse passer la suppression en cascade d'un restaurant entier (plats et catégories supprimés par la même instruction). À vérifier par un test en Phase 4.

### 3.3. Commandes

**`orders`**

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `restaurant_id` | uuid | FK → `restaurants.id` ON DELETE CASCADE |
| `order_number` | integer | NOT NULL. UNIQUE `(restaurant_id, order_number)`. Numéro lisible affiché au personnel. |
| `table_label` | text | NOT NULL, 1–20 caractères (« 12 », « Terrasse 3 ») |
| `customer_note` | text | NULL, ≤ 500 caractères |
| `status` | enum `order_status` | NOT NULL, défaut `new` |
| `currency` | char(3) | NOT NULL, copie de la devise au moment de la commande |
| `total_amount` | numeric(12,2) | NOT NULL, `>= 0`. **Recalculé côté serveur**, jamais reçu du navigateur. |
| `idempotency_key` | uuid | NOT NULL. UNIQUE `(restaurant_id, idempotency_key)`. Insertion par `INSERT … ON CONFLICT DO NOTHING` puis relecture : deux envois simultanés renvoient la même commande, sans erreur. |
| `created_at`, `updated_at` | timestamptz | NOT NULL |

UNIQUE `(id, restaurant_id)`. Index `(restaurant_id, created_at DESC)` et index partiel `(restaurant_id, status)` sur les statuts actifs (`new`, `accepted`, `preparing`, `ready`).

`order_status` : `new`, `accepted`, `preparing`, `ready`, `completed`, `rejected`, `cancelled`. Transitions autorisées : voir `UML.md` §7.

**`order_items`** — instantané figé au moment de la commande.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `order_id` | uuid | NOT NULL. FK `(order_id, restaurant_id)` → `orders(id, restaurant_id)` ON DELETE CASCADE |
| `restaurant_id` | uuid | NOT NULL (sert à l'isolation et aux statistiques sans jointure) |
| `dish_id` | uuid | NULL. FK composite `(dish_id, restaurant_id)` → `dishes(id, restaurant_id)` ON DELETE SET NULL (`dish_id`) (syntaxe Postgres 15+) : supprimer un plat ne casse pas l'historique, et une ligne ne peut pas référencer le plat d'un autre restaurant. |
| `dish_name` | text | NOT NULL (copie) |
| `category_name` | text | NOT NULL (copie, pour les statistiques par catégorie) |
| `unit_price` | numeric(12,2) | NOT NULL, `>= 0` (copie) |
| `quantity` | integer | NOT NULL, 1–99 |
| `line_total` | numeric(12,2) | NOT NULL, = `unit_price × quantity` (contrainte CHECK) |

Index `(restaurant_id, dish_id)`.

**`order_status_events`** — historique des changements de statut (ajout uniquement).

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `order_id` | uuid | FK `(order_id, restaurant_id)` → `orders(id, restaurant_id)` ON DELETE CASCADE |
| `restaurant_id` | uuid | NOT NULL |
| `from_status` | `order_status` | NULL pour la création |
| `to_status` | `order_status` | NOT NULL |
| `actor_user_id` | uuid | NULL si l'action vient du client (création) |
| `created_at` | timestamptz | NOT NULL |

Index `(order_id, created_at)`.

### 3.4. Notifications et présence

**`notifications`** — boîte de réception du restaurant (partagée par ses membres).

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `restaurant_id` | uuid | FK → `restaurants.id` ON DELETE CASCADE |
| `type` | enum `notification_type` (`order_new`, `order_status`, `system`) | NOT NULL |
| `title` | text | NOT NULL, ≤ 120 caractères |
| `body` | text | NULL, ≤ 500 caractères |
| `order_id` | uuid | NULL. FK composite `(order_id, restaurant_id)` → `orders(id, restaurant_id)` ON DELETE CASCADE |
| `read_at` | timestamptz | NULL = non lue |
| `created_at` | timestamptz | NOT NULL |

Index partiel `(restaurant_id, created_at DESC) WHERE read_at IS NULL` : compte exact de la pastille rouge.

**`push_subscriptions`** — abonnements Web Push par appareil.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | NOT NULL |
| `restaurant_id` | uuid | FK → `restaurants.id` ON DELETE CASCADE |
| `endpoint` | text | NOT NULL, UNIQUE. URL `https` dont l'hôte figure sur une **liste blanche** des services de push (`fcm.googleapis.com`, `*.push.services.mozilla.com`, `*.notify.windows.com`, `web.push.apple.com`) : protège contre les requêtes vers des ressources internes (SSRF). Envoi avec délai court et sans suivre les redirections. |
| `p256dh`, `auth` | text | NOT NULL (clés publiques de l'appareil fournies par le navigateur) |
| `failure_count` | integer | NOT NULL, défaut 0. Abonnement supprimé après échec définitif (HTTP 404/410), à la déconnexion, et si l'utilisateur n'est plus membre du restaurant (vérifié au moment de l'envoi). |
| `created_at`, `last_success_at` | timestamptz | |

**`menu_views_daily`** — fréquentation du menu public, **sans donnée personnelle**.

| Colonne | Type | Contraintes |
|---|---|---|
| `restaurant_id` | uuid | FK → `restaurants.id` ON DELETE CASCADE |
| `day` | date | NOT NULL (jour dans le fuseau du restaurant) |
| `views` | integer | NOT NULL, défaut 0 |

PK `(restaurant_id, day)`. Incrément par `INSERT … ON CONFLICT DO UPDATE`.

### 3.5. Contenus publiés par l'administration

Ces tables sont **écrites uniquement par l'administration** et **lues par l'application** restaurateur. Ainsi, `apps/web` n'a jamais besoin d'accéder à la branche `admin`.

**`platform_settings`** — configuration dynamique **non secrète** (source unique de vérité).

| Colonne | Type | Contraintes |
|---|---|---|
| `key` | text | PK, liste fermée définie dans `packages/core` (`community_whatsapp_url`, `contact_email`, `contact_phone`, `social_links`, `tracking_pixels`, `feature_flags`…) |
| `value` | jsonb | NOT NULL, validée par le schéma Zod propre à chaque clé |
| `updated_at` | timestamptz | NOT NULL |

Les identifiants de pixels (Meta, TikTok, Google Analytics, GTM) sont stockés comme **identifiants validés par expression régulière** ; le script est généré par le code, jamais saisi.
Les pixels ne sont chargés **que sur le site vitrine** `restio-app.com`, **après consentement**, et autorisés par la politique CSP. Jamais sur `app.`, `admin.` ni sur les menus publics : Google Tag Manager peut exécuter du JavaScript arbitraire configuré hors de Restio.

**`announcements`** — annonces, nouveautés, tutoriels, maintenance, promotions.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `kind` | enum `announcement_kind` (`feature`, `tutorial`, `maintenance`, `promotion`, `info`) | NOT NULL |
| `title` | text | NOT NULL, ≤ 120 caractères |
| `body` | text | NOT NULL, ≤ 2 000 caractères, texte brut (aucun HTML) |
| `link_url` | text | NULL, `https` uniquement. Ouvert avec `rel="noopener noreferrer"`. |
| `youtube_video_id` | text | NULL, `^[A-Za-z0-9_-]{11}$`. L'URL d'intégration `youtube-nocookie.com` est construite par le code. |
| `audience` | jsonb | NOT NULL (tous, pays, restaurants récents…), validée par Zod |
| `display` | enum (`banner`, `modal`, `inbox`) | NOT NULL |
| `starts_at`, `ends_at` | timestamptz | NOT NULL, `ends_at > starts_at` |
| `is_active` | boolean | NOT NULL |
| `created_at`, `updated_at` | timestamptz | NOT NULL |

**`announcement_dismissals`** — évite de réafficher la même fenêtre.
PK `(announcement_id, user_id)`, `dismissed_at timestamptz`. FK `announcement_id` ON DELETE CASCADE.

### 3.6. Abonnements (préparés, non activés)

**`plans`** : `id text` PK (`free`, `plus`, `pro` — noms provisoires), `name text`, `is_active boolean`, `sort integer`. **Aucun prix ni limite** tant que l'étude de marché n'est pas faite.

**`subscriptions`** : `restaurant_id` PK FK ON DELETE CASCADE, `plan_id` FK → `plans.id`, `status` enum (`active`, `trialing`, `past_due`, `canceled`), `current_period_start`, `current_period_end` (NULL au lancement), `created_at`, `updated_at`.
Au lancement : chaque restaurant reçoit `free` / `active`. Aucune restriction commerciale n'est appliquée.

Pas de table de paiements tant qu'aucun prestataire n'est choisi.

### 3.7. Protection contre les abus

**`rate_limit_buckets`** : `key text` PK, `window_start timestamptz`, `hits integer`. Trois limites cumulées sur la création de commande : par IP et par restaurant, **par IP tous restaurants confondus**, et nombre de commandes `new` par restaurant et par minute.
L'IP provient de l'en-tête fourni par Vercel (jamais d'un `X-Forwarded-For` brut) et est **hachée avec un sel secret** : c'est une pseudonymisation, pas une anonymisation. Les fenêtres expirées sont supprimées après 24 heures. Le choix final (table Postgres ou Vercel Firewall) est confirmé en Phase 4.

**Règles du point d'entrée public de commande** (en plus des contraintes ci-dessus) : restaurant `is_published = true` et `status = 'active'` ; plats disponibles dans une catégorie visible du même restaurant ; au plus 50 lignes, doublons fusionnés ; taille du corps de requête limitée.

## 4. Base d'administration — branche `admin`, base `neondb`

Volontairement réduite : ce n'est pas une copie de la base métier.

**`audit_log`** — journal immuable des actions administratives.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | bigint | PK, `GENERATED ALWAYS AS IDENTITY` |
| `at` | timestamptz | NOT NULL, défaut `now()` |
| `admin_user_id` | uuid | NOT NULL |
| `action` | text | NOT NULL, liste fermée (`restaurant.suspend`, `restaurant.delete`, `settings.update`, `announcement.publish`…) |
| `target_type`, `target_id` | text | NULL |
| `metadata` | jsonb | NOT NULL. Valeurs avant/après **sans** mot de passe, jeton ni donnée personnelle inutile. |
| `request_id` | text | NOT NULL |
| `ip_hash` | text | NULL |

Le rôle d'exécution n'a que `INSERT` et `SELECT` : ni `UPDATE` ni `DELETE`. Pour une action destructrice, l'intention est journalisée **avant** l'exécution, puis le résultat après.

**`deletion_requests`** — suppression d'un restaurant en trois étapes.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `restaurant_id` | uuid | NOT NULL |
| `restaurant_name_snapshot` | text | NOT NULL (texte à ressaisir à l'étape 2) |
| `step` | enum (`confirmed`, `typed`, `executed`, `cancelled`) | NOT NULL |
| `requested_by` | uuid | NOT NULL |
| `reauthenticated_at` | timestamptz | NULL, exigée récente (< 5 minutes) pour l'étape 3. Écrite **uniquement par le serveur** après vérification du mot de passe auprès de Neon Auth, jamais d'après une valeur du client. |
| `executed_at` | timestamptz | NULL |
| `created_at` | timestamptz | NOT NULL, demande expirée après 15 minutes |

Index unique partiel `(restaurant_id) WHERE step IN ('confirmed','typed')` : une seule demande en cours par restaurant, ce qui empêche les doubles exécutions.

## 5. Rôles Postgres et moindre privilège

### 5.1. Création des rôles

**Vérifié le 3 novembre 2026 :** sur Neon, tout rôle créé depuis la console, le CLI ou l'API devient membre de `neon_superuser`, qui hérite de `pg_read_all_data` et `pg_write_all_data`. Un tel rôle pourrait lire `neon_auth.jwks` (clés privées) et fabriquer des sessions valides pour n'importe quel compte.

Donc :

- Les rôles d'exécution sont créés **en SQL** (`CREATE ROLE … LOGIN`) par une migration dédiée, jamais depuis la console.
- La migration se termine par des contrôles qui doivent échouer si un droit dépasse : `pg_has_role(rôle, 'neon_superuser', 'MEMBER') = false`, `has_table_privilege(rôle, 'neon_auth.jwks', 'SELECT') = false`, aucun droit sur le schéma `neon_auth`.
- Les droits sont accordés **colonne par colonne** lorsque la table contient des colonnes protégées. Dans Postgres, un `UPDATE` accordé sur toute la table l'emporte sur un `REVOKE` par colonne.
- `ALTER DEFAULT PRIVILEGES` n'accorde rien par défaut : chaque nouvelle table reçoit ses droits explicitement dans sa migration.
- Des tests de non-régression tentent chaque écriture interdite et vérifient le refus.

### 5.2. Matrice des droits

| Rôle | Branche / base | Droits | Utilisé par |
|---|---|---|---|
| `neondb_owner` | `production` / `neondb` | Propriétaire. **Migrations uniquement**, jamais à l'exécution. | CI / commande manuelle |
| `restio_app` | `production` / `neondb` | Voir le détail ci-dessous. **Aucun accès** au schéma `neon_auth`. | `apps/web` |
| `restio_admin_ops` | `production` / `neondb` | `SELECT` sur les tables métier ; `UPDATE (status, updated_at)` sur `restaurants` ; `DELETE` sur `restaurants` et `profiles` (suppression d'un compte) ; `DELETE` sur `announcement_dismissals` ; `INSERT, UPDATE, DELETE` sur `platform_settings`, `announcements`. **Aucun accès** au schéma `neon_auth`. | `apps/admin` |
| `neondb_owner` | `admin` / `neondb` | Migrations uniquement. | CI / commande manuelle |
| `restio_admin_app` | `admin` / `neondb` | `INSERT, SELECT` sur `audit_log` ; `SELECT, INSERT, UPDATE (step, reauthenticated_at, executed_at)` sur `deletion_requests` ; `SELECT, INSERT, UPDATE, DELETE` sur `rate_limit_buckets`. | `apps/admin` |

Détail de `restio_app` :

| Tables | Droits |
|---|---|
| `restaurants` | `SELECT`, `INSERT`, `UPDATE` **sur les colonnes modifiables par le restaurateur uniquement** (pas `id`, `status`, `order_seq`, `created_at`). **Pas de `DELETE`** : un restaurant suspendu ne peut pas se supprimer pour se recréer. |
| `profiles`, `restaurant_members`, `categories`, `dishes`, `push_subscriptions`, `announcement_dismissals` | `SELECT, INSERT, UPDATE, DELETE` (`restaurant_members` : `SELECT, INSERT` seulement) |
| `orders` | `SELECT, INSERT`, `UPDATE (status, updated_at)` |
| `order_items`, `order_status_events` | `SELECT, INSERT` |
| `notifications` | `SELECT, INSERT`, `UPDATE (read_at)` |
| `slug_history` | `SELECT` seulement (écrit par le trigger `restaurants_slug_guard`) |
| `menu_views_daily`, `rate_limit_buckets` | `SELECT, INSERT, UPDATE` (`rate_limit_buckets` : aussi `DELETE` pour le nettoyage) |
| `platform_settings`, `announcements`, `plans`, `subscriptions` | `SELECT` seulement |
| Fonction `next_order_number(uuid)` | Aucun droit : appelée uniquement par le trigger `orders_force_defaults` |

Vérifié sur une branche Neon (Phase 4) : les suppressions en cascade s'exécutent avec les droits du propriétaire des tables enfants ; `restio_admin_ops` n'a pas besoin de `DELETE` sur ces tables.

### 5.4. Règles imposées par la base (triggers)

| Trigger | Effet |
|---|---|
| `restaurants_force_defaults` (avant insertion) | `status = 'active'`, `order_seq = 0`, quelles que soient les valeurs envoyées. |
| `restaurants_create_free_subscription` (après insertion) | Crée l'abonnement `free` / `active`. |
| `restaurants_slug_guard` (avant insertion ou changement de slug) | Verrou consultatif par slug ; refuse un slug retiré par un autre restaurant (même supprimé) ; archive l'ancien slug. |
| `orders_force_defaults` (avant insertion) | `status = 'new'` et `order_number` = prochain numéro du restaurant. |

Toutes ces fonctions sont `SECURITY DEFINER` avec `search_path` figé et sans droit `EXECUTE` pour `PUBLIC`.

### 5.3. Comptes Neon Auth

- Les comptes (création, réinitialisation, suppression) ne sont jamais modifiés en SQL.
- **Aucune clé d'API Neon n'est déployée dans une application.** Une clé d'API Neon donne la main sur tout le projet (rôles, chaînes de connexion) : la compromission d'`apps/admin` deviendrait une compromission totale.
- La suppression de l'identité Neon Auth d'un restaurateur supprimé est faite par le propriétaire (console ou CLI Neon), à partir d'une liste « suppressions d'identité en attente » affichée dans l'administration. C'est une opération rare en V1.
- Sur l'instance des restaurateurs : seuls l'email et Google sont activés. Les plugins configurés aujourd'hui et non utilisés (`magicLink`, `phoneNumber`, `organization`, `oauthProvider`) sont désactivés en Phase 5. Contrôle régulier : aucun compte avec `role = 'admin'` sur `production`.
- Cookies de session sans attribut `Domain` (limités à leur sous-domaine). Préfixe `__Secure-` imposé par le SDK Neon Auth (`__Host-` impossible). `NEON_AUTH_COOKIE_SECRET` doit être différent entre `apps/web` et `apps/admin`, et l'admin vérifie la session auprès de Neon Auth à chaque requête (pas de cache de 5 minutes).

## 6. Stockage des fichiers (Neon Object Storage)

- Bucket `media` (branche `production`) : lecture publique **objet par objet** pour les images du menu, **listage du bucket interdit**, écriture uniquement par le serveur.
- Clés générées par le serveur : `restaurants/<restaurant_id>/<logo|banner|dishes>/<uuidv7>.webp`. Aucun nom de fichier fourni par l'utilisateur n'est conservé.
- Le serveur limite la taille du corps avant lecture, vérifie le format réel (signature du fichier), limite le nombre de pixels décodés (`sharp` `limitInputPixels`) et réencode en WebP avant l'envoi.
- Remplacement ou suppression d'une image : l'ancien objet est supprimé après validation de la transaction.
- Deux variantes par image (`<uuid>.webp` et `<uuid>-thumb.webp`), servies avec un cache immuable : une nouvelle clé par version. Le navigateur compresse avant l'envoi, le serveur revérifie et réencode.

## 7. Migrations

- Drizzle Kit génère des fichiers SQL versionnés et relus avant application.
- Les migrations s'appliquent d'abord sur une branche de test créée depuis `production`, puis sur `production`.
- Toute migration destructive (suppression de colonne ou de table, changement de type) exige une sauvegarde (instantané Neon) et votre validation explicite.
- Les rôles et droits (§5) sont créés par une migration dédiée, relue par l'agent Sécurité.

## 8. Points ouverts

- Durée de conservation des commandes et des données d'un restaurant supprimé (obligations légales et fiscales selon les pays) : **décision du propriétaire requise**. Par défaut, la suppression est définitive et seule une trace sans donnée personnelle reste dans `audit_log`.
- La suppression d'un compte supprime dans une même transaction : le restaurant (et en cascade menu, commandes, notifications, abonnements), `profiles`, `announcement_dismissals` de l'utilisateur. Les fichiers du stockage sont supprimés ensuite (échec journalisé et rejoué). Seuls les slugs retirés sont conservés, sans lien vers le restaurant.
- Option future : jeton de table signé dans le QR Code pour empêcher les commandes passées hors du restaurant.
- Liste exacte des devises proposées à l'inscription.
