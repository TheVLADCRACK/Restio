Tu es un expert en performance web. Passe en revue ce projet et vérifie les 31 règles ci-dessous, une par une.

Pour chaque règle :
1. Dis si elle est déjà appliquée, absente, ou sans objet pour ce projet (avec le fichier concerné).
2. Si elle est absente, explique en une phrase ce que ça coûte à l'utilisateur.

Puis classe les règles absentes de la plus rentable à la moins rentable, et attends que je valide avant de modifier quoi que ce soit. Corrige ensuite celles que je valide, une par une, en vérifiant que l'appli marche toujours après chaque changement.

Les règles :
1. Écrans de chargement en squelette : à la place des spinners, pour que la page ait l'air prête tout de suite.
2. Images en WebP ou AVIF : 2 à 3 fois plus légères que le JPG ou le PNG, avec des tailles adaptées à l'écran.
3. Pas d'appels API en double : un seul appel par donnée, partagé entre les composants (cache de requêtes).
4. Debounce sur la recherche et l'autocomplétion : on attend la fin de la frappe avant d'appeler le serveur.
5. Résultats d'API paginés : jamais toute la table d'un coup.
6. Fichiers statiques sur un CDN : images, JS et CSS servis au plus près de l'utilisateur.
7. Tâches lentes en file de jobs : mails, exports, IA : en arrière-plan, la page répond tout de suite.
8. Requêtes N+1 corrigées : une requête pour la liste, pas une par ligne.
9. Compression Brotli ou gzip : sur le HTML, le JS, le CSS et le JSON.
10. Cache Redis sur les données chaudes : ce qui est lu souvent et change peu.
11. Dépendances inutiles supprimées : moins de JavaScript à télécharger.
12. Timeouts sur les API externes : une API lente ne doit jamais bloquer ta page.
13. Réponses de l'IA en streaming : affichées token par token.
14. Interface optimiste : l'écran se met à jour avant la réponse du serveur, et revient en arrière en cas d'erreur.
15. Lazy load des images sous l'écran : chargées seulement quand on y arrive.
16. Requêtes indépendantes en parallèle : jamais l'une après l'autre si elles ne dépendent pas l'une de l'autre.
17. Index en base pour les requêtes fréquentes : sur les colonnes des filtres et des tris.
18. Traces OpenTelemetry sur le backend : pour voir quelle requête est lente.
19. Serveurs près de la base : même région pour l'app et la base.
20. Rendu côté serveur ou au build : la page arrive déjà remplie.
21. Scripts tiers chargés après la page : analytics, chat, pixels : en différé.
22. JavaScript découpé par page : chaque page charge seulement son code.
23. Longues listes virtualisées : seules les lignes visibles sont rendues.
24. Seulement les colonnes utiles : jamais de SELECT *.
25. Pool de connexions à la base : on réutilise les connexions au lieu d'en ouvrir une par requête.
26. Pas de re-renders inutiles : mémoïsation et état placé au bon endroit.
27. Cache navigateur sur les fichiers statiques : en-têtes Cache-Control longs sur les fichiers versionnés.
28. Load balancing sur plusieurs instances : le trafic réparti quand une seule ne suffit plus.
29. Polices auto-hébergées, peu de graisses : deux graisses maximum, en WOFF2.
30. Monitoring de la vitesse réelle : les Core Web Vitals de tes vrais utilisateurs.
31. Tests sur téléphone lent et réseau lent : throttling CPU et 3G dans les outils du navigateur.