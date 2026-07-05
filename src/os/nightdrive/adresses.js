// LE CARNET D'ADRESSES — les bonnes adresses de Vincent, un flow unique
// (cavistes de la taverne, tables de la taverne, pizzerias de la barque…).
//
// Vincent : remplace les EXEMPLES par tes vraies adresses, une ligne par
// maison. `lien` est optionnel (site, page, ou lien Google Maps) — s'il est
// là, l'adresse devient cliquable et s'ouvre dans un nouvel onglet.
//
//   { nom: 'CAVE UNTEL', ville: 'Marseille', note: 'le rouleguy du patron', lien: 'https://…' },

export const SECTIONS = {
  cavistes: {
    titre: 'VIN DU MOIS',
    sous: "les cavistes que j'aime dans le coin",
    entrees: [
      { nom: "EXEMPLE — LA CAVE D'EN BAS", ville: 'Marseille', note: 'remplace-moi dans adresses.js' },
    ],
  },
  restos: {
    titre: 'À MANGER',
    sous: "les tables que j'affectionne",
    entrees: [
      { nom: 'EXEMPLE — CHEZ TANTE B', ville: 'Marseille', note: 'remplace-moi dans adresses.js' },
    ],
  },
  pizzerias: {
    titre: 'LA PIZZA',
    sous: 'les meilleures pizzerias du coin',
    entrees: [
      { nom: 'EXEMPLE — CHEZ SAUVEUR', ville: 'Marseille', note: 'remplace-moi dans adresses.js' },
    ],
  },
};
