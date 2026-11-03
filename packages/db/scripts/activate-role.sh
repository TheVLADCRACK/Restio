#!/usr/bin/env bash
# Demande la chaîne de connexion du propriétaire sans l'afficher ni l'écrire dans l'historique,
# puis active le rôle demandé (voir activate-role.mjs).
set -euo pipefail
read -rsp "Collez la chaine de connexion neondb_owner de la branche, puis Entree : " OWNER_DATABASE_URL
echo
export OWNER_DATABASE_URL
node "$(dirname "$0")/activate-role.mjs" "$@"
