// Lokale Speicherung im IndexedDB des Geräts. Objekte und Fotos liegen in
// getrennten Stores, damit die Objektliste ohne Bilddaten schnell lädt.

const DB_NAME = 'besichtigung';
const DB_VERSION = 1;
let dbPromise;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('objekte')) db.createObjectStore('objekte', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('fotos')) {
          const s = db.createObjectStore('fotos', { keyPath: 'id' });
          s.createIndex('objektId', 'objektId');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function tx(store, mode, fn) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const result = fn(t.objectStore(store));
    t.oncomplete = () => resolve(result && 'result' in result ? result.result : result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const getObjekte = () => tx('objekte', 'readonly', s => s.getAll());
export const getObjekt = id => tx('objekte', 'readonly', s => s.get(id));
export const putObjekt = o => { o.updatedAt = Date.now(); return tx('objekte', 'readwrite', s => s.put(o)); };

export async function deleteObjekt(id) {
  const fotos = await getFotos(id);
  await tx('fotos', 'readwrite', s => fotos.forEach(f => s.delete(f.id)));
  await tx('objekte', 'readwrite', s => s.delete(id));
}

// Fotos werden als ArrayBuffer gespeichert, nicht als Blob: Safari auf iOS verliert
// in Web-Apps gelegentlich die Daten gespeicherter Blobs (Bild zeigt dann "?").
async function packBild(b) {
  if (!(b instanceof Blob)) return b ?? null;
  return { buf: await b.arrayBuffer(), type: b.type || 'image/jpeg' };
}
function unpackBild(b) {
  return b && b.buf ? new Blob([b.buf], { type: b.type }) : b ?? null;
}
async function pack(f) {
  return { ...f, blob: await packBild(f.blob), original: await packBild(f.original), defekt: undefined };
}
function unpack(f) {
  return f && { ...f, blob: unpackBild(f.blob), original: unpackBild(f.original) };
}

// Ältere Einträge mit Blob einmalig umwandeln; nicht mehr lesbare werden als defekt markiert.
async function migriere(list) {
  const neu = [];
  for (const f of list) {
    if (!(f.blob instanceof Blob) && !(f.original instanceof Blob)) continue;
    try {
      neu.push(await pack(f));
    } catch {
      f.defekt = true;
    }
  }
  if (neu.length) await tx('fotos', 'readwrite', s => neu.forEach(f => s.put(f)));
  return list;
}

export async function getFotos(objektId) {
  const list = await migriere(await tx('fotos', 'readonly', s => s.index('objektId').getAll(objektId)));
  return list.map(unpack).sort((a, b) => a.order - b.order);
}
export const getFoto = async id => unpack((await migriere([await tx('fotos', 'readonly', s => s.get(id))].filter(Boolean)))[0]);
export const putFoto = async f => { const p = await pack(f); return tx('fotos', 'readwrite', s => s.put(p)); };
export const putFotos = async list => { const p = await Promise.all(list.map(pack)); return tx('fotos', 'readwrite', s => p.forEach(f => s.put(f))); };
export const deleteFoto = id => tx('fotos', 'readwrite', s => s.delete(id));

export async function countFotos(objektId) {
  return tx('fotos', 'readonly', s => s.index('objektId').count(objektId));
}

export function newObjekt() {
  return {
    id: uid(),
    createdAt: Date.now(),
    stammdaten: { datum: new Date().toISOString().slice(0, 10) },
    baubeschreibung: {},
    standard: {},
  };
}

// Sicherung: ein JSON-Dokument mit allen Daten eines Objekts, Fotos als Data-URLs.
export async function exportBackup(objektId) {
  const objekt = await getObjekt(objektId);
  const fotos = await getFotos(objektId);
  const enc = blob => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  const fotosOut = [];
  for (const f of fotos) {
    if (f.defekt) continue;
    fotosOut.push({ ...f, blob: await enc(f.blob), original: f.original ? await enc(f.original) : null });
  }
  return { format: 'besichtigung-backup', version: 1, objekt, fotos: fotosOut };
}

export async function importBackup(data) {
  if (data?.format !== 'besichtigung-backup') throw new Error('Keine gültige Sicherungsdatei.');
  const dec = async url => url ? (await fetch(url)).blob() : null;
  const objekt = { ...data.objekt, id: uid() };
  const fotos = [];
  for (const f of data.fotos) {
    fotos.push({ ...f, id: uid(), objektId: objekt.id, blob: await dec(f.blob), original: await dec(f.original) });
  }
  await putObjekt(objekt);
  await putFotos(fotos);
  return objekt.id;
}
