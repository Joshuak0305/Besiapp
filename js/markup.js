// Vollbild-Editor zum Einzeichnen von Markierungen (Stift, Pfeil, Kreis) in ein Foto.
//
// Für iOS ausgelegt: Angezeigt wird ein kleiner Canvas in Bildschirmgröße über dem
// Foto (<img>), die Formen werden relativ (0–1) gespeichert. Erst beim Speichern
// wird einmalig in voller Auflösung gerendert und der Canvas danach freigegeben,
// weil Safari den Canvas-Speicher sonst nicht zuverlässig zurückgibt.

const COLORS = ['#ff2d20', '#ffd60a', '#ffffff'];
const TOOLS = [['pen', '✏️ Stift'], ['arrow', '↗ Pfeil'], ['circle', '◯ Kreis']];

export function freeCanvas(c) {
  c.width = 0;
  c.height = 0;
}

function drawShape(ctx, s, w, h) {
  const lw = s.w * Math.max(w, h);
  const P = p => [p.x * w, p.y * h];
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,.45)';
  ctx.shadowBlur = lw;
  const [ax, ay] = P(s.pts[0]);
  const [bx, by] = P(s.pts.at(-1));
  ctx.beginPath();
  if (s.tool === 'pen') {
    ctx.moveTo(ax, ay);
    for (const p of s.pts) ctx.lineTo(...P(p));
    ctx.stroke();
  } else if (s.tool === 'circle') {
    ctx.ellipse((ax + bx) / 2, (ay + by) / 2, Math.abs(bx - ax) / 2, Math.abs(by - ay) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (s.tool === 'arrow') {
    const ang = Math.atan2(by - ay, bx - ax);
    const head = lw * 5;
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx - Math.cos(ang) * head * 0.6, by - Math.sin(ang) * head * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - head * Math.cos(ang - 0.45), by - head * Math.sin(ang - 0.45));
    ctx.lineTo(bx - head * Math.cos(ang + 0.45), by - head * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

export function openMarkup(blob, onSave) {
  const overlay = document.createElement('div');
  overlay.className = 'markup';
  overlay.innerHTML = `
    <div class="mk-top">
      <button class="bar-btn" data-act="cancel">Abbrechen</button>
      <button class="bar-btn" data-act="undo">↶ Rückgängig</button>
      <button class="bar-btn strong" data-act="save">Fertig</button>
    </div>
    <div class="mk-stage"><div class="mk-frame"><img alt=""><canvas></canvas></div></div>
    <div class="mk-tools">
      <div class="seg tools">${TOOLS.map(([k, l], i) => `<button data-tool="${k}" class="${i === 1 ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="colors">${COLORS.map((c, i) => `<button data-color="${c}" class="${i === 0 ? 'on' : ''}" style="background:${c}" aria-label="Farbe"></button>`).join('')}</div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add('no-scroll');

  const stage = overlay.querySelector('.mk-stage');
  const frame = overlay.querySelector('.mk-frame');
  const img = overlay.querySelector('img');
  const canvas = overlay.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const shapes = [];
  let tool = 'arrow', color = COLORS[0], current = null, cssW = 0, cssH = 0;
  const url = URL.createObjectURL(blob);

  // Bild und Zeichenfläche in Pixeln passend in den freien Bereich einpassen.
  function layout() {
    if (!img.naturalWidth) return;
    const pad = 16;
    const maxW = stage.clientWidth - pad, maxH = stage.clientHeight - pad;
    const r = img.naturalWidth / img.naturalHeight;
    cssW = Math.min(maxW, maxH * r);
    cssH = cssW / r;
    frame.style.width = cssW + 'px';
    frame.style.height = cssH + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    redraw();
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of shapes) drawShape(ctx, s, canvas.width, canvas.height);
    if (current) drawShape(ctx, current, canvas.width, canvas.height);
  }

  img.onload = layout;
  img.onerror = () => { alert('Das Foto konnte nicht geladen werden.'); close(); };
  img.src = url;
  window.addEventListener('resize', layout);

  const pos = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
    };
  };
  const start = (x, y) => { current = { tool, color, w: 1 / 220, pts: [pos(x, y)] }; };
  const move = (x, y) => {
    if (!current) return;
    const p = pos(x, y);
    if (current.tool === 'pen') current.pts.push(p); else current.pts[1] = p;
    redraw();
  };
  const end = () => {
    if (current && current.pts.length > 1) shapes.push(current);
    current = null;
    redraw();
  };

  // Touch-Events direkt (iOS), Maus/Stift über Pointer-Events.
  canvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; start(t.clientX, t.clientY); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); const t = e.touches[0]; move(t.clientX, t.clientY); }, { passive: false });
  canvas.addEventListener('touchend', e => { e.preventDefault(); end(); }, { passive: false });
  canvas.addEventListener('touchcancel', end);
  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;
    canvas.setPointerCapture?.(e.pointerId);
    start(e.clientX, e.clientY);
  });
  canvas.addEventListener('pointermove', e => { if (e.pointerType !== 'touch') move(e.clientX, e.clientY); });
  canvas.addEventListener('pointerup', e => { if (e.pointerType !== 'touch') end(); });
  canvas.addEventListener('pointercancel', e => { if (e.pointerType !== 'touch') end(); });

  function close() {
    window.removeEventListener('resize', layout);
    freeCanvas(canvas);
    URL.revokeObjectURL(url);
    overlay.remove();
    document.body.classList.remove('no-scroll');
  }

  // Formen einmalig in Originalauflösung auf das Foto rendern.
  async function render() {
    const out = document.createElement('canvas');
    out.width = img.naturalWidth;
    out.height = img.naturalHeight;
    const octx = out.getContext('2d');
    if (!octx) throw new Error('Zu wenig Speicher für die Bildbearbeitung. Bitte die App neu starten.');
    octx.drawImage(img, 0, 0);
    for (const s of shapes) drawShape(octx, s, out.width, out.height);
    const result = await new Promise(r => out.toBlob(r, 'image/jpeg', 0.88));
    freeCanvas(out);
    if (!result) throw new Error('Das Foto konnte nicht gespeichert werden.');
    return result;
  }

  let saving = false;
  overlay.addEventListener('click', async e => {
    const t = e.target.closest('button');
    if (!t || saving) return;
    if (t.dataset.tool) {
      tool = t.dataset.tool;
      overlay.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b === t));
    } else if (t.dataset.color) {
      color = t.dataset.color;
      overlay.querySelectorAll('[data-color]').forEach(b => b.classList.toggle('on', b === t));
    } else if (t.dataset.act === 'undo') {
      shapes.pop(); redraw();
    } else if (t.dataset.act === 'cancel') {
      if (!shapes.length || confirm('Markierungen verwerfen?')) close();
    } else if (t.dataset.act === 'save') {
      if (!shapes.length) { close(); return; }
      saving = true;
      t.textContent = 'Speichert …';
      try {
        const out = await render();
        close();
        onSave(out);
      } catch (err) {
        alert(err.message);
        saving = false;
        t.textContent = 'Fertig';
      }
    }
  });
}
