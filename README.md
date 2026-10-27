# HorizonTechX Music Player

A premium, responsive web music player built with vanilla HTML5, CSS3, and ES6+ JavaScript. Features real audio playback, playlists, favorites, recently played history, synchronized lyrics, a Web Audio visualizer, dark/light themes, and keyboard shortcuts.

---

## Project Overview

HorizonTechX Music Player is a single-page web application that demonstrates a complete music streaming UI without any frontend framework. It uses the HTML5 Audio API for genuine playback, LocalStorage for persistence, and the Web Audio API for real-time visualization.

**Live demo:** *Not deployed yet — see deployment instructions below.*

---

## Features

- 🎵 **Real audio playback** — HTML5 Audio API with play/pause, next/previous, seek, volume, mute, shuffle, and repeat (off/all/one)
- 📚 **Demo library** — 6 royalty-free sample tracks from SoundHelix (requires internet)
- 📁 **Local file import** — Select your own MP3/WAV/OGG/M4A files; nothing is uploaded
- 🔍 **Search** — Case-insensitive filtering by title, artist, and album
- 📋 **Playlists** — Create, rename, delete, add/remove tracks; persisted in LocalStorage
- ❤️ **Favorites** — Like songs; persisted and synced across all views
- 🕘 **Recently played** — Auto-tracked when playback starts (30-entry limit)
- 🎤 **Synchronized lyrics** — Timestamped `[mm:ss]` format with active-line highlighting
- 📊 **Audio visualizer** — Real FFT analysis via Web Audio API (graceful fallback on CORS/support issues)
- 🌗 **Dark/light theme** — Persisted, respects system preference on first visit
- ⌨️ **Keyboard shortcuts** — Full transport control without touching the mouse
- 📱 **Responsive** — Desktop sidebar, mobile bottom navigation, full-screen expanded player

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 (semantic) |
| Styling | CSS3 (custom properties, flexbox, grid) |
| Logic | Vanilla JavaScript (ES6 modules) |
| Icons | Remix Icon CDN |
| Fonts | Google Fonts (Inter) |
| Audio | HTML5 Audio API + Web Audio API |
| Persistence | LocalStorage |

**No frameworks.** No React, Vue, Angular, Bootstrap, Tailwind, or jQuery.

---

## Folder Structure
