---
name: Restio
description: Menus QR et commandes pour restaurants, pensé d'abord pour le téléphone du restaurateur pendant le service.
colors:
  ink: "#0F0F0F"
  ink-2: "#2E2E2E"
  lime: "#C7FF2E"
  lime-pressed: "#B6F00F"
  lime-soft: "#F1FFC9"
  brand-gray: "#808080"
  ground: "#F4F4F1"
  surface: "#FFFFFF"
  sunken: "#EEEEEB"
  line: "#E4E4E0"
  line-strong: "#CFCFCA"
  text-2: "#5E5E5B"
  text-3: "#6B6B68"
  on-dark-2: "#A3A3A0"
  status-new: "#A14A00"
  status-new-bg: "#FFF3E0"
  status-info: "#1D5FD1"
  status-info-bg: "#EAF1FD"
  status-prep: "#6B3FC4"
  status-prep-bg: "#F1ECFC"
  status-ok: "#16794A"
  status-ok-bg: "#E6F4EC"
  status-muted: "#5E5E5B"
  status-muted-bg: "#EEEEEB"
  status-danger: "#C0261C"
  status-danger-bg: "#FDECEA"
typography:
  display:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  h1:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  h3:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  lead:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  stat:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
rounded:
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.lime-pressed}"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px"
  button-dark-hover:
    backgroundColor: "{colors.ink-2}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px"
  button-disabled:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.text-3}"
  button-danger:
    backgroundColor: "{colors.status-danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "48px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 14px"
  input-disabled:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.text-3}"
  tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "0 14px"
  tab-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
  order-ticket:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  tab-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark-2}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 14px 12px 16px"
---

# Design System: Restio

> Référence visuelle unique de Restio, citée par `CLAUDE.md` et `PROJECT.md`. Planche vivante : `design/board.html`. Établi le 3 novembre 2026 à partir de la planche construite et relue.

## Overview

**Creative North Star: "Le passe du service"**

Restio parle la langue du passe de cuisine : chaque commande est un ticket qui avance d'une étape à la fois, et le vert citron désigne toujours le prochain geste. L'outil est utilisé d'une main, debout, entre deux tables, sous la lumière d'une terrasse ou d'une salle sombre : le fond reste clair et chaud pour la lisibilité, le noir structure la navigation, et rien ne décore sans informer.

La densité est celle d'un outil de travail : on voit beaucoup sans chercher, mais chaque écran a un seul centre de gravité (ce qui attend une action). La personnalité vient du contraste noir/citron, des rayons généreux et d'une typographie Satoshi nette ; elle ne vient jamais d'effets. Le menu public, vu par les clients à table, partage le même langage en plus aéré, avec la photo des plats comme matière principale.

Rejets confirmés : thème sombre au lancement, tableau de bord de cartes KPI identiques, citron utilisé comme couleur de statut, émojis à la place des icônes.

**Key Characteristics:**
- Fond clair chaud, coquille de navigation noire, un seul accent citron.
- Le ticket de commande à rail en 4 segments comme composant signature.
- Une seule police (Satoshi), chiffres tabulaires pour tout montant ou quantité.
- Rayons généreux, bordures fines, presque aucune ombre.
- Statuts lisibles sans la couleur : libellé + icône + teinte.

## Colors

Une palette restreinte : neutres chauds, noir de structure, un accent citron rare, et un jeu de couleurs de statut qui ne se confond jamais avec l'accent.

### Primary
- **Ink** (#0F0F0F) : texte principal, barre de navigation, boutons forts, onglet sélectionné, monogramme du restaurant. 19,2:1 sur blanc.
- **Citron** (#C7FF2E) : l'action principale d'une zone, l'onglet actif de la barre de navigation, le compteur d'un onglet sélectionné, le segment courant du rail. Toujours en aplat avec du texte Ink (16,2:1). Appuyé : #B6F00F.

### Secondary
- **Ink 2** (#2E2E2E) : survol et séparateurs sur fond noir.
- **Citron doux** (#F1FFC9) : ligne sélectionnée ou surlignée sur fond clair, avec texte Ink.

### Tertiary
Couleurs de statut des commandes, chacune avec son fond teinté (contrastes texte/fond entre 4,79:1 et 6,7:1) :
- **Ambre « Nouvelle »** (#A14A00 sur #FFF3E0) : ce qui attend une action ; aussi l'alerte d'attente et les avertissements.
- **Bleu « Acceptée »** (#1D5FD1 sur #EAF1FD) : pris en compte ; aussi l'information neutre.
- **Violet « En préparation »** (#6B3FC4 sur #F1ECFC) : en cuisine.
- **Vert « Prête »** (#16794A sur #E6F4EC) : prêt à servir ; aussi les succès et l'état « Service ouvert ».
- **Gris « Terminée »** (#5E5E5B sur #EEEEEB) : archivé.
- **Rouge « Refusée / Annulée »** (#C0261C sur #FDECEA) : erreurs, actions destructrices, allergènes, attente critique, pastille de notification.

### Neutral
- **Fond** (#F4F4F1) : arrière-plan de tous les écrans.
- **Surface** (#FFFFFF) : cartes, champs, feuilles.
- **Creux** (#EEEEEB) : désactivé, squelettes, puces de rang, segments inactifs.
- **Trait** (#E4E4E0) et **Trait fort** (#CFCFCA) : bordures de cartes ; bordures de champs et de boutons secondaires.
- **Texte 2** (#5E5E5B) : texte secondaire (6,5:1 sur blanc).
- **Texte 3** (#6B6B68) : métadonnées et placeholders (5,4:1 sur blanc).
- **Gris sur noir** (#A3A3A0) : texte secondaire sur fond Ink.
- **Gris marque** (#808080) : réservé aux fonds noirs (4,85:1) et aux éléments décoratifs.

### Named Rules
**The Next Gesture Rule.** Le citron désigne le prochain geste. Une zone n'a qu'un seul élément citron ; s'il y en a deux, l'un des deux est faux.

**The Ink On Lime Rule.** Le citron est toujours un aplat portant du texte Ink. Jamais de texte citron sur fond clair (1,2:1). Sur fond Ink, le citron reste réservé aux indicateurs actifs, jamais à du texte d'action.

**The No Color Alone Rule.** Un statut s'exprime toujours par un libellé et une icône en plus de sa teinte.

## Typography

**Display Font:** Satoshi (avec ui-sans-serif, system-ui)
**Body Font:** Satoshi
**Label/Mono Font:** aucune ; les données utilisent Satoshi en chiffres tabulaires.

**Character:** une grotesque géométrique, nette et chaleureuse, qui tient aussi bien un « Bonjour, Awa » en grand qu'une ligne de ticket à 15 px. Graisses 400, 500 et 700 ; 900 uniquement pour le monogramme du restaurant.

### Hierarchy
- **Display** (700, 2.25rem, 1.05, -0.03em) : salutation de l'accueil, titre d'un parcours d'onboarding.
- **Headline** (700, 1.875rem, 1.15, -0.02em) : titre de page sur ordinateur.
- **Title** (700, 1.5rem puis 1.25rem, 1.2 et 1.3) : titres de section, catégories du menu public, numéro de ticket (1.25rem).
- **Lead** (500, 1.125rem, 1.45) : phrase d'introduction d'un écran ou d'un état vide.
- **Body** (400, 1rem, 1.5) : texte courant, champs, boutons ; 65 à 75 caractères par ligne au maximum pour la prose.
- **Small** (400, 0.875rem, 1.45) : métadonnées (table, âge), aides de champ, libellés d'onglets.
- **Caption** (400, 0.75rem, 1.4) : axes de graphiques et légendes uniquement.
- **Stat** (700, 1.875rem, 1, tabulaires) : chiffres clés des statistiques.

**Licence (ITF Free Font License 2.0, vérifiée le 3 novembre 2026) :** Satoshi est auto-hébergée en fichiers WOFF2 officiels, sans sous-ensemble ni conversion, uniquement pour les interfaces de Restio (site, application, administration). Elle n'est **jamais** proposée aux restaurants comme police de leur menu public : la licence interdit de la rendre disponible à des tiers via une plateforme SaaS. Les polices des menus publics sont des polices sous licence OFL. Les fichiers de police ne sont jamais publiés dans un dépôt public.

### Named Rules
**The Fourteen Floor Rule.** Aucune information de travail sous 14 px sur mobile. 12 px est réservé aux légendes de graphiques et à la barre de navigation.

**The Tabular Money Rule.** Prix, totaux, quantités et compteurs sont en chiffres tabulaires, avec la devise du restaurant formatée par `Intl.NumberFormat` (espace fine insécable comme séparateur en français).

## Layout

Mobile d'abord, conçu à 360 px (Android d'entrée de gamme) puis élargi. Gouttière latérale de 16 px sur mobile, 32 px à partir de 768 px. Rythme d'espacement en multiples de 4 px (4, 8, 12, 16, 20, 24, 32, 48) : groupes serrés (8 à 12 px), séparation de sections généreuse (24 à 32 px), plus d'espace au-dessus d'un titre qu'en dessous.

Application restaurateur sur mobile : en-tête court (monogramme, nom du restaurant, état du service, cloche avec pastille), contenu défilant, barre de navigation noire fixe en bas avec cinq destinations (Accueil, Commandes, Menu, Stats, Réglages). Les filtres sont des onglets-pilules qui défilent horizontalement. Les actions principales sont dans la moitié basse de l'écran, à portée de pouce.

Sur tablette et ordinateur (à valider à la construction en Phase 6) : la barre basse devient un rail latéral noir ; la liste de commandes peut passer en colonnes par statut au-delà de 1024 px. Aucune modale ne dépasse la hauteur de l'écran : sur mobile, les formulaires et détails s'ouvrent en feuille depuis le bas (rayon 28 px en haut).

Menu public : bannière pleine largeur (168 px de haut sur mobile), carte d'identité du restaurant qui chevauche la bannière, catégories collantes en haut, liste de plats, barre de panier collante en bas qui n'apparaît qu'au premier article.

Tableaux sur mobile : jamais de défilement horizontal pour une donnée essentielle ; chaque ligne devient une carte compacte (titre, valeur principale à droite, métadonnées dessous).

## Elevation & Depth

Système plat par défaut : la profondeur vient du contraste de fond (Fond → Surface → Creux) et des bordures fines, pas des ombres. Deux ombres seulement, toujours avec décalage et flou.

### Shadow Vocabulary
- **Repos léger** (`box-shadow: 0 1px 2px rgba(15,15,15,.06), 0 2px 8px rgba(15,15,15,.04)`) : élément qui chevauche un autre (carte du restaurant sur la bannière, curseur d'interrupteur).
- **Flottant** (`box-shadow: 0 8px 24px rgba(15,15,15,.10), 0 2px 6px rgba(15,15,15,.06)`) : toasts, feuilles, menus déroulants.

### Named Rules
**The Flat Until Floating Rule.** Une carte posée dans une liste n'a pas d'ombre. Seul ce qui flotte au-dessus du contenu en porte une.

## Shapes

Formes généreusement arrondies et régulières : 10 px pour les petits éléments (notes, puces de rang), 14 px pour champs et images de plats, 20 px pour cartes et tickets, 28 px pour les grandes cartes et le haut des feuilles, pilule (999 px) pour tous les boutons, onglets, badges et la barre de panier. Bordures de 1 px. Le seul trait non continu est le pointillé qui sépare le total dans un ticket. Images de plats et logos en carré 1:1 ; bannières en format large, jamais recadrées en carré.

## Components

### Buttons
- **Shape:** pilule (999 px), hauteur 48 px (40 px en compact), texte 16 px gras (14 px en compact).
- **Primary:** aplat citron, texte Ink. Un seul par zone. Survol #B6F00F.
- **Dark:** aplat Ink, texte blanc, pour l'action forte secondaire (imprimer, télécharger le QR Code). Survol Ink 2.
- **Secondary / Ghost:** surface blanche avec trait fort, ou transparent ; survol sur Creux.
- **Danger:** aplat rouge, texte blanc, libellé explicite (« Supprimer ») et confirmation si irréversible.
- **States:** focus en contour Ink 2 px décalé de 2 px (citron sur fond noir) ; appui à 98 % d'échelle ; désactivé sur Creux avec texte Texte 3 et `cursor: not-allowed` ; chargement avec spinner et libellé d'action en cours (« Envoi… »), bouton bloqué contre le double envoi.
- **Icône seule:** carré de 48 px (40 px compact), nom accessible obligatoire.

### Chips
- **Onglets-filtres:** pilules de 40 px, surface blanche et trait fort ; sélectionnée en Ink avec compteur citron. Rôle `tab`, `aria-selected`.
- **Badges de statut:** pilules de 28 px, texte 13 px gras, icône Lucide 15 px, teinte de statut sur son fond.
- **Pastille de notification:** rouge, texte blanc 12 px gras, bordure de la couleur du fond. Le nombre est exact ; masquée à zéro.

### Cards / Containers
- **Corner Style:** 20 px (28 px pour les cartes de mise en avant sur fond Ink).
- **Background:** Surface sur Fond ; une seule carte Ink par écran pour ce qui attend une action.
- **Shadow Strategy:** aucune au repos (voir Elevation & Depth).
- **Border:** 1 px Trait.
- **Internal Padding:** 16 px (12 px pour les lignes de plats).
- **Jamais de carte dans une carte.**

### Inputs / Fields
- **Style:** 48 px de haut, rayon 14 px, trait fort, fond blanc, libellé visible au-dessus (14 px, 500), aide dessous (13 px, Texte 2).
- **Focus:** bordure Ink et halo `0 0 0 3px rgba(15,15,15,.12)`.
- **Error / Disabled:** bordure et halo rouges, message rouge sous le champ avec icône et cause + correction (« 9 chiffres attendus ») ; désactivé sur Creux.
- **Téléphone:** sélecteur d'indicatif séparé (pays + indicatif) puis numéro, `inputmode="tel"`. Montants en `inputmode="decimal"`.
- **Interrupteur:** 48 × 28 px ; activé en Ink avec curseur citron, rôle `switch`.

### Navigation
- **Barre basse (mobile):** fond Ink, cinq entrées icône 22 px + libellé 11 px gras ; entrée active en blanc avec icône dans une pilule citron ; pastille rouge sur Commandes. `aria-current="page"`.
- **En-tête d'écran:** monogramme 40 px (Ink, initiale citron), nom du restaurant, état du service en vert avec point, cloche à pastille.

### Order Ticket (signature)
Le ticket de commande est le cœur visuel de Restio.
- **Contenu:** numéro (20 px gras), table et âge, badge de statut à droite, lignes « quantité × plat — prix », note client, total séparé par un pointillé, rail de 4 segments, puis l'action.
- **Rail:** segments de 6 px ; étapes franchies en Ink, étape courante en citron cerclé d'Ink, étapes à venir en Creux. Rôle image avec libellé « Étape N sur 4 : … ».
- **Action:** bouton citron pleine largeur qui nomme l'étape suivante (Accepter, Lancer la préparation, Marquer prête, Remettre au client) ; à côté, un bouton secondaire carré (refuser à l'étape « Nouvelle », plus d'actions ensuite).
- **Âge:** « Table N · il y a N min » en gris ; à partir de 5 min, l'âge passe sur sa propre ligne : « attend depuis N min » en ambre gras avec icône horloge ; à partir de 10 min en rouge avec icône d'alerte.
- **Allergènes:** note distincte, fond rouge pâle, texte rouge gras, icône triangle, préfixe « Allergie : ». Toujours au-dessus de la note libre.
- **Mouvement:** au passage d'étape, seul le ticket avancé anime son segment courant (remplissage de gauche à droite, 360 ms) et son badge (se pose, 360 ms), avec `cubic-bezier(.16,1,.3,1)`. Rien ne s'anime au chargement.

### Empty States
Illustration au trait (2 px Ink) propre au contexte avec une seule touche citron, titre 18 px gras, phrase de 34 caractères de large environ, puis une action utile (« Télécharger le QR Code », « Voir mon menu »). Chaque section a son propre message.

### Loading
Squelettes en Creux qui reproduisent la structure réelle (ticket, ligne de plat, carte de statistiques), animés par une pulsation d'opacité lente (1,6 s), coupée par `prefers-reduced-motion`. Jamais de spinner au milieu du contenu ; le spinner est réservé aux boutons en cours d'envoi.

### Toasts
Fond Ink, rayon 14 px, ombre flottante, pastille ronde de 28 px (citron et coche pour un succès, rouge pour une erreur), message en deux niveaux, action éventuelle en texte blanc souligné. `role="status"` pour un succès, `role="alert"` pour une erreur.

### Dish Row (gestion du menu)
Image carrée de 64 px (ou emplacement « ajouter une photo »), nom sur deux lignes au maximum (jamais tronqué sur une seule : le restaurateur doit reconnaître le plat avant de changer sa disponibilité), prix et catégorie, interrupteur de disponibilité à droite. Plat épuisé : nom en Texte 2, image en niveaux de gris.

### Public Dish Card (menu public)
Texte à gauche (nom, description sur 2 lignes, prix), photo carrée de 104 px à droite, bouton rond Ink « + » en bas à droite de la photo qui devient un sélecteur de quantité « − N + ». Plat épuisé : opacité réduite, mention « Épuisé », aucun contrôle d'ajout.

## Do's and Don'ts

### Do:
- **Do** garder un seul bouton citron par zone, et lui faire nommer l'action (« Lancer la préparation », pas « Suivant »).
- **Do** exprimer chaque statut par libellé + icône Lucide (contour 1,75 px) + teinte.
- **Do** vérifier le contraste de chaque texte : ≥ 4,5:1, ≥ 3:1 pour les grands textes et les éléments graphiques porteurs de sens.
- **Do** prévoir pour chaque composant interactif : normal, survol, focus visible, appui, désactivé, chargement, erreur.
- **Do** donner une cible tactile d'au moins 44 × 44 px (48 px par défaut).
- **Do** prévoir des libellés 30 % plus longs (anglais, allemand) sans casse de mise en page.
- **Do** thémer les surfaces du navigateur : sélection en citron avec texte Ink, barres de défilement fines en Trait fort, focus Ink.
- **Do** respecter `prefers-reduced-motion` : transitions ramenées à zéro, squelettes figés.
- **Do** signaler toute photo de démonstration comme telle.

### Don't:
- **Don't** écrire du texte citron sur fond clair, ni utiliser le citron comme couleur de statut.
- **Don't** utiliser le gris marque #808080 pour du texte sur fond blanc (3,9:1).
- **Don't** construire un écran en grille de cartes KPI identiques (grand chiffre, petit libellé).
- **Don't** placer de surtitre au-dessus d'un titre.
- **Don't** imbriquer une carte dans une autre.
- **Don't** ouvrir une modale quand une feuille, un panneau ou un changement en place suffit.
- **Don't** animer au chargement de page, ni plus de 250 ms pour une transition d'état (360 ms pour le seul geste du ticket).
- **Don't** remplacer une icône par un émoji ou un caractère Unicode.
- **Don't** introduire une seconde police ou une police système en titre.
