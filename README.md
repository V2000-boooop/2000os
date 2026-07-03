# Vincent 2000 OS

Atelier numérique vivant — bible et règles : voir `docs/000_PROJECT_MEMORY.md`.

## Lancer le site en local

Prérequis : [Node.js](https://nodejs.org) (version 20 ou plus).

Dans le Terminal, depuis ce dossier :

```bash
npm install   # une seule fois
npm run dev   # puis ouvrir http://localhost:4321
```

## Où est quoi

```
docs/            bible du projet (000 = mémoire à lire en premier)
src/os/          l'OS : bureau, moteur de fenêtres, apps
src/os/apps/     une app = un lieu (registry.js pour en ajouter)
src/data/        la matière (content.js) et la scène d'arrivée (session.js)
public/media/    fichiers audio et images
```

## État — Bureau v1

- Bureau niveau 1 : catégories naturelles (Sons, Médias, Projets, Jeux, Notes, Internet, Corbeille)
- Fenêtres : ouvrir, fermer, déplacer, réduire, superposer
- Scène restaurée : lecteur en pause + note non enregistrée (éditable dans `src/data/session.js`)
- Apps : dossier (avec questions créatives), note, lecteur audio, visionneuse, placeholders
- Recherche globale v0 dans la barre des tâches
- Matière fictive plausible — à remplacer progressivement dans `src/data/content.js`

Style volontairement neutre : le langage visuel viendra avec `docs/070_VISUAL_LANGUAGE.md`.
Les sons d'interface viendront avec `docs/050_SON.md`.
