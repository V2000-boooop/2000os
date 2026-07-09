// PMU DES ARÈNES — la course de la télé. Données ÉDITABLES (tes animaux au choix).
// Sprites (optionnels, mis "par-dessus") : /media/nightdrive/pmu/course/<key>_run_<n>.webp
// Tant que frames = 0, un coureur dessiné en code sert de placeholder (remplacé dès que tu déposes les webp).
// `taille` (optionnel, défaut 1) : multiplicateur de taille du sprite en course (0.9 = plus petit, 1.15 = plus grand).
export const COURSE = {
  titre: 'TIERCÉ DE NUIT',
  chaine: 'PMU DES ARÈNES · EN DIRECT',
  base: '/media/nightdrive/pmu/course/',
  cagnotteInit: 50,          // jetons de départ (sauvegardés en localStorage)
  miseMin: 1, miseMax: 20,
  partants: [
    { key: 'zidane', nom: 'Zidane 98 Prime', cote: 2.5, col: '#2f6bff', frames: 4 },
    { key: 'rose',   nom: 'Britney64',       cote: 3.5, col: '#ff5aa0', frames: 4 },
    { key: 'jockey', nom: 'Ricardo667',      cote: 4.5, col: '#dddcd4', frames: 4 },
    { key: 'chirac', nom: 'CHIRAC',         cote: 6,   col: '#24596e', frames: 4 },
    // jeanne (cavalière dorée) retirée à la demande de Vincent — 4 partants = persos plus grands, mieux répartis. Sprites toujours dans course/ si retour.
  ],
};
