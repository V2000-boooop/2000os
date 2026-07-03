// État global du lecteur audio (app singleton, cf. docs/030_OS.md — app signature).

export const player = $state({
  trackId: null,
  playing: false,
  autoplay: false, // vrai quand l'ouverture vient d'un double-clic sur un son
  caption: '',     // trace de session, ex. « laissé en pause hier, 02:17 »
});
