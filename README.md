# Vincent 2000 OS

Atelier numérique vivant de Vincent 2000 (DJ, compositeur, sound designer) : une interface
immersive inspirée d'un ordinateur personnel 1998–2003, qui rend accessible sa matière
créative. **Toute la vérité du projet vit dans `docs/000_PROJECT_MEMORY.md` — à lire en premier.**

## Lancer en local

Prérequis : [Node.js](https://nodejs.org) 20+.

```bash
npm install   # une seule fois
npm run dev   # puis ouvrir http://localhost:4321
```

Ou double-clic sur `Lancer Vincent 2000 OS.command` (macOS).

## Structure du dépôt

```
docs/                    la bible du projet — un document = un système autonome
  000_PROJECT_MEMORY.md    mémoire courante (≤ 3 pages, seule vérité à jour)
  005 → 070                principes, identité, contenu, OS, expériences, son, vie
  090_DECISION_LOG.md      journal détaillé des décisions (D1 → D15, itérations)
  exploration/             documents de recherche par chantier
    nightdrive/              destination Night Drive (DA, specs, scènes gigognes)
    emetteur/                le lecteur-émetteur V2000 TX (protos SVG, comportement)
    lecteur/                 genèse du concept lecteur → émetteur
src/
  pages/index.astro        point d'entrée (Astro ne sert que de coquille)
  os/                      l'OS Svelte : Desktop, Window, wm (fenêtres), player,
                           sound, open — le bureau et ses moteurs
  os/apps/                 une app = un lieu (registry.js pour en déclarer une)
  os/nightdrive/           la destination Night Drive : NightDrive.svelte,
                           scenes.js (arbre des scènes gigognes), cityscape.js
  data/                    la matière : content.js (contrat de contenu),
                           session.js (scène restaurée), sounds.js
public/media/              médias servis : sons UI (ui/), images Night Drive
  nightdrive/scenes/       paires off/on des intérieurs (cf. DEPOSE_ICI.txt)
archives/                  matériel de travail conservé, jamais servi en prod
```

## Règles pour développer ici

- **Stack** : Astro + Svelte 5 (runes), zéro dépendance superflue. Déploiement cible :
  Cloudflare Pages + R2.
- **Rôles** : Vincent = direction créative (non-développeur) · Claude = direction technique.
  Protocole de session et méthode d'itération : en tête de `docs/000_PROJECT_MEMORY.md`.
- **Les formats de données sont des contrats** (contenu `src/data/content.js`, scènes
  `src/os/nightdrive/scenes.js`) : le code consomme le schéma, jamais l'inverse.
- Ne jamais réécrire une partie fonctionnelle sans raison. Toute décision passe par
  `000` + une entrée dans `090`.
- Commentaires et vocabulaire en français, dans la voix du projet (« destination »,
  jamais « mode » ; « émettre », jamais « play »).

## État courant

Bureau v1 livré (fenêtres, dossiers, recherche, sons UI) · destination **Night Drive**
en chantier actif (ville peinte cliquable, scènes gigognes D15) · Émetteur v1 en pause
derrière Night Drive. Détail et prochaines briques : `docs/000_PROJECT_MEMORY.md`.
