import { read, write, KEYS } from './storage.js';

const root = document.documentElement;

export function current() {
  return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export function apply(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  root.setAttribute('data-theme', t);
  return t;
}

export function toggle() {
  const next = current() === 'dark' ? 'light' : 'dark';
  apply(next);
  write(KEYS.THEME, next);
  return next;
}

export function init() {
  const saved = read(KEYS.THEME, null);
  if (saved === 'light' || saved === 'dark') {
    apply(saved);
    return saved;
  }
  const sys = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  apply(sys);
  return sys;
}