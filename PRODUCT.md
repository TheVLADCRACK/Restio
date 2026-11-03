# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Restaurateurs** (propriétaires et gérants de restaurants, cafés, snacks, hôtels) : majoritairement non techniques, ils gèrent Restio **depuis leur smartphone, pendant le service**, souvent d'une main et dans l'urgence. Leur travail : publier un menu à jour, recevoir les commandes des tables, faire avancer chaque commande jusqu'à la remise, et suivre l'activité.
- **Clients des restaurants** : ils scannent un QR Code à table, sans compte ni installation, consultent le menu et commandent en quelques gestes.
- **Administrateur de la plateforme** (un seul compte au lancement) : supervise les restaurants, publie annonces et tutoriels, règle les paramètres globaux.

## Product Purpose

Restio digitalise le menu d'un établissement et centralise les commandes passées depuis les tables via QR Code. Succès : un restaurateur publie son premier menu et reçoit sa première commande sans aide ; le client commande en moins d'une minute après le scan ; aucune commande n'est perdue ou dupliquée.

## Positioning

Pas un simple générateur de menus QR : la commande est enregistrée dans Restio (et non envoyée par WhatsApp), suivie en temps réel jusqu'à la remise, et l'outil reste pensé d'abord pour le téléphone du restaurateur.

## Operating Context

- Usage en salle, en cuisine ou au comptoir : écrans tenus à la main, lumière variable (terrasse en plein soleil, salle sombre), interruptions constantes.
- **Appareils mixtes** : smartphones récents comme Android d'entrée de gamme sur réseau 3G/4G. Concevoir pour le cas le plus contraint (poids des pages, images légères, lisibilité, cibles tactiles larges).
- Supports physiques : QR Codes imprimés (chevalet de table, présentoir, carte A5).
- Communication avec les restaurateurs via une communauté WhatsApp officielle.

## Capabilities and Constraints

- Marchés au lancement : **international** — Afrique francophone, France et Europe, États-Unis, autres pays. Devises multiples (XOF, XAF, EUR, USD…), numéros internationaux (libphonenumber-js), fuseaux horaires par restaurant.
- Langues de l'interface au lancement : **français et anglais**.
- Stack imposée : Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Neon (Postgres, Auth, Object Storage, Realtime), Drizzle, Vercel. Détails : `TECHNICAL.md`, `DATABASE.md`.
- Aucun paiement au lancement ; plans préparés mais non activés.
- Thème clair uniquement au lancement ; structure prête pour un thème sombre.
- Application installable (PWA) et notifications push lorsque la plateforme le permet.
- Non décidé : tarification, prestataire de paiement, durée de conservation des commandes.

## Brand Commitments

- Nom : **Restio**. Symbole : forme organique « R » noire (`figma/logo/logo.png`). Version vectorielle manquante.
- Palette validée le 3 novembre 2026 : noir `#0F0F0F`, vert citron `#C7FF2E`, gris anthracite `#2E2E2E`, blanc `#FFFFFF`, gris moyen `#808080` (référence : `figma/image de l'identiter vusuelle.jpg`).
- Police validée : Satoshi.
- Ton : simple, direct, rassurant ; vocabulaire de restaurant, jamais technique.

## Evidence on Hand

- Références visuelles : `figma/Interfaces exemple/` (inspiration de hiérarchie et de parcours, pas de couleurs), `figma/exemple de supports/` (supports QR imprimés).
- Prototype non retenu visuellement : `figma/exemple de maquete figma a titre d'exemple/` (inventaire d'écrans uniquement).
- Aucun client, témoignage, chiffre d'usage ni restaurant réel à ce jour : ne rien inventer. Les photos de démonstration sont libres de droits et isolées dans `demo/`.

## Product Principles

1. **Le service d'abord** : l'action la plus fréquente (faire avancer une commande) se fait en un geste, sans quitter la liste.
2. **Rien n'est perdu** : chaque commande est enregistrée, horodatée, idempotente et visible même si le temps réel tombe.
3. **Lisible par tous** : un restaurateur sans culture numérique comprend chaque écran sans formation.
4. **Léger partout** : le menu public s'ouvre vite sur un Android modeste en 3G.
5. **Vrai ou rien** : aucune donnée fictive présentée comme réelle ; un état vide utile vaut mieux qu'un faux chiffre.

## Accessibility & Inclusion

- WCAG 2.2 AA : contrastes, focus visible, navigation clavier, libellés explicites.
- Cibles tactiles d'au moins 44 × 44 px ; textes de travail jamais sous 14 px sur mobile.
- Statuts jamais transmis par la couleur seule.
- Respect de `prefers-reduced-motion`.
- Deux langues (FR, EN) ; textes prévus pour s'allonger d'environ 30 % sans casser la mise en page.
