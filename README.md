# TabPilot

**Multi-instance Android mirroring for Windows.**

Run multiple apps simultaneously on isolated virtual displays via ADB — with shortcuts, activity auto-tap, audio forwarding, and Samsung Secure Folder support. Built with Electron, WebCodecs, and scrcpy.

## Features

- **Multi-instance** — run several apps in parallel, each in its own tab with its own virtual display
- **Multi-device** — connect multiple Android devices simultaneously
- **Embedded mirror** — video decoded via WebCodecs and rendered to a `<canvas>` inside each tab
- **Secure Folder** — full support for Samsung Secure Folder on Android 16 (no root required)
- **Shortcuts (zones)** — assign keyboard keys to tap zones on the mirror, shared across all instances of the same app
- **Activity** — auto-tap at a set position every 2 minutes to prevent inactivity
- **Audio forwarding** — captures device audio output and plays it through your PC speakers
- **Tab nicknames** — double-click or right-click any tab to rename it
- **Settings presets** — Ultra (2560×1440), High (1920×1080), Medium (1280×720), Low (960×540)
- **Turn off screen** — keeps device display off while mirroring to save battery
- **Keyboard shortcuts** — Ctrl+T (new instance), Ctrl+W (close), ←→ (navigate tabs)

## Requirements

- Windows 10/11 64-bit
- Node.js ≥ 18
- Android device with USB Debugging enabled
- Android 5.0+ (API 21+)
- Android 10+ recommended for virtual display (`--new-display`)
- Samsung Android 10+ for Secure Folder support

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Place binaries

Place the following in `bin/win32/`:
- `scrcpy.exe` + `scrcpy-server` (v4.0)
- `adb.exe` + required DLLs (`SDL3.dll`, `AdbWinApi.dll`, etc.)

### 3. Connect your Android device

Enable USB Debugging:  
**Settings → About Phone → tap Build Number 7× → Developer Options → USB Debugging ✓**

Connect via USB and accept the authorization prompt on your device.

### 4. Run

```bash
npm start
```

Your device appears automatically. Click **+ New instance**, select an app, and click **Launch**.

## How it works

- Our custom scrcpy server creates a virtual display with `new_display` and launches apps via ADB or the scrcpy control socket
- The server streams H.264 video over a local TCP socket to the Electron main process
- The main process forwards encoded frames to the renderer via IPC
- **WebCodecs `VideoDecoder`** (Chromium built-in) decodes frames in the renderer
- Each frame is drawn to a `<canvas>` — fully embedded, no external windows

## Built with

- [Electron](https://www.electronjs.org/)
- [scrcpy](https://github.com/Genymobile/scrcpy) v4.0 by Genymobile
- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [Claude AI](https://claude.ai)

---

© 2026 Aeonxy. All rights reserved.