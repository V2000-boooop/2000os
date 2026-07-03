# 090 — DECISION LOG

> Journal détaillé : une entrée par décision validée, avec justification et conséquences.
> Ne jamais modifier une décision validée sans nouvelle entrée expliquant le changement.
> Résumé courant : `000_PROJECT_MEMORY.md`.

## D1 — Nature de l'expérience ✅ (2026-07-03)

**Décision :** Atelier numérique vivant. Fonction première : rendre accessible le matériel de recherche et l'univers artistique réels. L'interface OS est le véhicule, pas le but.

**Conséquences :** la trouvabilité du contenu est une exigence de premier ordre (recherche, navigation directe). Les mécaniques ludiques sont évaluées selon la Règle d'or.

## D2 — Accès au contenu : architecture deux couches ✅ (2026-07-03)

**Décision :** Chaque contenu important (projet, musique, article, recherche, image, vidéo…) est une **ressource indépendante avec sa propre URL**. L'OS est l'expérience principale de découverte, pas le seul accès.

**Conséquences :**
- Couche contenu (données + URLs canoniques) séparée de la couche présentation (l'OS).
- Deep-linking bidirectionnel : un lien direct ouvre le contenu seul ; depuis cette vue, le visiteur peut « entrer dans l'OS » au même endroit.
- SEO et mobile assurés par les pages ressources.

## D3 — Pipeline de contenu évolutif ✅ (2026-07-03)

**Décision :** Phase 1 : contenu = fichiers dans le dépôt (Markdown, audio, images + métadonnées). Phase 2 : outil d'administration sur mesure. Pas de refonte entre les deux.

**Conséquences :** le **schéma de contenu** est défini dès maintenant et constitue le contrat stable. Le site consomme ce schéma sans savoir qui l'a produit. Le choix du stockage phase 2 reste ouvert.

## D4 — Identité et fiction ✅ (2026-07-03)

**Décision :** Vincent 2000 = identité artistique réelle. Pas de personnage fictif. Frontière réel/mise en scène volontairement floue ; esthétique = interprétation personnelle de 1998–2003 (rave, vieux jeux PC, interfaces oubliées, art contemporain).

**Conséquences :** la couche de mise en scène est **optionnelle par contenu** dans le schéma, jamais obligatoire.

## D5 — Paradigme d'interface : bureau multi-fenêtres + modes ✅ (2026-07-03)

**Décision :** Vrai bureau multi-fenêtres (déplacement, superposition, réduction, multitâche). L'OS est le **hub central** ; certaines apps basculent volontairement en **mode immersif plein écran** puis reviennent au bureau.

**Conséquences :**
- Window manager + gestionnaire de modes = cœur du moteur front-end.
- Chaque app est un module déclarant son mode d'affichage.
- La transition bureau ↔ immersif est un composant de première classe.

## D6 — Langues ✅ (2026-07-03)

**Décision :** Lancement en français, schéma et URLs conçus multilingues dès le départ.

**Conséquences :** tout champ textuel du schéma est localisable ; les URLs prévoient un espace de langue.

## D7 — Hébergement des médias : hybride ✅ (2026-07-03)

**Décision :** Sorties officielles : intégration plateformes (Spotify, Bandcamp, SoundCloud) quand pertinent. Recherches sonores, démos, samples, archives, exclusivités : **auto-hébergés**.

**Conséquences :** le schéma média distingue `source: self-hosted | platform-embed`. Le lecteur audio maison est une app centrale de l'OS. Prévoir stockage/CDN (voir D10).

## D8 — Rôles ✅ (2026-07-03)

**Décision :** Vincent = directeur créatif (non-développeur, veut comprendre les décisions à impact). Claude = directeur technique et développeur principal : implémente, explique, propose des options avec compromis.

## D9 — Budget et existant ✅ (2026-07-03)

**Décision :** Aucun existant (domaine, hébergement). Budget accepté : ~10–50 €/mois sur la durée.

## D10 — Stack technique ✅ (2026-07-03)

**Décision :** **Astro** (couche contenu) + **Svelte** (couche OS). Hébergement : **Cloudflare Pages** + **Cloudflare R2** (médias, sans frais de bande passante sortante) + nom de domaine.

**Justification :** la séparation Astro/Svelte épouse l'architecture deux couches (D2) ; Astro rend le pipeline par fichiers (D3) natif ; R2 rend l'audio auto-hébergé (D7) économiquement sûr.

## D11 — Documentation : bible de systèmes ✅ (2026-07-03)

**Décision :** Phase Creative Direction avant tout développement. La documentation est une **bible de systèmes indépendants** (un document = un système autonome, évolutif séparément), et non des chapitres par discipline. Ajouts : `000_PROJECT_MEMORY` (mémoire courante, max 3 pages, relue avant chaque tâche) et `005_DESIGN_PRINCIPLES` (manifeste créatif). `020` nommé **RESEARCH_ENGINE** (moteur de recherche créative, pas simple « contenu »). Emplacement `070_VISUAL_LANGUAGE` réservé pour le langage visuel. Anciens `00-VISION` / `01-DECISIONS` absorbés puis supprimés.

**Conséquences :** méthode par document : discussion → itération → validation → suivant. `000` = seule vérité courante ; toute décision changée = mise à jour `000` + entrée ici.

---

## Prochaines décisions d'architecture (en attente, après la bible)

1. **Schéma de contenu** — taxonomie des types et métadonnées communes (dépendra de `020_RESEARCH_ENGINE`).
2. **Contrat des apps de l'OS** — déclaration, modes, état (dépendra de `030_OS`).
3. **Correspondance URL ↔ OS** — deep-linking bidirectionnel.
4. **Stratégie mobile** — forme de l'expérience OS sur mobile.
5. **Direction artistique et identité sonore** — via `070_VISUAL_LANGUAGE` et `050_SON`.
