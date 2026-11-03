# RESTIO — PRÉSENTATION GÉNÉRALE DU PROJET

## 1. Présentation générale

Restio est une plateforme SaaS de gestion de menus numériques et de commandes destinée aux restaurants.

Son objectif est de permettre aux restaurateurs de digitaliser leur menu, de recevoir les commandes directement depuis les tables grâce à des QR Codes et de gérer leur activité depuis un tableau de bord centralisé.

Restio simplifie le parcours des clients tout en facilitant le travail quotidien du personnel du restaurant.

Le principe fondamental :

**Un restaurant, un menu numérique, des QR Codes et un système centralisé de gestion des commandes.**

Restio n'est pas simplement un générateur de menus numériques. C'est un outil de gestion permettant de centraliser le menu, les commandes et le suivi de l'activité d'un établissement.

## 2. Objectifs de la plateforme

Restio vise à remplacer les menus papier et à fluidifier la prise de commandes dans les restaurants.

La plateforme doit permettre :

- Aux clients de consulter le menu depuis leur smartphone.
- De visualiser les photos, descriptions et prix des plats.
- De sélectionner plusieurs plats et leurs quantités.
- D'indiquer leur numéro de table.
- D'ajouter éventuellement une note à leur commande.
- De transmettre directement leur commande au système Restio.
- Aux restaurateurs de recevoir et gérer les commandes depuis leur tableau de bord.
- De suivre les ventes, les commandes et les performances du restaurant.

Le client ne doit avoir besoin ni de créer un compte ni d'installer une application.

## 3. Fonctionnement côté client

Le parcours client doit rester simple, rapide et intuitif.

1. Le client s'installe à une table du restaurant.
2. Il scanne le QR Code placé sur sa table.
3. Son navigateur ouvre automatiquement le menu numérique du restaurant.
4. Il consulte les catégories et les plats disponibles.
5. Il sélectionne les plats souhaités et leurs quantités.
6. Il ajoute les articles à son panier.
7. Il indique son numéro de table et éventuellement une note.
8. Il vérifie le récapitulatif et confirme sa commande.
9. La commande est transmise et enregistrée sur la plateforme.
10. Le restaurant reçoit la commande dans son espace de gestion.

Après validation, le client reçoit une confirmation claire :

« Merci, votre commande sera bientôt prête. »

Le système doit éviter les doubles soumissions, vérifier la disponibilité des plats et calculer les montants côté serveur.

Le parcours doit être parfaitement adapté aux écrans mobiles, avec une navigation fluide et un panier facile à utiliser.

## 4. Fonctionnement côté restaurateur

Chaque restaurateur dispose d'un espace personnel sécurisé.

Depuis son tableau de bord, il peut :

**Commandes**
- Consulter les nouvelles commandes.
- Visualiser les détails de chaque commande.
- Modifier leur statut.
- Retrouver les commandes précédentes dans les archives.

**Gestion du menu**
- Créer et organiser des catégories.
- Ajouter, modifier et supprimer des plats.
- Ajouter des photos et descriptions.
- Modifier les prix et les disponibilités.

**QR Code**
- Générer et télécharger le QR Code du restaurant.
- Créer des supports imprimables contenant le QR Code.

**Statistiques**
- Consulter le chiffre d'affaires.
- Suivre le nombre de commandes.
- Analyser les performances du restaurant.

**Paramètres**
- Configurer les informations de l'établissement.
- Gérer son profil et sa sécurité.
- Personnaliser l'apparence du menu public.

Toutes les données doivent être enregistrées dans la base de données et associées au restaurant concerné.

Les modifications apportées au menu doivent être répercutées sur la page publique sans intervention manuelle supplémentaire.

## 5. Organisation des URL et des domaines

Le domaine principal du projet est :

`restio-app.com`

L'organisation prévue est la suivante :

| Adresse | Fonction |
|---|---|
| `https://restio-app.com` | Site officiel et présentation commerciale de Restio |
| `https://app.restio-app.com` | Application de gestion et tableau de bord |
| `https://restio-app.com/@slug` | Menu public d'un restaurant |
| `https://admin.restio-app.com` | Administration de la plateforme (application et authentification séparées, aucune inscription publique) |

> Le domaine `restio-app.com` n'est pas encore enregistré (vérifié le 3 novembre 2026). Son achat reste à faire avant la mise en production.

### Comprendre le slug

Chaque restaurant possède un identifiant public unique appelé slug.

Exemple :

- Nom : Le Jardin Gourmet
- Slug : `le-jardin-gourmet`
- URL : `https://restio-app.com/@le-jardin-gourmet`

Le slug est généré à partir du nom du restaurant ou défini lors de sa création, avec vérification de son unicité.

Chaque restaurant possède sa propre URL publique.

Le QR Code redirige vers cette adresse.

Le slug est un identifiant public. Il ne doit jamais être confondu avec l'identifiant interne du restaurant dans la base de données.

La résolution des URLs doit être sécurisée et ne doit jamais permettre d'accéder aux données privées d'un autre établissement.

## 6. Organisation fonctionnelle de l'application

L'application de gestion s'articule autour de cinq sections principales :

1. **Commandes :** réception, consultation et gestion des commandes.
2. **Menu :** gestion des catégories, plats, prix et disponibilités.
3. **QR Code :** génération, téléchargement et création de supports imprimables.
4. **Statistiques :** suivi des ventes et des performances.
5. **Paramètres :** gestion du restaurant, du profil, de la sécurité et de l'apparence du menu.

La page publique est indépendante du tableau de bord et accessible aux clients sans authentification.

Les différentes sections doivent partager une architecture cohérente et des données centralisées.

## 7. Modèle économique et abonnements

**Décision du 3 novembre 2026 : aucun paiement au lancement.** La première version sert à tester le marché ; Restio est gratuit pour les restaurateurs.

L'architecture prévoit à terme trois niveaux :

1. Plan gratuit.
2. Plan intermédiaire.
3. Plan supérieur avec fonctionnalités avancées.

Les prix, devises, limites, durée d'essai éventuelle et le prestataire de paiement seront définis après l'étude de marché. Les hypothèses précédentes (essai de 14 jours, 5 000 FCFA / 15 EUR / 15 USD par mois, −20 % en annuel) sont **suspendues** et ne doivent pas être implémentées.

Chaque compte gérant correspond à un restaurant dans la première version du produit.

### Ce qui est préparé dès maintenant

- Les tables `plans` et `subscriptions` existent dans le modèle de données (voir `DATABASE.md`), sans aucune restriction commerciale active.
- Aucun prestataire de paiement n'est branché. Aucune table de transactions n'est créée tant que le prestataire n'est pas choisi.
- Aucun revenu ni abonnement fictif n'est affiché.

### Règles applicables le jour où les paiements seront activés

- Ne jamais considérer une confirmation frontend comme une preuve de paiement.
- Vérifier les transactions auprès du prestataire, via des webhooks authentifiés.
- Traiter les webhooks de manière idempotente.
- Enregistrer références, montants, devises et statuts des transactions.
- Ne jamais stocker de données bancaires.
- Appliquer les restrictions d'abonnement côté serveur, jamais seulement dans l'interface.

## 8. Authentification et gestion des accès

**Décision du 3 novembre 2026 : Neon Auth (Managed Better Auth).** Clerk n'est pas utilisé.

### Restaurateurs

- Neon Auth provisionné sur la branche Neon `production`, base `neondb`.
- Méthodes au lancement : **email (avec vérification) et Google**. Apple et téléphone sont reportés (compte Apple Developer et fournisseur SMS payants).
- Aucun système OTP parallèle à Neon Auth.

### Administration

- Neon Auth n'autorise qu'une instance par branche. L'administration utilise donc une **branche Neon dédiée `admin`**, créée en « schéma seulement » (branche racine, aucune donnée des restaurateurs copiée), avec sa propre base `restio_admin` et **sa propre instance Neon Auth**.
- Inscriptions désactivées. Un seul compte administrateur, créé manuellement. L'adresse autorisée est en plus vérifiée côté serveur (liste blanche en variable d'environnement).
- Neon Auth ne propose pas encore la double authentification : les actions sensibles exigent une réauthentification récente et sont journalisées.

### Principes communs

- Vérifier l'identité et les permissions côté serveur pour chaque opération sensible.
- Ne jamais se fier au frontend, ni au champ `role` de Neon Auth : l'autorisation métier repose sur les tables Restio (`restaurant_members`).
- Associer chaque compte à son restaurant ; protéger routes privées et API.
- Gérer l'expiration et la révocation des sessions selon les possibilités de Neon Auth.

**Important :** l'authentification et l'autorisation sont deux choses différentes. Un utilisateur authentifié n'a pas automatiquement accès à toutes les ressources.

## 9. Notifications et expérience utilisateur

Les notifications sont importantes pour assurer une bonne réactivité dans la gestion du restaurant.

L'application doit notamment prévoir :

- La notification des nouvelles commandes.
- La mise à jour des informations de commande.
- Les notifications relatives à l'abonnement et aux paiements.
- Les retours visuels lors des actions importantes.
- Les états de chargement, de succès et d'erreur.

### Pastilles de notification

Ajouter des pastilles rouges de notification sur l'icône de l'application lorsque des notifications non consultées ou des événements nécessitant une attention particulière sont présents.

Ce comportement doit être intégré proprement au système de notifications.

Pour les installations PWA, utiliser les mécanismes de badge pris en charge par les navigateurs et systèmes d'exploitation. Prévoir un comportement de remplacement lorsque cette fonctionnalité n'est pas disponible.

Les notifications doivent être synchronisées avec leur état réel et ne pas rester affichées inutilement après consultation.

## 10. Design et identité visuelle

L'interface de Restio doit être moderne, professionnelle, élégante et particulièrement intuitive.

Le fichier `DESIGN.md` constitue la référence principale du système de design.

Il doit être respecté sur l'ensemble de l'application :

- Couleurs.
- Typographies.
- Espacements.
- Composants.
- Icônes.
- Boutons.
- Formulaires.
- Cartes.
- Tableaux.
- États et interactions.
- Modes clair et sombre, lorsqu'ils sont définis.

Direction retenue le 3 novembre 2026 : noir `#0F0F0F` et vert citron `#C7FF2E`, police Satoshi, logo symbole noir. Thème clair uniquement au lancement.

### Utilisation des maquettes Figma

Les maquettes Figma constituent une référence essentielle pour le développement des interfaces.

Lorsqu'un écran possède une maquette disponible, elle doit être consultée avant toute réalisation ou modification de cet écran.

Ne pas improviser un nouveau design lorsqu'une référence existe déjà.

### Procédure obligatoire pour Figma

1. Récupérer avec le MCP Figma toutes les informations nécessaires à l'écran : métadonnées, contexte du design, variables, capture et autres informations disponibles.
2. Enregistrer les réponses exactes et complètes de chaque outil, sans les résumer, dans le dossier `figma/`, avec le `node-id` correspondant.
3. Télécharger et conserver également les captures d'écran.
4. Lors des prochaines sessions, consulter d'abord les ressources enregistrées dans ce dossier.
5. Ne solliciter à nouveau Figma que lorsqu'un écran ou une information nécessaire est absent, incomplet ou doit être actualisé.

Les maquettes doivent guider l'implémentation, sans empêcher les adaptations techniques nécessaires au fonctionnement réel de l'application.

### Direction artistique

Utiliser les skills de design disponibles, notamment ceux liés à Apple Design, à l'ingénierie frontend et à la qualité UI/UX, lorsqu'ils sont pertinents.

Le résultat doit privilégier :

- Une hiérarchie visuelle claire.
- Une excellente lisibilité.
- Des interfaces aérées.
- Des interactions fluides.
- Une cohérence entre toutes les pages.
- Une expérience particulièrement soignée sur mobile.

## 11. Architecture et organisation des données

Restio repose sur une architecture SaaS multi-tenant.

Dans la première version, un compte gérant correspond à un restaurant.

Les données de chaque restaurant doivent rester strictement isolées.

Les principales entités métier devront être identifiées et structurées selon les besoins réels du projet, notamment :

- Comptes et utilisateurs.
- Restaurants.
- Catégories.
- Plats.
- Commandes.
- Articles de commande.
- Tables.
- Abonnements.
- Transactions.
- Notifications.

Cette liste représente le périmètre fonctionnel à prendre en compte, et non une structure de base de données imposée.

Les relations, contraintes et règles métier devront être définies dans un document technique séparé consacré à la modélisation et aux diagrammes UML.

Ne pas créer de nouvelles entités ou relations sans justification fonctionnelle.

## 12. Méthode de développement et utilisation des skills

Avant chaque étape de développement, l'agent doit analyser les skills dont il dispose afin d'identifier ceux qui peuvent réellement améliorer le travail.

Il ne doit pas se limiter à utiliser systématiquement les mêmes outils.

La sélection doit dépendre de la tâche.

Exemples :

- Analyse du projet : architecture logicielle et audit de code.
- Conception des interfaces : UI/UX, Apple Design et frontend engineering.
- Intégration Figma : outils Figma et analyse des maquettes.
- Développement backend : architecture serveur, API et sécurité.
- Base de données : modélisation, intégrité et optimisation.
- Paiements : intégration sécurisée et vérification des transactions.
- Tests : tests automatisés, non-régression et browser testing.
- Optimisation : performance, accessibilité et expérience mobile.

Les skills doivent être analysés avant leur utilisation. Vérifier leur disponibilité, leur origine et leur pertinence.

Ne pas installer de nouvelles extensions uniquement pour disposer d'un skill supplémentaire.

## 13. Périmètre de développement et progression

Le développement doit couvrir progressivement les différents éléments du produit.

**Phase 1 — Compréhension et audit**
- Analyser le projet existant.
- Identifier les technologies et l'architecture.
- Comprendre les fonctionnalités déjà opérationnelles.
- Identifier les éléments manquants et les éventuels problèmes.

**Phase 2 — Socle de l'application**
- Authentification.
- Gestion des restaurants.
- Structure de données.
- Isolation des accès.
- Organisation générale du tableau de bord.

**Phase 3 — Gestion du menu**
- Catégories.
- Plats.
- Photos et descriptions.
- Prix et disponibilités.
- Menu public.

**Phase 4 — Commandes et QR Codes**
- Génération des QR Codes.
- Parcours client.
- Panier.
- Validation et enregistrement des commandes.
- Réception et gestion des commandes.

**Phase 5 — Gestion commerciale (reportée)**
- Modélisation des plans et abonnements uniquement (aucun paiement au lancement, voir §7).
- Paiements, essai et restrictions : après l'étude de marché et le choix d'un prestataire.

**Phase 6 — Fonctionnalités complémentaires**
- Statistiques.
- Notifications.
- Personnalisation.
- Supports imprimables.
- Optimisations PWA.

**Phase 7 — Vérifications et finalisation**
- Tests fonctionnels.
- Tests de sécurité.
- Tests de non-régression.
- Optimisation des performances.
- Vérification mobile et desktop.

Ces phases représentent une organisation indicative du travail. Elles ne constituent pas une obligation de reconstruire les fonctionnalités déjà opérationnelles.

L'ordre réel doit être adapté à l'état du projet et aux dépendances techniques.

## 14. Principes fondamentaux du produit

Le développement doit respecter les principes suivants :

- Une plateforme centralisée.
- Un espace de gestion par restaurant.
- Une page publique indépendante pour chaque restaurant.
- Des commandes enregistrées dans Restio, et non envoyées par WhatsApp.
- Aucune création de compte obligatoire pour les clients.
- Une interface simple pour les restaurateurs.
- Une expérience mobile fluide pour les clients.
- Une isolation stricte des données entre les restaurants.
- Une conservation de l'historique des commandes.
- Une architecture prête pour les abonnements, sans paiement au lancement.
- Une cohérence visuelle sur l'ensemble de la plateforme.
- Une architecture évolutive sans complexité inutile.

## 15. Consignes générales de développement

Ce document constitue la référence de compréhension fonctionnelle et produit de Restio.

Avant toute intervention :

1. Lire `CLAUDE.md`, les directives globales de sécurité et `DESIGN.md`.
2. Lire le présent document pour comprendre le produit.
3. Examiner le projet existant et son architecture.
4. Consulter les maquettes et les ressources Figma disponibles.
5. Identifier les skills utiles à l'étape concernée.
6. Déterminer précisément ce qui doit être développé ou corrigé.

Ne jamais reconstruire inutilement une fonctionnalité existante.

Ne pas modifier arbitrairement les règles métier.

Ne pas inventer de fonctionnalités, de configurations, de technologies ou de comportements qui ne sont pas définis.

En cas d'ambiguïté importante, vérifier les éléments disponibles et demander une clarification plutôt que de prendre une décision susceptible de modifier le fonctionnement du produit.

Chaque modification doit être testée avant d'être considérée comme terminée.

Les fonctionnalités sensibles, notamment l'authentification, les commandes, les paiements et l'isolation des données, doivent faire l'objet de vérifications spécifiques.

**Objectif final : développer Restio comme une véritable plateforme SaaS professionnelle, fiable, sécurisée, performante et agréable à utiliser, aussi bien pour les restaurateurs que pour leurs clients.**