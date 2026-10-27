const PREFIX = 'htx_v1_';

const key = (k) => PREFIX + k;

export function read(keyName, fallback) {
  try {
    const raw = localStorage.getItem(key(keyName));
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function write(keyName, value) {
  try {
    localStorage.setItem(key(keyName), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function isAvailable() {
  try {
    const t = '__htx_test__';
    localStorage.setItem(t, t);
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

export const KEYS = {
  THEME: 'theme',
  FAVORITES: 'favorites',
  PLAYLISTS: 'playlists',
  RECENT: 'recent',
  VOLUME: 'volume',
  LAST_TRACK: 'lastTrack',
};