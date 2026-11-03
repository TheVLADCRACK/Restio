---
version: 1
slug: "design-board-html"
primary_target: "design/board.html"
related_targets: []
---

# Surface brief — Planche de validation du design system Restio

Scope : `design/board.html`, planche de référence du design system (tokens, composants, trois écrans mobiles clés). Mode : **Operate** (les écrans représentés sont des outils de travail ; la planche sert à valider le système avant le code).

Audience : le propriétaire du projet, qui valide ; puis les agents qui implémentent. Tâche : juger en un passage si palette, typographie, composants et écrans mobiles conviennent à un restaurateur pendant le service et à un client à table.

Contraintes : palette, police, logo et thème clair imposés par le brief (voir PRODUCT.md). Appareils modestes : aucune dépendance lourde. Photos de démonstration libres de droits (Unsplash), signalées comme telles.

## Direction contract

THESIS: Restio parle la langue du passe de cuisine : chaque commande est un ticket qui avance, et le citron signale toujours le prochain geste de service. Refuse le tableau de bord SaaS gris à cartes KPI identiques.

OWN-WORLD: fond clair légèrement chaud (#F4F4F1), surfaces blanches, coquille noire (#0F0F0F) pour la navigation, citron (#C7FF2E) réservé au geste suivant, à la sélection et à l'état actif, toujours avec texte noir. Satoshi seule, chiffres tabulaires. Rayons généreux (14/20/28 px), bordures fines, presque pas d'ombres. Statuts en couleurs sémantiques distinctes du citron, toujours avec libellé et icône Lucide.

STORY: le restaurateur voit d'abord ce qui attend une action, agit d'un pouce sans quitter la liste, puis consulte le reste. Le client voit le restaurant, choisit, commande, est rassuré.

FIRST VIEWPORT: écran Commandes mobile : en-tête court (nom du restaurant, état du service, cloche avec pastille), onglets de statut avec compteurs, liste de tickets ; chaque ticket montre numéro, table, âge, articles, total, rail de progression à 4 segments et un bouton citron pleine largeur qui nomme l'étape suivante. Barre de navigation noire en bas.

FORM: ticket de service à progression segmentée (le « signature move »), liste 1 sur 7 de l'ordre de résonance (ticket de cuisine imprimé, passe, ardoise du jour, chevalet de table, carte de bistrot, bon de commande, tableau des départs) ; seed:c3eb09408d68d1d7. Le tirage assignait le candidat 3 (ardoise du jour) ; le ticket est conservé car palette, police et thème sont imposés par le propriétaire et la revue indépendante demande de garder ce mouvement signature. Proposé au propriétaire comme alternative.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
