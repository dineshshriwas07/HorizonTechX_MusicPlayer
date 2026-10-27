import { read, write, KEYS } from './storage.js';

let favorites = new Set(read(KEYS.FAVORITES, []));
const listeners = new Set();

const notify = () => {
  const snapshot = getFavorites();
  listeners.forEach((fn) => { try { fn(snapshot); } catch (e) { console.error(e); } });
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getFavorites() { return Array.from(favorites); }

export function isFavorite(trackId) { return favorites.has(trackId); }

export function toggleFavorite(trackId) {
  if (!trackId) return false;
  favorites.has(trackId) ? favorites.delete(trackId) : favorites.add(trackId);
  write(KEYS.FAVORITES, Array.from(favorites));
  notify();
  return favorites.has(trackId);
}

export function getFavoriteTracks(allTracks) {
  return Array.isArray(allTracks) ? allTracks.filter((t) => favorites.has(t.id)) : [];
}