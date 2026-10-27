import { read, write, KEYS } from './storage.js';

const audio = document.getElementById('audioElement');
const listeners = new Set();

let tracks = [];
let queue = [];
let queueIndex = -1;
let shuffle = false;
let repeat = 'off';

const emit = (type, detail = {}) => {
  const event = { type, detail, state: getState() };
  listeners.forEach((fn) => {
    try { fn(event); } catch (e) { console.error('[player]', e); }
  });
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setTracks(list) {
  tracks = Array.isArray(list) ? list.slice() : [];
}

export function getTracks() { return tracks; }

export function getTrackById(id) {
  return tracks.find((t) => t.id === id) || null;
}

export function getCurrentTrack() {
  return queueIndex >= 0 && queueIndex < queue.length
    ? getTrackById(queue[queueIndex])
    : null;
}

export function playQueue(trackIds, startIndex = 0) {
  if (!trackIds?.length) {
    emit('error', { message: 'Nothing to play.' });
    return;
  }
  queue = trackIds.slice();
  queueIndex = Math.max(0, Math.min(startIndex, queue.length - 1));
  loadCurrent();
}

export function playTrackById(id) {
  const idx = queue.indexOf(id);
  if (idx >= 0) {
    queueIndex = idx;
    loadCurrent();
    return;
  }
  const all = tracks.map((t) => t.id);
  const newIdx = all.indexOf(id);
  if (newIdx >= 0) playQueue(all, newIdx);
}

function loadCurrent() {
  const track = getCurrentTrack();
  if (!track) return;
  if (!track.src) {
    emit('error', { message: `"${track.title}" has no audio source.`, trackId: track.id });
    return;
  }
  audio.src = track.src;
  audio.load();
  const p = audio.play();
  if (p?.catch) {
    p.catch((err) => {
      if (err?.name !== 'AbortError') {
        emit('error', { message: `Cannot play "${track.title}". ${err.message}`, trackId: track.id });
      }
    });
  }
  write(KEYS.LAST_TRACK, track.id);
  emit('trackchange', { track });
}

export function play() {
  if (!audio.src) {
    const lastId = read(KEYS.LAST_TRACK, null);
    if (lastId && getTrackById(lastId)) {
      playTrackById(lastId);
      return;
    }
    if (tracks.length) {
      playQueue(tracks.map((t) => t.id), 0);
    }
    return;
  }
  const p = audio.play();
  if (p?.catch) {
    p.catch((err) => {
      if (err?.name !== 'AbortError') emit('error', { message: err.message });
    });
  }
}

export function pause() { audio.pause(); }
export function togglePlay() { audio.paused ? play() : pause(); }

export function next() {
  if (!queue.length) return;
  if (shuffle && queue.length > 1) {
    let n = queueIndex;
    while (n === queueIndex) n = Math.floor(Math.random() * queue.length);
    queueIndex = n;
  } else {
    queueIndex = (queueIndex + 1) % queue.length;
  }
  loadCurrent();
}

export function previous() {
  if (!queue.length) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  if (shuffle && queue.length > 1) {
    let n = queueIndex;
    while (n === queueIndex) n = Math.floor(Math.random() * queue.length);
    queueIndex = n;
  } else {
    queueIndex = (queueIndex - 1 + queue.length) % queue.length;
  }
  loadCurrent();
}

export function seek(percent) {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  audio.currentTime = Math.max(0, Math.min(1, percent)) * audio.duration;
}

export function seekBy(seconds) {
  if (!Number.isFinite(audio.duration)) return;
  audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
}

export function setVolume(v) {
  const clamped = Math.max(0, Math.min(1, v));
  audio.volume = clamped;
  audio.muted = clamped === 0;
  write(KEYS.VOLUME, clamped);
  emit('volume');
}

export function getVolume() { return audio.volume; }

export function toggleMute() {
  audio.muted = !audio.muted;
  emit('volume');
}

export function isMuted() { return audio.muted || audio.volume === 0; }

export function setShuffle(v) {
  shuffle = !!v;
  emit('shuffle');
}

export function toggleShuffle() { setShuffle(!shuffle); }
export function isShuffleEnabled() { return shuffle; }

export function setRepeat(mode) {
  if (!['off', 'all', 'one'].includes(mode)) return;
  repeat = mode;
  audio.loop = mode === 'one';
  emit('repeat');
}

export function cycleRepeat() {
  const modes = ['off', 'all', 'one'];
  setRepeat(modes[(modes.indexOf(repeat) + 1) % modes.length]);
}

export function getRepeat() { return repeat; }

audio.addEventListener('play', () => emit('play'));
audio.addEventListener('pause', () => emit('pause'));
audio.addEventListener('ended', () => {
  if (repeat === 'one') { audio.currentTime = 0; play(); return; }
  if (repeat === 'off' && !shuffle && queueIndex >= queue.length - 1) {
    emit('playbackend');
    return;
  }
  next();
});
audio.addEventListener('timeupdate', () => emit('timeupdate'));
audio.addEventListener('loadedmetadata', () => emit('loadedmetadata'));
audio.addEventListener('durationchange', () => emit('loadedmetadata'));
audio.addEventListener('volumechange', () => emit('volume'));
audio.addEventListener('error', () => {
  if (!audio.src) return;
  const track = getCurrentTrack();
  emit('error', {
    message: `Audio failed to load${track ? ` for "${track.title}"` : ''}.`,
    trackId: track?.id ?? null,
  });
});

export function getState() {
  const track = getCurrentTrack();
  return {
    isPlaying: !audio.paused,
    currentTrackId: track?.id ?? null,
    currentTrack: track,
    currentTime: audio.currentTime || 0,
    duration: Number.isFinite(audio.duration) ? audio.duration : 0,
    volume: audio.volume,
    muted: audio.muted || audio.volume === 0,
    shuffle,
    repeat,
    queueLength: queue.length,
    queueIndex,
  };
}

export function init() {
  const vol = read(KEYS.VOLUME, 0.8);
  audio.volume = typeof vol === 'number' ? vol : 0.8;
  audio.muted = audio.volume === 0;
  emit('volume');
}

export function getAudioElement() { return audio; }
export function createMediaSource(audioContext) {
  try { return audioContext.createMediaElementSource(audio); }
  catch { return null; }
}
export function getLastTrackId() { return read(KEYS.LAST_TRACK, null); }