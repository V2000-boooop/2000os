// Carte des sons d'interface (docs/050_SON.md + docs/exploration/soundlist_ui_v1.md).
// Famille UI v1 complète — 10 sons produits par Vincent, un fichier par événement.
// Remplacer un son = déposer le fichier dans public/media/ui/ (même nom), rien d'autre.

export const soundMap = {
  tick:      { src: '/media/ui/tick.wav',      gain: 0.10, label: 'accusé discret (aperçu note, re-focus)' },
  open:      { src: '/media/ui/open.wav',      gain: 0.16, label: 'ouverture de fenêtre' },
  close:     { src: '/media/ui/close.wav',     gain: 0.16, label: 'fermeture de fenêtre' },
  minimize:  { src: '/media/ui/minimize.wav',  gain: 0.14, label: 'réduction vers la barre' },
  restore:   { src: '/media/ui/restore.wav',   gain: 0.14, label: 'restauration depuis la barre' },
  launch:    { src: '/media/ui/launch.wav',    gain: 0.15, label: 'lancement d\'un .exe' },
  load_tick: { src: '/media/ui/load_tick.wav', gain: 0.07, label: 'tic de barre de chargement' },
  select:    { src: '/media/ui/select.wav',    gain: 0.06, label: 'sélection d\'icône du bureau (clic simple)' },
  deny:      { src: '/media/ui/deny.wav',      gain: 0.14, label: 'action impossible / erreur douce' },
  collect:   { src: '/media/ui/collect.wav',   gain: 0.16, label: 'récompense / déblocage de pièce (système de collection, à venir avec les jeux)' },
  ignition:  { src: '/media/ui/ignition.wav',  gain: 0.22, label: 'démarrage voiture — clic sur l\'icône night mode (Night Drive)' },
};
