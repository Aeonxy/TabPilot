const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path    = require('path');
const fs      = require('fs');
const net     = require('net');
const crypto  = require('crypto');
const { execFileSync, execFile, spawn } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const { activateLicense, validateSavedLicense, clearLicenseLocal } = require('./license');

// ── Auto updater ───────────────────────────────────────────────────────────
let autoUpdater;
try {
  autoUpdater = require('electron-updater').autoUpdater;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-available', info => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('update:available', { version: info.version });
    }
  });
  autoUpdater.on('download-progress', progress => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('update:progress', { percent: Math.round(progress.percent) });
    }
  });
  autoUpdater.on('update-downloaded', () => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('update:ready');
    }
  });
  autoUpdater.on('error', () => {}); // silence update errors
} catch(e) {} // not available in dev mode

// ── License state ──────────────────────────────────────────────────────────
let licenseValid = false;

// ── Paths ──────────────────────────────────────────────────────────────────
let _binDir;
function binDir() {
  if (_binDir !== undefined) return _binDir;
  // In production (packaged), bins are in resources/bin/win32
  // In dev, bins are in project root bin/win32
  const platform = process.platform === 'win32' ? 'win32' : 'darwin';
  const candidates = [
    path.join(process.resourcesPath || '', 'bin', platform),
    path.join(__dirname, '..', '..', 'bin', platform),
  ];
  _binDir = candidates.find(d => fs.existsSync(d)) || null;
  return _binDir;
}
const _binCache = new Map();
function binPath(name) {
  if (_binCache.has(name)) return _binCache.get(name);
  const exe = process.platform === 'win32' ? name + '.exe' : name;
  const d = binDir();
  const p = d ? path.join(d, exe) : null;
  const result = (p && fs.existsSync(p)) ? p : name;
  _binCache.set(name, result);
  return result;
}
function serverPath() {
  const d = binDir();
  if (d) {
    for (const name of ['scrcpy-server.jar', 'scrcpy-server']) {
      const p = path.join(d, name);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function serverVersion() {
  const p = serverPath();
  if (!p) return '3.3.4';
  try {
    const size = fs.statSync(p).size;
    return size > 500000 ? '4.0' : '3.3.4';
  } catch { return '3.3.4'; }
}

async function adb(args) {
  try {
    const timeout = args[0]==='-s'&&args[2]==='pull' ? 30000 : 8000;
    const { stdout } = await execFileAsync(binPath('adb'), args, { timeout });
    return stdout.trim();
  } catch { return ''; }
}


// ── Window ─────────────────────────────────────────────────────────────────
let win = null;
const sessions = new Map();

function createWindow() {
  const iconPath = path.join(__dirname, '..', '..', 'build', 'icon.png');
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 600,
    icon: iconPath,
    backgroundColor: '#0d0f14', frame: false, titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true, nodeIntegration: false,
      devTools: !app.isPackaged,
    },
  });
  win.loadFile(path.join(__dirname, '../renderer/index.html'));
  win.on('closed', () => { killAll(); win = null; });
  win.webContents.on('before-input-event', (_e, input) => {
    if (input.key === 'F12' && !app.isPackaged) win.webContents.openDevTools({ mode: 'detach' });
  });
}
app.whenReady().then(async () => {
  createWindow();

  // Wait for page to load, THEN validate license
  win.webContents.once('did-finish-load', async () => {
    const result = await validateSavedLicense().catch(() => ({ valid: true, offline: true }));
    licenseValid = result.valid;
    if (licenseValid) {
      win.webContents.send('license:valid');

      // Check for updates after license is valid
      if (app.isPackaged && autoUpdater) {
        setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch(e) {} }, 3000);
        // Check every 5 minutes while app is open
        setInterval(() => { try { autoUpdater.checkForUpdates(); } catch(e) {} }, 5 * 60 * 1000);
      }

      const checkLicense = async () => {
        if (!licenseValid || !win || win.isDestroyed()) return;
        let check;
        try {
          check = await validateSavedLicense();
        } catch(e) {
          // Network error — don't revoke, give benefit of the doubt
          return;
        }
        // Only revoke if server explicitly says invalid (not a network error)
        if (check && check.valid === false && !check.offline) {
          licenseValid = false;
          clearLicenseLocal();
          win.webContents.send('license:revoked');
        }
      };

      // Check every 10 minutes (not 10 seconds — too aggressive)
      setInterval(checkLicense, 10 * 60 * 1000);

    } else {
      win.webContents.send('license:required', result.error || null);
    }
  });

  app.on('activate', () => { if (!win) createWindow(); });
});
app.on('window-all-closed', () => { killAll(); if (process.platform !== 'darwin') app.quit(); });

// Window controls
ipcMain.on('win:minimize', () => win?.minimize());
ipcMain.on('win:maximize', () => win?.isMaximized() ? win.unmaximize() : win?.maximize());
ipcMain.on('win:close', () => win?.close());
ipcMain.on('win:is-maximized', e => { e.returnValue = win?.isMaximized() ?? false; });
ipcMain.handle('app:version', () => app.getVersion());

// ── Auto update IPC ────────────────────────────────────────────────────────
ipcMain.on('update:download', () => { try { autoUpdater?.downloadUpdate(); } catch(e) {} });
ipcMain.on('update:install',  () => { try { autoUpdater?.quitAndInstall(); } catch(e) {} });

// ── Secure Folder unlock detection ────────────────────────────────────────

ipcMain.handle('sf:is-unlocked', async (_e, deviceId) => {
  try {
    const out = await adb(['-s', deviceId, 'shell',
      'dumpsys activity activities | grep -E "u150.*securefolder|securefolder.*u150" | head -2'
    ]);
    return !!(out && out.includes('u150') && out.includes('securefolder'));
  } catch { return false; }
});
ipcMain.handle('sf:wait-unlock', async (_e, deviceId) => {
  return new Promise(resolve => {
    const check = async () => {
      try {
        const out = await adb(['-s', deviceId, 'shell',
          'dumpsys activity activities | grep -E "u150.*securefolder|securefolder.*u150" | head -2'
        ]);
        if (out && out.includes('u150') && out.includes('securefolder')) {
          resolve(true);
          return;
        }
      } catch {}
      setTimeout(check, 1500);
    };
    check();
    setTimeout(() => resolve(false), 180000);
  });
});
// ── Shell IPC ──────────────────────────────────────────────────────────────
ipcMain.handle('shell:openExternal', (_, url) => shell.openExternal(url));

// ── License IPC ────────────────────────────────────────────────────────────
ipcMain.handle('license:activate', async (_, key) => {
  const result = await activateLicense(key).catch(e => ({ success: false, error: e.message }));
  if (result.success) licenseValid = true;
  return result;
});
ipcMain.handle('license:clear', async () => {
  clearLicenseLocal();
  licenseValid = false;
  return { success: true };
});

// ── ADB helpers ────────────────────────────────────────────────────────────
ipcMain.handle('adb:devices', async () => {
  const raw = await adb(['devices', '-l']);
  return raw.split('\n').slice(1).filter(Boolean).map(line => {
    const parts = line.trim().split(/\s+/);
    const id = parts[0], state = parts[1] ?? 'offline';
    const model = (line.match(/model:(\S+)/) || [])[1]?.replace(/_/g, ' ') ?? id;
    return { id, state, model };
  }).filter(d => d.id && d.state === 'device');
});
ipcMain.handle('adb:users', async (_e, deviceId) => {
  const raw = await adb(['-s', deviceId, 'shell', 'pm', 'list', 'users']);
  const users = [];
  for (const cap of raw.split('UserInfo{').slice(1)) {
    const parts = cap.split(':');
    const id = parseInt(parts[0]);
    // Label is the second field, could contain spaces
    const label = parts[1] ?? 'User';
    if (!isNaN(id)) users.push({ id, label: label.trim() });
  }
  return users.length ? users : [{ id: 0, label: 'Owner' }];
});
ipcMain.handle('adb:apps', async (_e, deviceId, userId = 0, userLabel = null) => {
  // --user must come before -3 on Samsung devices
  const args = ['-s', deviceId, 'shell', 'pm', 'list', 'packages'];
  if (userId !== 0) args.push('--user', String(userId));
  args.push('-3');
  const ul = userLabel || (userId === 0 ? 'Personal' : `User ${userId}`);
  let raw = await adb(args);
  // If empty (Samsung Secure Folder blocks -3), fallback without -3 and filter system apps manually
  if (!raw.trim()) {
    const fallbackArgs = ['-s', deviceId, 'shell', 'pm', 'list', 'packages', '--user', String(userId)];
    raw = await adb(fallbackArgs);
  }
  return raw.split('\n').filter(l => l.startsWith('package:')).map(l => {
    const pkg = l.replace('package:', '').trim();
    return { package: pkg, label: pkgLabel(pkg), userId, userLabel: ul };
  }).sort((a, b) => a.label.localeCompare(b.label));
});
// Icon disk cache dir
const iconCacheDir = path.join(require('os').homedir(), '.tabpilot', 'icons');
const _iconMemCache = new Map(); // in-memory cache on top of disk
try { fs.mkdirSync(iconCacheDir, { recursive: true }); } catch {}

function iconCachePath(pkg) {
  return path.join(iconCacheDir, pkg.replace(/[^a-z0-9]/gi,'_') + '.json');
}

ipcMain.handle('adb:icon', async (_e, deviceId, pkg) => {
  try {
    // Check memory cache first (instant)
    if (_iconMemCache.has(pkg)) return _iconMemCache.get(pkg);
    // Check disk cache
    const cachePath = iconCachePath(pkg);
    if (fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        _iconMemCache.set(pkg, cached);
        return cached;
      } catch {}
    }

    const os = require('os');
    const apkOut = (await adb(['-s', deviceId, 'shell', `pm path ${pkg}`])).trim();
    const apkPath = apkOut.split('\n')[0].replace('package:', '').trim();
    if (!apkPath) return null;

    const tmpApk = path.join(os.tmpdir(), `mth_${pkg.replace(/[^a-z0-9]/gi,'_')}.apk`);
    await adb(['-s', deviceId, 'pull', apkPath, tmpApk]);
    const apkBuf = fs.readFileSync(tmpApk);
    try { fs.unlinkSync(tmpApk); } catch {}

    const iconDirs = ['mipmap-xxxhdpi','mipmap-xxhdpi','mipmap-xhdpi','mipmap-hdpi','mipmap-mdpi',
                      'drawable-xxxhdpi','drawable-xxhdpi','drawable-xhdpi','drawable-hdpi','drawable'];
    const result = extractIconFromZip(apkBuf, iconDirs, pkg);
    if (!result) return null;
    const b64 = result.data.toString('base64');
    const entry = { iconData: b64, iconMime: result.mime };
    // Save to memory + disk cache
    _iconMemCache.set(pkg, entry);
    try { fs.writeFileSync(cachePath, JSON.stringify(entry)); } catch {}
    return entry;
  } catch(e) {
 return null; }
});

function extractIconFromZip(buf, preferredDirs, pkg) {
  // Find EOCD
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocdOffset = i; break; }
  }
  if (eocdOffset < 0) return null;

  // Handle ZIP64
  let cdOffset = buf.readUInt32LE(eocdOffset + 16);
  let cdSize   = buf.readUInt32LE(eocdOffset + 12);
  const z64loc = eocdOffset - 20;
  if (z64loc >= 0 && buf.readUInt32LE(z64loc) === 0x07064b50) {
    const z64off = Number(buf.readBigUInt64LE(z64loc + 8));
    if (z64off < buf.length && buf.readUInt32LE(z64off) === 0x06064b50) {
      cdSize   = Number(buf.readBigUInt64LE(z64off + 40));
      cdOffset = Number(buf.readBigUInt64LE(z64off + 48));
    }
  }
  if (cdOffset >= buf.length) return null;

  // Parse central directory
  const files = [];
  let pos = cdOffset;
  while (pos + 46 <= cdOffset + cdSize && pos + 46 <= buf.length) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) break;
    const fnLen  = buf.readUInt16LE(pos + 28);
    const exLen  = buf.readUInt16LE(pos + 30);
    const cmLen  = buf.readUInt16LE(pos + 32);
    let   loff   = buf.readUInt32LE(pos + 42);
    const name   = buf.slice(pos + 46, pos + 46 + fnLen).toString('utf8');

    // ZIP64 local offset
    if (loff === 0xFFFFFFFF) {
      let ep = pos + 46 + fnLen, ee = ep + exLen;
      while (ep + 4 <= ee) {
        const hid = buf.readUInt16LE(ep), hl = buf.readUInt16LE(ep + 2);
        if (hid === 0x0001) {
          // field order: uncompSize(8), compSize(8), localOffset(8) — but only if present
          // count how many 8-byte fields based on hlen
          const fields = Math.floor(hl / 8);
          if (fields >= 3) loff = Number(buf.readBigUInt64LE(ep + 4 + 16));
          else if (fields >= 2) loff = Number(buf.readBigUInt64LE(ep + 4 + 8));
          else if (fields >= 1) loff = Number(buf.readBigUInt64LE(ep + 4));
          break;
        }
        ep += 4 + hl;
      }
    }
    files.push({ name, loff });
    pos += 46 + fnLen + exLen + cmLen;
  }

  // Find best icon
  const pngWebp = files.filter(f => f.name.endsWith('.png') || f.name.endsWith('.webp'));

  let entry = null;
  const densities = ['xxxhdpi','xxhdpi','xhdpi','hdpi','mdpi'];

  // 1. mipmap-{density}[-suffix]/ic_launcher.png (not background)
  for (const d of densities) {
    entry = files.find(f =>
      f.name.match(new RegExp(`res/mipmap-${d}[^/]*/ic_launcher\.(png|webp)$`)) &&
      !f.name.includes('background'));
    if (entry) break;
  }
  // 2. mipmap with foreground
  if (!entry) for (const d of densities) {
    entry = files.find(f =>
      f.name.match(new RegExp(`res/mipmap-${d}[^/]*/ic_launcher_foreground\.(png|webp)$`)));
    if (entry) break;
  }
  // 3. drawable-{density}/ic_launcher.png
  if (!entry) for (const d of densities) {
    entry = files.find(f =>
      f.name.match(new RegExp(`res/drawable-${d}[^/]*/ic_launcher\.(png|webp)$`)));
    if (entry) break;
  }
  // 4. any ic_launcher not background
  if (!entry) entry = files.find(f =>
    f.name.includes('ic_launcher') && !f.name.includes('background') &&
    (f.name.endsWith('.png') || f.name.endsWith('.webp')));
  // 5. any ic_launcher
  if (!entry) entry = files.find(f =>
    f.name.includes('ic_launcher') && (f.name.endsWith('.png') || f.name.endsWith('.webp')));
  // 6. obfuscated: largest res/ file (likely launcher icon)
  if (!entry && pngWebp.length > 0) {
    let best = null, bestSize = 0;
    for (const f of pngWebp.filter(f2 => f2.name.startsWith('res/')).slice(0, 80)) {
      try {
        const lp2 = f.loff;
        if (lp2 + 30 > buf.length || buf.readUInt32LE(lp2) !== 0x04034b50) continue;
        const csz2 = buf.readUInt32LE(lp2 + 18);
        if (csz2 > bestSize && csz2 < 200000) { bestSize = csz2; best = f; }
      } catch {}
    }
    entry = best;
  }

  if (!entry) {
 return null; }
  // Read local file header
  const lp = entry.loff;
  if (lp + 30 > buf.length || buf.readUInt32LE(lp) !== 0x04034b50) return null;
  const comp  = buf.readUInt16LE(lp + 8);
  let   csz   = buf.readUInt32LE(lp + 18);
  const fnl   = buf.readUInt16LE(lp + 26);
  const exl   = buf.readUInt16LE(lp + 28);
  const dstart = lp + 30 + fnl + exl;

  // ZIP64 compSize in local extra
  if (csz === 0xFFFFFFFF) {
    let ep = lp + 30 + fnl, ee = ep + exl;
    while (ep + 4 <= ee) {
      const hid = buf.readUInt16LE(ep), hl = buf.readUInt16LE(ep + 2);
      if (hid === 0x0001 && hl >= 16) { csz = Number(buf.readBigUInt64LE(ep + 4 + 8)); break; }
      ep += 4 + hl;
    }
  }

  if (dstart + csz > buf.length) return null;
  const data = buf.slice(dstart, dstart + csz);
  const mime = entry.name.endsWith('.webp') ? 'image/webp' : 'image/png';
  if (comp === 0) return { data, mime };
  if (comp === 8) try {
    const result = require('zlib').inflateRawSync(data);
    return { data: result, mime };
  } catch(e) {
 }
  return null;
}
ipcMain.handle('adb:shell', async (_e, deviceId, cmd) => adb(['-s', deviceId, 'shell', cmd]));

// ── Mirror ─────────────────────────────────────────────────────────────────
ipcMain.handle('mirror:start', async (_e, opts) => startMirror(opts));
ipcMain.handle('mirror:stop', async (_e, tabId) => { stopSession(tabId); return true; });

// Controls the OS-level audio volume of the per-device scrcpy audio process.
// Because audio is captured by a separate scrcpy instance (--no-video) that
// plays back directly through the OS mixer, it bypasses the renderer's Web
// Audio stack entirely - so gain nodes in the renderer have no effect.
// We control it here via the Windows Audio Session API (WASAPI) using a
// PowerShell script that targets the specific process by PID.
ipcMain.handle('device:set-audio', async (_e, { deviceId, volume, muted }) => {
  const entry = deviceAudioProcs.get(deviceId);
  if (!entry || !entry.proc) { console.log('[TabPilot] setDeviceAudio: no audio proc for', deviceId); return false; }
  const pid = entry.proc.pid;
  if (!pid) { console.log('[TabPilot] setDeviceAudio: no PID'); return false; }
  const level = muted ? 0 : Math.max(0, Math.min(1, volume / 100));
  console.log(`[TabPilot] setDeviceAudio: deviceId=${deviceId} pid=${pid} level=${level}`);
  try {
    const { execFile } = require('child_process');
    const path = require('path');
    const script = path.join(path.dirname(binPath('scrcpy')), 'setvol.ps1');
    const output = await new Promise(resolve => {
      execFile('powershell', [
        '-NoProfile', '-ExecutionPolicy', 'Bypass',
        '-File', script,
        '-TargetPid', String(pid),
        '-Level', String(level.toFixed(4))
      ], { windowsHide: true, timeout: 5000 }, (err, stdout, stderr) => {
        if (err) console.error('[TabPilot] setvol error:', err.message);
        if (stdout) console.log('[TabPilot] setvol stdout:', stdout.trim());
        if (stderr) console.error('[TabPilot] setvol stderr:', stderr.trim());
        resolve(stdout);
      });
    });
    return true;
  } catch(e) { console.error('[TabPilot] setDeviceAudio:', e.message); return false; }
});

// IME counter — tracks how many tabs have keyboard open
const imeCounterMap = new Map();
const deviceAudioProcs = new Map(); // deviceId → { proc, refCount } // deviceId → { count, watcher, tabStates }

ipcMain.handle('mirror:watch-ime', (_e, { tabId, deviceId }) => {
  // We no longer use a polling watcher.
  // IME detection is done on-demand via mirror:check-ime after each tap.
  // Just register the tab so deviceId is trackable.
  if (!imeCounterMap.has(deviceId)) {
    imeCounterMap.set(deviceId, { lastConfirmed: null, tabStates: new Map() });
  }
  imeCounterMap.get(deviceId).tabStates.set(tabId, false);
  return true;
});

ipcMain.handle('mirror:check-ime', async (_e, { tabId }) => {
  const session = sessions.get(tabId);
  if (!session?.deviceId) return;
  const { deviceId, displayId } = session;

  if (!imeCounterMap.has(deviceId)) {
    imeCounterMap.set(deviceId, { lastConfirmed: new Map(), tabStates: new Map() });
  }
  const imeState = imeCounterMap.get(deviceId);
  if (!imeState.lastConfirmed) imeState.lastConfirmed = new Map();
  const lastForDisplay = imeState.lastConfirmed.get(displayId) ?? null;

  try {
    const out = await adb(['-s', deviceId, 'shell', 'dumpsys input_method 2>/dev/null']);

    // Samsung One UI: each virtual display gets a targetDisplayId entry when IME is active
    const hasTarget = out.includes(`targetDisplayId=${displayId}`);

    // mIsInputViewShown=true = keyboard is visually rendered on screen
    const isViewShown = out.includes('mIsInputViewShown=true');

    const shown = hasTarget && isViewShown;

    if (shown === lastForDisplay) return;
    imeState.lastConfirmed.set(displayId, shown);

    if (win && !win.isDestroyed()) {
      win.webContents.send(shown ? 'mirror:ime-open' : 'mirror:ime-close', { deviceId });
    }
  } catch(e) {}
});


ipcMain.handle('mirror:ime-reopen', async (_e, { tabId }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    return true;
  } catch { return false; }
});

ipcMain.handle('mirror:stop-ime-watcher', (_e, { deviceId }) => {
  const state = imeCounterMap.get(deviceId);
  if (state?.watcher) { clearInterval(state.watcher); state.watcher = null; }
  imeCounterMap.delete(deviceId);
  return true;
});

ipcMain.handle('mirror:hide-ime', async (_e, { tabId }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    // KEYCODE_BACK (4) when IME is visible = closes IME only (not the app)
    // We only call this when we know IME is open (isWriting check in renderer)
    const buf = Buffer.alloc(14);
    buf[0] = 0x00;                    // TYPE_INJECT_KEYCODE
    buf[1] = 0;                       // action: KEY_DOWN
    buf.writeUInt32BE(4, 2);          // KEYCODE_BACK
    buf.writeUInt32BE(0, 6);          // repeat
    buf.writeUInt32BE(0, 10);         // metaState
    session.controlSock.write(buf);
    setTimeout(() => {
      try {
        const buf2 = Buffer.alloc(14);
        buf2[0] = 0x00;
        buf2[1] = 1;                  // action: KEY_UP
        buf2.writeUInt32BE(4, 2);     // KEYCODE_BACK
        buf2.writeUInt32BE(0, 6);
        buf2.writeUInt32BE(0, 10);
        session.controlSock.write(buf2);
      } catch {}
    }, 50);
    return true;
  } catch(e) {
 return false; }
});

ipcMain.handle('mirror:show-ime', async (_e, { tabId }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    // Best way to show IME: inject a touch event at the center of the screen
    // The app's text field should be focused, so a tap will trigger the IME
    // Use INJECT_TOUCH at approximate text field location
    const displayId = session.displayId || 0;
    // Try adb to show soft input
    const out = await adb(['-s', session.deviceId, 'shell',
      `cmd input_method show-soft-input 2>/dev/null; echo ok`
    ]);
    return true;
  } catch(e) {
 return false; }
});

ipcMain.handle('mirror:touch-down', async (_e, { tabId, x, y, width, height }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    session.controlSock.write(makeTouchBuf(0, x, y, width, height)); // ACTION_DOWN
    return true;
  } catch(e) { return false; }
});

ipcMain.handle('mirror:touch-up', async (_e, { tabId, x, y, width, height }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    session.controlSock.write(makeTouchBuf(1, x, y, width, height)); // ACTION_UP
    return true;
  } catch(e) { return false; }
});

ipcMain.handle('mirror:touch-move', async (_e, { tabId, x, y, width, height }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    session.controlSock.write(makeTouchBuf(2, x, y, width, height)); // ACTION_MOVE
    return true;
  } catch(e) { return false; }
});

// Shared touch buffer builder
function makeTouchBuf(action, x, y, w, h, pointerId = -1, pressure = null) {
  const buf = Buffer.alloc(32);
  buf[0] = 0x02; // INJECT_TOUCH_EVENT
  buf[1] = action;
  buf.writeBigInt64BE(BigInt(pointerId), 2);
  buf.writeInt32BE(Math.round(x), 10);
  buf.writeInt32BE(Math.round(y), 14);
  buf.writeUInt16BE(w || 1920, 18);
  buf.writeUInt16BE(h || 1080, 20);
  buf.writeUInt16BE(pressure !== null ? pressure : (action === 1 ? 0 : 0xffff), 22);
  buf.writeUInt32BE(0x00000001, 24); // BUTTON_PRIMARY
  buf.writeUInt32BE(0x00000000, 28);
  return buf;
}

ipcMain.handle('mirror:scroll', async (_e, { tabId, x, y, hscroll, vscroll, width, height }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    const buf = Buffer.alloc(21);
    const w = width  || 1920;
    const h = height || 1080;
    buf[0] = 0x03;
    buf.writeInt32BE(Math.round(x), 1);
    buf.writeInt32BE(Math.round(y), 5);
    buf.writeUInt16BE(w, 9);
    buf.writeUInt16BE(h, 11);
    buf.writeInt16BE(Math.round((hscroll || 0) * 0x7fff), 13);
    buf.writeInt16BE(Math.round((vscroll || 0) * 0x7fff), 15);
    buf.writeUInt32BE(1, 17);
    session.controlSock.write(buf);
    return true;
  } catch(e) {
 return false; }
});

ipcMain.handle('mirror:pinch-zoom', async (_e, { tabId, x, y, zoom, width, height }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    const sock = session.controlSock;
    const w = width || 1920, h = height || 1080;

    // scrcpy method: real finger at cursor + virtual finger inverted through screen center
    const screenCx = w / 2, screenCy = h / 2;
    const f0x = Math.round(x), f0y = Math.round(y);
    const f1x = Math.round(2 * screenCx - x), f1y = Math.round(2 * screenCy - y);

    // Direction from screen center toward cursor (for movement)
    const dx = x - screenCx, dy = y - screenCy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const ux = dx/len, uy = dy/len;
    const STEP = zoom * 80; // pixels each finger moves

    function makeBuf(action, pid, px, py) {
      const b = Buffer.alloc(32);
      b[0] = 0x02; b[1] = action & 0xff;
      b.writeBigInt64BE(BigInt(pid), 2);
      b.writeInt32BE(Math.max(0, Math.min(w-1, Math.round(px))), 10);
      b.writeInt32BE(Math.max(0, Math.min(h-1, Math.round(py))), 14);
      b.writeUInt16BE(w,18); b.writeUInt16BE(h,20);
      const up = (action&0xff)===1||(action&0xff)===6;
      b.writeUInt16BE(up?0:0xffff,22); b.writeUInt32BE(0,24); b.writeUInt32BE(0,28);
      return b;
    }

    const delay = ms => new Promise(r => setTimeout(r, ms));
    const STEPS = 6;

    // 1. Both fingers down
    sock.write(makeBuf(0, 0, f0x, f0y));          // finger 0 DOWN
    await delay(8);
    sock.write(makeBuf(0x0105, 1, f1x, f1y));      // finger 1 DOWN (POINTER_DOWN idx 1)
    await delay(8);

    // 2. Move both fingers smoothly
    for (let i = 1; i <= STEPS; i++) {
      const t = i / STEPS;
      sock.write(makeBuf(2, 0, f0x + ux*STEP*t, f0y + uy*STEP*t));
      sock.write(makeBuf(2, 1, f1x - ux*STEP*t, f1y - uy*STEP*t));
      await delay(5);
    }

    // 3. Both fingers up
    sock.write(makeBuf(0x0106, 1, f1x - ux*STEP, f1y - uy*STEP)); // finger 1 UP
    await delay(8);
    sock.write(makeBuf(1, 0, f0x + ux*STEP, f0y + uy*STEP));       // finger 0 UP

    return true;
  } catch(e) {
 return false; }
});
// Ctrl+drag pinch — real finger (id=0) + virtual finger (id=1, inverted pos)
const VIRTUAL_FINGER_ID = BigInt(-4); // scrcpy's POINTER_ID_VIRTUAL_FINGER

function makePinchBuf(action, isVirtual, px, py, w, h) {
  const b = Buffer.alloc(32);
  b[0] = 0x02; b[1] = action & 0xff;
  b.writeBigInt64BE(isVirtual ? VIRTUAL_FINGER_ID : BigInt(-1), 2);
  b.writeInt32BE(Math.max(0, Math.min(w, Math.round(px))), 10);
  b.writeInt32BE(Math.max(0, Math.min(h, Math.round(py))), 14);
  b.writeUInt16BE(w, 18); b.writeUInt16BE(h, 20);
  const up = (action&0xff)===1||(action&0xff)===6;
  b.writeUInt16BE(up ? 0 : 0xffff, 22);
  b.writeUInt32BE(0, 24); b.writeUInt32BE(0, 28);
  return b;
}

ipcMain.handle('mirror:pinch-start', async (_e, { tabId, x, y, vx, vy, width, height }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  const w = width||1920, h = height||1080;
  try {
    const sock = session.controlSock;
    sock.write(makePinchBuf(0,      false, x,  y,  w, h)); // real finger DOWN
    await new Promise(r=>setTimeout(r,8));
    sock.write(makePinchBuf(0x0105, true,  vx, vy, w, h)); // virtual finger DOWN
    return true;
  } catch(e) { return false; }
});

ipcMain.handle('mirror:pinch-move', async (_e, { tabId, x, y, vx, vy, width, height }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  const w = width||1920, h = height||1080;
  try {
    const sock = session.controlSock;
    sock.write(makePinchBuf(2, false, x,  y,  w, h)); // real finger MOVE
    sock.write(makePinchBuf(2, true,  vx, vy, w, h)); // virtual finger MOVE
    return true;
  } catch(e) { return false; }
});

ipcMain.handle('mirror:pinch-end', async (_e, { tabId, x, y, vx, vy, width, height }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  const w = width||1920, h = height||1080;
  try {
    const sock = session.controlSock;
    sock.write(makePinchBuf(0x0106, true,  vx, vy, w, h)); // virtual finger UP
    await new Promise(r=>setTimeout(r,8));
    sock.write(makePinchBuf(1,      false, x,  y,  w, h)); // real finger UP
    return true;
  } catch(e) { return false; }
});

ipcMain.handle('mirror:tap', async (_e, { tabId, x, y, width, height }) => {
  const session = sessions.get(tabId);
  if (!session || !session.controlSock) return false;
  const rx = Math.round(x), ry = Math.round(y);
  const w = width || 1920, h = height || 1080;
  try {
    session.controlSock.write(makeTouchBuf(0, rx, ry, w, h));
    await new Promise(r => setTimeout(r, 80));
    session.controlSock.write(makeTouchBuf(1, rx, ry, w, h));
    return true;
  } catch(e) { return false; }
});

ipcMain.handle('mirror:key', async (_e, { tabId, text }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    // INJECT_TEXT message: type(1) + length(4) + utf8 text
    const encoded = Buffer.from(text, 'utf8');
    const buf = Buffer.alloc(1 + 4 + encoded.length);
    buf[0] = 0x01; // SC_CONTROL_MSG_TYPE_INJECT_TEXT
    buf.writeUInt32BE(encoded.length, 1);
    encoded.copy(buf, 5);
    session.controlSock.write(buf);
    return true;
  } catch(e) {
 return false; }
});

ipcMain.handle('mirror:keyevent', async (_e, { tabId, keycode, action, meta }) => {
  const session = sessions.get(tabId);
  if (!session?.controlSock) return false;
  try {
    // INJECT_KEYCODE: type(1) + action(1) + keycode(4) + repeat(4) + metaState(4) = 14 bytes
    const buf = Buffer.alloc(14);
    buf[0] = 0x00; // SC_CONTROL_MSG_TYPE_INJECT_KEYCODE
    buf[1] = action || 0; // 0=down, 1=up
    buf.writeUInt32BE(keycode, 2);
    buf.writeUInt32BE(0, 6);          // repeat
    buf.writeUInt32BE(meta || 0, 10); // metaState (shift etc)
    session.controlSock.write(buf);
    return true;
  } catch(e) {
 return false; }
});

async function startMirror(opts) {
  const { deviceId, appPackage, tabId, resolution = '1920x1080', maxFps = 60 } = opts;
  const iFrameInterval = opts.iFrameInterval || 3;
  const bitrate = (opts.bitrate || 8) * 1000000;
  const dpi = opts.dpi || 240;
  const turnScreenOff = opts.turnScreenOff === true;
  const useMainDisplay = opts.useMainDisplay === true;
  const [w, h] = resolution.split('x').map(Number);

  // scid: positive 28-bit hex
  const scid = (crypto.randomBytes(4).readUInt32BE(0) & 0x0FFFFFFF).toString(16).padStart(8, '0');

  // Push server
  const jar = serverPath();
  if (!jar) throw new Error('scrcpy-server not found');
  const isJar = jar.endsWith('.jar');
  const deviceServerPath = isJar ? '/data/local/tmp/scrcpy-server.jar' : '/data/local/tmp/scrcpy-server';
  const srvVersion = serverVersion();
  execFileSync(binPath('adb'), ['-s', deviceId, 'push', jar, deviceServerPath], { timeout: 10000 });
  execFileSync(binPath('adb'), ['-s', deviceId, 'shell', `chmod 755 ${deviceServerPath}`], { timeout: 3000 });

  // Free port
  const port = await freePort();

  // ADB reverse
  execFileSync(binPath('adb'), ['-s', deviceId, 'reverse', `localabstract:scrcpy_${scid}`, `tcp:${port}`], { timeout: 5000 });

  // Launch server
  const cmd = [
    `CLASSPATH=${deviceServerPath}`,
    `app_process / com.genymobile.scrcpy.Server ${srvVersion}`,
    `scid=${scid}`,
    `log_level=info`,
    `audio=false`,
    `stay_awake=${turnScreenOff ? 'false' : 'true'}`,
    `video_codec=h264`,
    `max_fps=${maxFps}`,
    `video_bit_rate=${bitrate}`,
    useMainDisplay ? null : `new_display=${w}x${h}/240`,
    useMainDisplay ? `max_size=${Math.max(w,h)}` : null,
    `video_codec_options=i-frame-interval=${iFrameInterval}`,
    useMainDisplay ? null : `vd_system_decorations=false`,
  ].filter(Boolean).join(' ');
  const proc = spawn(binPath('adb'), ['-s', deviceId, 'shell', cmd], {
    stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  });
  let displayId = 0;
  let displayWidth = w;
  let displayHeight = h;
  proc.stdout.on('data', d => {
    const msg = d.toString().trim();
    const m = msg.match(/New display:\s*(\d+)x(\d+).*\(id=(\d+)\)/);
    if (m) {
      displayWidth = parseInt(m[1]);
      displayHeight = parseInt(m[2]);
      displayId = parseInt(m[3]);
    }
  });
  proc.stderr.on('data', d => { console.log('[scrcpy stderr]', d.toString().trim()); });

  // Accept connections from scrcpy-server
  const sockets = await new Promise((resolve, reject) => {
    const conns = [];
    const srv = net.createServer(sock => {
      conns.push(sock);
      if (conns.length >= 2) { srv.close(); resolve(conns); }
    });
    srv.listen(port, '127.0.0.1');
    srv.on('error', reject);
    setTimeout(() => { srv.close(); conns.length ? resolve(conns) : reject(new Error('timeout')); }, 6000);
  });

  const videoSock = sockets[0];

  // Protocol 4.0: 64 device name + 4 codec = 68 bytes
  // Session packets: bit7=1, 12 bytes (flags+reserved+width+height), no size field
  // Media packets: bit7=0, 12 bytes header (PTS 8 + size 4) + payload
  let hBuf = Buffer.alloc(0);
  let pBuf = Buffer.alloc(0);
  let hDone = false;
  const H = 68;

  videoSock.on('data', chunk => {
    if (!hDone) {
      hBuf = Buffer.concat([hBuf, chunk]);
      if (hBuf.length < H) return;
      hDone = true;
      const name  = hBuf.slice(0, 64).toString('utf8').replace(/\0/g, '').trim();
      const codec = hBuf.readUInt32BE(64).toString(16);
      const width  = displayWidth;
      const height = displayHeight;
      // Don't send meta yet - wait for displayId first
      const waitForDisplay = useMainDisplay
        ? Promise.resolve(0)
        : new Promise(resolve => {
          if (displayId) { resolve(displayId); return; }
          const check = setInterval(() => {
            if (displayId) { clearInterval(check); resolve(displayId); }
          }, 100);
          setTimeout(() => { clearInterval(check); resolve(0); }, 5000);
        });
      waitForDisplay.then(dId => {
        // Now send meta with the real displayId
        if (win) win.webContents.send('mirror:meta', { tabId, width, height, displayId: dId });
        const userId = opts.userId || 0;
        const secureFolder = opts.secureFolder || false;
        try {
          if (dId > 0 && appPackage && !secureFolder) {
            // Regular app on virtual display
            const actOut = execFileSync(binPath('adb'), ['-s', deviceId, 'shell',
              `cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.LAUNCHER --user ${userId} ${appPackage} 2>/dev/null | tail -1`
            ], { timeout: 5000 }).toString().trim();
            if (actOut && actOut.includes('/')) {
              execFileSync(binPath('adb'), ['-s', deviceId, 'shell',
                `am start --display ${dId} --user ${userId} -n ${actOut}`
              ], { timeout: 5000 });
            } else {
              execFileSync(binPath('adb'), ['-s', deviceId, 'shell',
                `monkey --user ${userId} -p ${appPackage} -c android.intent.category.LAUNCHER 1`
              ], { timeout: 5000 });
            }
          } else if (dId > 0 && appPackage && secureFolder) {
            // Secure Folder: usar mensaje de control START_APP (type=16)
            // Formato: [0x10][len(1 byte)][package name UTF-8]
            const ctrl = sockets[1] || null;
            if (ctrl) {
              const pkgBuf = Buffer.from(appPackage, 'utf8');
              const msg = Buffer.alloc(2 + pkgBuf.length);
              msg[0] = 0x10; // SC_CONTROL_MSG_TYPE_START_APP
              msg[1] = pkgBuf.length; // tiny string: 1-byte length prefix
              pkgBuf.copy(msg, 2);
              ctrl.write(msg);
              console.log('[SF] START_APP control message sent:', appPackage);
            } else {
              console.log('[SF] no control socket available');
            }
          } else if (secureFolder) {
            // Secure Folder: always on main display (Samsung blocks --display)
            execFileSync(binPath('adb'), ['-s', deviceId, 'shell',
              'am start -n com.samsung.knox.securefolder/.presentation.switcher.view.SecureFolderShortcutActivity'
            ], { timeout: 5000 });
          } else if (appPackage) {
            execFileSync(binPath('adb'), ['-s', deviceId, 'shell',
              `monkey --user ${userId} -p ${appPackage} -c android.intent.category.LAUNCHER 1`
            ], { timeout: 5000 });
          }
          // Turn off screen and keep it off
          if (turnScreenOff) {
            setTimeout(async () => {
              const existingScreenOff = [...sessions.values()].find(s => s.deviceId === deviceId && s._screenOffActive);
              if (existingScreenOff) return;
              const sess = sessions.get(tabId);
              if (sess) sess._screenOffActive = true;
              try {
                // SET_DISPLAY_POWER via control socket: type=10 (0x0A), mode=0 (off)
                // This turns off screen without locking
                const ctrl = sess?.controlSock;
                if (ctrl) {
                  const buf = Buffer.alloc(2);
                  buf[0] = 0x0A; // SC_CONTROL_MSG_TYPE_SET_DISPLAY_POWER
                  buf[1] = 0x00; // POWER_MODE_OFF
                  ctrl.write(buf);
                }
              } catch(e) {}
            }, 1500);
          }

          // Start audio capture for this device (shared across all tabs)
          if (opts.audioEnabled) {
            if (deviceAudioProcs.has(deviceId)) {
              deviceAudioProcs.get(deviceId).refCount++;
            } else {
              try {
                const scrcpyBin = binPath('scrcpy');
                const ap = spawn(scrcpyBin, [
                  '--serial', deviceId,
                  '--no-video',
                  '--no-control',
                  '--no-window',
                  '--audio-source=playback',
                  '--audio-codec=opus',
                  '--audio-buffer=50',
                ], { stdio: 'ignore', windowsHide: true });
                ap.on('error', () => {});
                ap.on('exit', c => {
                  deviceAudioProcs.delete(deviceId);
                });
                deviceAudioProcs.set(deviceId, { proc: ap, refCount: 1 });
              } catch(e) {}
            }
          }
        } catch(e) {
 }
      });
      // Forward any remaining bytes
      const rest = hBuf.slice(H);
      if (rest.length) { pBuf = rest; drain(); }
      return;
    }
    pBuf = Buffer.concat([pBuf, chunk]);
    drain();
  });

  let frameCount = 0;
  function drain() {
    while (pBuf.length >= 12) {
      const pts0 = pBuf[0];
      const isSession = (pts0 & 0x80) !== 0;

      if (isSession) {
        // Session packet: 12 bytes, no size field, contains width+height
        const sw = pBuf.readUInt32BE(4);
        const sh = pBuf.readUInt32BE(8);
        pBuf = pBuf.slice(12);
        if (sw > 0 && sh > 0 && win && !win.isDestroyed()) {
          win.webContents.send('mirror:meta', { tabId, width: sw, height: sh, displayId });
        }
        continue;
      }

      // Media packet: PTS(8) + size(4) + payload
      const sz = pBuf.readUInt32BE(8);
      if (pBuf.length < 12 + sz) break;
      const payload = pBuf.slice(12, 12 + sz);
      pBuf = pBuf.slice(12 + sz);
      frameCount++;
      if (payload.length && win && !win.isDestroyed()) {
        const ab = payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength);
        win.webContents.send('mirror:chunk', { tabId, data: ab });
      }
    }
  }

  videoSock.on('end',   ()  => {
 if (win) win.webContents.send('mirror:ended', { tabId, unexpected: !_manuallyStopped.has(tabId) }); _manuallyStopped.delete(tabId); stopSession(tabId); });
  videoSock.on('error', err => {
 if (win) win.webContents.send('mirror:error', { tabId, error: err.message }); });
  proc.on('exit', code => {
 });

  // sockets[0] = video, [1] = audio (if enabled), last = control
  const audioSock   = null; // audio not supported with new_display
  const controlSock = sockets[1] || null;

  // Stream audio chunks to renderer
  if (audioSock) {
    let aHdrDone = false;
    let aHdrBuf = Buffer.alloc(0);
    const AUDIO_HDR = 12; // 4 codec + 4 width(unused) + 4 height(unused)
    audioSock.on('data', chunk => {
      if (!aHdrDone) {
        aHdrBuf = Buffer.concat([aHdrBuf, chunk]);
        if (aHdrBuf.length < AUDIO_HDR) return;
        aHdrDone = true;
        chunk = aHdrBuf.slice(AUDIO_HDR);
        if (!chunk.length) return;
      }
      // Audio packet: 8-byte PTS + 4-byte size + payload (same as video)
      let off = 0;
      while (off + 12 <= chunk.length) {
        const pts  = chunk.readBigUInt64BE(off);
        const size = chunk.readUInt32BE(off + 8);
        off += 12;
        if (off + size > chunk.length) break;
        const pkt = chunk.slice(off, off + size);
        off += size;
        if (win && !win.isDestroyed()) {
          win.webContents.send('mirror:audio', { tabId, data: Array.from(pkt), pts: Number(pts) });
        }
      }
    });
    audioSock.on('error', () => {});
  }

  sessions.set(tabId, {
    controlSock,
    audioSock,
    deviceId,
    displayId,
    cleanup: () => {
      for (const s of sockets) { try { s.destroy(); } catch {} }
      try { proc.kill(); } catch {}
      adb(['-s', deviceId, 'reverse', '--remove', `localabstract:scrcpy_${scid}`]);
    }
  });

  return { tabId, status: 'running' };
}

const _manuallyStopped = new Set(); // tabIds stopped intentionally by user

function stopSession(id) {
  _manuallyStopped.add(id);
  const s = sessions.get(id);
  if (s) {
    if (s._screenOffInterval) clearInterval(s._screenOffInterval);

    const remainingForDevice = [...sessions.entries()].filter(([sid, sess]) => sid !== id && sess.deviceId === s.deviceId);

    if (remainingForDevice.length === 0) {
      // Last session for this device — turn screen back on if we turned it off
      if (s._screenOffActive) {
        // Try via control socket first, fallback to adb
        try {
          const buf = Buffer.alloc(2);
          buf[0] = 0x0A; // SET_DISPLAY_POWER
          buf[1] = 0x02; // POWER_MODE_NORMAL
          s.controlSock?.write(buf);
        } catch(e) {}
      }
    } else {
      // Transfer screen-off flag to another session
      const [, otherSess] = remainingForDevice[0];
      if (s._screenOffActive && !otherSess._screenOffActive) {
        otherSess._screenOffActive = true;
      }
    }

    // Stop audio process if no more sessions for this device
    const anyLeft = [...sessions.entries()].some(([sid, sess]) => sid !== id && sess.deviceId === s.deviceId);
    if (!anyLeft && deviceAudioProcs.has(s.deviceId)) {
      const entry = deviceAudioProcs.get(s.deviceId);
      entry.refCount = Math.max(0, entry.refCount - 1);
      if (entry.refCount === 0) {
        try { entry.proc.kill(); } catch {}
        deviceAudioProcs.delete(s.deviceId);
      }
    }
    s.cleanup();
    sessions.delete(id);
  }
}
function killAll() {
  for (const s of sessions.values()) s.cleanup();
  sessions.clear();
}
function freePort() {
  return new Promise((res, rej) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => res(p)); });
    srv.on('error', rej);
  });
}

function pkgLabel(pkg) {
  const l = pkg.split('.').pop() || pkg;
  return l.charAt(0).toUpperCase() + l.slice(1);
}