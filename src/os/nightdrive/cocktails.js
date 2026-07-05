// LA CARTE DE LA RIDE — les cocktails du bar (scène laride, zone tableau).
// Des vraies recettes, des vrais dosages. Vincent : ajoute/retouche librement,
// un objet par cocktail, la carte suit toute seule.
//
//   nom    : affiché en néon sur la carte
//   verre  : 'long' (tube) · 'court' (tumbler) · 'coupe' (à pied)
//   robe   : [couleur haute, couleur basse] — la couleur du liquide
//   compo  : [ingrédient, dose] dans l'ordre du barman
//   note   : le geste (optionnel)

export const COCKTAILS = [
  {
    nom: 'Mauresque',
    verre: 'long',
    robe: ['#f5efc9', '#e8d9a0'],
    compo: [
      ['Pastis', '2 cl'],
      ["Sirop d'orgeat", '1 cl'],
      ['Eau fraîche', '8 cl'],
    ],
    note: "l'eau d'abord si tu veux la voir troubler",
  },
  {
    nom: 'Perroquet',
    verre: 'long',
    robe: ['#d8f0c9', '#a8dfa0'],
    compo: [
      ['Pastis', '2 cl'],
      ['Sirop de menthe', '1 cl'],
      ['Eau fraîche', '8 cl'],
    ],
  },
  {
    nom: 'Tomate',
    verre: 'long',
    robe: ['#f5d3c9', '#eba9a0'],
    compo: [
      ['Pastis', '2 cl'],
      ['Grenadine', '1 cl'],
      ['Eau fraîche', '8 cl'],
    ],
  },
  {
    nom: 'Mojito',
    verre: 'long',
    robe: ['#eafff2', '#c9f5d9'],
    compo: [
      ['Rhum blanc', '4,5 cl'],
      ['Jus de citron vert', '2 cl'],
      ['Sucre de canne', '2 c. à café'],
      ['Menthe fraîche', '8 feuilles'],
      ['Eau gazeuse', "jusqu'en haut"],
    ],
    note: 'menthe pilée doucement, jamais broyée',
  },
  {
    nom: "Ti' Punch",
    verre: 'court',
    robe: ['#f2e3b3', '#e3c87e'],
    compo: [
      ['Rhum agricole', '4,5 cl'],
      ['Sirop de canne', '1 cl'],
      ['Citron vert', '1 zeste pressé'],
    ],
    note: 'chacun prépare sa mort',
  },
  {
    nom: 'Cuba Libre',
    verre: 'long',
    robe: ['#6e3b1e', '#3a1c0c'],
    compo: [
      ['Rhum ambré', '5 cl'],
      ['Cola', '12 cl'],
      ['Citron vert', '1 quartier'],
    ],
  },
  {
    nom: 'Caipirinha',
    verre: 'court',
    robe: ['#eaf5c9', '#cfe8a0'],
    compo: [
      ['Cachaça', '5 cl'],
      ['Citron vert', '½ en morceaux'],
      ['Sucre de canne', '2 c. à café'],
    ],
    note: 'pilé au fond du verre, glace concassée',
  },
  {
    nom: 'Margarita',
    verre: 'coupe',
    robe: ['#f2f5d9', '#dfe8b3'],
    compo: [
      ['Tequila', '5 cl'],
      ['Triple sec', '2 cl'],
      ['Jus de citron vert', '1,5 cl'],
    ],
    note: 'givrage sel sur le bord',
  },
  {
    nom: 'Tequila Sunrise',
    verre: 'long',
    robe: ['#ffb84a', '#e3391e'],
    compo: [
      ['Tequila', '4,5 cl'],
      ["Jus d'orange", '9 cl'],
      ['Grenadine', '1,5 cl'],
    ],
    note: 'la grenadine coule, on ne mélange pas',
  },
  {
    nom: 'Piña Colada',
    verre: 'long',
    robe: ['#fff5e0', '#f2dfb3'],
    compo: [
      ['Rhum blanc', '4,5 cl'],
      ['Crème de coco', '3 cl'],
      ["Jus d'ananas", '9 cl'],
    ],
  },
  {
    nom: 'Blue Lagoon',
    verre: 'long',
    robe: ['#a0e8ff', '#3f9fe3'],
    compo: [
      ['Vodka', '4 cl'],
      ['Curaçao bleu', '3 cl'],
      ['Jus de citron', '2 cl'],
      ['Limonade', "jusqu'en haut"],
    ],
  },
  {
    nom: 'Americano',
    verre: 'court',
    robe: ['#e85a3a', '#b3301e'],
    compo: [
      ['Campari', '3 cl'],
      ['Vermouth rouge', '3 cl'],
      ['Eau gazeuse', 'un trait'],
    ],
  },
  {
    nom: 'Negroni',
    verre: 'court',
    robe: ['#c93a2a', '#7e1e14'],
    compo: [
      ['Gin', '3 cl'],
      ['Campari', '3 cl'],
      ['Vermouth rouge', '3 cl'],
    ],
    note: "un glaçon, une écorce d'orange, rien d'autre",
  },
  {
    nom: 'Whisky Sour',
    verre: 'court',
    robe: ['#f2c96e', '#d9a03a'],
    compo: [
      ['Whisky', '4,5 cl'],
      ['Jus de citron', '3 cl'],
      ['Sirop de sucre', '1,5 cl'],
    ],
  },
  {
    nom: 'Sex on the Beach',
    verre: 'long',
    robe: ['#ffb35e', '#e8547e'],
    compo: [
      ['Vodka', '4 cl'],
      ['Liqueur de pêche', '2 cl'],
      ["Jus d'orange", '4 cl'],
      ['Jus de cranberry', '4 cl'],
    ],
  },
];
