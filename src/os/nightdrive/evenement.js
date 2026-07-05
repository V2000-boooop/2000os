// L'ÉVÉNEMENT DU PMU — la bouteille de Ricard sur le comptoir (zone pmu/ricard).
// L'affiche punaisée derrière le zinc : la prochaine date, la prochaine sortie,
// la prochaine raison de sortir. Un seul événement « à la une » ; s'il n'y en a
// pas, le lieu l'assume avec panache (voir `vide`).
//
// Vincent remplit `actuel` quand il a une date, un live, une sortie.
//   titre  : le nom de l'événement / de la sortie
//   quand  : la date (texte libre)
//   ou     : le lieu (optionnel)
//   ligne  : une phrase d'accroche (optionnel)
//   lien   : billetterie / écoute (optionnel — ouvre dans un onglet)
//   cta    : le libellé du bouton si lien (défaut : « en savoir plus »)

export const EVENEMENT = {
  actuel: null,
  // exemple à copier dans `actuel` :
  //   actuel: {
  //     titre: 'NUIT 2000 — LIVE AU HANGAR',
  //     quand: 'samedi 12, 23h → tard',
  //     ou: 'le hangar, quai ouest',
  //     ligne: 'field recordings, basses lourdes, une seule règle : jouer moins fort que la pluie.',
  //     lien: '', cta: 'réserver',
  //   },
  vide: {
    titre: 'RIEN D\'ANNONCÉ',
    ligne: 'pas de date au mur. c\'est louche. reviens vite — ou prépare la tienne.',
  },
};
