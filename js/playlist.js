import { read, write, KEYS } from './storage.js';

let playlists = read(KEYS.PLAYLISTS, []);
const listeners = new Set();

const notify = () => {
  const snapshot = getPlaylists();
  listeners.forEach((fn) => { try { fn(snapshot); } catch (e) { console.error(e); } });
};

const persist = () => { write(KEYS.PLAYLISTS, playlists); notify(); };

const genId = () => 'pl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getPlaylists() {
  return playlists.map((p) => ({ id: p.id, name: p.name, trackIds: p.trackIds.slice() }));
}

export function getPlaylistById(id) {
  const p = playlists.find((pl) => pl.id === id);
  return p ? { id: p.id, name: p.name, trackIds: p.trackIds.slice() } : null;
}

export function validateName(raw) {
  if (typeof raw !== 'string') return null;
  const name = raw.trim();
  if (!name) return null;
  return name.length > 60 ? name.slice(0, 60) : name;
}

export function createPlaylist(raw) {
  const name = validateName(raw);
  if (!name) return null;
  const pl = { id: genId(), name, trackIds: [] };
  playlists.push(pl);
  persist();
  return { id: pl.id, name: pl.name, trackIds: [] };
}

export function renamePlaylist(id, raw) {
  const name = validateName(raw);
  if (!name) return false;
  const pl = playlists.find((p) => p.id === id);
  if (!pl) return false;
  pl.name = name;
  persist();
  return true;
}

export function deletePlaylist(id) {
  const i = playlists.findIndex((p) => p.id === id);
  if (i === -1) return false;
  playlists.splice(i, 1);
  persist();
  return true;
}

export function addTrackToPlaylist(playlistId, trackId) {
  if (!trackId) return { ok: false, reason: 'invalid' };
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return { ok: false, reason: 'notfound' };
  if (pl.trackIds.includes(trackId)) return { ok: false, reason: 'duplicate' };
  pl.trackIds.push(trackId);
  persist();
  return { ok: true };
}

export function removeTrackFromPlaylist(playlistId, trackId) {
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return false;
  const i = pl.trackIds.indexOf(trackId);
  if (i === -1) return false;
  pl.trackIds.splice(i, 1);
  persist();
  return true;
}