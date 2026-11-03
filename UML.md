# RESTIO — MODÉLISATION UML

## 1. Objectif du document

Ce document présente une première modélisation UML de Restio, plateforme SaaS de gestion de menus numériques et de commandes pour les restaurants.

Il a pour objectif de faciliter la compréhension de l'architecture fonctionnelle, des principales entités métier et des interactions entre les différents composants de l'application.

Les diagrammes présentés constituent une base de travail indicative.

**Ils ne représentent pas une architecture définitive et ne doivent pas être considérés comme des contraintes techniques immuables.**

L'agent de développement doit analyser ce document, le confronter aux autres documents du projet et à l'architecture réellement existante, puis le valider, le corriger, le compléter ou le simplifier selon les besoins réels.

## 2. Instructions de modélisation

Avant toute utilisation de ces diagrammes :

1. Lire `PROJECT.md` pour comprendre le fonctionnement global de Restio.
2. Lire `CLAUDE.md` et les directives globales de sécurité.
3. Consulter `DESIGN.md` pour comprendre les contraintes de conception.
4. Examiner l'architecture, les technologies et les fonctionnalités existantes.
5. Vérifier les entités, relations et processus réellement nécessaires.
6. Analyser les éventuelles incohérences ou informations manquantes dans les diagrammes.

### Règles importantes

- Ne pas considérer les diagrammes proposés comme exhaustifs.
- Ne pas inventer des entités, attributs, relations ou fonctionnalités sans justification.
- Ne pas supprimer une relation nécessaire au fonctionnement du produit.
- Adapter les diagrammes à la technologie et à l'architecture réellement utilisées.
- Préserver les fonctionnalités existantes.
- Privilégier une architecture simple, cohérente, sécurisée et évolutive.
- Mettre à jour les diagrammes lorsque des décisions techniques ou fonctionnelles importantes évoluent.

Si une information nécessaire manque, rechercher d'abord si elle est disponible dans les autres documents ou dans le code. En cas d'incertitude importante, demander une clarification.

## 3. Diagramme des cas d'utilisation

> Mis à jour le 3 novembre 2026 : Neon Auth remplace Clerk, ajout de l'administrateur, paiements reportés.

```mermaid
flowchart TB
    Client([Client du restaurant])
    Restaurateur([Restaurateur])
    Admin([Administrateur Restio])
    AuthResto([Neon Auth - instance restaurateurs])
    AuthAdmin([Neon Auth - instance administration])

    subgraph PUBLIC["Menu public - restio-app.com/@slug"]
        UC1["Consulter le menu"]
        UC3["Composer un panier"]
        UC4["Passer une commande"]
        UC5["Recevoir une confirmation"]
    end

    subgraph APP["Application - app.restio-app.com"]
        UC6["S'inscrire / se connecter"]
        UC15["Compléter profil et restaurant"]
        UC7["Gérer les commandes"]
        UC8["Gérer catégories et plats"]
        UC10["Générer QR Code et supports"]
        UC11["Consulter les statistiques"]
        UC12["Configurer restaurant et apparence"]
        UC14["Recevoir les notifications"]
    end

    subgraph ADMIN["Administration - admin.restio-app.com"]
        UA1["Se connecter (aucune inscription)"]
        UA2["Superviser restaurants et activité"]
        UA3["Suspendre / supprimer un restaurant"]
        UA4["Modifier les paramètres globaux et pixels"]
        UA5["Publier annonces et tutoriels"]
        UA6["Consulter le journal d'audit"]
    end

    Client --> UC1 & UC3 & UC4 & UC5
    Restaurateur --> UC6 & UC15 & UC7 & UC8 & UC10 & UC11 & UC12 & UC14
    Admin --> UA1 & UA2 & UA3 & UA4 & UA5 & UA6
    AuthResto --> UC6
    AuthAdmin --> UA1
```

### Points vérifiés

- Le client commande sans compte.
- Le restaurateur n'accède qu'à son établissement (filtrage serveur par `restaurant_members`).
- Les deux instances Neon Auth sont sur deux branches distinctes : aucun compte restaurateur n'existe côté administration.
- Le paiement d'abonnement n'est pas un cas d'utilisation de la V1.

## 4. Diagramme de classes

Le détail des colonnes, types et contraintes est dans `DATABASE.md`. Ce diagramme montre les entités et leurs relations.

```mermaid
classDiagram
    class AuthUser {
        <<Neon Auth, géré par Neon>>
        +id
        +email
    }
    class Profile {
        +userId
        +firstName
        +lastName
        +phoneE164
        +whatsappE164
    }
    class Restaurant {
        +id
        +slug
        +name
        +countryCode
        +city
        +currency
        +timezone
        +isPublished
        +status
    }
    class RestaurantMember {
        +restaurantId
        +userId
        +role
    }
    class SlugHistory {
        +slug
        +retiredAt
    }
    class Category {
        +id
        +name
        +position
        +isVisible
    }
    class Dish {
        +id
        +name
        +price
        +imageKey
        +isAvailable
        +isFeatured
    }
    class Order {
        +id
        +orderNumber
        +tableLabel
        +customerNote
        +status
        +totalAmount
        +idempotencyKey
    }
    class OrderItem {
        +dishName
        +categoryName
        +unitPrice
        +quantity
        +lineTotal
    }
    class OrderStatusEvent {
        +fromStatus
        +toStatus
        +actorUserId
    }
    class Notification {
        +type
        +title
        +readAt
    }
    class PushSubscription {
        +endpoint
    }
    class Subscription {
        +planId
        +status
    }
    class PlatformSetting {
        +key
        +value
    }
    class Announcement {
        +kind
        +title
        +display
        +startsAt
        +endsAt
    }

    AuthUser "1" --> "1" Profile : complète
    AuthUser "1" --> "1" RestaurantMember : V1 un restaurant
    Restaurant "1" --> "*" RestaurantMember : membres
    Restaurant "1" --> "*" SlugHistory : anciennes adresses
    Restaurant "1" --> "*" Category : organise
    Category "1" --> "*" Dish : contient
    Restaurant "1" --> "*" Order : reçoit
    Order "1" --> "*" OrderItem : instantané
    Dish "0..1" <-- "*" OrderItem : référence facultative
    Order "1" --> "*" OrderStatusEvent : historique
    Restaurant "1" --> "*" Notification : boîte partagée
    Restaurant "1" --> "*" PushSubscription : appareils
    Restaurant "1" --> "1" Subscription : plan (non activé)
    Announcement ..> Restaurant : audience
```

### Corrections par rapport à la version initiale

- `clerkId` supprimé : l'identifiant vient de Neon Auth et n'est relié par aucune clé étrangère au schéma géré par Neon.
- Le prénom, le nom, le téléphone et le WhatsApp sont dans `Profile`, distincts entre eux.
- `RestaurantMember` remplace le lien direct utilisateur → restaurant : il prépare les collaborateurs sans les développer.
- `Dish` porte aussi `restaurantId` : clés composites qui empêchent tout mélange entre restaurants.
- `OrderItem` conserve nom, catégorie et prix au moment de la commande ; la référence au plat devient facultative.
- `Payment` est retiré tant qu'aucun prestataire n'est choisi. `Subscription` est conservé mais non activé.
- `PlatformSetting` et `Announcement` sont ajoutés : écrits par l'administration, lus par l'application.

## 5. Diagramme entité-relation (ERD)

### 5.1. Base métier (`production` / `neondb`)

```mermaid
erDiagram
    RESTAURANTS ||--|{ RESTAURANT_MEMBERS : has
    PROFILES ||--o| RESTAURANT_MEMBERS : "user_id"
    RESTAURANTS ||--o{ SLUG_HISTORY : keeps
    RESTAURANTS ||--o{ CATEGORIES : owns
    CATEGORIES ||--o{ DISHES : contains
    RESTAURANTS ||--o{ ORDERS : receives
    ORDERS ||--|{ ORDER_ITEMS : contains
    DISHES |o--o{ ORDER_ITEMS : "set null"
    ORDERS ||--o{ ORDER_STATUS_EVENTS : logs
    RESTAURANTS ||--o{ NOTIFICATIONS : gets
    RESTAURANTS ||--o{ PUSH_SUBSCRIPTIONS : registers
    RESTAURANTS ||--o{ MENU_VIEWS_DAILY : counts
    RESTAURANTS ||--|| SUBSCRIPTIONS : "plan"
    PLANS ||--o{ SUBSCRIPTIONS : defines
    ANNOUNCEMENTS ||--o{ ANNOUNCEMENT_DISMISSALS : tracks

    RESTAURANTS {
        uuid id PK
        text slug UK
        text name
        char currency
        text timezone
        bool is_published
        enum status
        int order_seq
    }
    CATEGORIES {
        uuid id PK
        uuid restaurant_id FK
        text name
        int position
    }
    DISHES {
        uuid id PK
        uuid restaurant_id FK
        uuid category_id FK
        numeric price
        bool is_available
    }
    ORDERS {
        uuid id PK
        uuid restaurant_id FK
        int order_number
        text table_label
        enum status
        numeric total_amount
        uuid idempotency_key
    }
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid restaurant_id
        uuid dish_id FK "nullable"
        text dish_name
        numeric unit_price
        int quantity
    }
```

### 5.2. Base d'administration (`admin` / `restio_admin`)

```mermaid
erDiagram
    AUDIT_LOG {
        bigint id PK
        timestamptz at
        uuid admin_user_id
        text action
        jsonb metadata
    }
    DELETION_REQUESTS {
        uuid id PK
        uuid restaurant_id
        enum step
        timestamptz reauthenticated_at
    }
```

Les deux bases n'ont aucune clé étrangère entre elles : elles sont sur deux branches différentes. Le lien `deletion_requests.restaurant_id` est vérifié par le serveur d'administration.

## 6. Diagrammes de séquence

### 6.1. Parcours de commande du client

```mermaid
sequenceDiagram
    actor Client
    participant Menu as Menu public (apps/web)
    participant Srv as Action serveur
    participant DB as Neon (production)
    participant RT as Neon Realtime
    participant Push as Web Push
    participant Dash as Tableau de bord

    Client->>Menu: Scanner le QR Code (/@slug)
    Menu->>DB: Restaurant publié + catégories + plats disponibles
    DB-->>Menu: Menu
    Client->>Menu: Panier, table, note
    Client->>Srv: Confirmer (articles, quantités, table, clé d'idempotence)
    Srv->>Srv: Validation Zod (≤ 50 lignes) + limites de fréquence
    Srv->>DB: BEGIN
    Srv->>DB: Restaurant publié et actif ? Plats disponibles, catégories visibles, même restaurant, prix
    Srv->>DB: INSERT orders ... ON CONFLICT (restaurant_id, idempotency_key) DO NOTHING
    alt Clé déjà utilisée (double envoi)
        Srv->>DB: Relire la commande existante
    else Nouvelle commande
        Srv->>DB: next_order_number(), INSERT order_items, order_status_events, notifications
    end
    Srv->>DB: COMMIT
    Srv-->>Client: « Merci, votre commande sera bientôt prête. »
    DB-->>RT: Changement visible par la requête live du restaurant
    RT-->>Dash: Nouvelle commande + pastille (requête scellée par le serveur, filtrée sur le restaurant de la session)
    Srv-)Push: Notification aux appareils du restaurant (après COMMIT)
    Note over Dash: Si la connexion temps réel tombe, rechargement périodique de la liste
```

### 6.2. Changement de statut d'une commande

```mermaid
sequenceDiagram
    actor Resto as Restaurateur
    participant Srv as Action serveur
    participant Core as packages/core
    participant DB as Neon (production)

    Resto->>Srv: Passer la commande X en « En préparation »
    Srv->>Srv: Session Neon Auth valide → user_id
    Srv->>DB: restaurant_id via restaurant_members(user_id)
    Srv->>DB: SELECT … FOR UPDATE orders WHERE id = X AND restaurant_id = session
    alt Commande introuvable pour ce restaurant
        Srv-->>Resto: 404 (aucune information divulguée)
    else Trouvée
        Srv->>Core: Transition autorisée ?
        Core-->>Srv: Oui / Non
        Srv->>DB: UPDATE orders + INSERT order_status_events
        Srv-->>Resto: Statut mis à jour
    end
```

### 6.3. Suppression d'un restaurant par l'administration

```mermaid
sequenceDiagram
    actor Admin
    participant AdminApp as apps/admin
    participant AdminDB as Neon (admin)
    participant ProdDB as Neon (production)

    Admin->>AdminApp: Étape 1 - confirmer le compte visé
    AdminApp->>AdminDB: INSERT deletion_requests (confirmed)
    Admin->>AdminApp: Étape 2 - ressaisir le nom du restaurant
    AdminApp->>AdminDB: step = typed
    Admin->>AdminApp: Étape 3 - réauthentification + validation finale
    AdminApp->>AdminDB: Vérifier demande non expirée et réauthentification récente (vérifiée par le serveur)
    AdminApp->>AdminDB: audit_log (intention)
    AdminApp->>ProdDB: Transaction : DELETE restaurants (cascade), profiles, announcement_dismissals
    AdminApp->>AdminDB: step = executed + audit_log (résultat)
    Note over AdminApp: Fichiers du stockage supprimés ensuite ; échec journalisé et rejoué
    Note over Admin: Identité Neon Auth supprimée par le propriétaire (console ou CLI), aucune clé d'API Neon dans l'application
```

Le paiement d'abonnement (ancienne séquence 6.2) est retiré tant qu'aucun prestataire n'est choisi.

## 7. Diagramme d'états-transitions des commandes

```mermaid
stateDiagram-v2
    [*] --> Nouvelle : création par le client

    Nouvelle --> Acceptee : Accepter
    Nouvelle --> Refusee : Refuser
    Nouvelle --> EnPreparation : Lancer directement

    Acceptee --> EnPreparation : Démarrer
    EnPreparation --> Prete : Terminer la préparation
    Prete --> Terminee : Remettre au client

    Acceptee --> Annulee : Annuler
    EnPreparation --> Annulee : Annuler
    Prete --> Annulee : Annuler

    Refusee --> [*]
    Annulee --> [*]
    Terminee --> [*]
```

### Règles validées

- Seuls les membres du restaurant modifient les statuts ; le client ne peut ni annuler ni modifier une commande envoyée (V1).
- Ajout de `Nouvelle → En préparation` : dans un petit restaurant, accepter puis préparer est souvent un seul geste.
- Ajout de `Prête → Annulée` : client parti avant d'être servi.
- Toute autre transition est rejetée côté serveur.
- Chaque transition crée une ligne `order_status_events` (horodatage et auteur).
- Les commandes terminées, refusées ou annulées restent consultables.

## 8. Validation et évolution de la modélisation

Les diagrammes de ce document constituent une proposition initiale de modélisation.

L'agent de développement doit effectuer une véritable vérification de cohérence avant de les utiliser comme référence d'implémentation.

Il doit notamment :

1. Comparer les diagrammes avec la présentation globale de Restio.
2. Vérifier que tous les besoins fonctionnels sont représentés.
3. Identifier les entités, relations, attributs et processus manquants.
4. Vérifier la cohérence entre le diagramme de classes et le diagramme entité-relation.
5. Vérifier que les séquences respectent les règles de sécurité et les responsabilités frontend/backend.
6. Vérifier que les états et transitions correspondent aux règles métier.
7. Identifier les éléments inutiles ou redondants.
8. Améliorer librement les diagrammes lorsque cela est justifié.

Si une représentation ne correspond pas à l'architecture réelle, elle doit être corrigée plutôt que de forcer le développement à suivre un modèle inadapté.

Il n'est pas nécessaire d'ajouter d'autres diagrammes UML si ceux-ci n'apportent aucune valeur réelle au projet.

Toute évolution importante doit être documentée afin que les diagrammes restent cohérents avec le code et la structure réelle de Restio.

## 9. Règle finale

**La qualité et l'exactitude de la modélisation priment sur le nombre de diagrammes.**

L'objectif n'est pas de produire une documentation UML volumineuse, mais de disposer d'une représentation claire, fiable et exploitable du fonctionnement de Restio.

Ces diagrammes doivent aider au développement, prévenir les incohérences et faciliter la maintenance future de la plateforme, sans imposer de complexité inutile.