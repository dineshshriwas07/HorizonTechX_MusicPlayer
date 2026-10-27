export function filterTracks(tracks, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return tracks.slice();
  return tracks.filter((t) => {
    const hay = [t.title, t.artist, t.album, t.sourceLabel].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });
}