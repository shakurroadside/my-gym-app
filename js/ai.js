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
