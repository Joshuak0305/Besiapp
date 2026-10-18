// Erzeugt Fotodokumentation und Baubeschreibung als PDF (jsPDF) sowie als Text.
import { BAUBESCHREIBUNG, STANDARD_MERKMALE, standardStufe } from './schema.js';

const PAGE_W = 210, PAGE_H = 297, M = 20, CONTENT_W = PAGE_W - 2 * M;
const FOOTER_Y = PAGE_H - 12;

export function formatDatum(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export function adresse(sd) {
  return [sd.strasse, [sd.plz, sd.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

export function titel(objekt) {
  const sd = objekt.stammdaten || {};
  return sd.bezeichnung || adresse(sd) || 'Unbenanntes Objekt';
}

function newDoc() {
  const { jsPDF } = window.jspdf;
  return new jsPDF({ unit: 'mm', format: 'a4', compress: true });
}

function addFooters(doc, label) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.setDrawColor(200);
    doc.line(M, FOOTER_Y - 4, PAGE_W - M, FOOTER_Y - 4);
    doc.text(label, M, FOOTER_Y);
    doc.text(`Seite ${i} von ${n}`, PAGE_W - M, FOOTER_Y, { align: 'right' });
  }
  doc.setTextColor(0);
}

function titleBlock(doc, heading, objekt, extraRows = []) {
  const sd = objekt.stammdaten || {};
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(heading, M, M + 8);
  doc.setFontSize(12);
  doc.text(titel(objekt), M, M + 16);
  let y = M + 26;
  const rows = [
    ['Objekt', adresse(sd)],
    ['Aktenzeichen', sd.aktenzeichen],
    ['Auftraggeber', sd.auftraggeber],
    ['Besichtigung', [formatDatum(sd.datum), sd.uhrzeit ? `${sd.uhrzeit} Uhr` : ''].filter(Boolean).join(', ')],
    ...extraRows,
  ].filter(r => r[1]);
  doc.setFontSize(10);
  for (const [k, v] of rows) {
    doc.setFont('helvetica', 'bold');
    doc.text(k + ':', M, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(v), CONTENT_W - 40);
    doc.text(lines, M + 40, y);
    y += lines.length * 5;
  }
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(M, y, PAGE_W - M, y);
  doc.setLineWidth(0.2);
  return y + 8;
}

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
    img.onerror = () => { reject(new Error('Bild konnte nicht geladen werden')); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

// Verkleinert ein Foto für das PDF, damit die Datei handlich bleibt.
async function prepareImage(blob, maxEdge = 1600) {
  const img = await loadImage(blob);
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  return { data: c.toDataURL('image/jpeg', 0.82), w, h };
}

export async function fotodokuPdf(objekt, fotos, onProgress) {
  const doc = newDoc();
  let y = titleBlock(doc, 'Fotodokumentation', objekt, [['Anzahl Fotos', String(fotos.length)]]);
  const maxImgH = 105;
  const bottom = FOOTER_Y - 10;

  for (let i = 0; i < fotos.length; i++) {
    onProgress?.(i + 1, fotos.length);
    const f = fotos[i];
    const img = await prepareImage(f.blob);
    const ratio = img.w / img.h;
    let w = CONTENT_W, h = w / ratio;
    if (h > maxImgH) { h = maxImgH; w = h * ratio; }

    doc.setFontSize(10);
    const caption = `Foto ${i + 1}` + (f.caption ? `: ${f.caption}` : '');
    const capLines = doc.splitTextToSize(caption, CONTENT_W);
    const slotH = h + 4 + capLines.length * 5 + 8;

    if (y + slotH > bottom) { doc.addPage(); y = M; }

    const x = M + (CONTENT_W - w) / 2;
    doc.addImage(img.data, 'JPEG', x, y, w, h, undefined, 'FAST');
    doc.setDrawColor(180);
    doc.rect(x, y, w, h);
    y += h + 5;
    doc.setFont('helvetica', 'bold');
    doc.text(capLines[0], M, y);
    if (capLines.length > 1) {
      doc.setFont('helvetica', 'normal');
      doc.text(capLines.slice(1), M, y + 5);
    }
    y += capLines.length * 5 + 8;
  }
  addFooters(doc, `Fotodokumentation – ${titel(objekt)}`);
  return doc.output('blob');
}

// Liefert die befüllten Gruppen der Baubeschreibung: [{title, rows:[[label, text]]}]
export function baubeschreibungRows(objekt) {
  const bb = objekt.baubeschreibung || {};
  return BAUBESCHREIBUNG.map(g => ({
    title: g.title,
    rows: g.fields
      .map(f => [f.label, (bb[g.key]?.[f.key] || '').trim()])
      .filter(r => r[1]),
  })).filter(g => g.rows.length);
}

function standardRows(objekt) {
  const s = objekt.standard || {};
  const rows = STANDARD_MERKMALE.filter(m => s[m.key]).map(m => [m.label, `Stufe ${s[m.key]} (Wägungsanteil ${m.weight} %)`]);
  const res = standardStufe(s);
  if (res) rows.push(['Gewichtete Standardstufe', res.stufe.toFixed(1).replace('.', ',') + (res.vollstaendig ? '' : ' (unvollständig)')]);
  return rows;
}

export function baubeschreibungPdf(objekt) {
  const doc = newDoc();
  let y = titleBlock(doc, 'Baubeschreibung', objekt);
  const bottom = FOOTER_Y - 10;
  const labelW = 52;

  const groups = baubeschreibungRows(objekt);
  const std = standardRows(objekt);
  if (std.length) groups.push({ title: 'Gebäudestandard (NHK 2010)', rows: std });

  for (const g of groups) {
    if (y + 16 > bottom) { doc.addPage(); y = M; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(g.title, M, y);
    y += 7;
    doc.setFontSize(10);
    for (const [label, text] of g.rows) {
      const labelLines = doc.splitTextToSize(label + ':', labelW - 3);
      const lines = doc.splitTextToSize(text, CONTENT_W - labelW);
      const h = Math.max(lines.length, labelLines.length) * 5;
      if (y + h > bottom) { doc.addPage(); y = M; }
      doc.setFont('helvetica', 'bold');
      doc.text(labelLines, M, y);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, M + labelW, y);
      y += h + 1.5;
    }
    y += 5;
  }
  if (!groups.length) {
    doc.setFont('helvetica', 'italic');
    doc.text('Noch keine Angaben erfasst.', M, y);
  }
  addFooters(doc, `Baubeschreibung – ${titel(objekt)}`);
  return doc.output('blob');
}

export function baubeschreibungText(objekt) {
  const out = ['BAUBESCHREIBUNG', titel(objekt)];
  const sd = objekt.stammdaten || {};
  if (adresse(sd)) out.push(adresse(sd));
  if (sd.datum) out.push(`Besichtigung am ${formatDatum(sd.datum)}`);
  const groups = baubeschreibungRows(objekt);
  const std = standardRows(objekt);
  if (std.length) groups.push({ title: 'Gebäudestandard (NHK 2010)', rows: std });
  for (const g of groups) {
    out.push('', g.title.toUpperCase());
    for (const [label, text] of g.rows) out.push(`${label}: ${text}`);
  }
  return out.join('\n');
}

export function dateiname(objekt, art) {
  const base = titel(objekt).replace(/[^\wäöüÄÖÜß\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 50);
  return `${art}_${base || 'Objekt'}.pdf`;
}

// Teilen-Dialog des iPhones (Speichern in Dateien, AirDrop, Mail …), sonst Download.
export async function shareOrDownload(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
