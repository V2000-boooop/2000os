// LES CASSETTES DE LA BARQUE — la boombox X-BASS ouvre la boîte à K7.
// Le son joue ICI, dans la barque (règle « son spatial cinéma ») :
// clic = lecture, re-clic = stop, sortir de la barque = stop.
//
// Vincent : une entrée par cassette.
//   titre    : écrit sur l'étiquette
//   couleur  : la couleur de l'étiquette (hex)
//   note     : griffonné en dessous (optionnel)
//   src      : le fichier (déposé dans public/media/k7/)

export const CASSETTES = [
  {
    titre: 'LUJON',
    couleur: '#e8a13a',
    note: 'face nuit',
    src: '/media/k7/lujon.mp3',
  },
  {
    titre: 'INNER WAVE',
    couleur: '#3fa0e8',
    note: 'radio barque',
    src: '/media/k7/inner_wave.mp3',
  },
  {
    titre: 'SCH DNB',
    couleur: '#b03fe8',
    note: '2000',
    src: '/media/k7/sch_dnb.mp3',
  },
  {
    titre: 'PINO2000',
    couleur: '#3fe86e',
    note: 'italo barque',
    src: '/media/k7/pino2000.mp3',
  },
];
