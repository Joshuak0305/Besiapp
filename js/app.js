import * as db from './db.js';
import { STAMMDATEN, BAUBESCHREIBUNG, STANDARD_MERKMALE, FOTO_CHIPS, standardStufe } from './schema.js';
import * as ex from './export.js';
import { openMarkup } from './markup.js';

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
    const fotos = await db.getFotos(o.id);
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
  ['bau', 'Baubeschreibung', '🏗️'],
  ['fotos', 'Fotos', '📷'],
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
  else if (tab === 'export') await renderExport(content, objekt);
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
  root.querySelectorAll('.chips').forEach(box => {
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

function renderBau(content, objekt, save) {
  const open = JSON.parse(sessionStorage.getItem('openGroups') || '["allgemein"]');
  const groups = BAUBESCHREIBUNG.map(g => `
    <details class="card group" data-key="${g.key}" ${open.includes(g.key) ? 'open' : ''}>
      <summary><span>${esc(g.title)}</span><small class="prog">${groupProgress(objekt, g)}</small></summary>
      <div class="form">${g.fields.map(f => fieldHtml(f, getPath(objekt, `baubeschreibung.${g.key}.${f.key}`), `baubeschreibung.${g.key}.${f.key}`)).join('')}</div>
    </details>`).join('');

  const std = objekt.standard || {};
  const stdHtml = `
    <details class="card group" data-key="standard" ${open.includes('standard') ? 'open' : ''}>
      <summary><span>Gebäudestandard (NHK 2010)</span><small class="prog" id="stdres"></small></summary>
      <p class="hint">Standardstufe 1 (einfach) bis 5 (stark gehoben) je Merkmal, gewichtet nach Wägungsanteil (Ein-/Zweifamilienhäuser). Nochmal tippen hebt die Auswahl auf.</p>
      ${STANDARD_MERKMALE.map(m => `
        <div class="std-row">
          <span>${esc(m.label)} <small>${m.weight} %</small></span>
          <div class="seg" data-key="${m.key}">${[1, 2, 3, 4, 5].map(n =>
            `<button type="button" class="${String(std[m.key]) === String(n) ? 'on' : ''}">${n}</button>`).join('')}</div>
        </div>`).join('')}
    </details>`;

  content.innerHTML = groups + stdHtml;

  content.querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => {
    const keys = [...content.querySelectorAll('details[open]')].map(x => x.dataset.key);
    sessionStorage.setItem('openGroups', JSON.stringify(keys));
    d.querySelectorAll('textarea').forEach(autoGrow);
  }));

  bindFields(content, objekt, save, el => {
    const d = el.closest('details');
    const g = BAUBESCHREIBUNG.find(x => x.key === d.dataset.key);
    if (g) d.querySelector('.prog').textContent = groupProgress(objekt, g);
  });

  const updateStd = () => {
    const r = standardStufe(objekt.standard);
    document.getElementById('stdres').textContent = r ? 'Stufe ' + r.stufe.toFixed(1).replace('.', ',') : '';
  };
  updateStd();
  content.querySelectorAll('.seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    objekt.standard ??= {};
    const key = seg.dataset.key;
    if (String(objekt.standard[key]) === b.textContent) delete objekt.standard[key];
    else objekt.standard[key] = Number(b.textContent);
    seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', String(objekt.standard[key]) === x.textContent));
    updateStd();
    save();
  }));
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
    return await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function addFiles(objekt, files) {
  const existing = await db.getFotos(objekt.id);
  let order = existing.length ? existing.at(-1).order + 1 : 0;
  let lastId = null;
  for (const file of files) {
    const blob = await processImage(file);
    const foto = { id: db.uid(), objektId: objekt.id, order: order++, blob, caption: '', createdAt: Date.now() };
    await db.putFoto(foto);
    lastId = foto.id;
  }
  await db.putObjekt(objekt);
  return lastId;
}

async function renderFotos(content, objekt) {
  const fotos = await db.getFotos(objekt.id);
  content.innerHTML = `
    <div class="photo-actions">
      <label class="btn primary">📷 Kamera<input type="file" accept="image/*" capture="environment" id="cam" hidden></label>
      <label class="btn">🖼️ Mediathek<input type="file" accept="image/*" multiple id="lib" hidden></label>
    </div>
    ${fotos.length ? `<p class="hint">Foto antippen zum Beschriften. Die Reihenfolge entspricht der Nummerierung in der Fotodokumentation.</p>
    <div class="grid">${fotos.map((f, i) => `
      <a class="tile" href="#/o/${objekt.id}/foto/${f.id}">
        <img src="${objectUrl(f.blob)}" alt="" loading="lazy">
        <span class="num">${i + 1}</span>
        <span class="cap ${f.caption ? '' : 'missing'}">${esc(f.caption) || 'Ohne Beschriftung'}</span>
      </a>`).join('')}</div>`
      : '<div class="empty">Noch keine Fotos.</div>'}`;

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
}

async function renderFoto(objekt, fotoId) {
  const fotos = await db.getFotos(objekt.id);
  const idx = fotos.findIndex(f => f.id === fotoId);
  if (idx < 0) { location.hash = `#/o/${objekt.id}/fotos`; return; }
  const foto = fotos[idx];
  const back = `#/o/${objekt.id}/fotos`;
  const save = debounce(() => db.putFoto(foto));
  pendingSave = save;

  $app.innerHTML = `
    ${header(`Foto ${idx + 1} von ${fotos.length}`, { back })}
    <main class="page foto-edit">
      <div class="photo-view"><img src="${objectUrl(foto.blob)}" alt=""></div>
      <section class="card form">
        <div class="field">
          <label for="cap">Beschriftung</label>
          <textarea id="cap" rows="2" placeholder="z. B. Ansicht von Süden" autocapitalize="sentences">${esc(foto.caption)}</textarea>
          <div class="chips" id="capchips">${FOTO_CHIPS.map(c => `<button type="button" class="chip">${esc(c)}</button>`).join('')}</div>
        </div>
      </section>
      <div class="btn-row">
        <button class="btn" id="mark">✏️ Markieren</button>
        ${foto.original ? '<button class="btn" id="orig">↺ Original</button>' : ''}
      </div>
      <div class="btn-row">
        <button class="btn" id="up" ${idx === 0 ? 'disabled' : ''}>← Nach vorne</button>
        <button class="btn" id="down" ${idx === fotos.length - 1 ? 'disabled' : ''}>Nach hinten →</button>
      </div>
      <div class="btn-row">
        <button class="btn" id="prev" ${idx === 0 ? 'disabled' : ''}>‹ Vorheriges</button>
        <button class="btn" id="next" ${idx === fotos.length - 1 ? 'disabled' : ''}>Nächstes ›</button>
      </div>
      <button class="btn danger" id="del">Foto löschen</button>
    </main>`;

  const cap = document.getElementById('cap');
  autoGrow(cap);
  cap.addEventListener('input', () => { foto.caption = cap.value; autoGrow(cap); save(); });
  // Chips ergänzen die Beschriftung (z. B. „Mangel:“ + Freitext oder „Küche“ + „EG“).
  document.getElementById('capchips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const t = chip.textContent;
    const v = cap.value.trimEnd();
    cap.value = !v ? t : v.endsWith(':') ? `${v} ${t}` : `${v}, ${t}`;
    if (t.endsWith(':')) cap.value += ' ';
    cap.dispatchEvent(new Event('input'));
    if (t.endsWith(':')) cap.focus();
  });

  const go = id => { location.hash = `#/o/${objekt.id}/foto/${id}`; };
  const swap = async other => {
    save.flush();
    [foto.order, other.order] = [other.order, foto.order];
    await db.putFotos([foto, other]);
    route();
  };
  document.getElementById('prev').onclick = () => go(fotos[idx - 1].id);
  document.getElementById('next').onclick = () => go(fotos[idx + 1].id);
  document.getElementById('up').onclick = () => swap(fotos[idx - 1]);
  document.getElementById('down').onclick = () => swap(fotos[idx + 1]);
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

// ---------- Export ----------
async function renderExport(content, objekt) {
  const fotos = await db.getFotos(objekt.id);
  const ohneText = fotos.filter(f => !f.caption?.trim()).length;
  const groups = ex.baubeschreibungRows(objekt);
  const felder = groups.reduce((n, g) => n + g.rows.length, 0);

  content.innerHTML = `
    <section class="card export">
      <h2>Fotodokumentation</h2>
      <p>${fotos.length} Foto${fotos.length === 1 ? '' : 's'}${ohneText ? ` · <span class="warn">${ohneText} ohne Beschriftung</span>` : ''}</p>
      <button class="btn primary" id="pdfFoto" ${fotos.length ? '' : 'disabled'}>PDF erstellen</button>
      <div class="result" id="resFoto"></div>
    </section>
    <section class="card export">
      <h2>Baubeschreibung</h2>
      <p>${felder} Angaben in ${groups.length} Abschnitten</p>
      <button class="btn primary" id="pdfBau">PDF erstellen</button>
      <button class="btn" id="txtBau">Text kopieren (für Word)</button>
      <div class="result" id="resBau"></div>
    </section>
    <section class="card export">
      <h2>Sicherung</h2>
      <p>Alle Daten und Fotos dieses Objekts als Datei, z. B. zum Archivieren oder Übertragen auf ein anderes Gerät.</p>
      <button class="btn" id="backup">Sicherung erstellen</button>
      <div class="result" id="resBackup"></div>
    </section>
    <button class="btn danger" id="delObj">Objekt löschen</button>`;

  // iOS erlaubt den Teilen-Dialog nur direkt nach einem Tippen. Deshalb wird
  // zuerst erzeugt und dann ein eigener Button zum Teilen angezeigt.
  const offer = (target, blob, filename) => {
    target.innerHTML = `<button class="btn share">⬆︎ ${esc(filename)} teilen / sichern</button>
      <a class="btn link" target="_blank" rel="noopener">Ansehen</a>`;
    const url = objectUrl(blob);
    target.querySelector('a').href = url;
    target.querySelector('.share').onclick = () => ex.shareOrDownload(blob, filename);
  };

  document.getElementById('pdfFoto').onclick = async e => {
    const btn = e.currentTarget, res = document.getElementById('resFoto');
    btn.disabled = true;
    try {
      const blob = await ex.fotodokuPdf(objekt, fotos, (i, n) => { res.textContent = `Foto ${i} von ${n} …`; });
      offer(res, blob, ex.dateiname(objekt, 'Fotodokumentation'));
    } catch (err) { res.textContent = 'Fehler: ' + err.message; }
    btn.disabled = false;
  };
  document.getElementById('pdfBau').onclick = () => {
    offer(document.getElementById('resBau'), ex.baubeschreibungPdf(objekt), ex.dateiname(objekt, 'Baubeschreibung'));
  };
  document.getElementById('txtBau').onclick = async () => {
    const text = ex.baubeschreibungText(objekt);
    try { await navigator.clipboard.writeText(text); toast('Baubeschreibung kopiert'); }
    catch { if (navigator.share) navigator.share({ text }).catch(() => {}); }
  };
  document.getElementById('backup').onclick = async () => {
    const res = document.getElementById('resBackup');
    res.textContent = 'Wird erstellt …';
    const data = await db.exportBackup(objekt.id);
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const name = ex.dateiname(objekt, 'Sicherung').replace(/\.pdf$/, '.json');
    res.innerHTML = '';
    const b = document.createElement('button');
    b.className = 'btn share';
    b.textContent = `⬆︎ ${name} teilen / sichern`;
    b.onclick = () => ex.shareOrDownload(blob, name);
    res.appendChild(b);
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
