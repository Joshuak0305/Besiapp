// Vollbild-Editor zum Einzeichnen von Markierungen (Stift, Pfeil, Kreis) in ein Foto.

const COLORS = ['#ff2d20', '#ffd60a', '#ffffff'];
const TOOLS = [['pen', '✏️ Stift'], ['arrow', '↗ Pfeil'], ['circle', '◯ Kreis']];

export function openMarkup(blob, onSave) {
  const overlay = document.createElement('div');
  overlay.className = 'markup';
  overlay.innerHTML = `
    <div class="mk-top">
      <button class="bar-btn" data-act="cancel">Abbrechen</button>
      <button class="bar-btn" data-act="undo">↶ Rückgängig</button>
      <button class="bar-btn strong" data-act="save">Fertig</button>
    </div>
    <div class="mk-stage"><canvas></canvas></div>
    <div class="mk-tools">
      <div class="seg tools">${TOOLS.map(([k, l], i) => `<button data-tool="${k}" class="${i === 1 ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="colors">${COLORS.map((c, i) => `<button data-color="${c}" class="${i === 0 ? 'on' : ''}" style="background:${c}" aria-label="Farbe"></button>`).join('')}</div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add('no-scroll');

  const canvas = overlay.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const shapes = [];
  let tool = 'arrow', color = COLORS[0], current = null;
  const img = new Image();
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    redraw();
  };
  img.src = url;

  const lw = () => Math.max(4, Math.round(Math.max(canvas.width, canvas.height) / 220));

  function drawShape(s) {
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = s.w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,.45)';
    ctx.shadowBlur = s.w;
    const [a, b] = [s.pts[0], s.pts.at(-1)];
    ctx.beginPath();
    if (s.tool === 'pen') {
      ctx.moveTo(a.x, a.y);
      for (const p of s.pts) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (s.tool === 'circle') {
      ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (s.tool === 'arrow') {
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const head = s.w * 5;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x - Math.cos(ang) * head * 0.6, b.y - Math.sin(ang) * head * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - head * Math.cos(ang - 0.45), b.y - head * Math.sin(ang - 0.45));
      ctx.lineTo(b.x - head * Math.cos(ang + 0.45), b.y - head * Math.sin(ang + 0.45));
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function redraw() {
    ctx.drawImage(img, 0, 0);
    shapes.forEach(drawShape);
    if (current) drawShape(current);
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height };
  }

  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    current = { tool, color, w: lw(), pts: [pos(e)] };
  });
  canvas.addEventListener('pointermove', e => {
    if (!current) return;
    const p = pos(e);
    if (current.tool === 'pen') current.pts.push(p); else current.pts[1] = p;
    redraw();
  });
  const end = () => {
    if (current && current.pts.length > 1) shapes.push(current);
    current = null;
    redraw();
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  function close() {
    URL.revokeObjectURL(url);
    overlay.remove();
    document.body.classList.remove('no-scroll');
  }

  overlay.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t) return;
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
      canvas.toBlob(out => { close(); onSave(out); }, 'image/jpeg', 0.88);
    }
  });
}
