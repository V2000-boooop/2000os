// LE JOURNAL DU PMU — le quotidien local sur le comptoir (zone pmu/sudouest).
// La « une » du canard régional : moitié vraies nouvelles de Vincent 2000
// (sorties, dates, résidence), moitié faits divers de comptoir. La première
// entrée est la MANCHETTE (grand titre) ; les suivantes, des brèves.
//
// Vincent : une entrée par article.
//   titre : le gros titre
//   date  : coin haut (optionnel)
//   chapo : l'accroche en gras (optionnel)
//   corps : le texte (\n\n = paragraphes)

export const JOURNAL = {
  nom: 'SUD OUEST',
  edition: 'ÉDITION DE LA NUIT',
  articles: [
    {
      titre: 'UN DJ APERÇU PRÈS DU PORT, LA VILLE RETIENT SON SOUFFLE',
      date: 'aujourd\'hui',
      chapo: 'Des basses ont été entendues jusqu\'au petit matin. La gendarmerie parle « d\'un groove maîtrisé ».',
      corps:
        'Selon plusieurs témoins attablés à la taverne, un individu se faisant appeler « Vincent 2000 » aurait fait vibrer les vitres du quai une bonne partie de la nuit.\n\n« On a d\'abord cru à des travaux », confie un habitué du comptoir, « puis on a compris que c\'était le kick. »\n\nAucune plainte n\'a été déposée. Une pétition pour que ça recommence circule déjà.',
    },
    {
      titre: 'La barque de 3h a encore fait le tour du port sans raison',
      chapo: 'Deux hommes, une lanterne, aucune explication.',
      corps: 'Le mystère reste entier. Ils saluent, ils repartent. On les aime bien.',
    },
    {
      titre: 'PMU : le favori de la 6e déçoit, le comptoir philosophe',
      corps: '« Le favori, il gagne jamais le jour où t\'as misé dessus. C\'est une loi », rappelle un fin connaisseur.',
    },
    {
      titre: 'MÉTÉO — nuit claire, lune haute, idéale pour ne pas dormir',
      corps: 'Ciel dégagé sur tout le littoral. Étoiles filantes possibles depuis l\'eau.',
    },
  ],
};
