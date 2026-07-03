// Carte des sons d'interface (docs/050_SON.md).
// v1 : placeholders synthétiques, à remplacer par les vrais sons de Vincent —
// déposer un fichier dans public/media/ui/ et changer le chemin ici. Rien d'autre.

export const soundMap = {
  open:     { src: '/media/ui/open.wav',     gain: 0.16 }, // ouverture de fenêtre
  close:    { src: '/media/ui/close.wav',    gain: 0.16 }, // fermeture
  minimize: { src: '/media/ui/minimize.wav', gain: 0.14 }, // réduction / restauration
  tick:     { src: '/media/ui/tick.wav',     gain: 0.10 }, // petit accusé (aperçu de note, chargement)
  launch:   { src: '/media/ui/launch.wav',   gain: 0.15 }, // lancement d'un .exe
};
