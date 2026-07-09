// État du perso qui traverse les scènes (film) : ivresse / défonce (0..100).
// Le bar / la picole augmentent l'ivresse, le passe-joint la défonce ; boire de
// l'eau au lavabo des WC fait redescendre. Réactif global (runes) — comme wm.
//
// Valeurs de départ : on arrive à LA RIDE déjà bien entamé (nuit en cours) →
// le lavabo a tout de suite un sens. Les scènes de picole/fumette pousseront
// ces jauges plus tard (setters ci-dessous).

export const etat = $state({ ivresse: 0, defonce: 0 });

/** Boire de l'eau : fait redescendre ivresse (et un peu la défonce). */
export function boire(ml = 1) {
  etat.ivresse = Math.max(0, etat.ivresse - ml);
  etat.defonce = Math.max(0, etat.defonce - ml * 0.6);
}
/** Picoler (bar, shots) → monte l'ivresse. */
export function picoler(n = 25) {
  etat.ivresse = Math.min(100, etat.ivresse + n);
}
/** Tirer sur le joint → monte la défonce. */
export function fumer(n = 25) {
  etat.defonce = Math.min(100, etat.defonce + n);
}
