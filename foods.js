// foods.js
// Values are PER 1 g or PER 1 ml (set unit accordingly).
// protein/fat/carbs are in grams.

window.FOODS = [
    // Whey protein powder (serving: 31g -> 120 kcal, P24 C4 F1.5)
    {
    id: "whey_protein_powder",
    name: "Whey Protein Powder (label-based)",
    unit: "g",
    perUnit: {
        kcal: 3.870968,
        protein: 0.774194,
        fat: 0.048387,
        carbs: 0.129032
    }
    },

    // Mailhot's Best Sausage (serving: 3 links 99g -> 250 kcal, P16 C3 F19)
    {
    id: "mailhots_sausage",
    name: "Mailhot's Best Sausage (label-based)",
    unit: "g",
    perUnit: {
        kcal: 2.525253,
        protein: 0.161616,
        fat: 0.191919,
        carbs: 0.030303
    }
    },

    // Whole milk (serving: 1 cup 240ml -> 150 kcal, P8 C12 F8)
    {
    id: "whole_milk_hood",
    name: "Whole Milk (Hood, label-based)",
    unit: "ml",
    perUnit: {
        kcal: 0.625000,
        protein: 0.033333,
        fat: 0.033333,
        carbs: 0.050000
    }
    },
    // Mission Carb Balance Flour Tortilla
    // Serving: 1 tortilla (43g) -> 70 kcal, P6 C19 F3.5
    {
    id: "mission_carb_balance_tortilla",
    name: "Mission Carb Balance Tortilla (flour)",
    unit: "g",
    perUnit: {
        kcal: 1.627907,
        protein: 0.139535,
        fat: 0.081395,
        carbs: 0.441860
    }
    },

    // Ground Turkey (as labeled)
    // Serving: 4 oz (112g) -> 170 kcal, P21 C0 F8
    {
    id: "ground_turkey",
    name: "Ground Turkey (label-based)",
    unit: "g",
    perUnit: {
        kcal: 1.517857,
        protein: 0.187500,
        fat: 0.071429,
        carbs: 0.000000
    }
    },

    // Boneless Skinless Chicken Breast (as labeled)
    // Serving: 4 oz (112g) -> 120 kcal, P25 C0 F2
    {
    id: "chicken_breast",
    name: "Chicken Breast (boneless/skinless, label-based)",
    unit: "g",
    perUnit: {
        kcal: 1.071429,
        protein: 0.223214,
        fat: 0.017857,
        carbs: 0.000000
    }
    },
    {
    id: "egg_whole",
    name: "Egg (whole, label-based)",
    baseUnit: "g",
    perBaseUnit: { kcal: 1.428571, protein: 0.125000, fat: 0.089286, carbs: 0.000000 },
    measures: [
        { id: "g", label: "grams (g)", kind: "g", basePerMeasure: 1 },
        { id: "egg", label: "egg (56 g)", kind: "unit", basePerMeasure: 56 }
    ]
    },
    {
    id: "ballpark_burger_bun",
    name: "Ball Park Burger Bun",
    baseUnit: "g",
    perBaseUnit: { kcal: 2.830189, protein: 0.075472, fat: 0.037736, carbs: 0.528302 },
    measures: [
        { id: "g", label: "grams (g)", kind: "g", basePerMeasure: 1 },
        { id: "bun", label: "bun (53 g)", kind: "unit", basePerMeasure: 53 }
    ]
    },
    // =======================
    // SAUCES / CONDIMENTS
    // =======================

    {
    id: "sweet_baby_rays_garlic_buffalo",
    name: "Sweet Baby Ray's Garlic Buffalo",
    baseUnit: "ml",
    // Label: 1 Tbsp (16 mL) = 35 kcal, 0P, 3.5F, 1C
    perBaseUnit: {
        kcal: 2.1875,
        protein: 0,
        fat: 0.21875,
        carbs: 0.0625,
    },
    measures: [
        { id: "ml",   label: "milliliters (ml)", kind: "ml", basePerMeasure: 1 },
    ],
    },

    {
    id: "hannaford_ketchup",
    name: "Ketchup (Hannaford / label-based)",
    baseUnit: "g",
    // Label: 1 Tbsp (17g) = 20 kcal, 0P, 0F, 4C
    perBaseUnit: {
        kcal: 20 / 17,
        protein: 0 / 17,
        fat: 0 / 17,
        carbs: 4 / 17,
    },
    measures: [
        { id: "g",    label: "grams (g)", kind: "g", basePerMeasure: 1 },
        { id: "tbsp", label: "tablespoon (Tbsp)", kind: "g", basePerMeasure: 17 },
    ],
    },

    {
    id: "hellmanns_light_mayo",
    name: "Hellmann's Light Mayonnaise",
    baseUnit: "g",
    // Label: 1 Tbsp (15g) = 35 kcal, 0P, 3.5F, 1C
    perBaseUnit: {
        kcal: 35 / 15,
        protein: 0 / 15,
        fat: 3.5 / 15,
        carbs: 1 / 15,
    },
    measures: [
        { id: "g",    label: "grams (g)", kind: "g", basePerMeasure: 1 },
        { id: "tbsp", label: "tablespoon (Tbsp)", kind: "g", basePerMeasure: 15 },
    ],
    },

    // =======================
    // SOUPS (Amy's)
    // =======================
    // Cup weight isn't listed on the can. Using a practical default:
    //   1 cup soup ≈ 240 g
    // so "cups" works as a measure in your UI.

    {
    id: "amys_soup_southwestern_fire_roasted_veg",
    name: "Amy's Soup - Southwestern Fire Roasted Veg (label-based)",
    baseUnit: "g",
    // Label per can: 1 can (405g) = 220 kcal, 6P, 8F, 31C
    perBaseUnit: {
        kcal: 220 / 405,
        protein: 6 / 405,
        fat: 8 / 405,
        carbs: 31 / 405,
    },
    measures: [
        { id: "g",   label: "grams (g)", kind: "g", basePerMeasure: 1 },
        { id: "cup", label: "cup (~240g)", kind: "g", basePerMeasure: 240 },
        { id: "can", label: "1 can (405g)", kind: "g", basePerMeasure: 405 },
    ],
    },

    {
    id: "amys_soup_rustic_italian_vegetable",
    name: "Amy's Soup - Rustic Italian Vegetable (label-based)",
    baseUnit: "g",
    // Label per can: 1 can (397g) = 310 kcal, 8P, 13F, 39C
    perBaseUnit: {
        kcal: 310 / 397,
        protein: 8 / 397,
        fat: 13 / 397,
        carbs: 39 / 397,
    },
    measures: [
        { id: "g",   label: "grams (g)", kind: "g", basePerMeasure: 1 },
        { id: "cup", label: "cup (~240g)", kind: "g", basePerMeasure: 240 },
        { id: "can", label: "1 can (397g)", kind: "g", basePerMeasure: 397 },
    ],
    },

    {
    id: "amys_soup_chunky_vegetable",
    name: "Amy's Soup - Chunky Vegetable (label-based)",
    baseUnit: "g",
    // Label per can: 1 can (405g) = 120 kcal, 4P, 2.5F, 18C
    perBaseUnit: {
        kcal: 120 / 405,
        protein: 4 / 405,
        fat: 2.5 / 405,
        carbs: 18 / 405,
    },
    measures: [
        { id: "g",   label: "grams (g)", kind: "g", basePerMeasure: 1 },
        { id: "cup", label: "cup (~240g)", kind: "g", basePerMeasure: 240 },
        { id: "can", label: "1 can (405g)", kind: "g", basePerMeasure: 405 },
    ],
    },

    // =======================
    // DRINKS
    // =======================

    {
    id: "oakhurst_vitamin_d_milk",
    name: "Milk - Oakhurst Vitamin D (label-based)",
    baseUnit: "ml",
    // Label: 1 cup (236mL) = 150 kcal, 8P, 8F, 12C
    perBaseUnit: {
        kcal: 150 / 236,
        protein: 8 / 236,
        fat: 8 / 236,
        carbs: 12 / 236,
    },
    measures: [
        { id: "ml",  label: "milliliters (ml)", kind: "ml", basePerMeasure: 1 },
        { id: "cup", label: "1 cup (236 mL)", kind: "ml", basePerMeasure: 236 },
        { id: "tbsp", label: "tablespoon (15 mL)", kind: "ml", basePerMeasure: 15 },
    ],
    },

    {
    id: "starbucks_brewed_coffee_black_unsweet",
    name: "Starbucks - Black Unsweetened Brewed Coffee (label-based)",
    baseUnit: "ml",
    // Label: 12 fl oz (360mL) = 15 kcal, 1P, 0F, 3C
    perBaseUnit: {
        kcal: 15 / 360,
        protein: 1 / 360,
        fat: 0 / 360,
        carbs: 3 / 360,
    },
    measures: [
        { id: "ml",     label: "milliliters (ml)", kind: "ml", basePerMeasure: 1 },
        { id: "fl_oz",  label: "1 fl oz (~30 mL)", kind: "ml", basePerMeasure: 30 },
        { id: "serving_12oz", label: "12 fl oz (360 mL)", kind: "ml", basePerMeasure: 360 },
        { id: "cup_8oz", label: "8 fl oz (~240 mL)", kind: "ml", basePerMeasure: 240 },
    ],
    },
    {
  id: "jj_nissen_white_bread",
  name: "J.J. Nissen White Bread (label-based)",
  baseUnit: "g",

  // Label: 1 slice (39g)
  // Calories 110, Protein 3g, Fat 2g, Carbs 19g
  perBaseUnit: {
    kcal: 110 / 39,
    protein: 3 / 39,
    fat: 2 / 39,
    carbs: 19 / 39,
  },

  measures: [
    {
      id: "g",
      label: "grams (g)",
      kind: "g",
      basePerMeasure: 1,
    },
    {
      id: "slice",
      label: "1 slice (39 g)",
      kind: "g",
      basePerMeasure: 39,
    },
  ],
},
{
  id: "italian_protein_soup_label_based",
  name: "Italian Protein Soup (label-based)",
  baseUnit: "g",

  // Label per 1 cup (245 g):
  // Calories 140, Protein 8g, Fat 1.5g, Carbs 24g
  perBaseUnit: {
    kcal: 140 / 245,
    protein: 8 / 245,
    fat: 1.5 / 245,
    carbs: 24 / 245,
  },

  measures: [
    {
      id: "g",
      label: "grams (g)",
      kind: "g",
      basePerMeasure: 1,
    },
    {
      id: "cup",
      label: "1 cup (245 g)",
      kind: "g",
      basePerMeasure: 245,
    },
    {
      id: "can",
      label: "1 can (~490 g)",
      kind: "g",
      basePerMeasure: 490,
    },
  ],
}



];

// Tip for nutrition labels:
// If label gives per 100g, divide by 100 to get per 1g.
// If label gives per serving (e.g., 32g), divide each value by 32 to get per 1g.
