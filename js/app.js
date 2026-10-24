import * as db from './db.js';
import {
  STAMMDATEN, BAUBESCHREIBUNG, STANDARD_MERKMALE, MODERNISIERUNG, MODERNISIERUNGSGRAD, FOTO_KATEGORIEN, GESCHOSSE,
  ausstattungsstandard, modernisierung, fotoKategorie, fotoText, sortiereFotos,
} from './schema.js';
import * as ex from './export.js';
import { openMarkup, freeCanvas } from './markup.js';

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const thumbUrls = new Set();

function objectUrl(blob) {
  const u = URL.createObjectURL(blob);
  thumbUrls.add(u);
  return u;
}
function releaseUrls() {
  thumbUrls.forEach(u => URL.revokeObjectURL(u));
  thumbUrls.clear();
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
}

function debounce(fn, ms = 400) {
  let t, pending = false;
  const run = () => { pending = false; fn(); };
  const d = () => { pending = true; clearTimeout(t); t = setTimeout(run, ms); };
  d.flush = () => { clearTimeout(t); if (pending) run(); };
  return d;
}

// ---------- Router ----------
let pendingSave = null;
async function route() {
  if (pendingSave) { pendingSave.flush(); pendingSave = null; }
  releaseUrls();
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  window.scrollTo(0, 0);
  try {
    if (parts[0] === 'o' && parts[1]) {
      const objekt = await db.getObjekt(parts[1]);
      if (!objekt) { location.hash = '#/'; return; }
      if (parts[2] === 'foto' && parts[3]) return renderFoto(objekt, parts[3]);
      return renderObjekt(objekt, parts[2] || 'daten');
    }
    return renderHome();
  } catch (e) {
    console.error(e);
    $app.innerHTML = `<div class="empty">Fehler: ${esc(e.message)}</div>`;
  }
}
window.addEventListener('hashchange', route);

function header(title, { back, action } = {}) {
  return `<header class="bar">
    ${back ? `<a class="bar-btn back" href="${back}" aria-label="Zurück">‹ Zurück</a>` : '<span class="bar-btn"></span>'}
    <h1>${esc(title)}</h1>
    ${action || '<span class="bar-btn"></span>'}
  </header>`;
}

// ---------- Startseite ----------
async function renderHome() {
  const objekte = (await db.getObjekte()).sort((a, b) => b.updatedAt - a.updatedAt);
  const cards = await Promise.all(objekte.map(async o => {
    const fotos = sortiereFotos(await db.getFotos(o.id));
    const sd = o.stammdaten || {};
    const thumb = fotos[0] ? `<img src="${objectUrl(fotos[0].blob)}" alt="">` : '<div class="ph">🏠</div>';
    return `<a class="card obj" href="#/o/${o.id}">
      <div class="thumb">${thumb}</div>
      <div class="meta">
        <strong>${esc(ex.titel(o))}</strong>
        <span>${esc(ex.adresse(sd))}</span>
        <small>${sd.datum ? ex.formatDatum(sd.datum) + ' · ' : ''}${fotos.length} Foto${fotos.length === 1 ? '' : 's'}${sd.aktenzeichen ? ' · Az. ' + esc(sd.aktenzeichen) : ''}</small>
      </div>
    </a>`;
  }));

  $app.innerHTML = `
    ${header('Besichtigungen', { action: `<button class="bar-btn" id="imp" aria-label="Sicherung importieren">Import</button>` })}
    <main class="page">
      <button class="btn primary big" id="neu">＋ Neue Besichtigung</button>
      ${cards.length ? `<div class="list">${cards.join('')}</div>`
        : `<div class="empty">Noch keine Objekte.<br>Lege eine neue Besichtigung an.</div>`}
      <input type="file" id="impfile" accept=".json,application/json" hidden>
    </main>`;

  document.getElementById('neu').onclick = async () => {
    const o = db.newObjekt();
    await db.putObjekt(o);
    location.hash = `#/o/${o.id}/daten`;
  };
  const impfile = document.getElementById('impfile');
  document.getElementById('imp').onclick = () => impfile.click();
  impfile.onchange = async () => {
    const file = impfile.files[0];
    if (!file) return;
    try {
      const id = await db.importBackup(JSON.parse(await file.text()));
      toast('Sicherung importiert');
      location.hash = `#/o/${id}`;
    } catch (e) { alert('Import fehlgeschlagen: ' + e.message); }
  };
}

// ---------- Objekt mit Tabs ----------
const TABS = [
  ['daten', 'Objekt', '📋'],
  ['bau', 'Baubeschr.', '🏗️'],
  ['fotos', 'Fotos', '📷'],
  ['bewertung', 'Bewertung', '📊'],
  ['export', 'Export', '📄'],
];

async function renderObjekt(objekt, tab) {
  const save = debounce(() => db.putObjekt(objekt));
  pendingSave = save;
  const tabbar = `<nav class="tabbar">${TABS.map(([k, label, icon]) =>
    `<a href="#/o/${objekt.id}/${k}" class="${k === tab ? 'active' : ''}"><span>${icon}</span>${label}</a>`).join('')}</nav>`;

  $app.innerHTML = `${header(ex.titel(objekt), { back: '#/' })}<main class="page with-tabs" id="content"></main>${tabbar}`;
  const content = document.getElementById('content');

  if (tab === 'daten') renderDaten(content, objekt, save);
  else if (tab === 'bau') renderBau(content, objekt, save);
  else if (tab === 'fotos') await renderFotos(content, objekt);
  else if (tab === 'bewertung') renderBewertung(content, objekt, save);
  else if (tab === 'export') await renderExport(content, objekt, save);
}

function fieldHtml(f, value, path) {
  const id = 'f_' + path.replace(/\./g, '_');
  const val = esc(value);
  const attrs = `id="${id}" data-path="${path}" ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} ${f.inputmode ? `inputmode="${f.inputmode}"` : ''}`;
  const input = f.multiline || (f.chips && !f.type)
    ? `<textarea ${attrs} rows="${f.multiline ? 3 : 1}" autocapitalize="sentences">${val}</textarea>`
    : `<input type="${f.type || 'text'}" ${attrs} value="${val}">`;
  const chips = f.chips ? `<div class="chips" data-for="${id}">${f.chips.map(c =>
    `<button type="button" class="chip">${esc(c)}</button>`).join('')}</div>` : '';
  return `<div class="field ${f.half ? 'half' : ''}"><label for="${id}">${esc(f.label)}</label>${input}${chips}</div>`;
}

function getPath(obj, path) { return path.split('.').reduce((o, k) => o?.[k], obj); }
function setPath(obj, path, value) {
  const keys = path.split('.');
  let o = obj;
  for (const k of keys.slice(0, -1)) o = o[k] ??= {};
  o[keys.at(-1)] = value;
}

function splitTerms(text) { return text.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean); }

function refreshChips(el) {
  const box = el.parentElement.querySelector('.chips');
  if (!box) return;
  const terms = splitTerms(el.value).map(t => t.toLowerCase());
  box.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', terms.includes(c.textContent.toLowerCase())));
}

function autoGrow(el) {
  if (el.tagName !== 'TEXTAREA') return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 2 + 'px';
}

// Verdrahtet Eingabefelder und Schnellauswahl-Chips mit dem Objekt.
function bindFields(root, objekt, save, onChange) {
  root.querySelectorAll('[data-path]').forEach(el => {
    autoGrow(el);
    refreshChips(el);
    el.addEventListener('input', () => {
      setPath(objekt, el.dataset.path, el.value);
      autoGrow(el);
      refreshChips(el);
      onChange?.(el);
      save();
    });
  });
  root.querySelectorAll('.chips[data-for]').forEach(box => {
    const el = document.getElementById(box.dataset.for);
    box.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const term = chip.textContent;
      const terms = splitTerms(el.value);
      const idx = terms.findIndex(t => t.toLowerCase() === term.toLowerCase());
      if (idx >= 0) terms.splice(idx, 1); else terms.push(term);
      el.value = terms.join(', ');
      el.dispatchEvent(new Event('input'));
    });
  });
}

function renderDaten(content, objekt, save) {
  content.innerHTML = `<section class="card form">${STAMMDATEN.map(f =>
    fieldHtml(f, objekt.stammdaten?.[f.key], `stammdaten.${f.key}`)).join('')}</section>`;
  bindFields(content, objekt, save, el => {
    if (['stammdaten.bezeichnung', 'stammdaten.strasse', 'stammdaten.plz', 'stammdaten.ort'].includes(el.dataset.path)) {
      document.querySelector('.bar h1').textContent = ex.titel(objekt);
    }
  });
}

function groupProgress(objekt, g) {
  const filled = g.fields.filter(f => (objekt.baubeschreibung?.[g.key]?.[f.key] || '').trim()).length;
  return `${filled}/${g.fields.length}`;
}

function rememberOpen(content, storageKey) {
  content.querySelectorAll('details[data-key]').forEach(d => d.addEventListener('toggle', () => {
    const keys = [...content.querySelectorAll('details[data-key][open]')].map(x => x.dataset.key);
    sessionStorage.setItem(storageKey, JSON.stringify(keys));
    d.querySelectorAll('textarea').forEach(autoGrow);
  }));
}
function openKeys(storageKey, fallback = []) {
  try { return JSON.parse(sessionStorage.getItem(storageKey)) || fallback; } catch { return fallback; }
}

function renderBau(content, objekt, save) {
  const open = openKeys('openGroups', ['allgemein']);
  content.innerHTML = BAUBESCHREIBUNG.map(g => `
    <details class="card group" data-key="${g.key}" ${open.includes(g.key) ? 'open' : ''}>
      <summary><span>${esc(g.title)}</span><small class="prog">${groupProgress(objekt, g)}</small></summary>
      <div class="form">${g.fields.map(f => fieldHtml(f, getPath(objekt, `baubeschreibung.${g.key}.${f.key}`), `baubeschreibung.${g.key}.${f.key}`)).join('')}</div>
    </details>`).join('')
    + `<p class="hint center">Der Ausstattungsstandard wird aus diesen Angaben automatisch ermittelt (Tab „Bewertung“).</p>`;
  rememberOpen(content, 'openGroups');
  bindFields(content, objekt, save, el => {
    const d = el.closest('details');
    const g = BAUBESCHREIBUNG.find(x => x.key === d.dataset.key);
    if (g) d.querySelector('.prog').textContent = groupProgress(objekt, g);
  });
}

// ---------- Fotos ----------
async function processImage(file, maxEdge = 2400) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('Bildformat wird nicht unterstützt'));
      i.src = url;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
    freeCanvas(c);
    if (!blob) throw new Error('Zu wenig Speicher. Bitte die App neu starten.');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Neue Fotos übernehmen Kategorie, Geschoss und Raum der letzten Auswahl.
async function addFiles(objekt, files, vorlage = {}) {
  const existing = await db.getFotos(objekt.id);
  let order = existing.reduce((m, f) => Math.max(m, f.order), -1) + 1;
  const neu = objekt.neueFotos || {};
  let lastId = null;
  for (const file of files) {
    const blob = await processImage(file);
    const foto = {
      id: db.uid(), objektId: objekt.id, order: order++, blob, caption: '', createdAt: Date.now(),
      kategorie: vorlage.kategorie ?? neu.kategorie ?? 'aussen',
      geschoss: vorlage.geschoss ?? neu.geschoss ?? '',
      raum: vorlage.raum ?? '',
    };
    await db.putFoto(foto);
    lastId = foto.id;
  }
  await db.putObjekt(objekt);
  return lastId;
}

function selectHtml(id, options, value, emptyLabel) {
  return `<select id="${id}">${emptyLabel != null ? `<option value="">${esc(emptyLabel)}</option>` : ''}${options.map(([v, l]) =>
    `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
}

async function renderFotos(content, objekt) {
  const fotos = sortiereFotos(await db.getFotos(objekt.id));
  const byId = new Map(fotos.map(f => [f.id, f]));
  objekt.neueFotos ??= { kategorie: 'aussen', geschoss: '' };
  const nr = new Map(fotos.map((f, i) => [f.id, i + 1]));

  const item = f => {
    const kopf = [f.geschoss, f.raum].filter(Boolean).join(', ');
    return `<div class="fitem" data-id="${f.id}">
      <span class="handle" aria-label="Verschieben">⠿</span>
      <a class="fthumb" href="#/o/${objekt.id}/foto/${f.id}"><img src="${objectUrl(f.blob)}" alt="" loading="lazy"><span class="num">${nr.get(f.id)}</span></a>
      <div class="fbody">
        <a class="fkopf ${kopf ? '' : 'missing'}" href="#/o/${objekt.id}/foto/${f.id}">${esc(kopf || 'Raum / Geschoss wählen')} ›</a>
        <textarea class="fcap" data-id="${f.id}" rows="1" placeholder="Beschreibung …" autocapitalize="sentences">${esc(f.caption)}</textarea>
      </div>
    </div>`;
  };

  content.innerHTML = `
    <div class="photo-actions">
      <label class="btn primary">📷 Kamera<input type="file" accept="image/*" capture="environment" id="cam" hidden></label>
      <label class="btn">🖼️ Mediathek<input type="file" accept="image/*" multiple id="lib" hidden></label>
    </div>
    <div class="card neu-row">
      <span>Neue Fotos in</span>
      ${selectHtml('neuKat', FOTO_KATEGORIEN.map(k => [k.key, k.label]), objekt.neueFotos.kategorie)}
      ${selectHtml('neuGes', GESCHOSSE.map(g => [g, g]), objekt.neueFotos.geschoss, 'Geschoss –')}
    </div>
    ${fotos.length ? `
      <div class="ftools">
        <span class="hint">Mit ⠿ verschieben, auch in eine andere Kategorie.</span>
        <button class="btn small" id="autosort">Nach Geschoss sortieren</button>
      </div>
      <div id="flists">${FOTO_KATEGORIEN.map(k => {
        const list = fotos.filter(f => fotoKategorie(f) === k);
        return `<section class="fgroup ${list.length ? '' : 'leer'}">
          <h3>${esc(k.label)} <small class="cnt">${list.length}</small></h3>
          <div class="flist" data-kat="${k.key}">${list.map(item).join('')}</div>
        </section>`;
      }).join('')}</div>`
      : '<div class="empty">Noch keine Fotos.<br>Wähle oben die Kategorie, dann einfach losfotografieren.</div>'}`;

  const neuKat = document.getElementById('neuKat'), neuGes = document.getElementById('neuGes');
  neuKat.onchange = () => { objekt.neueFotos.kategorie = neuKat.value; db.putObjekt(objekt); };
  neuGes.onchange = () => { objekt.neueFotos.geschoss = neuGes.value; db.putObjekt(objekt); };

  const handle = async (input, openAfter) => {
    const files = [...input.files];
    if (!files.length) return;
    content.insertAdjacentHTML('afterbegin', '<div class="busy">Fotos werden gespeichert …</div>');
    try {
      const lastId = await addFiles(objekt, files);
      // Nach einer Kameraaufnahme direkt zur Beschriftung springen.
      if (openAfter && files.length === 1) location.hash = `#/o/${objekt.id}/foto/${lastId}`;
      else route();
    } catch (e) { alert('Foto konnte nicht gespeichert werden: ' + e.message); route(); }
  };
  document.getElementById('cam').onchange = e => handle(e.target, true);
  document.getElementById('lib').onchange = e => handle(e.target, false);
  if (!fotos.length) return;

  // Beschreibung direkt in der Liste bearbeiten.
  const dirty = new Set();
  const saveCaptions = debounce(() => { db.putFotos([...dirty].map(id => byId.get(id))); dirty.clear(); }, 500);
  pendingSave = saveCaptions;
  content.querySelectorAll('.fcap').forEach(ta => {
    autoGrow(ta);
    ta.addEventListener('input', () => {
      byId.get(ta.dataset.id).caption = ta.value;
      dirty.add(ta.dataset.id);
      autoGrow(ta);
      saveCaptions();
    });
  });

  // Nach dem Verschieben Kategorie und Reihenfolge aus der Anzeige übernehmen.
  const flists = document.getElementById('flists');
  const applyDomOrder = async () => {
    let order = 0, n = 0;
    const changed = [];
    flists.querySelectorAll('.flist').forEach(list => {
      const items = list.querySelectorAll('.fitem');
      list.parentElement.querySelector('.cnt').textContent = items.length;
      list.parentElement.classList.toggle('leer', !items.length);
      items.forEach(el => {
        const f = byId.get(el.dataset.id);
        if (f.order !== order || f.kategorie !== list.dataset.kat) {
          f.order = order; f.kategorie = list.dataset.kat; changed.push(f);
        }
        order++;
        el.querySelector('.num').textContent = ++n;
      });
    });
    if (changed.length) await db.putFotos(changed);
  };

  if (window.Sortable) {
    flists.querySelectorAll('.flist').forEach(list => window.Sortable.create(list, {
      group: 'fotos', handle: '.handle', animation: 150, ghostClass: 'ghost', forceFallback: true, fallbackTolerance: 3,
      onStart: () => flists.classList.add('dragging'),
      onEnd: () => { flists.classList.remove('dragging'); applyDomOrder(); },
    }));
  }

  document.getElementById('autosort').onclick = async () => {
    const gi = f => { const i = GESCHOSSE.indexOf(f.geschoss); return i < 0 ? GESCHOSSE.length : i; };
    const sorted = [...fotos].sort((a, b) =>
      FOTO_KATEGORIEN.indexOf(fotoKategorie(a)) - FOTO_KATEGORIEN.indexOf(fotoKategorie(b)) || gi(a) - gi(b) || a.order - b.order);
    sorted.forEach((f, i) => { f.order = i; });
    saveCaptions.flush();
    await db.putFotos(sorted);
    toast('Nach Kategorie und Geschoss sortiert');
    route();
  };
}

function singleChips(values, current) {
  return values.map(v => `<button type="button" class="chip ${v === current ? 'on' : ''}" data-v="${esc(v)}">${esc(v)}</button>`).join('');
}

async function renderFoto(objekt, fotoId) {
  const fotos = sortiereFotos(await db.getFotos(objekt.id));
  const idx = fotos.findIndex(f => f.id === fotoId);
  if (idx < 0) { location.hash = `#/o/${objekt.id}/fotos`; return; }
  const foto = fotos[idx];
  const back = `#/o/${objekt.id}/fotos`;
  const save = debounce(() => db.putFoto(foto));
  pendingSave = save;
  const kat = () => fotoKategorie(foto);

  $app.innerHTML = `
    ${header(`Foto ${idx + 1} von ${fotos.length}`, { back })}
    <main class="page foto-edit">
      <div class="photo-view"><img src="${objectUrl(foto.blob)}" alt=""></div>
      <p class="preview" id="preview"></p>
      <section class="card form">
        <div class="field"><label>Kategorie</label><div class="chips" id="katChips">${FOTO_KATEGORIEN.map(k =>
          `<button type="button" class="chip ${k === kat() ? 'on' : ''}" data-v="${k.key}">${esc(k.label)}</button>`).join('')}</div></div>
        <div class="field"><label>Geschoss</label><div class="chips" id="gesChips">${singleChips(GESCHOSSE, foto.geschoss)}</div></div>
        <div class="field"><label for="raum">Raum / Ansicht / Bauteil</label>
          <input id="raum" value="${esc(foto.raum)}" placeholder="z. B. Küche" autocapitalize="sentences">
          <div class="chips" id="raumChips">${singleChips(kat().raeume, foto.raum)}</div></div>
        <div class="field"><label for="cap">Beschreibung</label>
          <textarea id="cap" rows="2" placeholder="z. B. Einbauküche, Fliesenspiegel" autocapitalize="sentences">${esc(foto.caption)}</textarea></div>
      </section>
      <label class="btn primary wide">📷 Nächstes Foto aufnehmen<input type="file" accept="image/*" capture="environment" id="camNext" hidden></label>
      <div class="btn-row">
        <button class="btn" id="mark">✏️ Markieren</button>
        ${foto.original ? '<button class="btn" id="orig">↺ Original</button>' : ''}
      </div>
      <div class="btn-row">
        <button class="btn" id="prev" ${idx === 0 ? 'disabled' : ''}>‹ Vorheriges</button>
        <button class="btn" id="next" ${idx === fotos.length - 1 ? 'disabled' : ''}>Nächstes ›</button>
      </div>
      <button class="btn danger" id="del">Foto löschen</button>
    </main>`;

  const preview = document.getElementById('preview');
  const raum = document.getElementById('raum');
  const cap = document.getElementById('cap');
  const updatePreview = () => {
    const t = fotoText(foto);
    preview.innerHTML = `<b>Foto ${idx + 1}</b>${t ? ': ' + esc(t) : ' <span class="muted">(ohne Beschriftung)</span>'}`;
  };
  const changed = () => { updatePreview(); save(); };
  updatePreview();
  autoGrow(cap);

  // Kategorie und Geschoss gelten auch als Vorgabe für die nächsten Fotos.
  const remember = () => {
    objekt.neueFotos = { kategorie: kat().key, geschoss: foto.geschoss || '' };
    db.putObjekt(objekt);
  };

  document.getElementById('katChips').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    foto.kategorie = c.dataset.v;
    e.currentTarget.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === c));
    document.getElementById('raumChips').innerHTML = singleChips(kat().raeume, foto.raum);
    remember(); changed();
  });
  document.getElementById('gesChips').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    foto.geschoss = foto.geschoss === c.dataset.v ? '' : c.dataset.v;
    e.currentTarget.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.dataset.v === foto.geschoss));
    remember(); changed();
  });
  const raumChips = document.getElementById('raumChips');
  const syncRaumChips = () => raumChips.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.dataset.v === foto.raum));
  raumChips.addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    foto.raum = foto.raum === c.dataset.v ? '' : c.dataset.v;
    raum.value = foto.raum;
    syncRaumChips(); changed();
  });
  raum.addEventListener('input', () => { foto.raum = raum.value; syncRaumChips(); changed(); });
  cap.addEventListener('input', () => { foto.caption = cap.value; autoGrow(cap); changed(); });

  document.getElementById('camNext').onchange = async e => {
    const files = [...e.target.files];
    if (!files.length) return;
    save.flush();
    const id = await addFiles(objekt, files, { kategorie: kat().key, geschoss: foto.geschoss || '' });
    location.hash = `#/o/${objekt.id}/foto/${id}`;
  };

  const go = id => { location.hash = `#/o/${objekt.id}/foto/${id}`; };
  document.getElementById('prev').onclick = () => go(fotos[idx - 1].id);
  document.getElementById('next').onclick = () => go(fotos[idx + 1].id);
  document.getElementById('del').onclick = async () => {
    if (!confirm('Dieses Foto wirklich löschen?')) return;
    pendingSave = null;
    await db.deleteFoto(foto.id);
    location.hash = back;
  };
  document.getElementById('mark').onclick = () => openMarkup(foto.blob, async blob => {
    save.flush();
    foto.original ??= foto.blob;
    foto.blob = blob;
    await db.putFoto(foto);
    route();
  });
  document.getElementById('orig')?.addEventListener('click', async () => {
    if (!confirm('Markierungen entfernen und Originalfoto wiederherstellen?')) return;
    save.flush();
    foto.blob = foto.original;
    delete foto.original;
    await db.putFoto(foto);
    route();
  });
}

// ---------- Bewertung: Ausstattungsstandard und Modernisierung ----------
const z1 = n => ex.zahl(n);
const halb = n => Math.round(n * 2) / 2;

function stepper(act, key, label) {
  return `<div class="stepper"><button type="button" data-act="${act}" data-key="${key}" data-d="-0.5" aria-label="weniger">−</button>
    <span>${label}</span><button type="button" data-act="${act}" data-key="${key}" data-d="0.5" aria-label="mehr">＋</button></div>`;
}

function badge(manuell, hatWert) {
  if (!hatWert) return '<span class="badge leer">offen</span>';
  return manuell ? '<span class="badge man">angepasst</span>' : '<span class="badge auto">auto</span>';
}

function renderBewertung(content, objekt, save) {
  const open = openKeys('openBew');
  const st = ausstattungsstandard(objekt);
  const mo = modernisierung(objekt);
  const anzMan = st.zeilen.filter(z => z.manuell).length;

  const stdRows = st.zeilen.map(z => {
    const m = z.merkmal;
    const aktiv = z.wert != null ? Math.round(z.wert) : null;
    return `<details class="std" data-key="std_${m.key}" ${open.includes('std_' + m.key) ? 'open' : ''}>
      <summary><span class="lbl">${esc(m.label)} <small>${m.weight} %</small></span>
        <span class="val">${z1(z.wert)}</span>${badge(z.manuell, z.wert != null)}</summary>
      <div class="std-body">
        <p class="hint">${z.vorschlag
          ? `Vorschlag <b>${z1(z.vorschlag.wert)}</b> aus: ${z.vorschlag.gruende.map(g => `${esc(g.term)} (${g.stufe})`).join(', ')}`
          : 'Kein Vorschlag – passende Begriffe in der Baubeschreibung antippen oder Stufe hier festlegen.'}</p>
        <div class="std-ctrl">${stepper('std', m.key, z1(z.wert ?? 3))}
          ${z.manuell ? `<button type="button" class="btn small" data-act="stdAuto" data-key="${m.key}">Automatisch${z.vorschlag ? ' (' + z1(z.vorschlag.wert) + ')' : ''}</button>` : ''}</div>
        <div class="stufen">${m.stufen.map((t, i) => `<button type="button" class="stufe ${aktiv === i + 1 ? 'on' : ''}" data-act="stdSet" data-key="${m.key}" data-v="${i + 1}">
          <b>${i + 1}</b><span>${esc(t)}</span></button>`).join('')}</div>
      </div>
    </details>`;
  }).join('');

  const modRows = mo.zeilen.map(z => {
    const e = z.element, zg = !!z.eintrag.zeitgemaess;
    return `<div class="mod-row">
      <div class="mod-lbl"><span>${esc(e.label)} <small>max. ${e.max}</small></span>
        <button type="button" class="chip mini ${zg ? 'on' : ''}" data-act="zeit" data-key="${e.key}">zeitgemäß</button></div>
      <div class="mod-ctrl">
        <input type="text" inputmode="numeric" maxlength="4" class="jahr" data-key="${e.key}" placeholder="${zg ? '–' : 'Jahr'}" value="${esc(zg ? '' : z.eintrag.jahr || '')}" ${zg ? 'disabled' : ''}>
        <div class="seg small" data-key="${e.key}">
          <button type="button" data-umfang="voll" class="${z.eintrag.umfang !== 'teil' ? 'on' : ''}">ganz</button>
          <button type="button" data-umfang="teil" class="${z.eintrag.umfang === 'teil' ? 'on' : ''}">teilw.</button>
        </div>
        ${stepper('mod', e.key, z1(z.punkte))}
        ${z.manuell ? `<button type="button" class="reset" data-act="modAuto" data-key="${e.key}" aria-label="automatisch">↺</button>` : '<span class="reset"></span>'}
      </div>
    </div>`;
  }).join('');

  const modElemente = `
      <p class="hint">Maßgeblich sind Maßnahmen zum oder kurz vor dem Stichtag: Jahr eintragen ergibt die Höchstpunkte.
        Liegen Maßnahmen weiter zurück, ist zu prüfen, ob weniger Punkte anzusetzen sind (mit − / ＋ anpassen).
        Genügen nicht modernisierte Bauteile noch zeitgemäßen Ansprüchen, „zeitgemäß“ wählen: Sie erhalten vergleichbare Punkte.</p>
      <label class="opt-row pad"><span>Ältere Maßnahmen automatisch mindern<br><small class="muted">eigene Annahme, nicht ImmoWertV: bis 10 J. voll, 11–20 J. halb, älter 0</small></span>
        <input type="checkbox" id="mindern" ${mo.mindern ? 'checked' : ''}></label>
      ${modRows}
      <div class="mod-sum">
        <div><b>Summe</b> ${mo.summeManuell ? `<small>(rechnerisch ${z1(mo.summeAuto)})</small>` : ''}<br><span class="grad">${esc(mo.grad)}</span></div>
        <div class="mod-ctrl">${stepper('sum', 'sum', z1(mo.punkte))}
          ${mo.summeManuell ? '<button type="button" class="reset" data-act="sumAuto" aria-label="automatisch">↺</button>' : '<span class="reset"></span>'}</div>
      </div>`;

  const modGrad = `
      <p class="hint">Sachverständige Einschätzung des Modernisierungsgrades (Tabelle 2). Grad wählen, dann die Punktzahl innerhalb der Spanne festlegen.</p>
      <div class="stufen pad">${MODERNISIERUNGSGRAD.map(g => `<button type="button" class="stufe ${g === mo.gradInfo ? 'on' : ''}" data-act="grad" data-v="${g.key}">
        <b>${g.von === g.bis ? g.von : `${g.von}–${g.bis}`}</b><span>${esc(g.label)}</span></button>`).join('')}</div>
      <div class="mod-sum">
        <div><b>Punkte</b><br><span class="grad">Spanne ${mo.gradInfo.von} bis ${mo.gradInfo.bis}</span></div>
        <div class="mod-ctrl">${stepper('gradP', 'gradP', z1(mo.punkte))}<span class="reset"></span></div>
      </div>`;

  content.innerHTML = `
    <section class="card bew">
      <div class="bew-head">
        <div><h2>Ausstattungsstandard</h2><small>Anlage 4 ImmoWertV · Wohngebäude</small></div>
        <div class="big">${ex.zahl(st.gesamt, 2)}</div>
      </div>
      <p class="hint">${st.gesamt == null ? 'Noch keine Einstufung möglich.'
        : `Automatisch aus der Baubeschreibung ermittelt${anzMan ? `, ${anzMan} Merkmal${anzMan > 1 ? 'e' : ''} angepasst` : ''}${st.vollstaendig ? '' : ' · noch nicht alle Merkmale eingestuft'}.`}
        Merkmal antippen zum Anpassen.</p>
      ${stdRows}
    </section>

    <section class="card bew">
      <div class="bew-head">
        <div><h2>Modernisierung</h2><small>Anlage 2 ImmoWertV</small></div>
        <div class="big">${z1(mo.punkte)}<small>/20</small></div>
      </div>
      <div class="seg wide pad-x" id="methode">
        <button type="button" data-act="methode" data-v="elemente" class="${mo.methode === 'elemente' ? 'on' : ''}">Je Element · Tab. 1</button>
        <button type="button" data-act="methode" data-v="grad" class="${mo.methode === 'grad' ? 'on' : ''}">Grad · Tab. 2</button>
      </div>
      ${mo.methode === 'grad' ? modGrad : modElemente}
    </section>

    <section class="card bew">
      <div class="bew-head">
        <div><h2>Restnutzungsdauer</h2><small>modifiziert nach Anlage 2 ImmoWertV</small></div>
        <div class="big">${mo.rnd ?? '–'}<small> J.</small></div>
      </div>
      <div class="form">
        <div class="field half"><label for="bj">Baujahr</label><input id="bj" inputmode="numeric" maxlength="4" value="${esc(mo.baujahr || '')}"></div>
        <div class="field half"><label for="gnd">Gesamtnutzungsdauer</label><input id="gnd" inputmode="numeric" maxlength="3" value="${mo.gnd}"></div>
        <div class="field half"><label for="rnd">Restnutzungsdauer</label><input id="rnd" inputmode="numeric" maxlength="3" placeholder="${mo.rndAuto ?? ''}" value="${mo.rndManuell ? mo.rnd : ''}"></div>
        <div class="field half"><label>Stichtag</label><div class="ro">${mo.stichtagJahr}</div></div>
      </div>
      <p class="hint pad">Alter ${mo.alter ?? '–'} Jahre · rechnerische RND ${mo.rndAuto ?? '–'} Jahre · fiktives Baujahr ${mo.fiktivesBaujahr ?? '–'}.
        RND leer lassen für den rechnerischen Wert, Stichtag im Tab „Objekt“ (sonst Besichtigungsdatum).</p>
    </section>`;

  rememberOpenBew(content);

  const rerender = () => {
    save();
    const y = window.scrollY;
    renderBewertung(content, objekt, save);
    window.scrollTo(0, y);
  };
  objekt.standard ??= {};
  objekt.modernisierung ??= {};
  const mod = objekt.modernisierung;
  mod.elemente ??= {};
  const zeile = key => st.zeilen.find(z => z.merkmal.key === key);
  const mzeile = key => mo.zeilen.find(z => z.element.key === key);

  // onclick statt addEventListener: bei jedem Neuaufbau ersetzt, nicht gestapelt.
  content.onclick = e => {
    const b = e.target.closest('[data-act], [data-umfang]');
    if (!b) return;
    const key = b.dataset.key || b.closest('[data-key]')?.dataset.key;
    const d = Number(b.dataset.d || 0);
    switch (b.dataset.act) {
      case 'std': {
        const w = zeile(key).wert;
        objekt.standard[key] = w == null ? 3 : Math.min(5, Math.max(1, halb(w + d)));
        break;
      }
      case 'stdSet': objekt.standard[key] = Number(b.dataset.v); break;
      case 'stdAuto': delete objekt.standard[key]; break;
      case 'mod': {
        const z = mzeile(key);
        (mod.elemente[key] ??= {}).punkte = Math.min(z.element.max, Math.max(0, halb(z.punkte + d)));
        break;
      }
      case 'modAuto': delete mod.elemente[key]?.punkte; break;
      case 'sum': mod.punkte = Math.min(20, Math.max(0, halb(mo.punkte + d))); break;
      case 'sumAuto': delete mod.punkte; break;
      case 'zeit': {
        const e = mod.elemente[key] ??= {};
        e.zeitgemaess = !e.zeitgemaess;
        break;
      }
      case 'methode': mod.methode = b.dataset.v; break;
      case 'grad': mod.grad = b.dataset.v; delete mod.gradPunkte; break;
      case 'gradP': mod.gradPunkte = Math.min(mo.gradInfo.bis, Math.max(mo.gradInfo.von, mo.punkte + d * 2)); break;
      default:
        if (b.dataset.umfang) (mod.elemente[key] ??= {}).umfang = b.dataset.umfang;
        else return;
    }
    rerender();
  };

  content.querySelectorAll('.jahr').forEach(inp => inp.addEventListener('change', () => {
    const v = inp.value.trim();
    (mod.elemente[inp.dataset.key] ??= {}).jahr = /^\d{4}$/.test(v) ? v : '';
    rerender();
  }));
  document.getElementById('mindern')?.addEventListener('change', e => { mod.mindern = e.target.checked; rerender(); });
  const num = (id, fn) => document.getElementById(id).addEventListener('change', e => { fn(e.target.value.trim()); rerender(); });
  num('bj', v => { setPath(objekt, 'baubeschreibung.allgemein.baujahr', v); });
  num('gnd', v => { if (Number(v) > 0) mod.gnd = Number(v); else delete mod.gnd; });
  num('rnd', v => { if (v !== '' && !isNaN(Number(v))) mod.rnd = Number(v); else delete mod.rnd; });
}

function rememberOpenBew(content) {
  content.querySelectorAll('details[data-key]').forEach(d => d.addEventListener('toggle', () => {
    const keys = [...content.querySelectorAll('details[data-key][open]')].map(x => x.dataset.key);
    sessionStorage.setItem('openBew', JSON.stringify(keys));
  }));
}

// ---------- Export ----------
async function renderExport(content, objekt, save) {
  const fotos = await db.getFotos(objekt.id);
  const ohneText = fotos.filter(f => !fotoText(f)).length;
  const groups = ex.baubeschreibungRows(objekt);
  const felder = groups.reduce((n, g) => n + g.rows.length, 0);
  const st = ausstattungsstandard(objekt);
  const mo = modernisierung(objekt);
  const opts = objekt.exportOpts ??= { layout: 2, gruppieren: true };

  content.innerHTML = `
    <section class="card export">
      <h2>Fotodokumentation</h2>
      <p>${fotos.length} Foto${fotos.length === 1 ? '' : 's'}${ohneText ? ` · <span class="warn">${ohneText} ohne Beschriftung</span>` : ''}</p>
      <div class="opt-row"><span>Layout</span>
        <div class="seg" id="layout"><button type="button" data-v="2" class="${opts.layout !== 4 ? 'on' : ''}">2 je Seite</button><button type="button" data-v="4" class="${opts.layout === 4 ? 'on' : ''}">4 je Seite</button></div></div>
      <label class="opt-row"><span>Nach Kategorien gliedern</span><input type="checkbox" id="grp" ${opts.gruppieren !== false ? 'checked' : ''}></label>
      <button class="btn primary" id="docFoto" ${fotos.length ? '' : 'disabled'}>Word-Datei erstellen</button>
      <div class="result" id="resFoto"></div>
    </section>
    <section class="card export">
      <h2>Baubeschreibung</h2>
      <p>${felder} Angaben in ${groups.length} Abschnitten · Standardstufe ${ex.zahl(st.gesamt, 2)} · ${ex.zahl(mo.punkte)} Modernisierungspunkte${mo.rnd != null ? ` · RND ${mo.rnd} J.` : ''}</p>
      <button class="btn primary" id="docBau">Word-Datei erstellen</button>
      <button class="btn" id="txtBau">Als Text kopieren</button>
      <div class="result" id="resBau"></div>
    </section>
    <section class="card export">
      <h2>Sicherung</h2>
      <p>Alle Daten und Fotos dieses Objekts als Datei, z. B. zum Archivieren oder Übertragen auf ein anderes Gerät.</p>
      <button class="btn" id="backup">Sicherung erstellen</button>
      <div class="result" id="resBackup"></div>
    </section>
    <button class="btn danger" id="delObj">Objekt löschen</button>`;

  document.getElementById('layout').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    opts.layout = Number(b.dataset.v);
    e.currentTarget.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    save();
  });
  document.getElementById('grp').onchange = e => { opts.gruppieren = e.target.checked; save(); };

  // iOS erlaubt den Teilen-Dialog nur direkt nach einem Tippen. Deshalb wird
  // zuerst erzeugt und dann ein eigener Button zum Teilen angezeigt.
  const offer = (target, blob, filename) => {
    target.innerHTML = '';
    const b = document.createElement('button');
    b.className = 'btn share';
    b.textContent = `⬆︎ ${filename} teilen / sichern`;
    b.onclick = () => ex.shareOrDownload(blob, filename);
    target.appendChild(b);
  };
  const run = async (btn, res, fn, name) => {
    btn.disabled = true;
    try { offer(res, await fn(), name); }
    catch (err) { console.error(err); res.textContent = 'Fehler: ' + err.message; }
    btn.disabled = false;
  };

  document.getElementById('docFoto').onclick = e => {
    const res = document.getElementById('resFoto');
    run(e.currentTarget, res, () => ex.fotodokuDocx(objekt, fotos, opts, (i, n) => { res.textContent = `Foto ${i} von ${n} …`; }),
      ex.dateiname(objekt, 'Fotodokumentation'));
  };
  document.getElementById('docBau').onclick = e =>
    run(e.currentTarget, document.getElementById('resBau'), () => ex.baubeschreibungDocx(objekt), ex.dateiname(objekt, 'Baubeschreibung'));
  document.getElementById('txtBau').onclick = async () => {
    const text = ex.baubeschreibungText(objekt);
    try { await navigator.clipboard.writeText(text); toast('Baubeschreibung kopiert'); }
    catch { if (navigator.share) navigator.share({ text }).catch(() => {}); }
  };
  document.getElementById('backup').onclick = async e => {
    const res = document.getElementById('resBackup');
    res.textContent = 'Wird erstellt …';
    run(e.currentTarget, res, async () => new Blob([JSON.stringify(await db.exportBackup(objekt.id))], { type: 'application/json' }),
      ex.dateiname(objekt, 'Sicherung', 'json'));
  };
  document.getElementById('delObj').onclick = async () => {
    if (!confirm(`„${ex.titel(objekt)}“ mit allen Fotos endgültig löschen?`)) return;
    pendingSave = null;
    await db.deleteObjekt(objekt.id);
    location.hash = '#/';
  };
}

// ---------- Start ----------
navigator.storage?.persist?.();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js');
}
route();
