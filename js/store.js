// Data lives on your phone: settings + logs in localStorage, photos in IndexedDB.
import { defaultProgram } from './program.js';

const KEY = 'mygym.v1';

export function defaults() {
  return {
    v: 1,
    profile: { name: '', sex: 'male', age: 32, heightCm: 175, startWeight: 83, goalWeight: 77, startDate: Date.now() },
    settings: { sound: true, restDefault: 90 },
    program: defaultProgram(),
    nextDay: 0,
    exOverrides: {}, // per-exercise unit / increment changes
    customEx: {}, // your own machines
    exNotes: {}, // seat height, pin position…
    workouts: [],
    body: [], // {id, date, kg, waist}
    food: {}, // 'YYYY-MM-DD' → {breakfast, lunch, dinner, snack, photos}
    customFoods: {},
    savedMeals: [],
    mealPlan: null,
    active: null,
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const s = JSON.parse(raw);
    return { ...defaults(), ...s, profile: { ...defaults().profile, ...s.profile }, settings: { ...defaults().settings, ...s.settings } };
  } catch {
    return defaults();
  }
}

let saveErr = false;
export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    saveErr = false;
  } catch (e) {
    if (!saveErr) alert('Could not save data on this device: ' + e.message);
    saveErr = true;
  }
}

export function requestPersist() {
  try { navigator.storage?.persist?.(); } catch {}
}

// ── photos (IndexedDB) ──
let dbp;
function db() {
  if (!dbp)
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('mygym-photos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  return dbp;
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction('photos', mode);
    const out = fn(t.objectStore('photos'));
    t.oncomplete = () => res(out?.result ?? out);
    t.onerror = () => rej(t.error);
  });
}
export const putPhoto = (p) => tx('readwrite', (s) => s.put(p));
export const delPhoto = (id) => tx('readwrite', (s) => s.delete(id));
export async function getPhoto(id) {
  const d = await db();
  return new Promise((res, rej) => {
    const r = d.transaction('photos').objectStore('photos').get(id);
    r.onsuccess = () => res(r.result || null);
    r.onerror = () => rej(r.error);
  });
}
export async function allPhotos() {
  const d = await db();
  return new Promise((res, rej) => {
    const r = d.transaction('photos').objectStore('photos').getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => rej(r.error);
  });
}

// Shrink a camera photo before storing it.
export function resizeImage(file, max = 1200) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const sc = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * sc);
      c.height = Math.round(img.height * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? res(b) : rej(new Error('resize failed'))), 'image/jpeg', 0.82);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

const blobToDataURL = (b) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
const dataURLToBlob = async (u) => (await fetch(u)).blob();

export async function exportAll(state) {
  const photos = await allPhotos().catch(() => []);
  const ph = [];
  for (const p of photos) ph.push({ ...p, blob: await blobToDataURL(p.blob) });
  return JSON.stringify({ app: 'mygym', exported: Date.now(), state, photos: ph });
}

export async function importAll(text) {
  const data = JSON.parse(text);
  if (data.app !== 'mygym' || !data.state) throw new Error('This is not a My Gym backup file.');
  for (const p of data.photos || []) await putPhoto({ ...p, blob: await dataURLToBlob(p.blob) });
  return data.state;
}
