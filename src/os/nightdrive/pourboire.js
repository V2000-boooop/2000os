// LES BOUGIES DE LA CATHÉDRALE — donner une pièce à l'artiste (zone bougies).
// On allume un cierge, une pièce tombe dans le tronc. Un pourboire, jamais un
// péage (040 : la porte de collection est un bonus, pas une caisse). Le geste
// se suffit ; mais si Vincent met un vrai lien (Ko-fi, PayPal, Lydia, Tipeee…),
// un cierge de plus propose de « déposer une vraie pièce ».
//
//   lien   : URL de pourboire réel, ou '' (rien = geste symbolique seulement)
//   titre  : le libellé du bouton qui ouvre le lien
//   merci  : ce qui s'écrit quand une bougie s'allume

export const POURBOIRE = {
  lien: '',                       // ex. 'https://ko-fi.com/vincent2000'
  titre: 'déposer une vraie pièce',
  merci: [
    'merci. la nuit continue grâce à toi.',
    'une pièce, une bougie, un morceau de plus.',
    'ça, ça paie le prochain field recording.',
    'la lumière te va bien.',
    'reçu 5 sur 5. merci l\'ami.',
  ],
};
