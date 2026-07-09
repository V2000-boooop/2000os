#!/bin/bash
# Double-clic = pousser le projet en ligne (Vercel déploie tout seul).
cd "$(dirname "$0")"
git push originn master && echo "✓ Poussé — Vercel déploie (~1 min) : https://2000os.vercel.app" || echo "✗ Push refusé (identifiants GitHub ?)"
read -n 1 -s -r -p "Appuie sur une touche pour fermer."
