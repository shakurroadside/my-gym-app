// Optional: estimate a plate's calories from a photo with Claude.
// Uses YOUR Anthropic API key, saved only on this phone (never in the backup file or on GitHub).
// The SDK is loaded only when you tap "Estimate", so the app still works offline without it.

const KEY_STORE = 'mygym.anthropicKey';
const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.4.0/+esm';
const MODEL = 'claude-opus-5-5';

export function getKey() {
  try { return localStorage.getItem(KEY_STORE) || ''; } catch { return ''; }
}
export function setKey(k) {
  try { k ? localStorage.setItem(KEY_STORE, k.trim()) : localStorage.removeItem(KEY_STORE); } catch {}
}

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          portion: { type: 'string' },
          kcal: { type: 'number' },
          protein_g: { type: 'number' },
          carbs_g: { type: 'number' },
          fat_g: { type: 'number' },
        },
        required: ['name', 'portion', 'kcal', 'protein_g', 'carbs_g', 'fat_g'],
        additionalProperties: false,
      },
    },
    note: { type: 'string' },
  },
  required: ['items', 'note'],
  additionalProperties: false,
};

const SYSTEM = `You estimate the nutrition of a home-cooked meal from a photo for a calorie-tracking app.
The person often eats Ethiopian/Eritrean (Habesha) food — injera, shiro, misir wat, doro wat, tibs, kitfo, gomen, firfir, ful, ayib — plus eggs, chicken, rice, potatoes and cheese. They do not eat pork or any fish/seafood, so never identify food as either.
List each separate food you can see with a realistic portion in everyday words (e.g. "1 whole injera", "about 1 cup"), and estimate kcal, protein, carbs and fat for that portion. Account for cooking oil or niter kibbeh you can reasonably expect in stews.
Use the plate, hands or utensils for scale. When unsure, give your best middle estimate. In "note", give one short sentence on what was hardest to judge (e.g. hidden oil, food under injera).`;

let clientPromise = null;
async function client(key) {
  if (!clientPromise) {
    clientPromise = import(SDK_URL).then((mod) => mod.default).catch((e) => {
      clientPromise = null;
      throw new Error('Could not load the AI part — check your internet connection and try again.');
    });
  }
  const Anthropic = await clientPromise;
  // Browser use is intentional: a personal app, with the user's own key stored on their own phone.
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
}

function blobToBase64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

export async function estimatePlate(jpegBlob, hint = '') {
  const key = getKey();
  if (!key) throw new Error('Add your Anthropic API key in Settings first.');
  const c = await client(key);
  const data = await blobToBase64(jpegBlob);
  let res;
  try {
    res = await c.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } },
          { type: 'text', text: hint ? `Estimate this meal. The person says: ${hint}` : 'Estimate this meal.' },
        ],
      }],
    });
  } catch (e) {
    const s = e?.status;
    if (s === 401) throw new Error('The API key was rejected. Check it in Settings.');
    if (s === 429) throw new Error('Too many requests right now — try again in a minute.');
    if (s === 402 || /credit|billing/i.test(e?.message || '')) throw new Error('Your Anthropic account needs credit (console.anthropic.com → Billing).');
    if (!navigator.onLine) throw new Error('No internet connection.');
    throw new Error('Could not reach the AI: ' + (e?.message || 'unknown error'));
  }
  if (res.stop_reason === 'refusal') throw new Error('The AI could not analyse this photo. Add the foods by hand.');
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  let out;
  try { out = JSON.parse(text); } catch { throw new Error('The AI reply was incomplete — please try again.'); }
  return out;
}

// ── Recipes: read Osta screenshots and/or shared text into a structured recipe ──
const RECIPE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    link: { type: 'string' },
    servings: { type: 'number' },
    ingredients: { type: 'array', items: { type: 'string' } },
    steps: { type: 'array', items: { type: 'string' } },
    per_serving: {
      type: 'object',
      properties: { kcal: { type: 'number' }, protein_g: { type: 'number' }, carbs_g: { type: 'number' }, fat_g: { type: 'number' } },
      required: ['kcal', 'protein_g', 'carbs_g', 'fat_g'],
      additionalProperties: false,
    },
    macros_source: { type: 'string', enum: ['from_recipe', 'estimated'] },
    warning: { type: 'string' },
  },
  required: ['name', 'link', 'servings', 'ingredients', 'steps', 'per_serving', 'macros_source', 'warning'],
  additionalProperties: false,
};

const RECIPE_SYSTEM = `You turn saved recipes (screenshots from a recipe-saving app such as Osta, and/or text the person pasted) into a structured recipe for a calorie-tracking app.
- Copy the recipe name, ingredient lines (with amounts) and steps as written. Combine information across all screenshots — they are pages of the same recipe.
- "link": the social-media or website URL if one is visible or pasted, else "".
- "servings": as stated; if not stated, your best estimate (at least 1).
- "per_serving": if the recipe shows calories/macros, use them and convert totals to per-serving if they are for the whole recipe (macros_source "from_recipe"). If not shown, estimate from the ingredients (macros_source "estimated").
- "warning": the person does not eat pork or any fish/seafood. If an ingredient is pork or seafood, name it and suggest a swap (e.g. chicken). Otherwise "".`;

export async function extractRecipe(blobs = [], text = '') {
  const key = getKey();
  if (!key) throw new Error('Add your Anthropic API key in Settings first.');
  const c = await client(key);
  const content = [];
  for (const b of blobs) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: await blobToBase64(b) } });
  content.push({ type: 'text', text: text ? `Pasted text:\n${text}` : 'Read the recipe from these screenshots.' });
  let res;
  try {
    res = await c.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: RECIPE_SYSTEM,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: RECIPE_SCHEMA } },
      messages: [{ role: 'user', content }],
    });
  } catch (e) {
    const s = e?.status;
    if (s === 401) throw new Error('The API key was rejected. Check it in Settings.');
    if (s === 429) throw new Error('Too many requests right now — try again in a minute.');
    if (!navigator.onLine) throw new Error('No internet connection.');
    throw new Error(e?.message || 'Could not reach the AI.');
  }
  if (res.stop_reason === 'refusal') throw new Error('The AI could not read this. Fill the recipe in by hand.');
  const out = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try { return JSON.parse(out); } catch { throw new Error('The AI reply was incomplete — please try again.'); }
}
