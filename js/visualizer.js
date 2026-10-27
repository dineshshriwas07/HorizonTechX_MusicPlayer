import { createMediaSource } from './player.js';

let ctx = null;
let analyser = null;
let source = null;
let canvas = null;
let ctx2d = null;
let data = null;
let frameId = null;
let running = false;
let sourceAttached = false;

const BAR_COUNT = 64;
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx2d?.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw() {
  if (!ctx2d || !canvas || !analyser || !data) return;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  ctx2d.clearRect(0, 0, w, h);
  analyser.getByteFrequencyData(data);
  const barW = w / BAR_COUNT;
  const gap = Math.max(1, barW * 0.22);
  for (let i = 0; i < BAR_COUNT; i++) {
    const v = data[i] / 255;
    const barH = Math.max(2, v * h * 0.9);
    const x = i * barW + gap / 2;
    const y = h - barH;
    const grad = ctx2d.createLinearGradient(0, y, 0, h);
    grad.addColorStop(0, '#F28C28');
    grad.addColorStop(1, 'rgba(242,140,40,0.25)');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(x, y, barW - gap, barH);
  }
}

function loop() {
  if (!running) return;
  draw();
  frameId = requestAnimationFrame(loop);
}

export function setCanvas(el) {
  canvas = el;
  if (canvas) {
    ctx2d = canvas.getContext('2d');
    resize();
  }
}

export function init(el) {
  setCanvas(el);
  if (!ctx2d) return false;
  window.addEventListener('resize', resize);

  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!ctx) ctx = new AC();
    if (!analyser) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      data = new Uint8Array(analyser.frequencyBinCount);
    }
    if (!sourceAttached) {
      source = createMediaSource(ctx);
      if (!source) return false;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      sourceAttached = true;
    }
    return true;
  } catch (err) {
    console.warn('[visualizer] init failed:', err);
    return false;
  }
}

export function start() {
  if (!analyser) return false;
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
  if (REDUCED) { draw(); return true; }
  if (!running) { running = true; loop(); }
  return true;
}

export function stop() {
  running = false;
  if (frameId) { cancelAnimationFrame(frameId); frameId = null; }
}

export function isSupported() { return !!(window.AudioContext || window.webkitAudioContext); }