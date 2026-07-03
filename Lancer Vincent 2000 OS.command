#!/bin/bash
# Lanceur Vincent 2000 OS — double-cliquer ce fichier pour démarrer le site.
cd "$(dirname "$0")"

# S'assurer que Node/npm sont trouvables (installations Homebrew ou standard).
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v npm >/dev/null 2>&1; then
  echo ""
  echo "⚠️  Node.js n'est pas installé sur ce Mac."
  echo "   Télécharge-le ici : https://nodejs.org (bouton vert, version LTS),"
  echo "   installe-le, puis double-clique à nouveau ce fichier."
  echo ""
  read -n 1 -s -r -p "Appuie sur une touche pour fermer…"
  exit 1
fi

# Première fois : installation des dépendances (1 à 2 minutes).
if [ ! -d node_modules ]; then
  echo "Première installation, patiente une minute ou deux…"
  npm install --no-audit --no-fund
fi

# Ouvrir le navigateur une fois le serveur prêt.
( sleep 4 && open "http://localhost:4321" ) &

echo ""
echo "▶ Vincent 2000 OS démarre — le navigateur va s'ouvrir tout seul."
echo "  Pour arrêter : ferme cette fenêtre (ou Ctrl+C)."
echo ""
npm run dev
