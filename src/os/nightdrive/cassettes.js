// LES CASSETTES DE LA BARQUE — la boombox X-BASS ouvre la boîte à K7.
// Une cassette = une playlist. Choisir une cassette = prise d'antenne (D13) :
// c'est le MÊME flux que l'Émetteur et l'autoradio, jamais un second lecteur.
//
// Vincent : une entrée par cassette.
//   titre    : écrit sur l'étiquette
//   couleur  : la couleur de l'étiquette (hex)
//   note     : griffonné en dessous (optionnel)
//   pistes   : dans l'ordre — soit l'id d'un son de l'OS (src/data/content.js),
//              soit { nom: 'TITRE', src: '/media/…' } pour un fichier direct
//              (déposé dans public/media/, ex. public/media/k7/).

export const CASSETTES = [
  {
    titre: 'FACE A — EXEMPLE',
    couleur: '#e8a13a',
    note: 'remplace-moi dans cassettes.js',
    pistes: ['kick1', 'fr_hangar', 'fr_quai'],
  },
  {
    titre: 'FACE B — EXEMPLE',
    couleur: '#3fa0e8',
    note: 'démos du hangar',
    pistes: ['demo3', 'basse1'],
  },
];
