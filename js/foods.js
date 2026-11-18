// Food list — no pork, no fish or seafood.
// Values are per ONE portion as described (cooked, typical home portion).
// k = kcal, p = protein g, c = carbs g, f = fat g, g = grams per portion (for grocery list)
// Habesha dishes vary a lot with how much oil / niter kibbeh is used — numbers are averages.

const F = (id, name, cat, portion, k, p, c, f, g = 0, hint = '') => ({ id, name, cat, portion, k, p, c, f, g, hint });

export const FOOD_CATS = ['Habesha', 'Protein', 'Eggs & dairy', 'Carbs', 'Fruit & veg', 'Extras', 'Drinks', 'Out & snacks'];

export const FOODS = [
  // ── Habesha ──
  F('injera', 'Injera', 'Habesha', '1 whole injera (round)', 300, 9, 60, 2, 180, '½ = a half round'),
  F('shiro', 'Shiro wat', 'Habesha', '1 cup (≈ 1 ladle-and-a-half)', 300, 14, 30, 14, 240),
  F('tegabino', 'Tegabino shiro', 'Habesha', '1 cup', 380, 15, 30, 22, 240, 'thicker, more butter'),
  F('misir', 'Misir wat (red lentils)', 'Habesha', '1 cup', 280, 16, 36, 8, 240),
  F('kik', 'Kik alicha (split peas)', 'Habesha', '1 cup', 250, 14, 35, 6, 240),
  F('doro', 'Doro wat', 'Habesha', '1 piece chicken + sauce + 1 egg', 450, 32, 12, 30, 250),
  F('tibs', 'Beef tibs', 'Habesha', '1 cup (≈ 150 g meat)', 380, 35, 6, 24, 180),
  F('tibs-lean', 'Beef tibs — light oil', 'Habesha', '1 cup (≈ 150 g meat)', 300, 36, 6, 14, 180, 'cooked with little oil'),
  F('lamb-tibs', 'Lamb tibs', 'Habesha', '1 cup (≈ 150 g meat)', 420, 30, 6, 32, 180),
  F('chicken-tibs', 'Chicken tibs', 'Habesha', '1 cup (≈ 150 g meat)', 300, 38, 6, 13, 180),
  F('key-wat', 'Key wat (beef stew)', 'Habesha', '1 cup', 400, 30, 10, 26, 240),
  F('alicha', 'Alicha (mild beef/chicken stew)', 'Habesha', '1 cup', 330, 28, 10, 20, 240),
  F('kitfo', 'Kitfo', 'Habesha', '1 serving (≈ 150 g)', 450, 30, 1, 36, 150),
  F('gomen', 'Gomen (collard greens)', 'Habesha', '1 cup', 120, 4, 10, 8, 200),
  F('atkilt', 'Atkilt wat (cabbage, potato, carrot)', 'Habesha', '1 cup', 180, 4, 22, 9, 220),
  F('firfir', 'Injera firfir', 'Habesha', '1 plate (≈ 1½ cups)', 450, 10, 60, 18, 300),
  F('ful', 'Ful (fava beans)', 'Habesha', '1 bowl (≈ 1½ cups)', 400, 20, 45, 15, 330),
  F('ayib', 'Ayib (fresh cheese)', 'Habesha', '½ cup', 110, 12, 4, 5, 115),
  F('chechebsa', 'Chechebsa / kitcha fitfit', 'Habesha', '1 plate', 500, 9, 60, 25, 250),
  F('genfo', 'Genfo', 'Habesha', '1 bowl', 550, 10, 70, 25, 300),
  F('kolo', 'Kolo', 'Habesha', '½ cup', 200, 6, 35, 5, 60),
  F('dabo', 'Dabo (bread)', 'Habesha', '1 thick slice', 120, 4, 22, 2, 45),
  F('niter', 'Niter kibbeh (spiced butter)', 'Habesha', '1 tablespoon', 110, 0, 0, 12, 14),

  // ── Protein ──
  F('chicken-breast', 'Chicken breast', 'Protein', '1 palm-size piece (≈ 120 g cooked)', 200, 37, 0, 5, 120),
  F('chicken-thigh', 'Chicken thigh (no skin)', 'Protein', '1 palm-size piece (≈ 120 g cooked)', 250, 30, 0, 13, 120),
  F('chicken-leg', 'Chicken drumstick (with skin)', 'Protein', '1 drumstick', 170, 18, 0, 10, 75),
  F('rotisserie', 'Rotisserie chicken', 'Protein', '¼ chicken', 340, 40, 0, 19, 150),
  F('ground-beef', 'Ground beef (85% lean)', 'Protein', '1 palm (≈ 120 g cooked)', 300, 28, 0, 20, 120),
  F('steak', 'Beef steak, lean', 'Protein', '1 palm (≈ 120 g cooked)', 250, 34, 0, 12, 120),
  F('lamb', 'Lamb', 'Protein', '1 palm (≈ 120 g cooked)', 320, 30, 0, 22, 120),
  F('turkey', 'Turkey breast', 'Protein', '1 palm (≈ 120 g cooked)', 170, 35, 0, 2, 120),
  F('lentils', 'Lentils, cooked', 'Protein', '1 cup', 230, 18, 40, 1, 200),
  F('chickpeas', 'Chickpeas, cooked', 'Protein', '1 cup', 270, 15, 45, 4, 165),
  F('whey', 'Protein shake (whey, water)', 'Protein', '1 scoop', 120, 24, 3, 2, 30),

  // ── Eggs & dairy ──
  F('egg', 'Egg, boiled', 'Eggs & dairy', '1 large egg', 72, 6, 0, 5, 50),
  F('egg-fried', 'Egg, fried / scrambled with oil', 'Eggs & dairy', '1 large egg', 90, 6, 0, 7, 50),
  F('egg-white', 'Egg whites', 'Eggs & dairy', '3 whites', 51, 11, 1, 0, 100),
  F('cheddar', 'Cheese (cheddar / slice)', 'Eggs & dairy', '1 slice (≈ 30 g)', 120, 7, 0, 10, 30),
  F('mozzarella', 'Mozzarella', 'Eggs & dairy', '1 slice (≈ 30 g)', 85, 6, 1, 6, 30),
  F('feta', 'Feta', 'Eggs & dairy', '30 g (≈ 2 tbsp crumbled)', 75, 4, 1, 6, 30),
  F('cottage', 'Cottage cheese', 'Eggs & dairy', '½ cup', 110, 12, 4, 5, 115),
  F('greek-yogurt', 'Greek yogurt, plain (0–2%)', 'Eggs & dairy', '¾ cup (175 g)', 120, 18, 7, 2, 175),
  F('yogurt', 'Yogurt, plain', 'Eggs & dairy', '¾ cup (175 g)', 110, 6, 12, 4, 175),
  F('milk', 'Milk 2%', 'Eggs & dairy', '1 cup', 122, 8, 12, 5, 245),

  // ── Carbs ──
  F('rice', 'White rice, cooked', 'Carbs', '1 cup (≈ 1 fist)', 205, 4, 45, 0, 160),
  F('brown-rice', 'Brown rice, cooked', 'Carbs', '1 cup', 215, 5, 45, 2, 160),
  F('potato', 'Potato, boiled / baked', 'Carbs', '1 medium (fist-size)', 160, 4, 37, 0, 170),
  F('potato-fried', 'Fried potatoes / fries (home)', 'Carbs', '1 cup', 300, 3, 35, 16, 120),
  F('mashed', 'Mashed potato with butter', 'Carbs', '1 cup', 240, 4, 35, 9, 210),
  F('sweet-potato', 'Sweet potato', 'Carbs', '1 medium', 115, 2, 27, 0, 130),
  F('pasta', 'Pasta, cooked', 'Carbs', '1 cup', 220, 8, 43, 1, 140),
  F('bread', 'Bread, whole wheat', 'Carbs', '1 slice', 80, 4, 14, 1, 32),
  F('pita', 'Pita / tortilla wrap', 'Carbs', '1 large', 200, 6, 36, 4, 70),
  F('oats', 'Oats (dry)', 'Carbs', '½ cup', 150, 5, 27, 3, 40),

  // ── Fruit & veg ──
  F('salad', 'Green salad (no dressing)', 'Fruit & veg', '2 cups', 30, 2, 6, 0, 120),
  F('veg', 'Mixed vegetables, cooked', 'Fruit & veg', '1 cup', 60, 3, 12, 0, 150),
  F('tomato-onion', 'Tomato & onion salad (timatim)', 'Fruit & veg', '1 cup', 70, 2, 10, 3, 180),
  F('banana', 'Banana', 'Fruit & veg', '1 medium', 105, 1, 27, 0, 120),
  F('apple', 'Apple', 'Fruit & veg', '1 medium', 95, 0, 25, 0, 180),
  F('orange', 'Orange', 'Fruit & veg', '1 medium', 62, 1, 15, 0, 130),
  F('dates', 'Dates', 'Fruit & veg', '3 dates', 200, 1, 54, 0, 70),
  F('avocado', 'Avocado', 'Fruit & veg', '½ avocado', 120, 2, 6, 11, 70),

  // ── Extras ──
  F('oil', 'Cooking oil / olive oil', 'Extras', '1 tablespoon', 120, 0, 0, 14, 14),
  F('butter', 'Butter', 'Extras', '1 tablespoon', 100, 0, 0, 11, 14),
  F('pb', 'Peanut butter', 'Extras', '1 tablespoon', 95, 4, 3, 8, 16),
  F('nuts', 'Nuts (almonds / peanuts)', 'Extras', '1 small handful (28 g)', 165, 6, 6, 14, 28),
  F('honey', 'Honey / sugar', 'Extras', '1 tablespoon', 60, 0, 16, 0, 20),

  // ── Drinks ──
  F('coffee-sugar', 'Coffee / bunna with sugar', 'Drinks', '1 cup (1 tsp sugar)', 25, 0, 6, 0, 0),
  F('coffee-milk', 'Coffee with milk & sugar', 'Drinks', '1 mug', 70, 3, 10, 2, 0),
  F('tea-sugar', 'Tea / shai with sugar', 'Drinks', '1 cup (2 tsp sugar)', 32, 0, 8, 0, 0),
  F('juice', 'Juice', 'Drinks', '1 cup', 110, 1, 26, 0, 0),
  F('soda', 'Soft drink', 'Drinks', '1 can (355 ml)', 140, 0, 39, 0, 0),

  // ── Out & snacks ──
  F('shawarma', 'Chicken shawarma wrap', 'Out & snacks', '1 wrap', 600, 35, 55, 25),
  F('burger', 'Beef burger', 'Out & snacks', '1 burger', 550, 28, 45, 28),
  F('pizza', 'Pizza (no pork toppings)', 'Out & snacks', '1 slice', 285, 12, 36, 10),
  F('sambusa', 'Sambusa (lentil or beef)', 'Out & snacks', '1 piece', 150, 5, 15, 8),
  F('cookies', 'Cookies / biscuits', 'Out & snacks', '2 cookies', 140, 2, 20, 6),
  F('chocolate', 'Chocolate bar', 'Out & snacks', '1 bar', 230, 3, 26, 13),
  F('chips', 'Chips / crisps', 'Out & snacks', '1 small bag (28 g)', 150, 2, 15, 10),
];

export const FOOD = Object.fromEntries(FOODS.map((f) => [f.id, f]));

// ── Meal plan: 3 meals + 1 snack, built from foods you eat ──
// [foodId, portions]
const M = (id, name, items, note = '') => ({ id, name, items, note });

export const MEALS = {
  breakfast: [
    M('b1', 'Eggs & ayib with injera', [['egg', 3], ['ayib', 1], ['injera', 0.5]]),
    M('b2', 'Eggs, cheese & toast', [['egg-fried', 3], ['cheddar', 1], ['bread', 2]]),
    M('b3', 'Ful with eggs', [['ful', 0.75], ['egg', 2], ['tomato-onion', 0.5]]),
    M('b4', 'Yogurt & oats bowl', [['greek-yogurt', 1], ['oats', 1], ['banana', 1], ['pb', 1]]),
  ],
  lunch: [
    M('l1', 'Chicken, rice & salad', [['chicken-breast', 1.25], ['rice', 1.5], ['salad', 1], ['oil', 0.5]]),
    M('l2', 'Tibs with injera & gomen', [['tibs-lean', 1], ['injera', 0.75], ['gomen', 1]]),
    M('l3', 'Misir, eggs & injera', [['misir', 1], ['egg', 2], ['injera', 0.5], ['gomen', 0.5]]),
    M('l4', 'Chicken, potato & veg', [['chicken-breast', 1.25], ['potato', 1.5], ['veg', 1], ['butter', 0.5]]),
  ],
  dinner: [
    M('d1', 'Doro wat with injera', [['doro', 1], ['injera', 1]], 'Ask for less niter kibbeh to save ~100 kcal'),
    M('d2', 'Big chicken & rice bowl', [['chicken-breast', 1.5], ['rice', 1.5], ['veg', 1], ['oil', 0.5]]),
    M('d3', 'Chicken tibs, rice & salad', [['chicken-tibs', 1.25], ['rice', 1.5], ['salad', 1]]),
    M('d4', 'Shiro, injera & chicken', [['shiro', 1], ['injera', 1], ['chicken-breast', 1]]),
  ],
  snack: [
    M('s1', 'Greek yogurt, banana & nuts', [['greek-yogurt', 1], ['banana', 1], ['nuts', 0.5]]),
    M('s2', '2 boiled eggs, apple & cheese', [['egg', 2], ['apple', 1], ['cheddar', 0.5]]),
    M('s3', 'Protein shake, banana & PB', [['whey', 1], ['banana', 1], ['pb', 1]]),
    M('s4', 'Ayib, dabo & banana', [['ayib', 1], ['dabo', 1], ['banana', 1]]),
  ],
};

export const MEAL_SLOTS = [
  ['breakfast', 'Meal 1 · Breakfast', '🍳'],
  ['lunch', 'Meal 2 · Lunch', '🍛'],
  ['dinner', 'Meal 3 · After the gym', '🍗'],
  ['snack', 'Snack', '🍌'],
];

export function itemTotals(items, lookup = (id) => FOOD[id]) {
  const t = { k: 0, p: 0, c: 0, f: 0 };
  for (const [id, q] of items) {
    const f = lookup(id);
    if (!f) continue;
    t.k += f.k * q; t.p += f.p * q; t.c += f.c * q; t.f += f.f * q;
  }
  return t;
}
