#!/usr/bin/env bash
# optimize_assets.sh — Vincent 2000 OS
# Convertit les PNG de scènes servies en WebP (fonds opaques) et archive les
# sources. À relancer chaque fois que tu déposes de nouvelles images de scène.
#
# Règles du projet :
#   - fonds/scènes  -> WebP q82 (léger, universel)
#   - masques lights (scenes/lights/*.png) -> RESTENT en PNG (générés par
#     build_zone_masks.py, alpha net)
#   - perso (calques détourés) -> déjà servis en .webp
#
# Usage :
#   bash tools/optimize_assets.sh            # convertit + archive les .png sources
#   bash tools/optimize_assets.sh --keep     # convertit sans archiver les .png
#   Q=88 bash tools/optimize_assets.sh       # force une autre qualité (def. 82)
#
# Prérequis : ImageMagick (`convert`). Vérifie : command -v convert
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ND="$ROOT/public/media/nightdrive"
ARCH="$ROOT/archives/scenes_png_sources"
Q="${Q:-82}"
KEEP=0; [ "${1:-}" = "--keep" ] && KEEP=1

command -v convert >/dev/null || { echo "ERREUR: ImageMagick 'convert' introuvable"; exit 1; }

converted=0
# Toutes les scènes servies : racine + scenes/, hors dossier lights/ et hors perso/.
while IFS= read -r -d '' png; do
  case "$png" in
    */lights/*) continue ;;   # masques : on garde le PNG
    */perso/*)  continue ;;   # calques perso : déjà en webp
  esac
  webp="${png%.png}.webp"
  convert "$png" -quality "$Q" -define webp:method=6 "$webp"
  before=$(du -h "$png" | cut -f1); after=$(du -h "$webp" | cut -f1)
  printf "OK  %-45s %6s -> %6s\n" "${png#$ND/}" "$before" "$after"
  if [ "$KEEP" -eq 0 ]; then
    rel="${png#$ND/}"; dest="$ARCH/$(dirname "$rel")"
    mkdir -p "$dest"; mv "$png" "$dest/"
  fi
  converted=$((converted+1))
done < <(find "$ND" -maxdepth 2 -name '*.png' -not -path '*/lights/*' -print0)

echo "----"
echo "$converted image(s) converties en WebP q$Q."
[ "$KEEP" -eq 0 ] && echo "Sources PNG archivées dans archives/scenes_png_sources/ (rien n'est supprimé)."
echo "Pense à passer les refs en .webp dans src/os/nightdrive/scenes.js si tu ajoutes une nouvelle scène."
