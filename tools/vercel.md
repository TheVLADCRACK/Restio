---
nom : vercel-démarrer
Zone : Premiers pas
surfaces_supportées : [cli, plugin, compétences, mcp]
description : |-
  Remettez ce guide à votre agent de développement pour configurer Vercel : installez le
  L'interface de ligne de commande (CLI) ajoute les instructions de la plateforme Vercel et se connecte au serveur MCP officiel de Vercel.
  Une seule fois pour une utilisation dans plusieurs projets.
Titre : « Intégrez votre agent chez Vercel »
URL : https://vercel.com/get-started.md
---

# Configurez Vercel pour votre agent de codage IA

Utilisez ce guide pour préparer l'agent actuel à Vercel. Installez l'interface de ligne de commande, les instructions et la connexion MCP une seule fois ; liez les projets individuels uniquement lorsque leurs opérations l'exigent.

## Comment exécuter

Exécutez la section 1 une fois par machine. Exécutez les sections 2 et 3 une fois par agent de codage. Dans la section 2, essayez d'abord le plugin Vercel et n'utilisez les compétences autonomes que si le plugin ne peut pas être utilisé.

Pour la section 3, suivez le parcours indiqué pour votre client ci-dessous ou dans la [documentation Vercel MCP](https://vercel.com/docs/agent-resources/vercel-mcp). Si aucun de ces documents ne correspond, choisissez le parcours le plus approprié. En cas de blocage à une étape, notez la raison et poursuivez avec les étapes suivantes.

Effectuez vous-même les actions lorsque l'accès au terminal ou aux fichiers est disponible. L'installation globale ou limitée à l'utilisateur est le comportement par défaut. Ne suspendez l'exécution que pour l'authentification de l'utilisateur, l'approbation ou les actions d'interface utilisateur que vous ne pouvez pas réaliser. Ne vous contentez pas de renvoyer des commandes à copier.

## 1. Installez l'interface de ligne de commande Vercel

Vérifier s'il existe une installation :

```sh
vercel --version
```

Si l'interface de ligne de commande est manquante, installez la dernière version :

```sh
npm install --global vercel@latest
vercel --version
```

Si l'interface de ligne de commande installée indique qu'une mise à jour est disponible, exécutez la même commande d'installation globale. Utilisez les commandes `vercel` de base pour toutes les opérations suivantes.

Si `whoami` indique qu'aucun utilisateur n'est authentifié, vous pouvez utiliser `vercel signup` pour créer un compte au nom de l'utilisateur, ou `vercel login` s'il en possède déjà un.

Veuillez faire une pause pendant que l'utilisateur termine son inscription ou sa connexion, puis vérifiez en utilisant :

```sh
Vercel Whoami
```

Ne créez ni ne liez de projet Vercel lors de la configuration globale. Liez un projet ultérieurement, lorsqu'un déploiement ou une opération spécifique au projet l'exige.

## 2. Ajouter le guidage Vercel

Installez soit le plugin Vercel, soit les compétences autonomes, mais pas les deux.

### Préféré : plugin Vercel

Ce plugin requiert Node.js 18 ou une version ultérieure. Installez-le s'il est absent et si possible, puis exécutez :

```sh
nœud --version
npx plugins ajouter vercel/vercel-plugin
```

Utilisez les compétences autonomes si vous savez que votre agent ne prend pas en charge les plugins, si l'installation signale une incompatibilité ou si Node.js ne peut pas être installé. Pour toute autre erreur, consultez la [documentation du plugin](https://vercel.com/docs/agent-resources/vercel-plugin) avant d'opter pour une autre solution.

Dans OpenCode, utilisez plutôt la commande native d'OpenCode. Elle ne nécessite pas Node.js :

```sh
plugin opencode ajouter github:vercel/vercel-plugin
```

Installez le plugin une seule fois pour l'agent actuel. Vérifiez qu'il est activé dans tous les projets et qu'une commande telle que `/vercel-plugin:status` est accessible. Dans OpenCode, la commande est `/vercel:status`.

Rechargez uniquement si les commandes nouvellement installées sont manquantes.

### Solution de repli : compétences autonomes

Utilisez ceci pour l'une des raisons ci-dessus :

```sh
liste des compétences npx
npx skills ajouter vercel-labs/agent-skills --global
liste des compétences npx
```

Choisissez l'agent actuel si vous y êtes invité et confirmez le chemin d'installation. Le pack autonome est plus petit que le plugin et ne comprend pas l'ensemble de ses commandes, agents et systèmes d'automatisation.

## 3. Connectez le Vercel MCP

Connectez-vous une seule fois au point de terminaison Vercel MCP partagé pour accéder aux projets, déploiements, journaux et analyses Vercel de l'ensemble des projets.

Si votre client prend en charge l'authentification MCP distante via OAuth, utilisez la route correspondante ci-dessous. S'il ne prend en charge que les serveurs stdio, configurez la commande serveur MCP du client avec `npx` et les arguments `["mcp-remote", "https://mcp.vercel.com"]`, comme dans la route de l'interface de ligne de commande Gemini. En cas de doute, testez la route ; signalez le blocage de l'authentification MCP uniquement en cas d'échec.

Avant de modifier un fichier de configuration MCP, examinez-le et fusionnez l'entrée `vercel` sans remplacer les paramètres non pertinents.

Pour les clients pris en charge par l'interface de ligne de commande Vercel, configurez le point de terminaison partagé :

```sh
vercel mcp --clients "<client>"
```

Utilisez la valeur exacte de `<client>` :

- Claude Code : `Claude Code`
- Curseur : `Curseur`
- VS Code avec GitHub Copilot : `VS Code avec Copilot`

D'autres valeurs prises en charge sont disponibles dans la [documentation CLI MCP](https://vercel.com/docs/cli/mcp). Si votre client n'est pas pris en charge, utilisez plutôt sa route ci-dessous. Une seule route par client est autorisée.

Il s'agit du comportement par défaut. Utilisez `--project` uniquement lorsque l'utilisateur demande explicitement une connexion MCP à portée de projet.

### Code Claude

Solution de repli manuelle à portée utilisateur :

```bash
claude mcp add --transport http vercel --scope utilisateur https://mcp.vercel.com
```

Vérifiez les entrées MCP existantes avant d'en ajouter. Pour vous authentifier, ouvrez `/mcp`, sélectionnez `vercel` et choisissez l'action d'authentification.

### Codex CLI

Première inspection :

```bash
Liste des codes MCP
```

Codex n'est pas une cible prise en charge par `vercel mcp --clients`. Sa commande d'ajout documentée utilise la configuration utilisateur globale de Codex :

```bash
codex mcp ajouter vercel --url https://mcp.vercel.com
```

Codex devrait ouvrir un navigateur lors de l'installation. Si le serveur existe mais n'est pas authentifié, exécutez :

```bash
Connexion au codex mcp Vercel
```

### Curseur

Solution de repli manuelle : fusionnez ceci dans `~/.cursor/mcp.json` :

```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com"
    }
  }
}
```

Le curseur affiche « Connexion requise » lorsqu'une autorisation est nécessaire. Demandez à l'utilisateur de cliquer dessus.

### VS Code avec GitHub Copilot

Exécutez **MCP : Ajouter un serveur**, choisissez **HTTP**, saisissez `https://mcp.vercel.com`, nommez-le `Vercel` et sélectionnez **Global**. Ensuite, exécutez **MCP : Lister les serveurs**, démarrez Vercel et autorisez l’authentification. Si VS Code propose une méthode d’authentification alternative via le gestionnaire d’URL, utilisez-la.

### OpenCode

Le plugin Vercel ajoute déjà le serveur `vercel`. Sans le plugin, exécutez :

```bash
opencode mcp add vercel --global --url https://mcp.vercel.com
```

Pour s'authentifier, demandez à l'utilisateur d'exécuter `/mcps` dans OpenCode, de sélectionner `vercel` et de se connecter.

### Planche à voile

Fusionnez ceci dans `~/.codeium/windsurf/mcp_config.json` :

```json
{
  "mcpServers": {
    "vercel": {
      "serverUrl": "https://mcp.vercel.com"
    }
  }
}
```

Actualisez la configuration MCP dans Windsurf après l'enregistrement.

### Interface de ligne de commande Gemini

Fusionnez ceci dans `~/.gemini/settings.json` :

```json
{
  "mcpServers": {
    "vercel": {
      "commande": "npx",
      "args": ["mcp-remote", "https://mcp.vercel.com"]
    }
  }
}
```

Lancez Gemini CLI et utilisez `/mcp list` pour charger le serveur.

### Autorisation et vérification communes

Avant d'autoriser, vérifiez que le point de terminaison est exactement :

```text
https://mcp.vercel.com
```

Lorsqu'une fenêtre de navigateur ou un écran de consentement s'ouvre, faites une pause pour permettre à l'utilisateur de terminer l'authentification OAuth.

Après autorisation :

1. Appelez `search_vercel_documentation`.
2. Appelez l'outil authentifié en lecture seule `list_teams`.
3. Actualisez la liste des outils MCP ou des serveurs du client si l'un ou l'autre est indisponible.
4. Démarrer ou reprendre une session, ou recharger ou redémarrer le client, uniquement si l'actualisation ne charge pas le serveur.

Maintenez la confirmation humaine activée pour chaque mutation MCP. La connexion MCP confère à l'agent les mêmes droits d'accès que l'utilisateur Vercel autorisant l'opération.

## Achèvement

Rapport uniquement sur l'état vérifié :

```text
▲ L'installation de l'agent Vercel est prête
CLI : <version>, authentifié en tant que <nom d'utilisateur>
Indications : <plugin|skills|blocked: reason>, portée globale ou utilisateur
MCP : <connecté|bloqué : raison>, point de terminaison partagé global, https://mcp.vercel.com
Configuration MCP : <chemin|géré par l'interface de ligne de commande Vercel>
Vérification MCP authentifiée : <list_teams a réussi|non demandé>
Rechargement : <inutile|terminé>
```

## Déployer sans compte

Lorsqu'un utilisateur souhaite déployer une application en ligne sans posséder de compte Vercel, exécutez `vercel deploy --temporary` depuis le répertoire du projet. Cette commande ne nécessite aucune inscription et génère une URL de production en une seule opération. Elle affiche également une URL de revendication et sa date d'expiration. Communiquez cette URL à l'utilisateur et demandez-lui de ne pas la partager. Cette commande ne fonctionne pas dans un environnement d'intégration continue ni dans un répertoire déjà lié à un projet Vercel.

Si l'utilisateur souhaite le déployer lui-même, nous recommandons [Vercel Drop](https://vercel.com/drop). Il lui suffit de glisser-déposer un dossier de site statique dans son navigateur, sans avoir besoin de créer de compte.

Sources :

- https://vercel.com/docs/deployments/deploy-without-logging-in
- https://vercel.com/docs/cli
- https://vercel.com/docs/agent-resources/vercel-plugin
- https://vercel.com/docs/agent-resources/skills
- https://vercel.com/docs/agent-resources/vercel-mcp
- https://vercel.com/docs/cli/mcp


Si vous rencontrez des informations incorrectes, si vous ne trouvez pas ce dont vous avez besoin, si vous avez besoin d'une fonctionnalité que Vercel n'offre pas actuellement, ou si vous avez d'autres commentaires à signaler, veuillez le faire en suivant les instructions sur https://vercel.com/feedback.md.