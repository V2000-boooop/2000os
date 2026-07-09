// SCÈNES GIGOGNES (D15) — le registre de l'arbre. Contrat stable (D3) :
// le composant ne connaît que ce schéma.
//
// Une scène = paire off/on au cadrage identique + zones en % de l'image.
// Chaque zone fait UNE de ces choses :
//   goto: 'id'            → descendre dans la scène enfant (zoom-crossfade)
//   open: { type, id }    → ouvrir du contenu de l'OS (arcade, dossier, app…)
//                           types vivants : 'arcade' · 'mantra' (phrase de
//                           comptoir) — extensible (jeu à gratter, news…)
//   exit: true            → ressortir vers la scène parente (la porte, la
//                           fenêtre — en plus du seuil bas et d'Échap)
//   (rien)                → lueur brève, pas encore branchée
// goto + open ensemble = fallback : tant que les images de la scène enfant
// ne sont pas déposées, le clic fait l'open (ou la lueur). Dès que la paire
// existe dans public/media/nightdrive/scenes/, la porte s'ouvre toute seule.
//
// Convention fichiers : /media/nightdrive/scenes/<id>_off_v1.webp + _on_v1.webp
// (le quai, racine, garde ses fichiers historiques à la racine du dossier).
// Zones des intérieurs : mesurées sur crops agrandis à réception des images
// (une scène par itération, Vincent teste entre chaque).

const S = '/media/nightdrive/scenes';

// DÉTOURAGE AU PIXEL : chaque zone peut porter un masque alpha calculé sur
// le diff off/on réel (la surbrillance épouse la forme exacte de l'objet).
// Génération : python3 tools/build_zone_masks.py — à relancer à chaque
// nouvelle zone / nouvelle version d'images. Sans masque : fondu générique.
const L = (n) => `${S}/lights/${n}.png`;

// Frames du prêtre (tools/build_pretre_frames.py — canvas commun, ancre pieds)
const PF = (b, n) => Array.from({ length: n }, (_, i) => `${S}/perso/pretre_${b}_${i + 1}.webp`);

export const ROOT = 'quai';

export const SCENES = {
  // ---- LA RACINE : le quai, vu de l'habitacle (seule scène avec les
  // instruments vivants ; les intérieurs sont plein cadre) ----
  quai: {
    off: '/media/nightdrive/ville_off_v1.webp',
    on: '/media/nightdrive/ville_on_v1.webp',
    zones: [
      // zones v3 mesurées au pixel (It14-16), élargies de la bande de fondu
      // (masque doux du moteur : les bords fondent, le cœur reste plein)
      { id: 'cathedrale', x: 6.9,  y: 3.6,  w: 15.1, h: 30.7, goto: 'cathedrale', lum: L('quai_cathedrale') }, // la tour gauche — jamais sur le montant
      { id: 'barque',     x: 40.7, y: 37.7, w: 7.7,  h: 7,    goto: 'barque',     lum: L('quai_barque') },     // les 2 gars sur l'eau
      { id: 'taverne',    x: 61.5, y: 31.4, w: 6.7,  h: 3.8,  goto: 'taverne',    lum: L('quai_taverne') },    // l'écriteau seul
      { id: 'laride',     x: 74.5, y: 17.7, w: 8.7,  h: 16.9, goto: 'laride', open: { type: 'arcade' }, lum: L('quai_laride') }, // le club — fallback : la salle It9
      { id: 'pmu',        x: 87.7, y: 32.4, w: 4.6,  h: 6.4,  goto: 'pmu',        lum: L('quai_pmu') },        // le bar-tabac
      { id: 'radio',      x: 84,   y: 4.1,  w: 4.5,  h: 15.4, open: { type: 'internet' }, lum: L('quai_radio') },      // la tour → Internet (séquence modem : porteuse introuvable)
      // LA BOÎTE À GANT (It28) : le panneau passager de la planche, à droite (sous
      // l'horloge). Détourée comme les enseignes → scintille au survol, clic = on
      // zoome dans l'intérieur (scène gigogne). % estimés sur ville_on_v1 — Vincent recale.
      { id: 'glovebox',   x: 64,   y: 54.3, w: 19.6, h: 11.8, goto: 'glovebox', z: 5, lum: L('quai_glovebox') }, // le clapet arrondi seul (mesuré sur ville_on) ; z:5 → au-dessus de la blockzone
      // HOTEL DU COMMERCE, LE BISTRONOME : décor, ne s'allument pas
    ],
  },

  // ---- LES INTÉRIEURS : câblés, en attente de leurs paires d'images.
  // zones: [] = la scène s'ouvre nue ; les objets seront mesurés et branchés
  // à réception (jukebox → Sons dans la taverne, bornes → arcade dans LA RIDE…) ----
  taverne: {
    parent: 'quai',
    off: `${S}/taverne_off_v1.webp`,
    on: `${S}/taverne_on_v1.webp`,
    // zones mesurées sur l'image (2026-07-04), fondu compris
    zones: [
      { id: 'vins',   x: 3.4,  y: 33.5, w: 9,    h: 22, open: { type: 'carnet', id: 'cavistes' }, lum: L('taverne_vins') },   // VIN DU MOIS → les cavistes de Vincent
      { id: 'manger', x: 80.8, y: 32.5, w: 13.5, h: 25, open: { type: 'carnet', id: 'restos' },   lum: L('taverne_manger') }, // À MANGER → ses tables
      { id: 'phone',  x: 39,   y: 83,   w: 15,   h: 17, open: { type: 'nokia' },                  lum: L('taverne_phone') },  // le 3310 sur la table : menu, contacts, Snake
    ],
  },
  laride: {
    parent: 'quai',
    off: `${S}/laride_off_v1.webp`,
    on: `${S}/laride_on_v1.webp`,
    // zones mesurées sur préview annotée (2026-07-04), fondu compris.
    // Chaque lieu recevra son sound design (fichiers Vincent, 050).
    zones: [
      { id: 'tableau',    x: 1,    y: 30.8, w: 9.5,  h: 17.5, open: { type: 'cocktails' },   lum: L('laride_tableau') }, // la carte : cocktails réels, verre animé
      { id: 'photobooth', x: 62.6, y: 22,   w: 13.4, h: 36,   open: { type: 'photobooth' }, lum: L('laride_photobooth') }, // la cabine → les photos de soirée (pellicule)
      { id: 'vestiaire',  x: 75,   y: 23,   w: 11,   h: 37,   goto: 'vestiaire', open: { type: 'friperie' }, lum: L('laride_vestiaire') },  // le portant → le VESTIAIRE (sous-scène gigogne D15 : décor dressing off/on). goto+open = fallback : tant que la paire vestiaire_dressing n'est pas là, clic = friperie (It??). Dès qu'elle existe, la porte s'ouvre seule.
      { id: 'toilettes',  x: 88.5, y: 29,   w: 10.8, h: 36.5, open: { type: 'toilettes' },  lum: L('laride_toilettes') },  // le mur des chiottes → lieu à sound design
      { id: 'djbooth',    x: 52,   y: 56,   w: 42.5, h: 37,   open: { type: 'dj' },        lum: L('laride_djbooth') },    // la cabine : deux CDJ, piste A / piste B
    ],
  },
  // ---- LE VESTIAIRE de LA RIDE (gigogne D15, enfant de laride) : le décor
  // dressing (miroir plein pied, portant de survêts, étagères de baskets,
  // néon d'essayage violet off/on). Cliquer la zone `vestiaire` de laride
  // plonge ici (zoom-crossfade) ; Échap dépile vers laride (jamais sortie
  // de destination — garde-fou D12). Son : `porte_vestiaire` à l'entrée,
  // `ressortir` au retour, `ambiance_vestiaire` en lit (silence si absents, 050).
  //
  // SCAFFOLD JEU D'HABILLAGE (laride_vestiaire_habillage.md) : le décor est
  // VISITABLE dès maintenant. Le jeu d'habillage (dress-up type Sims du raver
  // alien, calques PNG empilés) viendra quand Vincent aura produit les PNG du
  // perso (base + fringues par slot). En attendant : `persoZone` réserve la
  // zone centrale VIDE devant le miroir où le sprite du raver se posera
  // (pivot aux pieds), et `zones: []` → la scène s'ouvre nue (aucune lueur
  // parasite). AUCUN calque perso n'est rendu tant que les assets manquent.
  vestiaire: {
    parent: 'laride',
    off: `${S}/vestiaire_dressing_off_v1.webp`,
    on: `${S}/vestiaire_dressing_on_v1.webp`,
    // ZONE PERSO (jeu d'habillage) : le raver PLEIN CADRE, centré et ENTIÈREMENT
    // visible (tête → pieds). En % du cadre 1536×1024. Les calques sont en ratio
    // 2:3 (portrait) et rendus contain (aucun écrasement) : la zone est plus haute
    // et centrée pour que les JAMBES et les PIEDS soient visibles (l'ancienne UI
    // en bas de scène a disparu, remplacée par des cyclers par zone du corps).
    // pivot milieu-bas = les pieds (§2.1) : pieds ≈ y+h ≈ 94 %, tête ≈ y ≈ 8 %.
    persoZone: { x: 33, y: 8, w: 34, h: 86 },
    // JEU D'HABILLAGE v1 BRANCHÉ (dressup.js) : le raver alien se rend en pile de
    // calques PNG dans cette persoZone (pivot pieds), l'UI (onglets Bas·Pieds·
    // Haut·Coiffe + rail de vignettes + SURPRENDS-MOI + reset) s'affiche par-
    // dessus le décor. JOUABLE EN PLACEHOLDER tant que les PNG manquent (aplats
    // étiquetés) ; déposer les fichiers de dressup.js les remplace tout seuls.
    // zones vides : aucune lueur parasite, l'habillage a ses propres contrôles.
    zones: [],
  },
  barque: {
    parent: 'quai',
    off: `${S}/barque_base.webp`,
    on: `${S}/barque_base.webp`,
    // barque v9 (2026-07-05) : base = barque VIDE allumée (`barque_base.webp`), + 2
    // perso en CALQUES MOBILES détourés d'un fond vert (chroma key net + ombre au sol).
    // Base chaude unique pour off/on. Zones = mêmes % (cadrage conservé), fallback crop.
    water: { x: 0, y: 18, w: 100, h: 20 }, // bande d'eau animée (shimmer), au-dessus de la proue
    // (vacillement lampe retiré — on fera la vie de la flamme autrement, en calque.)
    zones: [
      { id: 'lampe',      x: 45, y: 49, w: 14, h: 22, open: { type: 'ciel' }, boost: 1.1, light: true }, // la lanterne → ciel étoilé (light: pas de crop de survol, sa vie = le halo continu)
      { id: 'radio',      x: 11, y: 62, w: 20, h: 29, open: { type: 'k7' } },                             // la boombox → les cassettes
      { id: 'weed',       x: 30, y: 73, w: 12, h: 14, open: { type: 'roll' }, soft: true, aura: '#9b6cff' }, // le sachet → « rouler un joint ? » (lueur magique violette, rendu doux)
      { id: 'pizza',      x: 42, y: 74, w: 14, h: 15, open: { type: 'carnet', id: 'pizzerias' }, soft: true }, // la pizza → pizzerias (resserrée sur la pizza, rendu doux, ne mange plus Stick)
      { id: 'cathedrale', x: 0,  y: 1,  w: 17, h: 20, goto: 'cathedrale', boost: 1.2 },                   // les tours, en haut à gauche
      { id: 'taverne',    x: 59, y: 20, w: 11, h: 6,  goto: 'taverne', boost: 1.75, aura: '#ffb24a' },    // LA TAVERNE
      { id: 'laride',     x: 73, y: 17, w: 11, h: 8,  goto: 'laride',  boost: 1.75, aura: '#ff3140' },    // LA RIDE, néon rouge
      { id: 'pmu',        x: 88, y: 19, w: 10, h: 7,  goto: 'pmu',     boost: 1.75, aura: '#46e05a' },    // le PMU
    ],
    // CALQUES MOBILES : perso détourés du fond vert (sprite unique + ombre au sol).
    // Survol = plein feu, idle CSS. % faciles à ajuster (« bouge / plus grand / petit »).
    personnages: [
      // MYRTILLE (la punk) : jeu de poses. `idle` = pose actuelle ; `radio` (danse quand
      // la boombox joue) et `roll` (roule un joint) sont des sprites fond vert à générer
      // → tant qu'ils manquent, fallback sur idle (rien ne casse).
      // toutes les poses de Myrtille partagent la MÊME bbox (idle + 7 frames) → calage parfait, zéro saut.
      { id: 'myrtille', name: 'Myrtille', x: 35, y: 20, w: 16, h: 44, anim: 'lean',
        canDance: true, favDance: true, // danse cut-out sur la musique ; PINO2000 = sa préférée (Niveau 2)
        // PANTIN ARTICULÉ (assise, calques fond vert détourés → tools/build_rig_layers.py).
        // Ordre = z (jambes derrière → tête devant). px/py = pivot en % du cadre commun
        // (887×1774) : épaules pour les bras, nuque pour la tête. Corps immobile, seuls
        // bras + tête snappent sur le rythme (CSS). Affiché seulement quand elle danse.
        rig: [
          { part: 'jambes', src: `${S}/perso/myrtille_rig_jambes.webp`, px: 50,   py: 100  },
          { part: 'buste',  src: `${S}/perso/myrtille_rig_buste.webp`,  px: 50,   py: 100  },
          { part: 'brasd',  src: `${S}/perso/myrtille_rig_brasd.webp`,  px: 74.5, py: 17.2 },
          { part: 'brasg',  src: `${S}/perso/myrtille_rig_brasg.webp`,  px: 65.5, py: 12.8 },
          { part: 'tete',   src: `${S}/perso/myrtille_rig_tete.webp`,   px: 47.5, py: 57.6 },
        ],
        poses: {
          idle: `${S}/perso/myrtille_idle.webp`,
          // séquence « roule un joint » : 1-4 elle roule, 5 briquet, 6 allume, 7 fume
          roll: [1,2,3,4,5,6,7].map((n) => `${S}/perso/myrtille_roll_${n}.webp`),
          // séquence « souffle » COMPLÈTE (8 frames) : elle souffle, crache, le rond monte au
          // coin et se dissipe — toute la fumée est peinte dans les frames (aucun rond codé).
          blow: [1,2,3,4,5,6].map((n) => `${S}/perso/myrtille_smoke_${n}.webp`), // taffe → recrache → détente (anim riche, calée sur idle)
          ring: [1,2,3,4,5,6,7,8].map((n) => `${S}/perso/myrtille_blow_${n}.webp`), // le ROND de fumée qui monte (anim d'origine, gardée)
          smoke: `${S}/perso/myrtille_smoke_6.webp`, // pose détendue tenue entre les taffes
          // PALIER 2 (5e taffe) : maxi taffe → exhale → jambes se replient → lotus qui LÉVITE.
          // Dernière frame tenue (held) + lévitation CSS (perso-float2). state4 (Shiva) à venir.
          state2: [1,2,3,4,5,6,7,8,9].map((n) => `${S}/perso/myrtille_state2_${n}.webp`),
          // fume DANS l'état lotus lévitant (boucle taffe→exhale→lotus serein), calée sur state2_9.
          blow2: [1,2,3,4,5,6].map((n) => `${S}/perso/myrtille_blow2_${n}.webp`),
          // CHARGE pré-Shiva (10e taffe) : taffe → l'aura violette EXPLOSE (pic frame 6) → exhale.
          // Joue juste avant l'événement plein écran + la transformation en déesse (state4).
          charge4: [1,2,3,4,5,6,7,8,9,10].map((n) => `${S}/perso/myrtille_charge4_${n}.webp`),
          // PALIER ULTIME : transformation en Shiva 6 bras (yeux lumineux, halo, mudras).
          // canvas plus large (bras déployés). Dernière frame = déesse tenue (held) + float4.
          state4: [1,2,3,4,5,6,7,8,9,10].map((n) => `${S}/perso/myrtille_state4_${n}.webp`),
          // ÉTAT DE GRÂCE : la Shiva refume (taffe → grosse exhale violette → retour), bras en
          // mudra, halo. Joué LENTEMENT en boucle → elle « respire » dans son état ultime.
          blow4: [1,2,3,4,5,6,7,8,9,10].map((n) => `${S}/perso/myrtille_blow4_${n}.webp`),
          // PALIER SUPRÊME (15e taffe) : la Shiva se dissout → BOULE D'ÉNERGIE radiante.
          // Dernière frame = l'orbe tenue (held). Événement encore plus fort à la bascule.
          state6: [1,2,3,4,5,6,7,8,9,10].map((n) => `${S}/perso/myrtille_state6_${n}.webp`),
          // VRAIE FORME FINALE tenue : l'être d'énergie en lotus (3e œil). 10 frames jouées en
          // BOUCLE CONTINUE (l'énergie/aura shimmer) → elle vit sans bouger. Sert aussi d'anim de
          // REFUS quand on essaie de la faire fumer (elle n'a plus besoin). Boucle gérée côté moteur.
          final6: [1,2,3,4,5,6,7,8,9,10].map((n) => `${S}/perso/myrtille_final_${n}.webp`),
        } },
      // STICK (le raver) : ASSIS EN TAILLEUR sur le pont, il roule et fume (20 frames
      // fond vert détouré + recalé sur la même assise → zéro saut). idle = assis ;
      // roll = 1→10 (roule → allume) puis il fume ; blow = 11→20 (taffe → recrache →
      // contemplatif). SEUL Stick fait monter la défonce du joueur (etat.svelte.js).
      { id: 'stick', name: 'Stick', x: 61, y: 34, w: 26, h: 46, anim: 'lean',
        shadow: { x: 64, y: 78, w: 20, h: 3.5 },
        canDance: true, // danse cut-out sur la musique (Niveau 1)
        poses: {
          idle:  `${S}/perso/raver_roll_1.webp`,
          roll:  [1,2,3,4,5,6,7,8,9,10].map((n) => `${S}/perso/raver_roll_${n}.webp`),
          blow:  [11,12,13,14,15,16,17,18,19,20].map((n) => `${S}/perso/raver_roll_${n}.webp`),
          smoke: `${S}/perso/raver_roll_20.webp`, // pose « fume » tenue entre les taffes
        } },
    ],
  },
  cathedrale: {
    parent: 'quai',
    off: `${S}/cathedrale_off_v1.webp`,
    on: `${S}/cathedrale_on_v1.webp`,
    breath: false, // paire off/on NON alignée (deux générations IA) : la respiration superposait des bougies fantômes à droite (It39) — pas de battement sur cette scène
    // zones mesurées sur la paire (2026-07-04). Lumières d'abord : les
    // destinations (univers dark/angélique, discours, vocaux, pourboire)
    // seront branchées aux itérations suivantes — clic = lueur en attendant.
    // [COLLAGE] retiré ici (It42) : le calque « cierges allumés » au clic faisait un
    // effet radiant non voulu (Vincent) — la lueur au survol (lum détourée) suffit.
    // Le moteur overlays[] reste dispo pour d'autres scènes.
    // [PRÊTRE] perso vivant à humeur (060 §2) : idle → il vient demander la pièce au
    // 4e mur → OUI = sermon joyeux (halo doré) / NON = sermon vénère (halo rouge).
    // Safe-absent : rien ne s'affiche tant que les calques ne sont pas déposés, la
    // logique tourne quand même (le dialogue « une pièce ? » marche déjà).
    priest: {
      nom: 'Jean Paul del Papel',   // affiché façon Pokémon avant tout ce qu'il dit
      x: 38, y: 30, w: 20, h: 56,   // position finale dans la nef (à recaler sur l'image)
      enterFrom: 112,               // il ARRIVE du hors-champ droit (côté autel) en marchant
      walkMs: 5200,                 // durée de la traversée
      sermonZone: 'pupitre',        // cliquer le pupitre = sermon selon l'humeur mémorisée
      askAfter: [18, 40],           // secondes (aléatoire) avant son entrée + demande
      redoAfter: [16, 26],          // après un REFUS : il revient quémander (seconde chance)
      poses: {
        idle:          `${S}/perso/pretre_idle.webp`,        // état de base (planche refus, haut-gauche — acté Vincent)
        marche:        [...PF('marche_a', 8), ...PF('marche_b', 8)], // cycle complet : 2 planches = 2 foulées (jambe G + D)
        demande:       PF('demande', 8),                     // il quémande (boucle pendant la question)
        don:           `${S}/perso/pretre_pose_12.webp`,     // bénédiction, main lumineuse (OUI)
        refus:         PF('refus', 3),                       // il encaisse le NON (gueulante → main levée)
        disparition:   PF('disparition', 4),                 // fumée violette → parti
        sermon_joyeux: `${S}/perso/pretre_pose_9.webp`,      // bras ouverts
        sermon_vener:  `${S}/perso/pretre_refus_1.webp`,     // la gueulante
        // VIE idle façon NPC 16-bit (It42) : piochées par le moteur quand il est posé
        vie_appui:     `${S}/perso/pretre_pose_1.webp`,      // il change d'appui (la « 2e frame qui tourne »)
        vie_tousse:    `${S}/perso/pretre_refus_2.webp`,     // main au visage (il tousse / réfléchit)
        vie_priere:    `${S}/perso/pretre_pose_6.webp`,      // il joint les mains (tenu)
        vie_livre:     `${S}/perso/pretre_pose_7.webp`,      // il consulte son missel (tenu)
        vie_salut:     `${S}/perso/pretre_pose_2.webp`,      // il TE salue (4e mur, rare)
      },
      halos: {
        joyeux: [`${S}/overlays/cathedrale_halo_joyeux.webp`, `${S}/overlays/cathedrale_reflet_vitraux_joyeux.webp`, `${S}/overlays/cathedrale_reflet_murs_joyeux.webp`],
        vener:  [`${S}/overlays/cathedrale_halo_vener.webp`,  `${S}/overlays/cathedrale_reflet_vitraux_vener.webp`,  `${S}/overlays/cathedrale_reflet_murs_vener.webp`],
      },
    },
    zones: [
      { id: 'vitrail_dark',  x: 3,    y: 4,  w: 19,   h: 59, open: { type: 'univers', id: 'dark' }, lum: L('cathedrale_vitrail_dark') },  // vitrail démoniaque → univers dark psyché catholique + son
      { id: 'vitrail_ange',  x: 27.5, y: 7,  w: 12,   h: 47, open: { type: 'univers', id: 'ange' }, lum: L('cathedrale_vitrail_ange') },  // vitrail joyeux → même univers en angélique + son
      { id: 'pupitre',       x: 56,   y: 20, w: 14,   h: 38, open: { type: 'sermon' },   lum: L('cathedrale_pupitre') },       // l'autel/pupitre → discours à la con (boîte haute : le halo respire au-dessus de la flèche)
      { id: 'confessionnal', x: 76.5, y: 28, w: 10,   h: 35, boost: 1.05, open: { type: 'confess' }, lum: L('cathedrale_confessionnal') }, // « Là pour vous parler » → vocaux en boucle
      { id: 'bougies',       x: 84,   y: 52, w: 15.5, h: 23, open: { type: 'pourboire' }, lum: L('cathedrale_bougies') },       // les bougies → donner une pièce à l'artiste
    ],
  },
  pmu: {
    parent: 'quai',
    off: `${S}/pmu_off_v1.webp`,
    on: `${S}/pmu_on_v1.webp`,
    // zones mesurées sur préviews annotées (2026-07-04). Boîtes élargies
    // d'~14 % : le masque en fondu du moteur (détourage doux) mange les bords,
    // l'objet occupe le cœur plein de la zone.
    zones: [
      { id: 'fenetre',  x: 0,    y: 0,    w: 21,   h: 72,   exit: true,                  lum: L('pmu_fenetre') },  // la porte vitrée : on ressort sur le quai
      { id: 'fdj',      x: 22.2, y: 32,   w: 19.1, h: 41.8, open: { type: 'grattage' },  lum: L('pmu_fdj') },      // présentoir Française des Jeux → le jeu à gratter (vrai grattage)
      { id: 'tele',     x: 57.5, y: 9,    w: 20,   h: 23,   open: { type: 'paris' },     lum: L('pmu_tele') },     // la télé PARIS SPORTIFS → l'écran de paris qui tease
      { id: 'ricard',   x: 61.5, y: 37.5, w: 12.2, h: 28.3, open: { type: 'evenement' }, lum: L('pmu_ricard') },   // bouteille + verre → l'affiche du prochain événement
      { id: 'terminal', x: 80.9, y: 45.2, w: 13.4, h: 23.2, open: { type: 'mantra' },    lum: L('pmu_terminal') }, // borne PMU → phrase de comptoir
      { id: 'sudouest', x: 0.7,  y: 75,   w: 24.5, h: 25,   open: { type: 'journal' },   lum: L('pmu_sudouest') }, // le journal → la une du Sud Ouest de la nuit
    ],
  },

  // ---- LA BOÎTE À GANT (It28) : câblée en attente de l'image intérieure de
  // Vincent (paire off/on, éléments lumineux/pas lumineux). Dès que
  // glovebox_off_v1.webp / glovebox_on_v1.webp sont déposés, la porte s'ouvre
  // seule (zoom-crossfade) ; la scène s'ouvre nue tant que les 6 objets ne sont
  // pas mesurés sur l'image. Objets prévus : cd→Médias · phone→nokia (le 3310) ·
  // fumeur→flamme/lueur · carte→destination · ticket AUTO IRATI→archive ·
  // flyer RAVE EUSKADI→evenement. ----
  glovebox: {
    parent: 'quai',
    off: `${S}/glovebox_off_v1.webp`,
    on: `${S}/glovebox_on_v1.webp`,
    // 6 objets mesurés sur la grille de glovebox_on (2026-07-04). Fondu générique
    // d'abord (crop de l'image on) : ils scintillent au survol. Détourage au pixel
    // (build_zone_masks) après validation des positions par Vincent. phone/flyer
    // branchés ; cd/fumeur/carte/ticket = lueur en attendant leur destination.
    zones: [
      { id: 'phone',  x: 20,   y: 33.5, w: 11.5, h: 28,   open: { type: 'nokia' } },     // le 3310 → menu/contacts/Snake
      { id: 'flyer',  x: 32.5, y: 40,   w: 11.5, h: 18.5, open: { type: 'evenement' } }, // RAVE EUSKADI → l'affiche
      { id: 'fumeur', x: 46.5, y: 40.5, w: 14.5, h: 18 },                                 // OCB + briquet → lueur (la flamme vit dans l'image on)
      { id: 'cd',     x: 62,   y: 41,   w: 17,   h: 20.5 },                               // 2000 IS LOVE → Médias (à brancher)
      { id: 'ticket', x: 58,   y: 62,   w: 20,   h: 15 },                                 // AUTO IRATI → archive (à brancher)
      { id: 'carte',  x: 25.5, y: 57,   w: 31.5, h: 21 },                                 // la carte → destination (à brancher)
    ],
  },
};
