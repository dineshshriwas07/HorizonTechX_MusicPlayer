const panel = document.getElementById('lyricsPanel');
const body = document.getElementById('lyricsBody');
const closeBtn = document.getElementById('closeLyricsBtn');

let lines = [];
let activeIndex = -1;
let onToggle = null;

export function parse(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  const out = [];
  const re = /^\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/;
  for (const line of raw.split('\n')) {
    const m = line.trim().match(re);
    if (!m) continue;
    const mins = +m[1];
    const secs = +m[2];
    const frac = m[3] ? +m[3].padEnd(3, '0') / 1000 : 0;
    const text = m[4].trim();
    if (!text) continue;
    out.push({ time: mins * 60 + secs + frac, text });
  }
  return out.sort((a, b) => a.time - b.time);
}

function renderEmpty() {
  lines = [];
  activeIndex = -1;
  body.textContent = '';
  const wrap = document.createElement('div');
  wrap.className = 'lyrics-empty';
  const icon = document.createElement('i');
  icon.className = 'ri-file-music-line';
  icon.setAttribute('aria-hidden', 'true');
  const h = document.createElement('h4');
  h.textContent = "Lyrics aren't available";
  const p = document.createElement('p');
  p.textContent = 'Lyrics aren\'t available for this track.';
  wrap.append(icon, h, p);
  body.appendChild(wrap);
}

export function setLyrics(trackId, raw) {
  const parsed = parse(raw);
  if (!parsed.length) { renderEmpty(); return; }
  lines = parsed;
  activeIndex = -1;
  body.textContent = '';
  parsed.forEach((l, i) => {
    const el = document.createElement('div');
    el.className = 'lyric-line';
    el.textContent = l.text;
    body.appendChild(el);
    l.el = el;
  });
}

export function updateTime(currentTime) {
  if (!lines.length) return;
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= currentTime + 0.05) idx = i;
    else break;
  }
  if (idx === activeIndex) return;
  activeIndex = idx;
  lines.forEach((l, i) => {
    if (!l.el) return;
    l.el.classList.toggle('is-active', i === idx);
    l.el.classList.toggle('is-past', i < idx);
  });
  if (idx >= 0 && lines[idx].el) {
    const el = lines[idx].el;
    const panelRect = body.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const target = elRect.top - panelRect.top + body.scrollTop - panelRect.height / 2 + elRect.height / 2;
    body.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }
}

export function open() { panel.hidden = false; onToggle?.(true); }
export function close() { panel.hidden = true; onToggle?.(false); }
export function toggle() { panel.hidden ? open() : close(); }
export function isOpen() { return !panel.hidden; }
export function onToggleChange(fn) { onToggle = fn; }
export function reset() { lines = []; activeIndex = -1; body.textContent = ''; }

export function init() {
  closeBtn.addEventListener('click', close);
}