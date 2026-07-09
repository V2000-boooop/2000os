// LES CITATIONS DU PUPITRE — le prêche dépend de l'HUMEUR du prêtre.
// Prêtre content (pièce donnée, ou jamais dérangé) → l'évangile selon Céline.
// Prêtre vénère (pièce refusée) → textes à venir (Vincent) ; en attendant,
// fallback automatique sur les sermons absurdes de sermons.js.
//
// Vincent : colle ici autant de citations que tu veux (evene, etc.) —
// une chaîne par citation, virgule à la fin. \n = saut de ligne dans le prêche.
// `auteur` s'affiche en signature sous la citation (mets null pour aucune).

export const CITATIONS = {
  joyeux: {
    auteur: 'Céline Dion',
    textes: [
      "Je ne suis pas une superstar. Je suis Céline.",
      "La musique, c'est thérapeutique,\nune façon extraordinaire de s'exprimer.",
      "Il y a tellement de façons différentes de dire « je t'aime »\net de parler d'amour dans les chansons.",
      "La famille, c'est une richesse incroyable :\nça donne des outils pour affronter les moments extraordinaires,\nles moments plus difficiles, les hauts, les bas.",
      "Le bonheur ne se cache pas.",
      "Mon retour sur scène, ça va se passer.\nC'est pour ça que je travaille super fort.\nÇa va se passer.",
    ],
  },
  vener: {
    auteur: null,
    textes: [], // vide = les sermons de comptoir de sermons.js prennent le relais
  },
};
