# TabDesk Clone

Multi-instance Android mirroring — TabDesk clone built with Electron + WebCodecs.

## How it works

- **scrcpy** runs with `--no-window --record=- --record-format=mkv` — streams H264 video to stdout
- **Electron main process** reads the stdout pipe and sends chunks to the renderer via IPC
- **WebCodecs VideoDecoder** (Chromium built-in) decodes H264 frames in the renderer
- Frames render to a `<canvas>` inside each tab — fully embedded, no external windows

## Setup

### 1. Install Node.js dependencies

```bash
npm install
```

### 2. Download bundled binaries (adb + scrcpy)

```bash
npm run download-bins
```

This downloads to `bin/win32/` — ~80MB total, cached in temp dir.

### 3. Enable USB Debugging on your Android device

Settings → About Phone → tap Build Number 7× → Developer Options → USB Debugging ✓

### 4. Connect your device and run

```bash
npm start
```

Your device appears automatically. Click **+ New instance**, select the app, click **Launch**.

## Features

- Multi-instance — several apps running in parallel, each in its own tab
- Multi-user — detects Work Profile, Second Space, etc.
- Embedded mirror — video rendered inside the app via WebCodecs (no external scrcpy windows)
- Settings — Ultra/High/Medium/Low presets, audio control, device optimizations
- Tab renaming — double-click any tab
- Keyboard shortcuts — Ctrl+T (new), Ctrl+W (close), ←→ (navigate)
- App filter — in Devices panel, filter which apps appear in New Instance

## Requirements

- Windows 10/11 64-bit
- Node.js ≥ 18
- Android device with USB Debugging enabled
- Android 5+ (API 21+)
- For `--new-display` (separate virtual display): Android 10+ recommended
