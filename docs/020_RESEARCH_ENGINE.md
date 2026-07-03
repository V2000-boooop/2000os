# 020 — RESEARCH ENGINE (Le système Matière)

> **Rôle :** définit le moteur de recherche créative — ce qu'est la matière de l'atelier, comment elle entre, se décrit, se relie et vieillit. Ce document dictera le futur schéma de contenu technique (D3).
> **Dépendances :** `005_DESIGN_PRINCIPLES.md`, `010_IDENTITE.md`.
> **Révision :** 2026-07-03 — v1 **validée**.
> **Note terminologique :** le mot « pièce » est **provisoire**. À vérifier à l'usage lors de la construction des premières interfaces ; si un mot plus naturel s'impose (ressource, élément, matière…), remplacement partout.

## Mission du système

Transformer le chaos créatif en **cerveau navigable** — pas en bibliothèque. Une bibliothèque range ; un cerveau relie. Le but : que chaque découverte puisse en entraîner une autre, et que le système reflète la façon dont Vincent retrouve réellement les choses — par contexte, par époque, par projet, par sensation — plutôt que par type de fichier.

Ce document décrit le **système idéal**, pas les habitudes actuelles.

## L'unité : la pièce

L'unité atomique de l'atelier est une **pièce** (comme une pièce d'atelier ou de collection). Une pièce peut être : une démo, un morceau, un projet Ableton, un sample, un field recording, un preset, un sound design, une photo, une capture d'écran, une recherche visuelle, une vidéo, une note, une playlist, un favori, un document, une référence artistique, un projet entier — terminé ou abandonné.

Deux règles fondatrices :

1. **Tout peut être une pièce.** Si Vincent l'a collecté ou créé, ça peut entrer dans l'atelier (obsession : collectionner des matières, pas des œuvres).
2. **Une pièce appartient à plusieurs univers en même temps.** Jamais un seul dossier, jamais une seule catégorie. La multi-appartenance est la loi du système, pas l'exception.

## Le projet : l'unité centrale de l'atelier

Si la pièce est l'atome, **le projet est l'organe**. C'est l'unité de travail et de navigation principale de l'atelier : entrer dans un projet (HAL2000, Carmen, un EP, un DJ set…), c'est retrouver naturellement **toutes ses ressources** — sons, recherches visuelles, notes, références, exports, field recordings, projets Ableton — agrégées par leurs liens.

La multi-appartenance reste la loi : un même field recording peut nourrir deux projets ; le projet est le regroupement privilégié, jamais une prison.

**Les questions créatives.** Vincent travaille à partir de problèmes à résoudre. Chaque projet contient donc une section vivante de **questions / pistes à explorer** — parties intégrantes du processus, au même titre que les ressources. Une question est une pièce évolutive : elle naît, s'affine, se relie aux pièces qui tentent d'y répondre, et se ferme (résolue) ou s'abandonne (assumé, cf. l'inachevé). Une question ouverte est un déclencheur de création (P0) ; une question fermée raconte le chemin parcouru.

## Les dimensions de navigation

Chaque pièce peut être décrite — et donc retrouvée — selon quatre familles de dimensions :

| Famille | Dimensions | Nature |
|---|---|---|
| **Factuelle** | matière (son, image, vidéo, texte, code…), époque, origine, projet (HAL2000, Carmen, DJ sets…) | Objective, stable |
| **Sensible** | émotion, ambiance, couleur, énergie | Subjective, assumée comme telle |
| **D'état** | fonction : inspiration · à explorer · en cours · terminé · abandonné | Évolue dans le temps |
| **Relationnelle** | liens vers d'autres pièces (« a nourri », « vient de », « répond à »…) | Le tissu du cerveau |

Le visiteur comme Vincent doivent pouvoir naviguer selon **plusieurs dimensions simultanément** (ex. : « tout ce qui est sonore + nocturne + lié à HAL2000 »).

## Les trois règles de survie du système

Un système de description trop exigeant meurt : on cesse d'y verser sa matière. Trois règles le protègent :

1. **Entrer une pièce doit coûter moins d'une minute.** Seul un minimum est obligatoire (la pièce elle-même + sa matière). Toutes les autres dimensions sont optionnelles et peuvent venir plus tard.
2. **L'enrichissement est un geste créatif, pas une corvée.** Relier, colorer, qualifier une pièce se fait au fil des usages — idéalement dans l'OS lui-même (P0 : le rangement aussi peut provoquer la création).
3. **Les vocabulaires sensibles sont cultivés, pas libres.** Émotions, ambiances, énergies : de petits vocabulaires choisis par Vincent, qui grandissent lentement. Des tags libres illimités produiraient du bruit, pas un cerveau.

## Le système en usage : cinq scénarios du quotidien

Le système se juge sur ces gestes réels. Convention de lecture : **geste** (ce que fait Vincent) · **automatique** (ce que le système déduit seul) · **demandé** (le minimum obligatoire, < 1 minute) · **plus tard** (enrichissement optionnel) · **retrouver** (comment la matière ressurgit).

### 1. Retour de festival — photos, vidéos, field recordings

- **Geste :** déposer tout le lot en une seule action — un **versement**.
- **Automatique :** matière de chaque fichier (son/image/vidéo), dates (métadonnées des fichiers), rattachement de tout le lot à une origine saisie une fois (« Festival X, juin 2026 »).
- **Demandé :** rien d'autre. État par défaut : *à explorer*.
- **Plus tard :** ambiance ou émotion sur les meilleures pièces ; lien « a nourri → » quand un field recording finit dans une démo.
- **Retrouver :** par origine (« Festival X »), par époque (été 2026), par matière (field recordings), plus tard par ambiance.

### 2. Je termine une nouvelle musique

- **Geste :** entrer la pièce — fichier (ou lien plateforme, D7) + titre.
- **Automatique :** matière = son, date.
- **Demandé :** projet de rattachement, état = *terminé*.
- **Plus tard :** le geste le plus précieux du système — relier le morceau aux pièces qui l'ont nourri (samples, field recordings, notes, références). C'est ce qui rend le processus visible (obsession n°1) et transforme une sortie en constellation explorable.
- **Retrouver :** par projet, par état ; le visiteur remonte les liens et découvre la genèse du morceau.

### 3. Je découvre un peintre

- **Geste :** créer une pièce *référence* — nom + quelques images ou un lien.
- **Automatique :** matière = image/référence, date de découverte, origine = extérieure.
- **Demandé :** rien d'autre.
- **Plus tard :** une phrase — *pourquoi ça me touche* ; couleur, émotion ; lien vers le projet que ça pourrait nourrir.
- **Retrouver :** par les dimensions sensibles (couleur, émotion) — c'est là que les références externes ressurgissent au bon moment, des années plus tard.

### 4. Je crée un nouveau projet

- **Geste :** créer une pièce *projet* — nom + intention en une phrase.
- **Automatique :** date, état = *en cours*. **Effet systémique :** le projet devient immédiatement une dimension de navigation — toute pièce existante ou future peut s'y rattacher.
- **Demandé :** rien d'autre.
- **Plus tard :** le projet s'enrichit tout seul, par les pièces qui s'y relient — et par ses **questions créatives** (« quel grain pour la basse ? », « quelle identité visuelle ? »), qui naissent, évoluent et se ferment au fil du travail.
- **Retrouver :** le projet agrège automatiquement sa constellation ; dans l'OS, c'est naturellement un dossier vivant. Ses questions ouvertes sont visibles : elles montrent où le travail vit en ce moment.

### 5. Je fais une recherche sur un synthétiseur

- **Geste :** créer une pièce *recherche* (« SH-101 ») — c'est une **pièce évolutive** : elle grandit au fil des ajouts (textes, captures, liens, sons de test).
- **Automatique :** date de chaque ajout — la recherche porte sa propre chronologie.
- **Demandé :** un titre.
- **Plus tard :** les sons de test deviennent eux-mêmes des pièces liées ; lien vers les morceaux qui utilisent ce synthé.
- **Retrouver :** par titre ; ou en remontant depuis un morceau (« vient de → recherche SH-101 »).

### Concepts qui émergent de ces scénarios

Quatre mécanismes révélés par l'usage, qui font partie du système : le **versement** (entrée par lot avec origine commune), la **pièce évolutive** (qui grandit dans le temps, comme une recherche), la **pièce-dimension** (un projet est une pièce qui devient axe de navigation) et la **question créative** (pièce évolutive attachée à un projet, qui déclenche et raconte le travail).

## Cycle de vie d'une pièce

**Entrée** (minimum vital) → **enrichissement** (dimensions, au fil du temps) → **liaison** (connexions à d'autres pièces) → **évolution d'état** (inspiration → en cours → terminé/abandonné) → **mémoire** (rien n'est supprimé ; l'abandonné reste une pièce à part entière — l'inachevé a droit de cité, cf. 010).

Une pièce n'est jamais « finie » de décrire : le système accepte l'incomplétude permanente.

## Ce que ce système promet aux autres systèmes

- À `030_OS` : les apps sont des **vues sur les dimensions** (un explorateur navigue le factuel, d'autres apps navigueront le sensible et le relationnel).
- À `060_VIE` : chaque entrée ou liaison de pièce est un battement de cœur de l'atelier — la matière première du « site vivant ».
- Au futur schéma technique : taxonomie multi-dimensionnelle, liens typés entre pièces, états évolutifs, vocabulaires contrôlés éditables. Rien ici ne présuppose un outil.
