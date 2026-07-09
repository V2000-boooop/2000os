# 001 — LIGNE DIRECTRICE (révision Vincent, 2026-07-09)

> Réécriture de la vision par Vincent + architecture cible actée (D20).
> Ce document prime sur les formulations antérieures de la vision. Le protocole de travail reste dans `000`.

## La vision réécrite

Vincent 2000 OS n'est plus seulement un atelier-archive : c'est une **pièce d'art qui évolue**. Un monde graphique **relié au nôtre**, construit au fur et à mesure, où l'on trouve :

- des **histoires** et des **choses à trouver** (secrets, fenêtres cachées, objets, lieux) ;
- les **créations de Vincent** déposées dans certains dossiers — mais surtout un monde qui grandit ;
- des **passerelles vers le web réel** : un ordinateur dans une scène ouvre des playlists SoundCloud, le cinéma diffuse de vrais films, la tour radio capte de vrais flux ;
- à terme, un **visiteur connecté** : compte Google, avatar, choses à gagner (trouvailles, pièces, objets) ;
- de l'animation, du jeu, des idées improbables et novatrices — le site reste un lieu qui **provoque la création** (P0 inchangé).

Hiérarchie en cas d'arbitrage : 1) le monde s'enrichit par calques, jamais par régénération · 2) tout reste **léger et rapide** · 3) chaque nouveauté doit être **découvrable**.

## Architecture cible (D20, actée 2026-07-09)

**Décision centrale : les destinations ne deviennent PAS des pages web séparées.** La métamorphose D12 (le bureau reste monté, l'OS se transforme) est le cœur de la pièce — une navigation réelle la casserait. La légèreté vient du **code-splitting**, pas du multi-pages.

1. **Un seul shell** : le bureau (`index.astro` → `Desktop.svelte`), le plus léger possible.
2. **Un monde = un module chargé en différé** : `import()` → chunk séparé, préchargé quand le navigateur est au repos (`requestIdleCallback`) → zéro latence perçue. **Règle : jamais d'import statique d'un monde dans `Desktop.svelte`.** ✅ Fait pour Night Drive : bundle bureau 209 Ko → 80 Ko (−62 %), NightDrive = chunk de 129 Ko.
3. **Pages Astro séparées** : réservées aux expériences vraiment autonomes plein écran (futur cinéma longue durée, mini-jeu lourd, page de partage d'une création avec sa propre URL — cohérent D2 deep-linking).
4. **URLs profondes** (chantier futur) : History API `pushState` (`/nightdrive/pmu`) **sans** navigation réelle — partage + arrivée directe dans une scène, la métamorphose rejouée à l'arrivée.
5. **Progression / compte** : d'abord `src/state/save.svelte.js` (localStorage versionné : trouvailles, pièces, avatar) — ça débloque récompenses et secrets sans backend. Quand 3-4 choses à gagner existent → **Supabase** (auth Google gratuite, free tier généreux) qui synchronise le même objet de sauvegarde. Jamais de backend maison.
6. **Passerelles web** : une passerelle = **un écran DANS le monde** (iframe/widget habillé aux tokens `--v2000-*`), jamais une page brute. SoundCloud Widget API pour le PC in-game ; films via embeds (Internet Archive pour le domaine public, YouTube sinon). Règle 050 étendue : passerelle indisponible → écran de neige/silence, jamais d'erreur.
7. **Budget poids** : premier affichage d'un monde < 10 Mo. Fonds `.webp`, calques `.png`, boucles `.webm`. Musique longue = **streaming** (SoundCloud) ou `.webm` compressé, jamais de gros fichier source dans `public/`. ✅ Fait 2026-07-09 : le mp3 source de 50 Mo (non utilisé par le site, qui joue le `.webm` de 11 Mo) déplacé dans `archives/musique_sources/` — site allégé de 116 → 79 Mo. Les sources lourdes vont dans `archives/`, jamais dans `public/`.
8. **Découpage interne de `NightDrive.svelte`** (5352 lignes) : à terme un fichier par scène/salle, chargés à l'entrée. Chantier progressif, morceau par morceau, jamais en bloc.
9. **Dépendances** : `package.json` contient des libs non importées (`pixi.js`, `gsap`, `tone`, `@tsparticles/*`) — à retirer ou à justifier. `@rive-app` reste (D17).

## Roadmap (petites itérations, une par conversation)

1. ✅ Code-splitting Night Drive (2026-07-09).
2. ✅ Audio lourd : mp3 source 50 Mo déplacé hors du site (2026-07-09).
3. `save.svelte.js` : trouvailles + pièces (socle avatar/récompenses).
4. Première passerelle : le PC SoundCloud dans une scène.
5. Découpage de `NightDrive.svelte` par scènes.
6. URLs profondes (`pushState`).
7. Compte Google via Supabase — seulement quand il y a des choses à gagner.
