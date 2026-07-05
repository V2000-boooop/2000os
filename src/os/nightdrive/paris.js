// LES PARIS SPORTIFS DU PMU — la télé accrochée au mur (zone pmu/tele).
// Pas encore un jeu : un écran de paris qui vit tout seul, cotes qui défilent en
// bandeau, façon chaîne turf du bar-tabac. Les « matchs » sont volontairement
// absurdes (la nuit contre le sommeil, le kick contre la basse…). Le vrai jeu de
// paris viendra ; en attendant, l'écran tease et fait sourire.
//
// Vincent : ajoute des affiches. `cote` s'affiche à droite, `bandeau` défile en bas.

export const PARIS = {
  chaine: 'PMU · PARIS DE LA NUIT',
  matchs: [
    { a: 'LA NUIT', b: 'LE SOMMEIL', coteA: '1.10', coteB: '8.50', h: 'EN DIRECT' },
    { a: 'LE KICK', b: 'LA BASSE', coteA: '2.00', coteB: '1.85', h: '23:40' },
    { a: 'LE FAVORI', b: 'TON TICKET', coteA: '1.05', coteB: '12.0', h: '00:15' },
    { a: 'LE DERNIER VERRE', b: 'LA RAISON', coteA: '1.30', coteB: '3.40', h: '01:00' },
  ],
  bandeau:
    'PROCHAINEMENT : parie sur la 6e · la maison ne rembourse rien mais elle t\'écoute · ' +
    'cote spéciale sur « il rentre à quelle heure ? » · le turf, c\'est de la lecture · ',
};
