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


];

// Tip for nutrition labels:
// If label gives per 100g, divide by 100 to get per 1g.
// If label gives per serving (e.g., 32g), divide each value by 32 to get per 1g.
