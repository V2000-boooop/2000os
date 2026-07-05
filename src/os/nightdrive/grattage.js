// LE JEU À GRATTER DU PMU — présentoir Française des Jeux (zone pmu/fdj).
// Un vrai ticket : on gratte à la souris (ou au doigt), la couche argentée part,
// le résultat se révèle. Ni argent ni compte : on joue pour la phrase. Le turf,
// c'est de la lecture (comptoir.js). La plupart des tickets « perdent » avec
// panache ; un rare gagne quelque chose d'immatériel.
//
// Vincent : ajoute/retouche les résultats. `poids` = fréquence relative (un gros
// poids sort souvent). `gain` s'affiche en gros, `mot` en petit dessous.

export const TICKET = {
  nom: 'MORPION DE LA NUIT',
  prix: '2 €ur… ou rien, ici c\'est gratuit',
  consigne: 'gratte les trois cases',
};

export const RESULTATS = [
  { poids: 30, gain: 'PERDU', mot: 'rejoue. la chance passe, comme le bus.' },
  { poids: 22, gain: 'PERDU', mot: 'd\'un rien. demande au nez.' },
  { poids: 14, gain: 'PRESQUE', mot: 'deux sur trois. le turf est cruel.' },
  { poids: 10, gain: 'REJOUE', mot: 'la maison t\'offre un deuxième ticket.' },
  { poids: 8,  gain: 'x2', mot: 'tu as gagné… un autre ticket. c\'est déjà ça.' },
  { poids: 5,  gain: 'UN VERRE', mot: 'présente ce ticket au comptoir (il rigolera).' },
  { poids: 3,  gain: 'UN SON', mot: 'un morceau exclusif t\'attend. un jour. promis.' },
  { poids: 1,  gain: 'GAGNÉ !', mot: 'le 7 t\'a enfin regardé. savoure, ça revient pas.' },
];

/** Tire un résultat selon les poids. */
export function tirerTicket() {
  const total = RESULTATS.reduce((s, r) => s + r.poids, 0);
  let n = Math.random() * total;
  for (const r of RESULTATS) {
    if ((n -= r.poids) <= 0) return r;
  }
  return RESULTATS[0];
}
