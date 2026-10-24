// Erzeugt Fotodokumentation und Baubeschreibung als Word-Dokument (.docx).
// Die Dateien werden direkt als WordprocessingML geschrieben und mit JSZip gepackt.
import { freeCanvas } from './markup.js';
import { BAUBESCHREIBUNG, ausstattungsstandard, modernisierung, fotoKategorie, fotoText, sortiereFotos } from './schema.js';

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

export const zahl = (n, d = 1) => n == null ? '–' : n.toFixed(d).replace('.', ',').replace(/(,\d*?)0+$/, '$1').replace(/,$/, '');

export function dateiname(objekt, art, ext = 'docx') {
  const base = titel(objekt).replace(/[^\wäöüÄÖÜß\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 50);
  return `${art}_${base || 'Objekt'}.${ext}`;
}

// ---------- WordprocessingML-Bausteine ----------
const CM = 360000;            // EMU pro Zentimeter
const TW_CM = 567;            // Twips pro Zentimeter
const CONTENT_TW = 9070;      // A4 mit 2,5 cm Rändern = 16 cm Satzspiegel

const x = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function run(text, { bold, italic, size, color } = {}) {
  const rpr = [bold && '<w:b/>', italic && '<w:i/>', color && `<w:color w:val="${color}"/>`, size && `<w:sz w:val="${size * 2}"/>`]
    .filter(Boolean).join('');
  const parts = String(text ?? '').split('\n');
  return parts.map((t, i) => `<w:r>${rpr ? `<w:rPr>${rpr}</w:rPr>` : ''}${i ? '<w:br/>' : ''}<w:t xml:space="preserve">${x(t)}</w:t></w:r>`).join('');
}

function para(content, { style, align, keepNext, spacingAfter, pageBreakBefore } = {}) {
  const ppr = [
    style && `<w:pStyle w:val="${style}"/>`,
    keepNext && '<w:keepNext/>',
    pageBreakBefore && '<w:pageBreakBefore/>',
    spacingAfter != null && `<w:spacing w:after="${spacingAfter}"/>`,
    align && `<w:jc w:val="${align}"/>`,
  ].filter(Boolean).join('');
  return `<w:p>${ppr ? `<w:pPr>${ppr}</w:pPr>` : ''}${content}</w:p>`;
}

function field(instr, cached) {
  return `<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> ${instr} </w:instrText></w:r>`
    + `<w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>${x(cached)}</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>`;
}

function cell(content, widthTw, { shade, vAlign } = {}) {
  const tcpr = `<w:tcW w:w="${widthTw}" w:type="dxa"/>${shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${shade}"/>` : ''}${vAlign ? `<w:vAlign w:val="${vAlign}"/>` : ''}`;
  return `<w:tc><w:tcPr>${tcpr}</w:tcPr>${content || '<w:p/>'}</w:tc>`;
}

function table(rows, widths, { borders = 'lines', header = false } = {}) {
  const b = borders === 'none'
    ? '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>'
    : '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="A6A6A6"/><w:left w:val="nil"/><w:bottom w:val="single" w:sz="4" w:color="A6A6A6"/><w:right w:val="nil"/><w:insideH w:val="single" w:sz="4" w:color="D9D9D9"/><w:insideV w:val="nil"/></w:tblBorders>';
  const grid = widths.map(w => `<w:gridCol w:w="${w}"/>`).join('');
  const trs = rows.map((cells, i) => `<w:tr><w:trPr><w:cantSplit/>${header && i === 0 ? '<w:tblHeader/>' : ''}</w:trPr>${cells.join('')}</w:tr>`).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${widths.reduce((a, c) => a + c, 0)}" w:type="dxa"/>${b}<w:tblLayout w:type="fixed"/>`
    + `<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr>`
    + `<w:tblGrid>${grid}</w:tblGrid>${trs}</w:tbl>`;
}

const cellPara = (text, opts = {}) => para(run(text, opts), { spacingAfter: 0, align: opts.align });

function imageRun(rid, id, cx, cy) {
  return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/>`
    + `<wp:docPr id="${id}" name="Foto ${id}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>`
    + `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>`
    + `<pic:nvPicPr><pic:cNvPr id="${id}" name="foto${id}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr>`
    + `<pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`
    + `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>`
    + `<a:ln w="6350"><a:solidFill><a:srgbClr val="A6A6A6"/></a:solidFill></a:ln></pic:spPr>`
    + `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
  + 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
  + 'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
  + 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
  + 'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="de-DE"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="60"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="240"/></w:pPr><w:rPr><w:sz w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="280" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Caption"><w:name w:val="caption"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="60" w:after="280"/></w:pPr><w:rPr><w:sz w:val="19"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Footer"><w:name w:val="footer"/><w:basedOn w:val="Normal"/><w:pPr><w:tabs><w:tab w:val="right" w:pos="${CONTENT_TW}"/></w:tabs><w:spacing w:after="0"/></w:pPr><w:rPr><w:color w:val="7F7F7F"/><w:sz w:val="16"/></w:rPr></w:style>
<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>`;

async function packDocx(bodyXml, footerText, images, docTitle) {
  const zip = new window.JSZip();
  const imgRels = images.map(img => `<Relationship Id="${img.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${img.name}"/>`).join('');
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="jpeg" ContentType="image/jpeg"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`);
  zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${x(docTitle)}</dc:title><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created>
</cp:coreProperties>`);
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
${imgRels}
</Relationships>`);
  zip.file('word/styles.xml', STYLES);
  zip.file('word/settings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="708"/><w:characterSpacingControl w:val="doNotCompress"/>
<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`);
  zip.file('word/footer1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr ${NS}><w:p><w:pPr><w:pStyle w:val="Footer"/><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="BFBFBF"/></w:pBdr></w:pPr>
${run(footerText)}<w:r><w:tab/></w:r>${run('Seite ')}${field('PAGE', '1')}${run(' von ')}${field('NUMPAGES', '1')}</w:p></w:ftr>`);
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${NS}><w:body>${bodyXml}<w:p/>
<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/>
<w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="709" w:footer="567" w:gutter="0"/></w:sectPr>
</w:body></w:document>`);
  for (const img of images) zip.file(`word/media/${img.name}`, img.data);
  return zip.generateAsync({
    type: 'blob', compression: 'DEFLATE',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

function kopf(heading, objekt, extraRows = []) {
  const sd = objekt.stammdaten || {};
  const rows = [
    ['Objekt', adresse(sd)],
    ['Aktenzeichen', sd.aktenzeichen],
    ['Auftraggeber', sd.auftraggeber],
    ['Besichtigung', [formatDatum(sd.datum), sd.uhrzeit ? `${sd.uhrzeit} Uhr` : ''].filter(Boolean).join(', ')],
    ['Wertermittlungsstichtag', formatDatum(sd.stichtag)],
    ...extraRows,
  ].filter(r => r[1]);
  const w1 = Math.round(4.5 * TW_CM), w2 = CONTENT_TW - w1;
  return para(run(heading), { style: 'Title' })
    + para(run(titel(objekt)), { style: 'Subtitle' })
    + (rows.length ? table(rows.map(([k, v]) => [cell(cellPara(k, { bold: true }), w1), cell(cellPara(v), w2)]), [w1, w2]) : '')
    + para('', { spacingAfter: 120 });
}

// ---------- Fotodokumentation ----------
function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
    img.onerror = () => { reject(new Error('Bild konnte nicht geladen werden')); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

async function prepareImage(blob, maxEdge) {
  const img = await loadImage(blob);
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  const out = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
  freeCanvas(c);
  if (!out) throw new Error('Zu wenig Speicher beim Verarbeiten der Fotos.');
  return { data: await out.arrayBuffer(), w, h };
}

function fit(w, h, maxWcm, maxHcm) {
  const r = w / h;
  let cw = maxWcm, ch = cw / r;
  if (ch > maxHcm) { ch = maxHcm; cw = ch * r; }
  return [Math.round(cw * CM), Math.round(ch * CM)];
}

function captionPara(nr, text) {
  return para(run('Foto ', { bold: true }) + field('SEQ Foto \\* ARABIC', nr).replace('<w:r><w:t>', '<w:r><w:rPr><w:b/></w:rPr><w:t>')
    + (text ? run(': ', { bold: true }) + run(text) : ''), { style: 'Caption' });
}

// opts.layout: 2 = zwei große Fotos je Seite, 4 = vier Fotos (2 × 2) je Seite
export async function fotodokuDocx(objekt, fotosRaw, opts = {}, onProgress) {
  const layout = opts.layout === 4 ? 4 : 2;
  const gruppieren = opts.gruppieren !== false;
  const fotos = sortiereFotos(fotosRaw);
  const images = [];
  const blocks = [];
  for (let i = 0; i < fotos.length; i++) {
    onProgress?.(i + 1, fotos.length);
    const img = await prepareImage(fotos[i].blob, layout === 4 ? 1200 : 1800);
    const rid = `rIdImg${i + 1}`;
    images.push({ rid, name: `foto${i + 1}.jpeg`, data: img.data });
    blocks.push({ foto: fotos[i], nr: i + 1, rid, w: img.w, h: img.h });
  }

  // In Gruppen je Kategorie aufteilen (oder eine Gruppe ohne Überschrift).
  const gruppen = [];
  for (const b of blocks) {
    const kat = gruppieren ? fotoKategorie(b.foto).label : '';
    if (!gruppen.length || gruppen.at(-1).kat !== kat) gruppen.push({ kat, items: [] });
    gruppen.at(-1).items.push(b);
  }

  let body = kopf('Fotodokumentation', objekt, [['Anzahl Fotos', String(fotos.length)]]);
  gruppen.forEach((g, gi) => {
    if (g.kat) body += para(run(g.kat), { style: 'Heading1', pageBreakBefore: layout === 2 && gi > 0 });
    if (layout === 2) {
      for (const b of g.items) {
        const [cx, cy] = fit(b.w, b.h, 16, 10);
        body += para(imageRun(b.rid, b.nr, cx, cy), { align: 'center', keepNext: true, spacingAfter: 0 });
        body += captionPara(b.nr, fotoText(b.foto));
      }
    } else {
      const half = CONTENT_TW / 2;
      const rows = [];
      for (let i = 0; i < g.items.length; i += 2) {
        rows.push(g.items.slice(i, i + 2).map(b => {
          const [cx, cy] = fit(b.w, b.h, 7.6, 6.2);
          return cell(para(imageRun(b.rid, b.nr, cx, cy), { align: 'center', keepNext: true, spacingAfter: 0 })
            + captionPara(b.nr, fotoText(b.foto)), half);
        }));
        if (rows.at(-1).length === 1) rows.at(-1).push(cell('', half));
      }
      body += table(rows, [half, half], { borders: 'none' }) + para('', { spacingAfter: 0 });
    }
  });
  return packDocx(body, `Fotodokumentation – ${titel(objekt)}`, images, `Fotodokumentation – ${titel(objekt)}`);
}

// ---------- Baubeschreibung ----------
export function baubeschreibungRows(objekt) {
  const bb = objekt.baubeschreibung || {};
  return BAUBESCHREIBUNG.map(g => ({
    title: g.title,
    rows: g.fields.map(f => [f.label, (bb[g.key]?.[f.key] || '').trim()]).filter(r => r[1]),
  })).filter(g => g.rows.length);
}

function kvTable(rows) {
  const w1 = Math.round(5 * TW_CM), w2 = CONTENT_TW - w1;
  return table(rows.map(([k, v]) => [cell(cellPara(k, { bold: true }), w1), cell(cellPara(v), w2)]), [w1, w2]);
}

export async function baubeschreibungDocx(objekt) {
  let body = kopf('Baubeschreibung', objekt);
  const groups = baubeschreibungRows(objekt);
  for (const g of groups) body += para(run(g.title), { style: 'Heading1' }) + kvTable(g.rows);
  if (!groups.length) body += para(run('Noch keine Angaben erfasst.', { italic: true }));

  // Ausstattungsstandard
  const st = ausstattungsstandard(objekt);
  if (st.gesamt != null) {
    body += para(run('Ausstattungsstandard (Anlage 4 ImmoWertV)'), { style: 'Heading1' });
    const ws = [3.9, 1.6, 1.4, 9.1].map(c => Math.round(c * TW_CM));
    ws[3] = CONTENT_TW - ws[0] - ws[1] - ws[2];
    const head = ['Merkmal', 'Wägung', 'Stufe', 'Grundlage'].map((t, i) => cell(cellPara(t, { bold: true, align: i === 1 || i === 2 ? 'center' : undefined }), ws[i], { shade: 'F2F2F2' }));
    const rows = [head];
    for (const z of st.zeilen) {
      const grundlage = z.manuell
        ? 'sachverständige Einstufung' + (z.vorschlag ? ` (Vorschlag ${zahl(z.vorschlag.wert)})` : '')
        : z.vorschlag ? z.vorschlag.gruende.map(g => g.term).join(', ') : '–';
      rows.push([
        cell(cellPara(z.merkmal.label), ws[0]),
        cell(cellPara(`${z.merkmal.weight} %`, { align: 'center' }), ws[1]),
        cell(cellPara(zahl(z.wert), { align: 'center' }), ws[2]),
        cell(cellPara(grundlage, { size: 9 }), ws[3]),
      ]);
    }
    rows.push([
      cell(cellPara('Gewichtete Standardstufe', { bold: true }), ws[0], { shade: 'F2F2F2' }),
      cell(cellPara('100 %', { bold: true, align: 'center' }), ws[1], { shade: 'F2F2F2' }),
      cell(cellPara(zahl(st.gesamt, 2), { bold: true, align: 'center' }), ws[2], { shade: 'F2F2F2' }),
      cell(cellPara(st.vollstaendig ? '' : 'nicht alle Merkmale eingestuft', { size: 9 }), ws[3], { shade: 'F2F2F2' }),
    ]);
    body += table(rows, ws, { header: true });
  }

  // Modernisierung
  const mo = modernisierung(objekt);
  const hatModernisierung = mo.methode === 'grad' || mo.zeilen.some(z => z.eintrag.jahr || z.eintrag.zeitgemaess || z.manuell) || mo.summeManuell || mo.rndManuell || mo.baujahr;
  if (hatModernisierung) {
    body += para(run('Modernisierung und Restnutzungsdauer (Anlage 2 ImmoWertV)'), { style: 'Heading1' });
    if (mo.methode === 'grad') {
      body += para(run('Die Modernisierungspunkte wurden auf Grundlage einer sachverständigen Einschätzung des Modernisierungsgrades ermittelt (Anlage 2 Nr. 2 ImmoWertV, Tabelle 2).'));
    } else {
      const ws = [9.6, 2.1, 2.1, 2.2].map(c => Math.round(c * TW_CM));
      ws[0] = CONTENT_TW - ws[1] - ws[2] - ws[3];
      const head = ['Modernisierungselement', 'Jahr', 'max.', 'Punkte'].map((t, i) => cell(cellPara(t, { bold: true, align: i ? 'center' : undefined }), ws[i], { shade: 'F2F2F2' }));
      const rows = [head, ...mo.zeilen.map(z => [
        cell(cellPara(z.element.label + (z.eintrag.umfang === 'teil' ? ' (teilweise)' : '')), ws[0]),
        cell(cellPara(z.eintrag.zeitgemaess ? 'zeitgemäß¹' : z.eintrag.jahr || '–', { align: 'center' }), ws[1]),
        cell(cellPara(String(z.element.max), { align: 'center' }), ws[2]),
        cell(cellPara(zahl(z.punkte), { align: 'center' }), ws[3]),
      ])];
      rows.push([
        cell(cellPara('Summe Modernisierungspunkte' + (mo.summeManuell ? ' (sachverständig angepasst)' : ''), { bold: true }), ws[0], { shade: 'F2F2F2' }),
        cell(cellPara(''), ws[1], { shade: 'F2F2F2' }),
        cell(cellPara('20', { bold: true, align: 'center' }), ws[2], { shade: 'F2F2F2' }),
        cell(cellPara(zahl(mo.punkte), { bold: true, align: 'center' }), ws[3], { shade: 'F2F2F2' }),
      ]);
      body += table(rows, ws, { header: true });
      const notes = [];
      if (mo.zeilen.some(z => z.eintrag.zeitgemaess)) notes.push('¹ nicht modernisiert, genügt jedoch noch zeitgemäßen Ansprüchen; mit einer Modernisierung vergleichbare Punkte vergeben.');
      if (mo.mindern) notes.push('Länger zurückliegende Maßnahmen wurden gemindert berücksichtigt (bis 10 Jahre volle, 11–20 Jahre halbe Punktzahl).');
      body += notes.length ? para(run(notes.join('\n'), { size: 9 }), { spacingAfter: 120 }) : para('', { spacingAfter: 0 });
    }
    body += kvTable([
      ['Modernisierungsgrad', `${mo.grad} (${zahl(mo.punkte)} Punkte${mo.methode === 'grad' ? `, Spanne ${mo.gradInfo.von}–${mo.gradInfo.bis}` : ''})`],
      ['Baujahr', mo.baujahr ? String(mo.baujahr) : '–'],
      ['Gesamtnutzungsdauer', `${mo.gnd} Jahre`],
      ['Gebäudealter zum Stichtag', mo.alter != null ? `${mo.alter} Jahre (Stichtag ${mo.stichtagJahr})` : '–'],
      ['Restnutzungsdauer', mo.rnd != null ? `${mo.rnd} Jahre${mo.rndManuell ? ' (sachverständig angepasst' + (mo.rndAuto != null ? `, rechnerisch ${mo.rndAuto} Jahre)` : ')') : ' (modifiziert nach Anlage 2 ImmoWertV)'}` : '–'],
      ['Fiktives Baujahr', mo.fiktivesBaujahr != null ? String(mo.fiktivesBaujahr) : '–'],
    ]);
  }
  return packDocx(body, `Baubeschreibung – ${titel(objekt)}`, [], `Baubeschreibung – ${titel(objekt)}`);
}

export function baubeschreibungText(objekt) {
  const out = ['BAUBESCHREIBUNG', titel(objekt)];
  const sd = objekt.stammdaten || {};
  if (adresse(sd)) out.push(adresse(sd));
  if (sd.datum) out.push(`Besichtigung am ${formatDatum(sd.datum)}`);
  for (const g of baubeschreibungRows(objekt)) {
    out.push('', g.title.toUpperCase());
    for (const [label, text] of g.rows) out.push(`${label}: ${text}`);
  }
  const st = ausstattungsstandard(objekt);
  if (st.gesamt != null) {
    out.push('', 'AUSSTATTUNGSSTANDARD (ANLAGE 4 IMMOWERTV)');
    for (const z of st.zeilen) out.push(`${z.merkmal.label} (${z.merkmal.weight} %): ${zahl(z.wert)}`);
    out.push(`Gewichtete Standardstufe: ${zahl(st.gesamt, 2)}`);
  }
  const mo = modernisierung(objekt);
  out.push('', 'MODERNISIERUNG (ANLAGE 2 IMMOWERTV)');
  if (mo.methode === 'grad') out.push('Sachverständige Einschätzung des Modernisierungsgrades (Tabelle 2)');
  else for (const z of mo.zeilen) if (z.punkte || z.eintrag.jahr) out.push(`${z.element.label}: ${z.eintrag.zeitgemaess ? 'zeitgemäß, nicht modernisiert' : z.eintrag.jahr || '–'}, ${zahl(z.punkte)} von ${z.element.max} Punkten`);
  out.push(`Modernisierungspunkte: ${zahl(mo.punkte)} (${mo.grad})`);
  if (mo.rnd != null) out.push(`Restnutzungsdauer: ${mo.rnd} Jahre, fiktives Baujahr ${mo.fiktivesBaujahr}`);
  return out.join('\n');
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
