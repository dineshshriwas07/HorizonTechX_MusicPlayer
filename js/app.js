import {
  setTracks, playQueue, playTrackById, togglePlay, next, previous,
  seek, seekBy, setVolume, getVolume, toggleMute,
  toggleShuffle, cycleRepeat, subscribe as onPlayer, getState,
  getTrackById, init as initPlayer, getLastTrackId, setShuffle,
} from './player.js';

import {
  subscribe as onFavorites, isFavorite, toggleFavorite, getFavoriteTracks,
} from './favorites.js';

import {
  subscribe as onPlaylists, getPlaylists, getPlaylistById,
  createPlaylist, renamePlaylist, deletePlaylist,
  addTrackToPlaylist, removeTrackFromPlaylist, validateName,
} from './playlist.js';

import { filterTracks } from './search.js';
import {
  init as initLyrics, setLyrics, updateTime as updateLyricsTime,
  toggle as toggleLyrics, close as closeLyrics, isOpen as isLyricsOpen, onToggleChange,
} from './lyrics.js';

import {
  init as initVisualizer, start as startVisualizer, stop as stopVisualizer,
  isSupported as visualizerSupported, setCanvas as setVisualizerCanvas,
} from './visualizer.js';

import { init as initTheme, toggle as toggleTheme, current as currentTheme } from './theme.js';
import { read, write, isAvailable, KEYS } from './storage.js';

/* ========================================================================== */
/* DEMO LIBRARY — 20 SoundHelix tracks                                        */
/* ========================================================================== */

const DEMO_TRACKS = [
  { id: 'sh-1',  title: 'Horizon Dawn',       artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',  sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-2',  title: 'Midnight Circuit',   artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',  sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-3',  title: 'Amber Skies',        artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',  sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-4',  title: 'Deep Pulse',         artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',  sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-5',  title: 'Glass Orbit',        artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',  sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-6',  title: 'Solar Drift',        artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',  sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-7',  title: 'Crystal Wave',       artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',  sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-8',  title: 'Echo Valley',        artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',  sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-9',  title: 'Silver Rain',        artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',  sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-10', title: 'Golden Hour',        artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-11', title: 'Neon Skyline',       artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-12', title: 'Velvet Nights',      artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-13', title: 'Frozen Echo',        artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-14', title: 'Static Bloom',       artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-15', title: 'Lunar Tide',         artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-16', title: 'Paper Planes',       artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-17', title: 'Urban Flow',         artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-18', title: 'Cosmic Dust',        artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-19', title: 'Broken Signal',      artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3', sourceLabel: 'Demo', lyrics: '' },
  { id: 'sh-20', title: 'Final Horizon',      artist: 'SoundHelix', album: 'Demo Sessions', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3', sourceLabel: 'Demo', lyrics: '' },
];

let allTracks = [];
const localUrls = new Map();
let recentIds = read(KEYS.RECENT, []);
let activePlaylistId = null;
let currentView = 'home';

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

function fmt(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function makeArtwork(cls, track) {
  const div = el('div', `artwork ${cls || ''}`.trim());
  div.dataset.fallback = '♪';
  if (track?.artworkUrl) {
    const img = document.createElement('img');
    img.src = track.artworkUrl;
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => img.remove(), { once: true });
    div.appendChild(img);
  }
  return div;
}

/* ========================================================================== */
/* TOASTS                                                                     */
/* ========================================================================== */

const toastStack = $('#toastStack');

function toast(message, type = 'info') {
  if (!toastStack) return;
  const t = el('div', `toast toast--${type}`);
  const icon = el('i', type === 'error' ? 'ri-error-warning-line'
    : type === 'success' ? 'ri-check-line' : 'ri-information-line');
  icon.setAttribute('aria-hidden', 'true');
  t.append(icon, el('span', '', message));
  toastStack.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(20px)';
    t.style.transition = 'opacity 200ms ease, transform 200ms ease';
    setTimeout(() => t.remove(), 220);
  }, 3200);
}

/* ========================================================================== */
/* DIALOGS                                                                    */
/* ========================================================================== */

const dialogBackdrop = $('#dialogBackdrop');
const dialogTitle = $('#dialogTitle');
const dialogMessage = $('#dialogMessage');
const dialogInputWrap = $('#dialogInputWrap');
const dialogInput = $('#dialogInput');
const dialogCancelBtn = $('#dialogCancelBtn');
const dialogConfirmBtn = $('#dialogConfirmBtn');

let dialogResolve = null;

function dialog({ title, message, withInput = false, inputValue = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    dialogResolve = resolve;
    dialogTitle.textContent = title;
    dialogMessage.textContent = message || '';
    dialogInputWrap.hidden = !withInput;
    if (withInput) {
      dialogInput.value = inputValue;
      setTimeout(() => dialogInput.focus(), 50);
    }
    dialogConfirmBtn.textContent = confirmLabel;
    dialogCancelBtn.textContent = cancelLabel;
    dialogConfirmBtn.className = danger ? 'btn btn--danger' : 'btn btn--primary';
    dialogBackdrop.hidden = false;
  });
}

function closeDialog(result) {
  dialogBackdrop.hidden = true;
  const r = dialogResolve;
  dialogResolve = null;
  r?.(result);
}

dialogCancelBtn.addEventListener('click', () => closeDialog(null));
dialogConfirmBtn.addEventListener('click', () => {
  closeDialog(dialogInputWrap.hidden ? true : { value: dialogInput.value });
});
dialogBackdrop.addEventListener('click', (e) => {
  if (e.target === dialogBackdrop) closeDialog(null);
});
dialogInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    closeDialog({ value: dialogInput.value });
  }
});

/* ========================================================================== */
/* THEME                                                                      */
/* ========================================================================== */

const themeToggleBtn = $('#themeToggleBtn');

function updateThemeIcon() {
  themeToggleBtn.innerHTML = '';
  const icon = el('i', currentTheme() === 'dark' ? 'ri-sun-line' : 'ri-moon-line');
  icon.setAttribute('aria-hidden', 'true');
  themeToggleBtn.appendChild(icon);
}
themeToggleBtn.addEventListener('click', () => {
  toggleTheme();
  updateThemeIcon();
});

/* ========================================================================== */
/* TRACK ROW                                                                  */
/* ========================================================================== */

function trackRow(track, index, contextPlaylistId = null) {
  const state = getState();
  const isCurrent = state.currentTrackId === track.id;
  const isPlaying = isCurrent && state.isPlaying;

  const row = el('div', 'track-row');
  row.setAttribute('role', 'button');
  row.setAttribute('tabindex', '0');
  row.dataset.trackId = track.id;
  if (isCurrent) row.classList.add('is-current');
  if (isPlaying) row.classList.add('is-playing');

  const idx = el('div', 'track-row__index');
  idx.appendChild(el('span', 'num', String(index + 1)));
  const eq = el('span', 'eq');
  eq.append(el('span'), el('span'), el('span'));
  idx.appendChild(eq);
  row.appendChild(idx);

  const main = el('div', 'track-row__main');
  main.appendChild(makeArtwork('track-row__art', track));
  const meta = el('div', 'track-row__meta');
  meta.append(el('div', 'track-row__title', track.title), el('div', 'track-row__artist', track.artist));
  main.appendChild(meta);
  row.appendChild(main);

  row.appendChild(el('div', 'track-row__album', track.album || '—'));

  const actions = el('div', 'track-row__actions');
  const favBtn = el('button', 'icon-btn icon-btn--fav');
  favBtn.type = 'button';
  favBtn.setAttribute('aria-label', isFavorite(track.id) ? 'Remove from favorites' : 'Add to favorites');
  const favIcon = el('i', isFavorite(track.id) ? 'ri-heart-3-fill' : 'ri-heart-3-line');
  favIcon.setAttribute('aria-hidden', 'true');
  favBtn.appendChild(favIcon);
  if (isFavorite(track.id)) favBtn.classList.add('is-favorite');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const on = toggleFavorite(track.id);
    toast(on ? 'Added to favorites' : 'Removed from favorites', 'success');
    renderAll();
  });
  actions.appendChild(favBtn);

  const menuBtn = el('button', 'icon-btn');
  menuBtn.type = 'button';
  menuBtn.setAttribute('aria-label', 'Track actions');
  const menuIcon = el('i', 'ri-more-2-line');
  menuIcon.setAttribute('aria-hidden', 'true');
  menuBtn.appendChild(menuIcon);
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openTrackMenu(track, contextPlaylistId, menuBtn);
  });
  actions.appendChild(menuBtn);
  row.appendChild(actions);

  row.appendChild(el('div', 'track-row__duration', track.duration ? fmt(track.duration) : '—'));

  const play = () => {
    const ids = allTracks.map((t) => t.id);
    playQueue(ids, allTracks.findIndex((t) => t.id === track.id));
  };
  row.addEventListener('click', play);
  row.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      play();
    }
  });

  return row;
}

function renderTrackList(container, tracks, contextPlaylistId = null) {
  if (!container) return;
  container.textContent = '';
  if (!tracks.length) return;
  const frag = document.createDocumentFragment();
  tracks.forEach((t, i) => frag.appendChild(trackRow(t, i, contextPlaylistId)));
  container.appendChild(frag);
}

/* ========================================================================== */
/* TRACK MENU                                                                 */
/* ========================================================================== */

const trackMenu = $('#trackMenu');

function closeTrackMenu() { trackMenu.hidden = true; }

function openTrackMenu(track, contextPlaylistId, anchor) {
  trackMenu.textContent = '';

  if (contextPlaylistId) {
    const item = el('button', 'popover__item');
    item.type = 'button';
    const icon = el('i', 'ri-subtract-line');
    icon.setAttribute('aria-hidden', 'true');
    item.append(icon, el('span', '', 'Remove from playlist'));
    item.addEventListener('click', () => {
      removeTrackFromPlaylist(contextPlaylistId, track.id);
      toast('Removed from playlist', 'success');
      closeTrackMenu();
      renderAll();
    });
    trackMenu.appendChild(item);
  }

  trackMenu.appendChild(el('div', 'popover__title', 'Add to playlist'));
  const lists = getPlaylists();
  if (!lists.length) {
    trackMenu.appendChild(el('div', 'popover__empty', 'No playlists yet. Create one first.'));
  } else {
    lists.forEach((pl) => {
      const item = el('button', 'popover__item');
      item.type = 'button';
      const icon = el('i', 'ri-play-list-add-line');
      icon.setAttribute('aria-hidden', 'true');
      item.append(icon, el('span', '', pl.name));
      item.addEventListener('click', () => {
        const res = addTrackToPlaylist(pl.id, track.id);
        if (res.ok) toast(`Added to "${pl.name}"`, 'success');
        else if (res.reason === 'duplicate') toast('Already in that playlist', 'info');
        else toast('Could not add track', 'error');
        closeTrackMenu();
        renderAll();
      });
      trackMenu.appendChild(item);
    });
  }

  const r = anchor.getBoundingClientRect();
  trackMenu.hidden = false;
  const m = trackMenu.getBoundingClientRect();
  let top = r.bottom + 6;
  let left = r.right - m.width;
  if (left < 8) left = 8;
  if (top + m.height > window.innerHeight - 8) top = r.top - m.height - 6;
  trackMenu.style.top = `${Math.max(8, top)}px`;
  trackMenu.style.left = `${left}px`;
}

document.addEventListener('click', (e) => {
  if (!trackMenu.hidden && !trackMenu.contains(e.target)) closeTrackMenu();
});

/* ========================================================================== */
/* VIEW NAVIGATION                                                            */
/* ========================================================================== */

const VIEW_META = {
  home: { title: 'Home', subtitle: 'Welcome back to HorizonTechX' },
  search: { title: 'Search', subtitle: 'Find songs, artists, albums, and playlists' },
  library: { title: 'Your Library', subtitle: 'Your playlists and all songs' },
  liked: { title: 'Liked Songs', subtitle: 'Your favorite tracks' },
  recent: { title: 'Recently Played', subtitle: 'Your listening history' },
  playlist: { title: 'Playlist', subtitle: 'Your playlist' },
};

function switchView(name, playlistId = null) {
  currentView = name;
  if (name === 'playlist') activePlaylistId = playlistId;

  $$('.view').forEach((v) => v.classList.remove('is-active'));
  $(`#view-${name}`)?.classList.add('is-active');

  $$('.nav-item[data-view]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.view === name);
  });

  const meta = VIEW_META[name] || VIEW_META.home;
  $('#viewTitle').textContent = meta.title;
  $('#viewSubtitle').textContent = meta.subtitle;

  const box = $('#searchBox');
  if (box) box.hidden = name !== 'home';

  renderAll();
  $('#main-content').scrollTop = 0;
  closeMobileSidebar();
}

$$('.nav-item[data-view]').forEach((b) => {
  b.addEventListener('click', () => switchView(b.dataset.view));
});

/* ========================================================================== */
/* RENDERERS                                                                  */
/* ========================================================================== */

const sidebarPlaylists = $('#sidebarPlaylists');

function renderSidebar() {
  sidebarPlaylists.textContent = '';
  const lists = getPlaylists();
  if (!lists.length) {
    sidebarPlaylists.appendChild(el('li', 'sidebar__empty', 'No playlists yet'));
    return;
  }
  lists.forEach((pl) => {
    const li = el('li');
    const btn = el('button', 'sidebar-playlist');
    btn.type = 'button';
    const icon = el('i', 'ri-circle-fill');
    icon.setAttribute('aria-hidden', 'true');
    btn.append(icon, el('span', '', pl.name));
    btn.addEventListener('click', () => switchView('playlist', pl.id));
    li.appendChild(btn);
    sidebarPlaylists.appendChild(li);
  });
}

function trackCard(track) {
  const card = el('div', 'music-card');
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.dataset.trackId = track.id;

  const artWrap = el('div', 'music-card__art');
  artWrap.appendChild(makeArtwork('', track));
  const playBtn = el('button', 'music-card__play');
  playBtn.type = 'button';
  playBtn.setAttribute('aria-label', `Play ${track.title}`);
  const icon = el('i', 'ri-play-fill');
  icon.setAttribute('aria-hidden', 'true');
  playBtn.appendChild(icon);
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playTrackById(track.id);
  });
  artWrap.appendChild(playBtn);
  card.appendChild(artWrap);

  card.appendChild(el('div', 'music-card__title', track.title));
  card.appendChild(el('div', 'music-card__sub', track.artist));

  card.addEventListener('click', () => playTrackById(track.id));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playTrackById(track.id);
    }
  });
  return card;
}

function playlistCard(pl) {
  const card = el('div', 'music-card');
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const artWrap = el('div', 'music-card__art');
  const art = el('div', 'artwork');
  art.dataset.fallback = '♫';
  artWrap.appendChild(art);
  const playBtn = el('button', 'music-card__play');
  playBtn.type = 'button';
  playBtn.setAttribute('aria-label', `Play ${pl.name}`);
  const icon = el('i', 'ri-play-fill');
  icon.setAttribute('aria-hidden', 'true');
  playBtn.appendChild(icon);
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!pl.trackIds.length) { toast('Playlist is empty', 'error'); return; }
    playQueue(pl.trackIds, 0);
  });
  artWrap.appendChild(playBtn);
  card.appendChild(artWrap);

  card.appendChild(el('div', 'music-card__title', pl.name));
  card.appendChild(el('div', 'music-card__sub', `${pl.trackIds.length} song${pl.trackIds.length === 1 ? '' : 's'}`));

  card.addEventListener('click', () => switchView('playlist', pl.id));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      switchView('playlist', pl.id);
    }
  });
  return card;
}

function renderHome() {
  const featured = $('#featuredGrid');
  if (featured) {
    featured.textContent = '';
    const lists = getPlaylists().slice(0, 6);
    if (lists.length) {
      lists.forEach((pl) => featured.appendChild(playlistCard(pl)));
    } else {
      DEMO_TRACKS.slice(0, 4).forEach((t) => {
        const track = allTracks.find((x) => x.id === t.id);
        if (track) featured.appendChild(trackCard(track));
      });
    }
  }

  const recent = $('#recentGrid');
  if (recent) {
    recent.textContent = '';
    const list = recentIds.map((id) => allTracks.find((t) => t.id === id)).filter(Boolean).slice(0, 6);
    if (!list.length) {
      const empty = el('div', 'empty');
      empty.style.gridColumn = '1 / -1';
      const icon = el('div', 'empty__icon');
      const i = el('i', 'ri-history-line');
      i.setAttribute('aria-hidden', 'true');
      icon.appendChild(i);
      empty.append(icon, el('h4', '', 'No recent tracks'), el('p', '', 'Play a song to see it here.'));
      recent.appendChild(empty);
    } else {
      list.forEach((t) => recent.appendChild(trackCard(t)));
    }
  }

  const all = $('#homeTrackList');
  if (all) renderTrackList(all, allTracks);
}

function renderSearch() {
  const input = $('#searchViewInput');
  const q = input?.value || '';
  const results = filterTracks(allTracks, q);
  renderTrackList($('#searchResults'), results);
  const empty = $('#searchEmpty');
  if (empty) empty.hidden = results.length > 0 || !q.trim();
}

function renderLibrary() {
  const grid = $('#libraryPlaylistGrid');
  if (grid) {
    grid.textContent = '';
    const lists = getPlaylists();
    if (!lists.length) {
      const empty = el('div', 'empty');
      empty.style.gridColumn = '1 / -1';
      const icon = el('div', 'empty__icon');
      const i = el('i', 'ri-play-list-2-line');
      i.setAttribute('aria-hidden', 'true');
      icon.appendChild(i);
      empty.append(icon, el('h4', '', 'No playlists yet'), el('p', '', 'Create one from the sidebar.'));
      grid.appendChild(empty);
    } else {
      lists.forEach((pl) => grid.appendChild(playlistCard(pl)));
    }
  }
  renderTrackList($('#libraryTrackList'), allTracks);
}

function renderLiked() {
  const list = getFavoriteTracks(allTracks);
  $('#likedCount').textContent = `${list.length} song${list.length === 1 ? '' : 's'}`;
  renderTrackList($('#likedTrackList'), list);
  const empty = $('#likedEmpty');
  if (empty) empty.hidden = list.length > 0;
}

function renderRecent() {
  const list = recentIds.map((id) => allTracks.find((t) => t.id === id)).filter(Boolean);
  $('#recentCount').textContent = `${list.length} song${list.length === 1 ? '' : 's'}`;
  renderTrackList($('#recentTrackList'), list);
  const empty = $('#recentEmpty');
  if (empty) empty.hidden = list.length > 0;
}

function renderActivePlaylist() {
  const pl = activePlaylistId ? getPlaylistById(activePlaylistId) : null;
  if (!pl) { switchView('library'); return; }
  $('#playlistTitle').textContent = pl.name;
  $('#playlistMeta').textContent = `${pl.trackIds.length} song${pl.trackIds.length === 1 ? '' : 's'}`;
  $('#viewTitle').textContent = pl.name;
  $('#viewSubtitle').textContent = 'Playlist';
  const tracks = pl.trackIds.map((id) => allTracks.find((t) => t.id === id)).filter(Boolean);
  renderTrackList($('#playlistTrackList'), tracks, pl.id);
  const empty = $('#playlistEmpty');
  if (empty) empty.hidden = tracks.length > 0;
}

function updateRowStates() {
  const state = getState();
  $$('.track-row').forEach((row) => {
    const current = state.currentTrackId === row.dataset.trackId;
    row.classList.toggle('is-current', current);
    row.classList.toggle('is-playing', current && state.isPlaying);
  });
}

function renderAll() {
  renderSidebar();
  renderHome();
  renderSearch();
  renderLibrary();
  renderLiked();
  renderRecent();
  if (currentView === 'playlist') renderActivePlaylist();
  updateRowStates();
}

/* ========================================================================== */
/* PLAYER BAR                                                                 */
/* ========================================================================== */

const nowTitle = $('#nowTitle');
const nowArtist = $('#nowArtist');
const nowArtwork = $('#nowArtwork');
const nowFavoriteBtn = $('#nowFavoriteBtn');
const playPauseBtn = $('#playPauseBtn');
const playPauseIcon = $('#playPauseIcon');
const shuffleBtn = $('#shuffleBtn');
const repeatBtn = $('#repeatBtn');
const repeatIcon = $('#repeatIcon');
const currentTimeEl = $('#currentTime');
const durationTimeEl = $('#durationTime');
const seekBar = $('#seekBar');
const volumeBar = $('#volumeBar');
const volumeIcon = $('#volumeIcon');

const expanded = $('#expandedPlayer');
const expandedArtwork = $('#expandedArtwork');
const expandedTitle = $('#expandedTitle');
const expandedArtist = $('#expandedArtist');
const expandedCurrentTime = $('#expandedCurrentTime');
const expandedDurationTime = $('#expandedDurationTime');
const expandedSeekBar = $('#expandedSeekBar');
const expandedPlayPauseIcon = $('#expandedPlayPauseIcon');
const expandedShuffleBtn = $('#expandedShuffleBtn');
const expandedRepeatBtn = $('#expandedRepeatBtn');
const expandedRepeatIcon = $('#expandedRepeatIcon');
const expandedFavoriteBtn = $('#expandedFavoriteBtn');

// Hero vinyl — spins while audio is playing
const vinylDisc = $('#vinylDisc');

let lastLyricsTrackId = null;

function setArtwork(node, track) {
  if (!node) return;
  node.textContent = '';
  node.dataset.fallback = '♪';
  if (track?.artworkUrl) {
    const img = document.createElement('img');
    img.src = track.artworkUrl;
    img.alt = '';
    img.addEventListener('error', () => img.remove(), { once: true });
    node.appendChild(img);
  }
}

function updatePlayerBar() {
  const state = getState();
  const track = state.currentTrack;

  if (track) {
    nowTitle.textContent = track.title;
    nowArtist.textContent = track.artist;
    nowFavoriteBtn.disabled = false;
    const fav = isFavorite(track.id);
    nowFavoriteBtn.classList.toggle('is-favorite', fav);
    nowFavoriteBtn.setAttribute('aria-label', fav ? 'Remove from favorites' : 'Add to favorites');
    setArtwork(nowArtwork, track);

    expandedTitle.textContent = track.title;
    expandedArtist.textContent = track.artist;
    expandedFavoriteBtn.classList.toggle('is-favorite', fav);
    setArtwork(expandedArtwork, track);

    if (track.id !== lastLyricsTrackId) {
      lastLyricsTrackId = track.id;
      setLyrics(track.id, track.lyrics || '');
    }
    updateLyricsTime(state.currentTime);
  } else {
    nowTitle.textContent = 'Nothing playing';
    nowArtist.textContent = 'Select a track';
    nowFavoriteBtn.disabled = true;
    nowFavoriteBtn.classList.remove('is-favorite');
    setArtwork(nowArtwork, null);
    expandedTitle.textContent = 'Nothing playing';
    expandedArtist.textContent = 'Select a track';
    setArtwork(expandedArtwork, null);
  }

  const iconCls = state.isPlaying ? 'ri-pause-fill' : 'ri-play-fill';
  playPauseIcon.className = iconCls;
  playPauseBtn.setAttribute('aria-label', state.isPlaying ? 'Pause' : 'Play');
  expandedPlayPauseIcon.className = iconCls;

  currentTimeEl.textContent = fmt(state.currentTime);
  durationTimeEl.textContent = fmt(state.duration);
  expandedCurrentTime.textContent = fmt(state.currentTime);
  expandedDurationTime.textContent = fmt(state.duration);

  const pct = state.duration > 0 ? (state.currentTime / state.duration) * 1000 : 0;
  if (!seekBar.matches(':active')) seekBar.value = String(pct);
  if (!expandedSeekBar.matches(':active')) expandedSeekBar.value = String(pct);
  seekBar.style.setProperty('--range-progress', `${(pct / 10)}%`);
  expandedSeekBar.style.setProperty('--range-progress', `${(pct / 10)}%`);

  shuffleBtn.classList.toggle('is-active', state.shuffle);
  shuffleBtn.setAttribute('aria-pressed', String(state.shuffle));
  expandedShuffleBtn.classList.toggle('is-active', state.shuffle);
  expandedShuffleBtn.setAttribute('aria-pressed', String(state.shuffle));

  const rep = state.repeat;
  repeatBtn.classList.toggle('is-active', rep !== 'off');
  repeatBtn.setAttribute('aria-pressed', String(rep !== 'off'));
  expandedRepeatBtn.classList.toggle('is-active', rep !== 'off');
  expandedRepeatBtn.setAttribute('aria-pressed', String(rep !== 'off'));
  const repIcon = rep === 'one' ? 'ri-repeat-one-line' : 'ri-repeat-line';
  repeatIcon.className = repIcon;
  expandedRepeatIcon.className = repIcon;
  repeatBtn.setAttribute('aria-label', `Repeat: ${rep}`);

  const muted = state.muted;
  volumeIcon.className = muted || state.volume === 0
    ? 'ri-volume-mute-line'
    : state.volume < 0.5 ? 'ri-volume-down-line' : 'ri-volume-up-line';
  volumeBar.value = String(Math.round((muted ? 0 : state.volume) * 100));
  volumeBar.style.setProperty('--range-progress', `${muted ? 0 : state.volume * 100}%`);

  updateRowStates();

  // Spin the hero vinyl only while audio is actively playing.
  if (vinylDisc) vinylDisc.classList.toggle('is-spinning', state.isPlaying);
}

/* ========================================================================== */
/* CONTROLS                                                                   */
/* ========================================================================== */

playPauseBtn.addEventListener('click', togglePlay);
$('#expandedPlayPauseBtn').addEventListener('click', togglePlay);
$('#prevBtn').addEventListener('click', previous);
$('#expandedPrevBtn').addEventListener('click', previous);
$('#nextBtn').addEventListener('click', next);
$('#expandedNextBtn').addEventListener('click', next);
shuffleBtn.addEventListener('click', () => { toggleShuffle(); updatePlayerBar(); });
expandedShuffleBtn.addEventListener('click', () => { toggleShuffle(); updatePlayerBar(); });
repeatBtn.addEventListener('click', () => { cycleRepeat(); updatePlayerBar(); });
expandedRepeatBtn.addEventListener('click', () => { cycleRepeat(); updatePlayerBar(); });

$('#muteBtn').addEventListener('click', () => {
  toggleMute();
  if (getVolume() === 0) setVolume(0.8);
  updatePlayerBar();
});

volumeBar.addEventListener('input', (e) => {
  const v = Number(e.target.value) / 100;
  setVolume(v);
  const audio = document.getElementById('audioElement');
  if (v > 0 && audio && audio.muted) audio.muted = false;
  updatePlayerBar();
});

seekBar.addEventListener('input', (e) => seek(Number(e.target.value) / 1000));
expandedSeekBar.addEventListener('input', (e) => seek(Number(e.target.value) / 1000));

nowFavoriteBtn.addEventListener('click', () => {
  const id = getState().currentTrackId;
  if (!id) return;
  toggleFavorite(id);
  updatePlayerBar();
  renderAll();
});
expandedFavoriteBtn.addEventListener('click', () => {
  const id = getState().currentTrackId;
  if (!id) return;
  toggleFavorite(id);
  updatePlayerBar();
  renderAll();
});

/* ========================================================================== */
/* EXPANDED PLAYER                                                            */
/* ========================================================================== */

function openExpanded() {
  expanded.hidden = false;
  updatePlayerBar();
  if (visualizerOn) startVisualizer();
}
function closeExpanded() {
  expanded.hidden = true;
  closeTrackMenu();
}
$('#expandPlayerBtn').addEventListener('click', openExpanded);
$('#closeExpandedBtn').addEventListener('click', closeExpanded);

/* ========================================================================== */
/* LYRICS                                                                     */
/* ========================================================================== */

const lyricsBtn = $('#lyricsToggleBtn');
lyricsBtn.addEventListener('click', () => {
  toggleLyrics();
  lyricsBtn.classList.toggle('is-active', isLyricsOpen());
});
$('#expandedLyricsBtn').addEventListener('click', () => {
  toggleLyrics();
  lyricsBtn.classList.toggle('is-active', isLyricsOpen());
});
onToggleChange((open) => lyricsBtn.classList.toggle('is-active', open));
$('#closeLyricsBtn').addEventListener('click', () => {
  closeLyrics();
  lyricsBtn.classList.remove('is-active');
});

/* ========================================================================== */
/* VISUALIZER                                                                 */
/* ========================================================================== */

let visualizerOn = false;
const visualizerCanvas = $('#visualizerCanvas');
const visualizerBtn = $('#visualizerToggleBtn');
const expandedVisualizerBtn = $('#expandedVisualizerBtn');

function toggleVisualizer() {
  if (!visualizerSupported()) {
    toast('Web Audio API is not supported.', 'error');
    return;
  }
  visualizerOn = !visualizerOn;
  visualizerCanvas.hidden = !visualizerOn;
  visualizerBtn.classList.toggle('is-active', visualizerOn);
  visualizerBtn.setAttribute('aria-pressed', String(visualizerOn));
  expandedVisualizerBtn.classList.toggle('is-active', visualizerOn);
  expandedVisualizerBtn.setAttribute('aria-pressed', String(visualizerOn));

  if (visualizerOn) {
    setVisualizerCanvas(visualizerCanvas);
    if (!initVisualizer(visualizerCanvas)) {
      toast('Visualizer unavailable (CORS or unsupported). Audio still plays.', 'error');
      visualizerOn = false;
      visualizerCanvas.hidden = true;
      visualizerBtn.classList.remove('is-active');
      expandedVisualizerBtn.classList.remove('is-active');
      return;
    }
    startVisualizer();
  } else {
    stopVisualizer();
  }
}

visualizerBtn.addEventListener('click', toggleVisualizer);
expandedVisualizerBtn.addEventListener('click', toggleVisualizer);

/* ========================================================================== */
/* SEARCH                                                                     */
/* ========================================================================== */

const searchBox = $('#searchBox');
const searchInput = $('#searchInput');
const clearSearchBtn = $('#clearSearchBtn');
const searchViewInput = $('#searchViewInput');

$('#searchToggleBtn').addEventListener('click', () => {
  if (currentView !== 'home') switchView('search');
  searchBox.hidden = !searchBox.hidden;
  if (!searchBox.hidden) searchInput.focus();
});

searchInput.addEventListener('input', (e) => {
  clearSearchBtn.hidden = !e.target.value.trim();
  renderSearch();
});
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    clearSearchBtn.hidden = true;
    renderSearch();
    searchInput.blur();
  }
  if (e.key === 'Enter') {
    switchView('search');
    if (searchViewInput) {
      searchViewInput.value = searchInput.value;
      searchViewInput.focus();
      renderSearch();
    }
  }
});
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.hidden = true;
  renderSearch();
  searchInput.focus();
});
searchViewInput.addEventListener('input', renderSearch);

/* ========================================================================== */
/* LOCAL FILE IMPORT                                                          */
/* ========================================================================== */

const fileInput = $('#localFileInput');
const openFilePicker = () => fileInput.click();
$('#importLocalBtn').addEventListener('click', openFilePicker);
$('#importLocalTopBtn').addEventListener('click', openFilePicker);

let localCounter = 0;

function importFiles(files) {
  if (!files?.length) return;
  const added = [];
  for (const file of files) {
    if (!file.type.startsWith('audio/')) {
      toast(`"${file.name}" is not an audio file.`, 'error');
      continue;
    }
    let url;
    try { url = URL.createObjectURL(file); }
    catch { toast(`Could not read "${file.name}".`, 'error'); continue; }

    const id = `local-${Date.now()}-${localCounter++}`;
    localUrls.set(id, url);
    added.push({
      id,
      title: file.name.replace(/\.[^.]+$/, '') || 'Untitled',
      artist: 'Local file',
      album: 'Your device',
      src: url,
      sourceLabel: 'Local',
      lyrics: '',
    });
  }
  if (!added.length) return;

  allTracks = [...allTracks, ...added];
  setTracks(allTracks);
  renderAll();
  toast(`${added.length} file${added.length === 1 ? '' : 's'} added. Re-import after refresh.`, 'success');

  const idx = allTracks.findIndex((t) => t.id === added[0].id);
  if (idx >= 0) playQueue(allTracks.map((t) => t.id), idx);
}

fileInput.addEventListener('change', (e) => {
  importFiles(e.target.files);
  e.target.value = '';
});

/* ========================================================================== */
/* PLAYLIST MANAGEMENT                                                        */
/* ========================================================================== */

$('#sidebarCreatePlaylistBtn').addEventListener('click', async () => {
  const res = await dialog({
    title: 'Create playlist',
    message: 'Give your playlist a name.',
    withInput: true,
    confirmLabel: 'Create',
  });
  if (!res?.value) return;
  const name = validateName(res.value);
  if (!name) { toast('Invalid playlist name.', 'error'); return; }
  const pl = createPlaylist(name);
  if (pl) {
    toast(`Playlist "${pl.name}" created`, 'success');
    switchView('playlist', pl.id);
  }
});

$('#renamePlaylistBtn').addEventListener('click', async () => {
  if (!activePlaylistId) return;
  const pl = getPlaylistById(activePlaylistId);
  if (!pl) return;
  const res = await dialog({
    title: 'Rename playlist',
    message: 'Enter a new name.',
    withInput: true,
    inputValue: pl.name,
    confirmLabel: 'Rename',
  });
  if (!res?.value) return;
  if (renamePlaylist(activePlaylistId, res.value)) {
    toast('Playlist renamed', 'success');
    renderAll();
  } else {
    toast('Invalid name.', 'error');
  }
});

$('#deletePlaylistBtn').addEventListener('click', async () => {
  if (!activePlaylistId) return;
  const pl = getPlaylistById(activePlaylistId);
  if (!pl) return;
  const ok = await dialog({
    title: 'Delete playlist',
    message: `Delete "${pl.name}"? This cannot be undone.`,
    confirmLabel: 'Delete',
    danger: true,
  });
  if (!ok) return;
  deletePlaylist(activePlaylistId);
  activePlaylistId = null;
  toast('Playlist deleted', 'success');
  switchView('library');
});

$('#playPlaylistBtn').addEventListener('click', () => {
  if (!activePlaylistId) return;
  const pl = getPlaylistById(activePlaylistId);
  if (!pl?.trackIds.length) { toast('Playlist is empty', 'error'); return; }
  playQueue(pl.trackIds, 0);
});

/* ========================================================================== */
/* HERO ACTIONS                                                               */
/* ========================================================================== */

$('#heroPlayAllBtn').addEventListener('click', () => {
  if (!allTracks.length) { toast('No tracks available', 'error'); return; }
  playQueue(allTracks.map((t) => t.id), 0);
});

$('#heroShuffleBtn').addEventListener('click', () => {
  if (!allTracks.length) { toast('No tracks available', 'error'); return; }
  setShuffle(true);
  const ids = allTracks.map((t) => t.id);
  playQueue(ids, Math.floor(Math.random() * ids.length));
  updatePlayerBar();
});

/* ========================================================================== */
/* SHORTCUTS DIALOG                                                           */
/* ========================================================================== */

const shortcutsBackdrop = $('#shortcutsBackdrop');
$('#shortcutsBtn').addEventListener('click', () => { shortcutsBackdrop.hidden = false; });
$('#shortcutsCloseBtn').addEventListener('click', () => { shortcutsBackdrop.hidden = true; });
shortcutsBackdrop.addEventListener('click', (e) => {
  if (e.target === shortcutsBackdrop) shortcutsBackdrop.hidden = true;
});

/* ========================================================================== */
/* KEYBOARD SHORTCUTS                                                         */
/* ========================================================================== */

const isTyping = (t) => {
  if (!t) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
};

document.addEventListener('keydown', (e) => {
  if (isTyping(e.target)) return;

  if (e.key === 'Escape') {
    if (!dialogBackdrop.hidden) { closeDialog(null); return; }
    if (!shortcutsBackdrop.hidden) { shortcutsBackdrop.hidden = true; return; }
    if (!expanded.hidden) { closeExpanded(); return; }
    if (isLyricsOpen()) { closeLyrics(); lyricsBtn.classList.remove('is-active'); return; }
    if (!trackMenu.hidden) { closeTrackMenu(); return; }
    return;
  }

  switch (e.key) {
    case ' ': e.preventDefault(); togglePlay(); break;
    case 'ArrowRight': e.preventDefault(); seekBy(5); break;
    case 'ArrowLeft': e.preventDefault(); seekBy(-5); break;
    case 'ArrowUp': e.preventDefault(); setVolume(Math.min(1, getVolume() + 0.05)); updatePlayerBar(); break;
    case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, getVolume() - 0.05)); updatePlayerBar(); break;
    case 'n': case 'N': next(); break;
    case 'p': case 'P': previous(); break;
    case 'm': case 'M': toggleMute(); updatePlayerBar(); break;
    case 'l': case 'L': {
      const id = getState().currentTrackId;
      if (id) { toggleFavorite(id); updatePlayerBar(); renderAll(); }
      break;
    }
    case '/':
      e.preventDefault();
      if (currentView !== 'home' && currentView !== 'search') switchView('search');
      if (currentView === 'search') searchViewInput?.focus();
      else { searchBox.hidden = false; searchInput?.focus(); }
      break;
  }
});

/* ========================================================================== */
/* MOBILE SIDEBAR                                                             */
/* ========================================================================== */

const sidebar = $('#sidebar');
const mobileMenuBtn = $('#mobileMenuBtn');

function closeMobileSidebar() { sidebar.classList.remove('is-open'); }

mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('is-open');
});

document.addEventListener('click', (e) => {
  if (window.innerWidth > 900) return;
  if (!sidebar.classList.contains('is-open')) return;
  if (sidebar.contains(e.target) || mobileMenuBtn.contains(e.target)) return;
  closeMobileSidebar();
});

/* ========================================================================== */
/* RECENTLY PLAYED                                                            */
/* ========================================================================== */

function addToRecent(trackId) {
  if (!trackId) return;
  recentIds = [trackId, ...recentIds.filter((id) => id !== trackId)].slice(0, 30);
  write(KEYS.RECENT, recentIds);
  renderRecent();
  renderHome();
}

/* ========================================================================== */
/* PLAYER SUBSCRIPTION                                                        */
/* ========================================================================== */

onPlayer((event) => {
  if (event.type === 'play') {
    const id = getState().currentTrackId;
    if (id) addToRecent(id);
  }

  if (event.type === 'error') {
    toast(event.detail.message || 'Playback error', 'error');
  }

  if (event.type === 'playbackend') {
    toast('Playback finished', 'info');
  }

  updatePlayerBar();
});

onFavorites(() => {
  renderLiked();
  renderAll();
  updatePlayerBar();
});

onPlaylists(() => {
  renderAll();
});

/* ========================================================================== */
/* INIT                                                                       */
/* ========================================================================== */

function init() {
  if (!isAvailable()) {
    toast('LocalStorage unavailable — preferences will not persist.', 'error');
  }

  initTheme();
  updateThemeIcon();

  allTracks = DEMO_TRACKS.map((t) => ({ ...t }));
  setTracks(allTracks);

  initPlayer();
  initLyrics();

  // Preload last track metadata so the player bar isn't empty on load.
  const lastId = getLastTrackId();
  const last = lastId ? getTrackById(lastId) : null;
  if (last?.src) {
    const audio = document.getElementById('audioElement');
    if (audio) {
      try { audio.src = last.src; audio.load(); } catch { /* ignore */ }
    }
  }

  switchView('home');
  updatePlayerBar();

  if (visualizerCanvas) setVisualizerCanvas(visualizerCanvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (visualizerOn) stopVisualizer();
    } else if (visualizerOn && !expanded.hidden) {
      startVisualizer();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}