'use strict';

// ── Settings ───────────────────────────────────────────────────────────────
const PRESETS = {
  ultra:  { resolution:'2560x1440', maxFps:60, bitrate:16 },
  high:   { resolution:'1920x1080', maxFps:60, bitrate:8 },
  medium: { resolution:'1280x720',  maxFps:45, bitrate:4 },
  low:    { resolution:'960x540',   maxFps:30, bitrate:2 },
};
function defaultSettings() {
  return { preset:'high', performance:{ ...PRESETS.high, iFrameInterval:3 },
    audio:{ enabled:true, codec:'opus', source:'device', volume:80 },
    device:{ turnScreenOff:true } };
}
function loadSettings() {
  try { return JSON.parse(localStorage.getItem('td-settings') || 'null') || defaultSettings(); }
  catch { return defaultSettings(); }
}
function saveSettings() { localStorage.setItem('td-settings', JSON.stringify(state.settings)); }


// ── License gate ───────────────────────────────────────────────────────────
function showLicenseScreen(errorMsg) {
  const screen = document.createElement('div');
  screen.id = 'license-screen';
  screen.style.cssText = 'position:fixed;inset:0;background:#0d0d0d;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:0;-webkit-app-region:drag';

  screen.innerHTML = `
    <div style="-webkit-app-region:no-drag;display:flex;flex-direction:column;align-items:center;gap:24px;width:360px">
      <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px">TabPilot</div>
      <div style="font-size:13px;color:#666;margin-top:-16px">Activate your license to continue</div>
      <div style="width:100%;display:flex;flex-direction:column;gap:10px">
        <input id="lic-input" type="text" placeholder="TABP-XXXX-XXXX-XXXX" maxlength="19" autocomplete="off" spellcheck="false"
          style="width:100%;box-sizing:border-box;background:#1a1a1a;border:1px solid #333;border-radius:10px;color:#fff;font-size:15px;padding:12px 16px;text-align:center;letter-spacing:2px;outline:none;font-family:monospace">
        <button id="lic-btn" style="width:100%;background:#2a5cdb;color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer">
          Activate
        </button>
      </div>
      <div id="lic-msg" style="font-size:12px;color:#e06060;min-height:16px;text-align:center">${errorMsg || ''}</div>
      <div style="font-size:11px;color:#444;text-align:center">Contact your administrator if you need a license key.</div>
    </div>`;

  document.body.appendChild(screen);

  const inp = document.getElementById('lic-input');
  const btn = document.getElementById('lic-btn');
  const msg = document.getElementById('lic-msg');

  // Auto-format key as user types
  inp.addEventListener('input', () => {
    let v = inp.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 16);
    const parts = [];
    for (let i = 0; i < v.length; i += 4) parts.push(v.slice(i, i+4));
    inp.value = parts.join('-');
  });

  const activate = async () => {
    const key = inp.value.trim();
    if (!key) return;
    btn.disabled = true;
    btn.textContent = 'Activating…';
    msg.textContent = '';
    msg.style.color = '#888';
    const result = await window.td.activateLicense(key);
    if (result.success) {
      msg.style.color = '#4caf50';
      msg.textContent = 'License activated!';
      setTimeout(() => { screen.remove(); initApp(); }, 800);
    } else {
      btn.disabled = false;
      btn.textContent = 'Activate';
      msg.style.color = '#e06060';
      msg.textContent = result.error || 'Activation failed.';
    }
  };

  btn.addEventListener('click', activate);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') activate(); });
  setTimeout(() => inp.focus(), 100);
}

// ── App init (called after license is validated) ───────────────────────────
function initApp() {
  const shell = document.getElementById('shell');
  if (shell) shell.style.display = '';
}

// ── License check on load ──────────────────────────────────────────────────
window.td.onLicenseValid(() => initApp());
window.td.onLicenseRequired(msg => showLicenseScreen(msg));
// Show a subtle loading screen while main process validates
{
  const loading = document.createElement('div');
  loading.id = 'license-loading';
  loading.style.cssText = 'position:fixed;inset:0;background:#0d0d0d;display:flex;align-items:center;justify-content:center;z-index:9998;flex-direction:column;gap:16px;-webkit-app-region:drag';
  loading.innerHTML = `
    <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px">TabPilot</div>
    <div style="width:24px;height:24px;border:2px solid #333;border-top-color:#666;border-radius:50%;animation:spin .7s linear infinite"></div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  document.body.appendChild(loading);

  // Remove loading screen when license result arrives
  const removeLoading = () => document.getElementById('license-loading')?.remove();
  window.td.onLicenseValid(removeLoading);
  window.td.onLicenseRequired(removeLoading);
}
window.td.onLicenseRevoked(() => {
  // Close all tabs cleanly
  [...state.tabs].forEach(t => {
    try { stopMirror(t.id); } catch {}
  });
  state.tabs = [];
  document.getElementById('tabs').innerHTML = '';
  document.getElementById('panes').innerHTML = '';
  // Hide the shell
  const shell = document.getElementById('shell');
  if (shell) shell.style.display = 'none';
  // Show activation screen with revocation message
  const existing = document.getElementById('license-screen');
  if (existing) existing.remove();
  showLicenseScreen('Your license has been revoked. Contact your administrator.');
});

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  devices:[], selectedDevice:null, users:[], apps:[],
  iconCache:{}, tabs:[], activeTab:null, tabCounter:0,
  panel:null, modalDevice:null, modalApp:null,
  decoders: new Map(), settings: loadSettings(),
};

// ── DOM ────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const panesEl    = $('panes');
const emptyEl    = $('empty');
const emptyStatus= $('empty-status');
const panelEl    = $('panel');
const panelTitle = $('panel-title');
const panelBody  = $('panel-body');
const backdropEl = $('modal-backdrop');
const modalDevs  = $('modal-devices');
const modalSearch= $('modal-search');
const modalLaunch= $('modal-launch');
// modalApps is lazy because shell starts hidden
const getModalApps = () => $('modal-apps');

// ── Focus management ───────────────────────────────────────────────────────
// Track whether canvas is focused (keys go to device)
let typingMode = false;
const TAB_WRITE = new Map(); // tabId → boolean, per-tab writing mode

function isWriting(tabId) {
  return TAB_WRITE.get(tabId || state.activeTab) || false;
}

function setTypingMode(on) {
  typingMode = on;
  updateWritingBtn();
}

function setWritingMode(on, tabId) {
  const id = tabId || state.activeTab;
  if (id) TAB_WRITE.set(id, on);
  updateWritingBtn();
}

function updateWritingBtn() {
  const btn = $('writing-mode-btn');
  if (!btn) return;
  const writing = isWriting(state.activeTab);
  btn.style.display = typingMode ? 'flex' : 'none';
  if (typingMode) {
    btn.style.background = writing ? 'var(--acc)' : 'none';
    btn.style.color = writing ? '#fff' : 'var(--t2)';
    btn.textContent = writing ? '⌨ Write' : '⌨ Zones';
    btn.title = writing
      ? 'Writing mode — all keys to device, zones disabled. Click to toggle.'
      : 'Zone mode — zone keys trigger taps. Click to type freely.';
  }
}

function updateDeviceStatus() {
  const el = $('topbar-device-status');
  if (!el) return;
  const online = state.devices.filter(d=>d.state==='device');
  if (state.tabs.length > 0 && online.length > 0) {
    el.style.display = 'flex';
    $('device-status-text').textContent = `${online.length} device${online.length>1?'s':''} connected`;
  } else {
    el.style.display = 'none';
  }
}

function updateMacroStatus() {
  const el = $('topbar-macro-status');
  if (!el) return;
  const activeMacros = state.tabs.filter(t => getMacro(t.id)?.enabled).length;
  if (activeMacros > 0) {
    el.style.display = 'flex';
    $('macro-status-text').textContent = `Macro active (${activeMacros})`;
  } else {
    el.style.display = 'none';
  }
}

function focusActiveCanvas() {
  if (!state.activeTab) return;
  const canvas = $('canvas-' + state.activeTab);
  if (canvas && canvas.style.display !== 'none') {
    canvas.focus({ preventScroll: true });
    setTypingMode(true);
  }
}

// ── Zone system ────────────────────────────────────────────────────────────
const PKG_ZONES = new Map(); // package → zones (shared across all instances of same app)

function getPkg(tabId) {
  return state.tabs.find(t => t.id === tabId)?.pkg || tabId;
}

// Nicknames: stored per "pkg:userId" so each user's instance can have its own name
function nickKey(pkg, userId, deviceId) { return `nick:${deviceId||''}:${pkg}:${+userId||0}`; }
function getNick(pkg, userId, deviceId) {
  try { return localStorage.getItem(nickKey(pkg, +userId||0, deviceId)) || ''; } catch { return ''; }
}
function setNick(pkg, userId, deviceId, name) {
  try {
    if (name) localStorage.setItem(nickKey(pkg, +userId||0, deviceId), name);
    else localStorage.removeItem(nickKey(pkg, +userId||0, deviceId));
  } catch {}
}
function getZones(tabId) {
  return PKG_ZONES.get(getPkg(tabId)) || [];
}
function setZones(tabId, zones) {
  const pkg = getPkg(tabId);
  PKG_ZONES.set(pkg, zones);
  try { localStorage.setItem('zones:pkg:' + pkg, JSON.stringify(zones)); } catch {}
  // Re-render all other tabs with the same app
  state.tabs.forEach(t => {
    if (t.id !== tabId && getPkg(t.id) === pkg) {
      renderZones(t.id, false);
    }
  });
}
function loadZones(tabId) {
  const pkg = getPkg(tabId);
  if (PKG_ZONES.has(pkg)) return; // already loaded
  try {
    const saved = localStorage.getItem('zones:pkg:' + pkg);
    if (saved) PKG_ZONES.set(pkg, JSON.parse(saved));
  } catch {}
}

let suppressNextHover = false;

function renderZones(tabId, editMode) {
  const canvas = $('canvas-' + tabId);
  const overlay = $('zone-overlay-' + tabId);
  if (!overlay || !canvas) return;

  if (!editMode) { overlay.innerHTML = ''; overlay.style.pointerEvents = 'none'; return; }

  const zones = getZones(tabId);
  const rect = canvas.getBoundingClientRect();
  const mirrorRect = overlay.parentElement.getBoundingClientRect();
  const offsetX = rect.left - mirrorRect.left;
  const offsetY = rect.top  - mirrorRect.top;
  const sx = rect.width  / canvas.width;
  const sy = rect.height / canvas.height;

  const ghost = overlay.querySelector('.zone-ghost');

  const boxes = zones.map((z, i) => {
    const div = document.createElement('div');
    div.className = 'zone-box editable';
    div.style.cssText = `left:${offsetX + z.x*sx}px;top:${offsetY + z.y*sy}px;width:${z.w*sx}px;height:${z.h*sy}px;cursor:grab`;
    div.innerHTML = `<span class="zone-label">${z.name ? z.key+' · '+z.name : z.key}</span>`;

    // ── Drag to move ──────────────────────────────────────────────
    let dragging = false, dragStartMX, dragStartMY, dragStartZX, dragStartZY;
    div.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.stopPropagation();
      dragging = false;
      dragStartMX = e.clientX; dragStartMY = e.clientY;
      dragStartZX = z.x; dragStartZY = z.y;
      div.style.cursor = 'grabbing';
      div.style.zIndex = '20';

      const onMove = ev => {
        const dx = ev.clientX - dragStartMX;
        const dy = ev.clientY - dragStartMY;
        if (!dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
          dragging = true;
          clearTimeout(hoverTimer);
          closeZoneMenu();
        }
        if (!dragging) return;
        const newX = Math.max(0, Math.round(dragStartZX + dx / sx));
        const newY = Math.max(0, Math.round(dragStartZY + dy / sy));
        div.style.left = (offsetX + newX * sx) + 'px';
        div.style.top  = (offsetY + newY * sy) + 'px';
        z.x = newX; z.y = newY;
      };
      const onUp = () => {
        div.style.cursor = 'grab';
        div.style.zIndex = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (dragging) {
          dragging = false;
          setZones(tabId, zones);
          // Re-render but block the hover that fires when new element appears under cursor
          suppressNextHover = true;
          renderZones(tabId, true);
          setTimeout(() => { suppressNextHover = false; }, 300);
        }
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // ── Hover → show context menu after 600ms ─────────────────────
    let hoverTimer;
    div.addEventListener('mouseenter', () => {
      if (suppressNextHover) return;
      hoverTimer = setTimeout(() => {
        if (!dragging) showZoneMenu(div, tabId, zones, i, z);
      }, 600);
    });
    div.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
    });

    return div;
  });

  [...overlay.children].forEach(el => {
    if (!el.classList.contains('zone-ghost')) el.remove();
  });
  boxes.forEach(b => overlay.appendChild(b));

  overlay.style.pointerEvents = 'all';
}

window.deleteZone = (tabId, idx) => {
  setZones(tabId, getZones(tabId).filter((_,i) => i !== idx));
  renderZones(tabId, true);
  if (state.panel === 'shortcuts') renderScTab('actions');
};

function closeZoneMenu() {
  document.querySelectorAll('.zone-ctx-menu').forEach(m => m.remove());
}

function showZoneMenu(anchor, tabId, zones, idx, z) {
  closeZoneMenu();
  const menu = document.createElement('div');
  menu.className = 'zone-ctx-menu';
  const ar = anchor.getBoundingClientRect();
  menu.style.cssText = `position:fixed;left:${ar.right+6}px;top:${ar.top}px;z-index:999`;
  menu.innerHTML = `
    <div class="zcm-title">${z.name ? z.name : z.key}</div>
    <button class="zcm-btn" id="zcm-rekey">⌨ Change key</button>
    <button class="zcm-btn" id="zcm-rename">✏ ${z.name ? 'Rename' : 'Add name'}</button>
    <button class="zcm-btn zcm-del" id="zcm-delete">✕ Remove</button>`;
  document.body.appendChild(menu);

  const close = e => {
    if (!menu.contains(e.target)) { closeZoneMenu(); document.removeEventListener('mousedown', close); }
  };
  setTimeout(() => document.addEventListener('mousedown', close), 0);

  menu.querySelector('#zcm-rekey').onclick = () => {
    closeZoneMenu();
    showKeyDialog(null, captured => {
      zones[idx].key = captured.key;
      setZones(tabId, zones);
      renderZones(tabId, true);
      if (state.panel === 'shortcuts') renderScTab('actions');
    });
  };

  menu.querySelector('#zcm-rename').onclick = () => {
    closeZoneMenu();
    const name = prompt('Zone name (leave empty to remove):', z.name || '');
    if (name !== null) {
      zones[idx].name = name.trim();
      setZones(tabId, zones);
      renderZones(tabId, true);
    }
  };

  menu.querySelector('#zcm-delete').onclick = () => {
    closeZoneMenu();
    setZones(tabId, zones.filter((_,i) => i !== idx));
    renderZones(tabId, true);
    if (state.panel === 'shortcuts') renderScTab('actions');
  };
}

const ZONE_PX = 24;

function startZoneEditor(tabId) {
  const canvas = $('canvas-' + tabId);
  const overlay = $('zone-overlay-' + tabId);
  if (!canvas || !overlay) return;
  renderZones(tabId, true);
  overlay.style.cursor = 'crosshair';
  overlay.style.pointerEvents = 'all';
  const ghost = document.createElement('div');
  ghost.className = 'zone-ghost';
  ghost.style.cssText = `width:${ZONE_PX}px;height:${ZONE_PX}px;display:none;border-radius:50%`;
  overlay.appendChild(ghost);
  const onMove = e => {
    const mr = overlay.getBoundingClientRect();
    ghost.style.display = 'block';
    ghost.style.left = (e.clientX - mr.left - ZONE_PX/2) + 'px';
    ghost.style.top  = (e.clientY - mr.top  - ZONE_PX/2) + 'px';
  };
  const onClick = e => {
    if (e.target.classList.contains('zone-del')) return;
    // Ignore clicks on existing zone boxes
    if (e.target.closest('.zone-box')) return;
    const r  = canvas.getBoundingClientRect();
    const sx = canvas.width  / r.width;
    const sy = canvas.height / r.height;
    showKeyCapture(tabId, {
      x: Math.max(0, Math.round((e.clientX - r.left - ZONE_PX/2) * sx)),
      y: Math.max(0, Math.round((e.clientY - r.top  - ZONE_PX/2) * sy)),
      w: Math.round(ZONE_PX * sx), h: Math.round(ZONE_PX * sy),
    });
  };
  overlay.addEventListener('mousemove', onMove);
  overlay.addEventListener('click', onClick);
  overlay._cleanup = () => {
    overlay.removeEventListener('mousemove', onMove);
    overlay.removeEventListener('click', onClick);
    ghost.remove(); overlay.style.cursor = '';
    overlay.style.pointerEvents = 'none'; overlay.innerHTML = '';
  };
  showZoneDoneBtn(tabId);
}

function stopZoneEditor(tabId) {
  const overlay = $('zone-overlay-' + (tabId || state.activeTab));
  if (overlay?._cleanup) { overlay._cleanup(); delete overlay._cleanup; }
  renderZones(tabId || state.activeTab, false);
  $('zone-done-btn')?.remove();
  setTopbarLocked(false);
  focusActiveCanvas();
}

function showZoneDoneBtn(tabId) {
  $('zone-done-btn')?.remove();
  const btn = document.createElement('button');
  btn.id = 'zone-done-btn';
  btn.className = 'nav-btn';
  btn.style.cssText = 'background:#2a7a4a;color:#fff;border:1px solid #3a9a5a;opacity:1;pointer-events:all';
  btn.textContent = '✓ Done';
  btn.onclick = () => stopZoneEditor(tabId);
  const aboutBtn = $('nav-account');
  if (aboutBtn) aboutBtn.insertAdjacentElement('afterend', btn);
  else document.querySelector('#topbar-left').appendChild(btn);
}

function setTopbarLocked(locked) {
  document.querySelectorAll('.nav-btn, .nav-top, #btn-new').forEach(btn => {
    if (btn.id === 'zone-done-btn' || btn.id === 'macro-done-btn') return;
    btn.style.pointerEvents = locked ? 'none' : '';
    btn.style.opacity       = locked ? '0.35' : '';
  });
}

function enterZoneEditMode(tabId) {
  setTopbarLocked(true);
  closePanel();
  startZoneEditor(tabId);
}


function showKeyCapture(tabId, zoneData, onDone) {
  showKeyDialog(null, capturedKey => {
    const zones = getZones(tabId);
    zones.push({ ...zoneData, key: capturedKey.key, label: capturedKey.label });
    setZones(tabId, zones);
    if (onDone) onDone();
    else renderZones(tabId, true);
    if (state.panel === 'shortcuts') renderScTab('actions');
  });
}

function showKeyReassign(tabId, idx, zone) {
  showKeyDialog(zone, result => {
    const zones = getZones(tabId);
    zones[idx] = { ...zones[idx], key: result.key, label: result.label || result.key };
    setZones(tabId, zones);
    renderZones(tabId, false);
    if (state.panel === 'shortcuts') renderScTab('actions');
  });
}

function showKeyDialog(existing, onSave) {
  const dlg = document.createElement('div');
  dlg.className = 'key-capture-dialog';
  dlg.innerHTML = `<div class="kcd-inner">
    <div class="kcd-title">${existing ? 'Edit zone key' : 'Assign a key to this zone'}</div>
    <div class="kcd-hint">Press any key…</div>
    <div class="kcd-key" id="kcd-key">${existing ? existing.key : '—'}</div>
    <input class="kcd-label-in" id="kcd-label" placeholder="Zone name (optional)" maxlength="20" value="${existing?.label||''}">
    <div class="kcd-btns">
      <button class="btn-ghost kcd-cancel">Cancel</button>
      <button class="btn-accent kcd-save" ${existing?'':'disabled'}>Save</button>
    </div></div>`;
  document.body.appendChild(dlg);
  let capturedKey = existing?.key || '';
  const keyEl = dlg.querySelector('#kcd-key');
  const saveBtn = dlg.querySelector('.kcd-save');
  const labelIn = dlg.querySelector('#kcd-label');
  const onKey = e => {
    // Don't capture keys when typing in the name field
    if (document.activeElement === labelIn) return;
    e.preventDefault(); e.stopPropagation();
    if (e.key === 'Escape') { cleanup(); return; }
    if (['Control','Shift','Alt','Meta'].includes(e.key)) return;
    capturedKey = e.key;
    keyEl.textContent = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    saveBtn.disabled = false;
    // Focus name field so user can type a name
    setTimeout(() => labelIn.focus(), 50);
  };
  const cleanup = () => { document.removeEventListener('keydown', onKey, true); dlg.remove(); };
  document.addEventListener('keydown', onKey, true);
  dlg.querySelector('.kcd-cancel').onclick = cleanup;
  saveBtn.onclick = () => {
    cleanup();
    onSave({ key: capturedKey, label: labelIn.value.trim() });
  };
}

function startZoneMover(tabId, idx) {
  const canvas = $('canvas-' + tabId);
  const overlay = $('zone-overlay-' + tabId);
  if (!canvas || !overlay) return;

  const zones = getZones(tabId);
  const zone = zones[idx];

  // Show all zones + highlight the one being moved
  renderZones(tabId, true);
  overlay.style.cursor = 'crosshair';
  overlay.style.pointerEvents = 'all';

  // Ghost showing where zone will be placed
  const ghost = document.createElement('div');
  ghost.className = 'zone-ghost';
  ghost.style.cssText = `width:${ZONE_PX}px;height:${ZONE_PX}px;display:none;border-radius:50%;border-color:var(--acc2)`;
  overlay.appendChild(ghost);

  // Info banner
  const banner = document.createElement('div');
  banner.style.cssText = 'position:absolute;top:8px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.7);color:var(--acc2);font-size:11px;padding:4px 12px;border-radius:20px;pointer-events:none;white-space:nowrap';
  banner.textContent = `Click to move "${zone.label||zone.key}" — Escape to cancel`;
  overlay.appendChild(banner);

  const onMove = e => {
    const r = canvas.getBoundingClientRect();
    ghost.style.display = 'none';
  };
  const onClick = e => {
    if (e.target.classList.contains('zone-del')) return;
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width, sy = canvas.height / r.height;
    zones[idx] = {
      ...zone,
      x: Math.max(0, Math.round((e.clientX - r.left - ZONE_PX/2) * sx)),
      y: Math.max(0, Math.round((e.clientY - r.top  - ZONE_PX/2) * sy)),
      w: Math.round(ZONE_PX * sx), h: Math.round(ZONE_PX * sy),
    };
    setZones(tabId, zones);
    cleanup();
  };
  const onEsc = e => { if (e.key === 'Escape') { e.stopPropagation(); cleanup(); } };
  const cleanup = () => {
    overlay.removeEventListener('mousemove', onMove);
    overlay.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onEsc, true);
    ghost.remove(); banner.remove();
    overlay.style.cursor = '';
    overlay.style.pointerEvents = 'none';
    renderZones(tabId, false);
    $('zone-done-btn')?.remove();
    focusActiveCanvas();
  };
  overlay.addEventListener('mousemove', onMove);
  overlay.addEventListener('click', onClick);
  document.addEventListener('keydown', onEsc, true);

  // Done button in topbar
  showZoneDoneBtn(tabId);
  $('zone-done-btn').onclick = cleanup;
}

// ── Panel ──────────────────────────────────────────────────────────────────
function openPanelWith(name, title, html, onOpen) {
  setTypingMode(false);
  state.panel = name;
  panelTitle.textContent = title;
  panelBody.innerHTML = html;
  panelEl.classList.remove('hidden');
  const btn = document.querySelector(`.nav-btn[data-panel="${name}"]`);
  if (btn) {
    const rect = btn.getBoundingClientRect();
    panelEl.style.left = Math.min(rect.left, window.innerWidth - 328) + 'px';
  }
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('on', b.dataset.panel === name));
  onOpen?.();
}
function closePanel() {
  state.panel = null;
  panelEl.classList.add('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('on'));
  focusActiveCanvas();
}
$('panel-close').onclick = closePanel;

// Close panel on click outside — but not when zones or macro are active
document.addEventListener('mousedown', e => {
  if (!state.panel) return;
  if (panelEl.classList.contains('hidden')) return;
  // Clicked inside the panel
  if (panelEl.contains(e.target)) return;
  // Clicked a nav button (let it toggle normally)
  if (e.target.closest('.nav-btn') || e.target.closest('#topbar-left') || e.target.closest('#topbar-right')) return;
  // Shortcuts: don't close if zone editor, zone mover or key capture dialog are active
  if (state.panel === 'shortcuts') {
    if ($('zone-done-btn') || document.querySelector('.key-capture-dialog')) return;
  }
  // Macro: don't close if position picking is active
  if (state.panel === 'macro') {
    if ($('macro-done-btn')) return;
  }
  closePanel();
}, true);

// ── Help modal ─────────────────────────────────────────────────────────────
function openBugModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'help-backdrop';
  backdrop.innerHTML = `
    <div class="help-modal" style="width:480px;height:auto">
      <div class="help-header" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--bd)">
        <span style="font-size:14px;font-weight:700;color:var(--t1)">Report a Bug</span>
        <button class="help-x" id="bug-close">×</button>
      </div>
      <div style="padding:28px 32px;display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center">
        <div style="font-size:40px">🐛</div>
        <div style="font-size:15px;font-weight:700;color:var(--t1)">Join the TabPilot Community</div>
        <div style="font-size:13px;color:var(--t2);line-height:1.7">
          To report a bug, give feedback, or connect with other TabPilot users,
          join our Discord server. Share your experience, suggest features,
          and help make TabPilot better for everyone.
        </div>
        <button onclick="window.td.openExternal('discord://-/invite/KZHeDJzMgg').catch(()=>window.td.openExternal('https://discord.gg/KZHeDJzMgg'))"
          style="display:flex;align-items:center;gap:10px;background:#5865F2;color:#fff;border-radius:10px;
          padding:12px 24px;font-size:14px;font-weight:700;border:none;cursor:pointer;transition:opacity .15s"
          onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
          <svg width="22" height="22" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"/></svg>
          Join Discord
        </button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  $('bug-close').onclick = () => { backdrop.remove(); focusActiveCanvas(); };
  backdrop.addEventListener('mousedown', e => { if (e.target === backdrop) { backdrop.remove(); focusActiveCanvas(); } });
}

function openHelpModal() {
  const steps = [
    {
      num: 1, icon: '🔌',
      title: 'Connect your phone',
      goal: 'Connect your Android device to the PC.',
      steps: [
        'Use a USB <strong>data</strong> cable — not just a charging cable.',
        'When Android prompts you, select <strong>File Transfer (MTP)</strong> mode.',
        'Connect directly to the PC — avoid USB hubs.',
      ],
      tip: 'If the device only charges and is not detected, the cable is likely charge-only.',
    },
    {
      num: 2, icon: '🛠️',
      title: 'Enable Developer Options',
      goal: 'Unlock the developer menu on Android.',
      steps: [
        'Open <strong>Settings → About phone</strong>.',
        'Find <strong>Build Number</strong>.',
        'Tap it <strong>7 times</strong> until you see "You are now a developer".',
      ],
      tip: null,
    },
    {
      num: 3, icon: '🐛',
      title: 'Enable USB Debugging',
      goal: 'Allow ADB communication with the device.',
      steps: [
        'Open <strong>Settings → System → Developer Options</strong>.',
        'Enable <strong>USB Debugging</strong>.',
      ],
      tip: 'On some brands (Xiaomi, Realme, Oppo…) you may need to enable additional USB-related options in Developer Options.',
    },
    {
      num: 4, icon: '✅',
      title: 'Authorize the connection',
      goal: 'Approve the computer from your phone.',
      steps: [
        'A dialog will appear: <strong>"Allow USB debugging?"</strong>',
        'Check <strong>"Always allow from this computer"</strong>.',
        'Tap <strong>Allow</strong>.',
      ],
      tip: 'If the dialog does not appear, disconnect and reconnect the device while keeping it unlocked.',
    },
    {
      num: 5, icon: '🚀',
      title: 'Device ready!',
      goal: 'Confirm the phone was detected correctly.',
      steps: [
        'Your device appears in the <strong>Devices</strong> panel.',
        'Click <strong>"+ New instance"</strong> to launch an app.',
        'Each instance runs in its own virtual display.',
      ],
      tip: null,
    },
  ];

  const TOTAL = steps.length;
  let step = 0;
  let activeTab = 'setup';

  const usageSections = [
    { icon:'📱', title:'Launching an instance', body:'Click <strong>+ New instance</strong> (or Ctrl+T) to open the launch dialog.<br><br>Select your device and app. Apps you\'ve renamed show their <strong>nickname in parentheses</strong>. Apps already running show a <strong>Running</strong> badge and cannot be launched again until closed.<br><br>Each instance runs in its own isolated virtual display on the device — the phone screen stays free.' },
    { icon:'🔒', title:'Secure Folder', body:'If your Samsung device has Secure Folder, an <strong>Open Secure Folder</strong> button appears in the launch dialog.<br><br><strong>Before clicking it:</strong> manually unlock Secure Folder on the device first. A 20-second countdown gives you time to do this.<br><br>Once unlocked, press <strong>Continue</strong> — SF launches in its own virtual display inside TabPilot, exactly like any other app. You can give it a nickname by double-clicking its tab.' },
    { icon:'🖱️', title:'Touch & gestures', body:'<strong>Click</strong> — tap on the device.<br><strong>Hold click</strong> — long press (context menus, item inspection).<br><strong>Drag</strong> — swipe or scroll lists.<br><strong>Scroll wheel</strong> — native scroll or zoom in map views.<br><strong>Ctrl + drag</strong> — two-finger pinch zoom for game views.' },
    { icon:'⌨️', title:'Keyboard & typing', body:'Click the mirror to focus it, then type normally. Keys mapped to <strong>Shortcuts</strong> trigger their zone tap instead of typing.<br><br>When the on-screen keyboard appears, a <strong>⌨ Write</strong> button shows — click it to switch to full typing mode, bypassing all zone shortcuts.' },
    { icon:'🎯', title:'Shortcuts (zones)', body:'Open <strong>Shortcuts → Actions</strong> and click <strong>Add zones</strong>. The cursor becomes a crosshair — click on the mirror to place a zone, then press the key to assign.<br><br>That key will now trigger a tap at that position. Zones are <strong>shared across all instances</strong> of the same app.' },
    { icon:'⏱️', title:'Macro for inactivity', body:'Open the <strong>Macro</strong> panel. Click <strong>📍 Set position</strong>, then click the mirror where the macro should tap.<br><br>Toggle <strong>Enable for this instance</strong> — fires 2 taps every 2 minutes automatically.<br><br><strong>Enable for all instances</strong> activates it on every open instance of the same app. Enabling one disables the other.' },
    { icon:'⚙️', title:'Settings', body:'<strong>Presets</strong> — Ultra (2560×1440), High (1920×1080), Medium (1280×720), Low (960×540). Apply to new instances only.<br><br><strong>Advanced</strong> — Custom resolution (up to 4K), FPS, and bitrate.<br><br><strong>Turn off screen</strong> — keeps device display off while mirroring to save battery.' },
    { icon:'🔊', title:'Audio', body:'Enable <strong>Audio</strong> in Settings before launching. A separate process captures the device\'s audio output and plays it through your PC speakers.<br><br>Audio is <strong>shared per device</strong> — one process for multiple instances of the same device. Stops automatically when all instances close.' },
    { icon:'🏷️', title:'Tabs & nicknames', body:'<strong>Ctrl+T</strong> — New instance &nbsp;·&nbsp; <strong>Ctrl+W</strong> — Close &nbsp;·&nbsp; <strong>← →</strong> — Switch tabs.<br><br><strong>Double-click</strong> or <strong>right-click</strong> a tab to rename it. The nickname is saved and shown in the launch dialog.<br><br>Drag tabs left or right to reorder them.' },
  ];

  const backdrop = document.createElement('div');
  backdrop.className = 'help-backdrop';

  const render = () => {
    const s = steps[step];
    backdrop.innerHTML = `
    <div class="help-modal">
      <div class="help-head">
        <span class="help-head-title">Help</span>
        <button class="help-x" id="help-close">×</button>
      </div>
      <div class="help-tabs">
        <button class="help-tab${activeTab==='setup'?' active':''}" data-tab="setup">Setup Guide</button>
        <button class="help-tab${activeTab==='usage'?' active':''}" data-tab="usage">Usage Guide</button>
      </div>
      <div style="height:1px;background:var(--bd2);margin:0;flex-shrink:0"></div>

      ${activeTab === 'usage' ? `
        <div class="help-progress-bar">
          ${usageSections.map((_,i) => `<div class="help-seg${i < step ? ' done' : i === step ? ' active' : ''}"></div>`).join('')}
        </div>
        <div class="help-progress-label">Step ${step+1} of ${usageSections.length}</div>
        <div class="help-content">
          <div class="help-left">
            <div class="help-big-icon">${usageSections[step] ? usageSections[step].icon : ''}</div>
            <div class="help-step-num">0${step+1}</div>
          </div>
          <div class="help-right">
            <div class="help-goal">How to use TabPilot</div>
            <div class="help-step-title">${usageSections[step] ? usageSections[step].title : ''}</div>
            <div class="help-step-body">${usageSections[step] ? usageSections[step].body : ''}</div>
          </div>
        </div>
        <div class="help-foot">
          <span></span>
          <div class="help-foot-btns">
            <button class="btn-ghost" id="help-prev" ${step===0?'disabled':''}>← Previous</button>
            <button class="btn-accent" id="help-next">${step===usageSections.length-1?'Close':'Next →'}</button>
          </div>
        </div>
      ` : `
        <div class="help-progress-bar">
          ${steps.map((_,i) => `<div class="help-seg${i < step ? ' done' : i === step ? ' active' : ''}"></div>`).join('')}
        </div>
        <div class="help-progress-label">Step ${step+1} of ${TOTAL}</div>
        <div class="help-content">
          <div class="help-left">
            <div class="help-big-icon">${s.icon}</div>
            <div class="help-step-num">0${s.num}</div>
          </div>
          <div class="help-right">
            <div class="help-goal">${s.goal}</div>
            <div class="help-step-title">${s.title}</div>
            <ul class="help-list">
              ${s.steps.map(st => `<li>${st}</li>`).join('')}
            </ul>
            ${s.tip ? `<div class="help-tip"><span class="help-tip-icon">💡</span>${s.tip}</div>` : ''}
          </div>
        </div>
        <div class="help-foot">
          <a class="help-trouble" href="#" id="help-trouble">Troubleshooting ↗</a>
          <div class="help-foot-btns">
            <button class="btn-ghost" id="help-prev" ${step===0?'disabled':''}>← Previous</button>
            <button class="btn-accent" id="help-next">${step===TOTAL-1?'Finish':'Next →'}</button>
          </div>
        </div>
      `}
    </div>`;

    $('help-close').onclick = () => { backdrop.remove(); focusActiveCanvas(); };

    // Tab switching - reset step when changing tabs
    backdrop.querySelectorAll('.help-tab').forEach(btn => {
      btn.onclick = () => { activeTab = btn.dataset.tab; step = 0; render(); };
    });

    if (activeTab === 'usage') {
      const helpPrev = $('help-prev');
      const helpNext = $('help-next');
      const UTOTAL = usageSections.length;
      if (helpPrev) helpPrev.onclick = () => { step--; render(); };
      if (helpNext) helpNext.onclick = () => {
        if (step < UTOTAL-1) { step++; render(); }
        else { backdrop.remove(); focusActiveCanvas(); }
      };
      return;
    }

    const helpPrev = $('help-prev');
    const helpNext = $('help-next');
    const helpTrouble = $('help-trouble');

    if (helpPrev) helpPrev.onclick = () => { step--; render(); };
    if (helpNext) helpNext.onclick = () => { if (step < TOTAL-1) { step++; render(); } else { backdrop.remove(); focusActiveCanvas(); } };
    if (helpTrouble) helpTrouble.onclick = e => {
      e.preventDefault();
      // Open troubleshooting tips inline
      const rt = backdrop.querySelector('.help-right');
      rt.innerHTML = `
        <div class="help-step-title" style="margin-bottom:12px">Troubleshooting</div>
        <ul class="help-list">
          <li>Make sure you're using a <strong>data cable</strong>, not a charge-only cable.</li>
          <li>Try a different USB port directly on the PC.</li>
          <li>On Xiaomi: enable <strong>USB Debugging (Security settings)</strong> in Developer Options.</li>
          <li>Disconnect and reconnect the device while it's <strong>unlocked</strong>.</li>
          <li>Revoke USB debugging authorizations and re-authorize.</li>
          <li>Restart ADB: run <code>adb kill-server</code> then reconnect.</li>
        </ul>
        <button class="btn-ghost" id="help-back-steps" style="margin-top:12px">← Back to guide</button>`;
      $('help-back-steps').onclick = render;
    };
  };

  document.body.appendChild(backdrop);
  render();
}

// ── Shortcuts panel ────────────────────────────────────────────────────────
function buildShortcutsHtml(active = 'nav') {
  return `<div class="sc-tabs">
    <button class="sc-tab${active==='nav'?' on':''}" data-stab="nav">Navigation</button>
    <button class="sc-tab${active==='actions'?' on':''}" data-stab="actions">Actions</button>
  </div><div id="sc-content"></div>`;
}
function bindShortcutsEvents(active = 'nav') {
  renderScTab(active);
  panelBody.querySelectorAll('.sc-tab').forEach(btn => {
    btn.onclick = () => {
      panelBody.querySelectorAll('.sc-tab').forEach(b=>b.classList.toggle('on',b===btn));
      renderScTab(btn.dataset.stab);
    };
  });
}
function renderScTab(tab) {
  const el = $('sc-content'); if (!el) return;
  if (tab === 'nav') {
    el.innerHTML = `<div class="ps">
      <p style="font-size:12px;color:var(--t2);margin-bottom:12px">Shortcuts to manage tabs.</p>
      ${[['Ctrl+T','New instance'],['Ctrl+W','Close instance'],['←→ arrows','Switch tabs'],['Escape','Close panel / Exit zone editor']]
        .map(([k,d])=>`<div class="sc-row"><span class="sc-key">${k}</span><span class="sc-desc">${d}</span></div>`).join('')}
    </div>`;
  } else {
    const activeTab = state.tabs.find(t=>t.id===state.activeTab);
    const zones = activeTab ? getZones(activeTab.id) : [];
    el.innerHTML = `<div class="ps">
      <p style="font-size:12px;color:var(--t2);margin-bottom:10px">
        Zones for <strong style="color:var(--t1)">${activeTab?.appName || activeTab?.label || 'No instance active'}</strong> <span style="color:var(--t3);font-size:11px">(shared across all instances)</span>.
      </p>
      ${!activeTab ? '<div style="font-size:12px;color:var(--t3)">No instance active.</div>' :
        zones.length === 0
        ? '<div style="font-size:12px;color:var(--t3);padding:4px 0 8px">No zones configured yet.</div>'
        : zones.map((z,i)=>`
          <div class="zone-list-row" data-idx="${i}">
            <span class="zone-list-key">${z.key}</span>
            <span class="zone-list-label">${z.label||z.key}</span>
            <div class="zone-list-btns">
              <button class="btn-sm zone-rename-btn" data-idx="${i}" title="Change key">⌨</button>
              <button class="btn-sm zone-move-btn" data-idx="${i}" title="Move zone">⊹</button>
              <button class="btn-sm zone-del-btn" data-idx="${i}" title="Delete">×</button>
            </div>
          </div>`).join('')}
      ${activeTab ? `<button id="btn-edit-zones" class="btn-sm" style="margin-top:10px;width:100%;padding:9px;text-align:center">
        ${zones.length ? '✏ Add more zones' : '+ Add zones'}
      </button>` : ''}
    </div>`;

    if (activeTab) {
      // Delete
      el.querySelectorAll('.zone-del-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = +btn.dataset.idx;
          setZones(activeTab.id, getZones(activeTab.id).filter((_,i)=>i!==idx));
          renderZones(activeTab.id, false);
          renderScTab('actions');
        };
      });
      // Rename key
      el.querySelectorAll('.zone-rename-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = +btn.dataset.idx;
          const zones = getZones(activeTab.id);
          const zone = zones[idx];
          showKeyReassign(activeTab.id, idx, zone);
        };
      });
      // Move zone
      el.querySelectorAll('.zone-move-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = +btn.dataset.idx;
          closePanel();
          activateTab(activeTab.id);
          setTimeout(() => startZoneMover(activeTab.id, idx), 100);
        };
      });
      // Show existing zones on canvas (non-edit mode)
      renderZones(activeTab.id, false);

      // Add zones
      $('btn-edit-zones')?.addEventListener('click', () => {
        if (!activeTab) return;
        enterZoneEditMode(activeTab.id);
      });
    }
  }
}

// ── Devices panel ──────────────────────────────────────────────────────────
function buildDevices() {
  const devCards = state.devices.filter(d=>d.state==='device').map(d=>`
    <div class="dp-card${d.id===state.selectedDevice?.id?' on':''}" data-id="${d.id}">
      <span class="dev-dot"></span>
      <div><div class="dev-name">${d.model}</div><div class="dev-id">${d.id}</div></div>
    </div>`).join('');
  const userRows = state.users.map(u=>`
    <div class="u-row">
      <span class="u-dot"></span>
      <span class="u-name">${u.label}</span>
      ${u.id===0?'<span class="badge badge-p">PRIMARY</span>':''}
    </div>`).join('');
  panelBody.innerHTML = `
    <div class="ps">${devCards||'<p style="font-size:12px;color:var(--t3)">No devices connected.</p>'}</div>
    <div class="ps">
      <div class="plabel">Android users</div>
      ${userRows||'<p style="font-size:12px;color:var(--t3)">—</p>'}
    </div>`;
  panelBody.querySelectorAll('.dp-card').forEach(el => {
    el.onclick = async () => {
      state.selectedDevice = state.devices.find(d=>d.id===el.dataset.id);
      if (state.selectedDevice) {
        state.users = await window.td.listUsers(state.selectedDevice.id);
        loadAllUserApps(state.selectedDevice.id);
      }
      buildDevices();
    };
  });
}

// ── Settings panel ─────────────────────────────────────────────────────────
function buildSettings() {
  const s = state.settings;
  panelBody.innerHTML = `
    <div class="ps">
      <div class="plabel">Performance</div>
      <div class="preset-grid">
        ${['ultra','high','medium','low'].map(p=>`
          <div class="preset${s.preset===p?' on':''}" data-p="${p}">
            <div class="preset-name">${p.charAt(0).toUpperCase()+p.slice(1)}</div>
            <div class="preset-meta">${PRESETS[p].resolution.replace('x','×')} · ${PRESETS[p].maxFps}fps · ${PRESETS[p].bitrate}Mbps</div>
          </div>`).join('')}
        <div class="preset wide${s.preset==='custom'?' on':''}" data-p="custom">
          <div class="preset-name">Custom</div><div class="preset-meta">Customize each setting</div>
        </div>
      </div>
    </div>
    <div class="ps">
      <div class="plabel">Advanced</div>
      ${srow('Resolution',`<select class="ssel" id="s-res">${['3840x2160','2560x1440','1920x1080','1280x720','960x540'].map(r=>`<option value="${r}"${s.performance.resolution===r?' selected':''}>${r.replace('x','×')}</option>`).join('')}</select>`)}
      ${srow('Max FPS',`<select class="ssel" id="s-fps">${[15,30,45,60].map(f=>`<option value="${f}"${s.performance.maxFps===f?' selected':''}>${f} FPS</option>`).join('')}</select>`)}
      ${srow('Bitrate',`<select class="ssel" id="s-bit">${[2,4,8,12,16,24].map(b=>`<option value="${b}"${s.performance.bitrate===b?' selected':''}>${b} Mbps</option>`).join('')}</select>`)}
    </div>
    <div class="ps">
      <div class="plabel">Device</div>
      ${srow('Turn off screen while mirroring',tog('tog-scr',s.device.turnScreenOff))}
      ${srow('Enable audio',tog('tog-audio',s.audio.enabled))}
    </div>`;
  panelBody.querySelectorAll('.preset').forEach(el => {
    el.onclick = () => {
      const p = el.dataset.p;
      panelBody.querySelectorAll('.preset').forEach(x=>x.classList.remove('on'));
      el.classList.add('on'); s.preset = p;
      if (p!=='custom') Object.assign(s.performance, PRESETS[p]);
      saveSettings();
    };
  });
  ['s-res','s-fps','s-bit'].forEach(id => {
    const el=$(id); if(!el) return;
    el.onchange = () => {
      s.preset='custom';
      panelBody.querySelectorAll('.preset').forEach(x=>x.classList.toggle('on',x.dataset.p==='custom'));
      if(id==='s-res') s.performance.resolution=el.value;
      if(id==='s-fps') s.performance.maxFps=+el.value;
      if(id==='s-bit') s.performance.bitrate=+el.value;
      saveSettings();
    };
  });
  const ts=$('tog-scr');
  if(ts) ts.onchange=()=>{ s.device.turnScreenOff=ts.checked; saveSettings(); };
  const ta=$('tog-audio');
  if(ta) ta.onchange=()=>{ s.audio.enabled=ta.checked; saveSettings(); };
}
function srow(label, ctrl) {
  return `<div class="srow"><label class="slbl">${label}</label>${ctrl}</div>`;
}
function tog(id, checked) {
  return `<div class="tog"><input type="checkbox" id="${id}"${checked?' checked':''}><label class="ttrack" for="${id}"></label></div>`;
}

// ── Modal ──────────────────────────────────────────────────────────────────
function openModal() {
  setTypingMode(false);
  backdropEl.classList.remove('hidden');
  state.modalApp = null; modalLaunch.disabled = true;
  // Keep last selected device if still online, else pick first online
  const online = state.devices.filter(d => d.state === 'device');
  if (!state.modalDevice || !online.find(d => d.id === state.modalDevice.id)) {
    state.modalDevice = online[0] || null;
  }
  renderModalDevices();
  modalSearch.value = 'dofus';
  // Show cached apps immediately if available
  if (state.modalDevice && APPS_CACHE.has(state.modalDevice.id)) {
    const cached = APPS_CACHE.get(state.modalDevice.id);
    state.apps = cached.apps;
    state.users = cached.users;
  }
  renderModalApps('dofus');
  updateSfButton();
  // Hide app section if selected device is still warming up
  const _selWs = state.modalDevice ? WARMUP_STATE.get(state.modalDevice.id) : null;
  const _appSec = $('modal-app-section');
  if (_appSec) _appSec.style.display = (!_selWs || _selWs.done) ? '' : 'none';
  // Load/refresh apps in background
  if (state.modalDevice) loadAllUserApps(state.modalDevice.id);
}

// ── Secure Folder ──────────────────────────────────────────────────────────
function updateSfButton() {
  const sfBtn = $('modal-sf-btn');
  if (!sfBtn) return;
  const hasSecureFolder = state.users.some(u => u.label === 'Secure Folder' || u.id === 150);
  sfBtn.classList.toggle('hidden', !hasSecureFolder);
  const nick = state.modalDevice ? getNick('com.samsung.knox.securefolder', 0, state.modalDevice.id) : '';
  // Show nickname inside button below main text
  let nickEl = sfBtn.querySelector('.sf-btn-nick');
  if (!nickEl) {
    nickEl = document.createElement('div');
    nickEl.className = 'sf-btn-nick';
    nickEl.style.cssText = 'font-size:10px;opacity:0.7;margin-top:2px';
    sfBtn.appendChild(nickEl);
  }
  nickEl.textContent = nick ? `(${nick})` : '';
  // Remove external nick element if exists
  $('sf-btn-nick')?.remove();
}

function openSfPanel() {
  const device = state.modalDevice;
  if (!device) return;
  closeModal();

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid #333;border-radius:14px;padding:28px 32px;width:400px;max-height:90vh;overflow-y:auto;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center">
      <div style="font-size:32px">⚠️</div>
      <div style="font-size:16px;font-weight:700;color:#fff">Secure Folder</div>
      <div style="font-size:13px;color:#e05c5c;line-height:1.7;font-weight:700">
        Before continuing, <b>manually unlock Secure Folder</b> on the device.<br>
        Once unlocked, press <b>Continue</b>.<br>
        If you don't unlock it, mirroring won't start.
      </div>
      <div style="font-size:12px;color:#888;line-height:1.6;background:#222;border-radius:8px;padding:10px 14px;text-align:left">
        💡 We recommend changing the <strong style="color:#ccc">"Automatic Lock"</strong> setting for the Secure Folder to <strong style="color:#ccc">"When phone restarts"</strong> to avoid future problems.
      </div>
      <div style="display:flex;gap:10px;justify-content:center;width:100%;margin-top:4px">
        <button id="sf-warn-cancel" style="background:#2a2a2a;color:#aaa;border:1px solid #333;border-radius:8px;padding:9px 20px;font-size:13px;cursor:pointer">Cancel</button>
        <button id="sf-warn-ok" disabled style="background:#2a5cdb;color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:600;cursor:not-allowed;opacity:0.5">Continue (<span id="sf-countdown">20</span>s)</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // 20s cooldown
  let secs = 20;
  const countEl = overlay.querySelector('#sf-countdown');
  const okBtn = overlay.querySelector('#sf-warn-ok');
  const timer = setInterval(() => {
    secs--;
    if (countEl) countEl.textContent = secs;
    if (secs <= 0) {
      clearInterval(timer);
      okBtn.disabled = false;
      okBtn.style.cursor = 'pointer';
      okBtn.style.opacity = '1';
      okBtn.textContent = 'Continue';
    }
  }, 1000);

  overlay.querySelector('#sf-warn-cancel').onclick = () => { clearInterval(timer); overlay.remove(); };
  okBtn.onclick = () => {
    if (okBtn.disabled) return;
    clearInterval(timer);
    overlay.remove();
    launchMirror({
      package:      'com.samsung.knox.securefolder',
      label:        getNick('com.samsung.knox.securefolder', 0, device.id) || 'Secure Folder',
      appName:      'Secure Folder',
      userId:       0,
      userLabel:    'Secure Folder',
      secureFolder: true,
    }, device);
  };
}

function launchSf(device, nick) {
  const s = state.settings;
  const label = nick || 'Secure Folder';
  const app = {
    package:   'com.samsung.knox.securefolder',
    label,
    appName:   'Secure Folder',
    userId:    0,
    userLabel: 'Secure Folder',
    secureFolder: true,
  };

  const tab = createTab(app, device);
  activateTab(tab.id);

  const mirrorDiv = $('mirror-' + tab.id);
  if (mirrorDiv) {
    const div = document.createElement('div');
    div.className = 'pane-status';
    div.id = 'pst-' + tab.id;
    div.innerHTML = `<div class="spin"></div><span style="font-size:12px;color:var(--t2);text-align:center;padding:0 20px">Starting…</span>`;
    mirrorDiv.appendChild(div);
  }

  window.td.sfLaunchScrcpy({
    deviceId:   device.id,
    tabId:      tab.id,
    resolution: s.performance.resolution,
  }).then(result => {
    const hwnd = result?.hwnd;
    if (!hwnd) {
      updateTabState(tab.id, 'error');
      const st = $('pst-' + tab.id);
      if (st) st.innerHTML = `<span style="color:#e05c5c;font-size:12px">Error: ${result?.error || 'Could not start'}</span>`;
      return;
    }
    embedScrcpyWindow(tab.id, hwnd);
    updateTabState(tab.id, 'running');
    $('pst-' + tab.id)?.remove();
  }).catch(() => updateTabState(tab.id, 'error'));
}

function embedScrcpyWindow(tabId, hwnd) {
  const mirrorDiv = $('mirror-' + tabId);
  if (!mirrorDiv) return;
  $('pst-' + tabId)?.remove();

  const positionWindow = () => {
    const r = mirrorDiv.getBoundingClientRect();
    window.td.sfStartCapture({
      tabId, hwnd,
      x: Math.round(r.left),
      y: Math.round(r.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
    }).catch(() => {});
  };

  // Primer posicionamiento inmediato — scrcpy ya está listo cuando llega hwnd
  positionWindow();

  const ro = new ResizeObserver(positionWindow);
  ro.observe(mirrorDiv);
  mirrorDiv._sfRo = ro;

  window.td.onSfReposition(() => positionWindow());
  window.td.onSfMinimize(() => window.td.sfHideWindow(hwnd).catch(() => {}));
  window.td.onSfRestore(() => positionWindow());
}




function closeSfPanel() {
  // Stop frame sync if running
  const sfPanel = $('sf-panel');
  if (sfPanel?._stopSync) { sfPanel._stopSync(); sfPanel._stopSync = null; }

  // Stop mini mirror if we launched one
  if (sfMirrorTabId && !state.tabs.find(t => t.id === sfMirrorTabId)) {
    window.td.stopMirror(sfMirrorTabId).catch(()=>{});
  }
  sfMirrorTabId = null;
  // Reset panel state
  $('sf-panel').classList.add('hidden');
  $('sf-mirror-wrap').style.display = '';
  const foot = $('sf-unlocked-btn')?.closest('.modal-foot');
  if (foot) foot.style.display = '';
  $('sf-unlocked-btn').textContent = 'Apps Loaded ✓';
  $('sf-unlocked-btn').disabled = true;
  $('sf-apps-wrap').classList.add('hidden');
  sfSelectedApp = null;
}

function closeModal() {
  backdropEl.classList.add('hidden');
  MULTI_SEL.clear();
  modalLaunch.textContent = 'Launch';
  modalLaunch.disabled = true;
  focusActiveCanvas();
}

function renderModalDevices() {
  const online = state.devices.filter(d=>d.state==='device');
  modalDevs.innerHTML = online.map(d => {
    const ws = WARMUP_STATE.get(d.id);
    const warming = ws && !ws.done;
    const ready = ws && ws.done;
    const progress = ws ? ws.progress : 0;
    const devSelCount = getDeviceSel(d.id).size;
    return `<div class="dev-card${d.id===state.modalDevice?.id?' on':''}" data-id="${d.id}">
      <span class="dev-dot"></span>
      <div style="flex:1">
        <div class="dev-name">${d.model}${devSelCount > 0 ? ` <span style="background:var(--acc);color:#fff;border-radius:10px;font-size:10px;padding:1px 6px;margin-left:4px">${devSelCount}</span>` : ''}</div>
        <div class="dev-id">${d.id}</div>
        <div class="warmup-bar-wrap">
          ${ready
            ? '<span class="warmup-ready">✓ Ready</span>'
            : warming
              ? `<div class="warmup-bar"><div class="warmup-fill" style="width:${progress}%"></div></div>
                 <span class="warmup-label">Setting up the device… ${progress}%</span>`
              : '<span class="warmup-label">Initializing…</span>'
          }
        </div>
      </div>
      ${d.id===state.modalDevice?.id?'':''}
    </div>`;
  }).join('') || '<p style="font-size:12px;color:var(--t3)">No devices found.</p>';

  // Enable/disable launch and SF based on selected device warmup state
  const selWs = state.modalDevice ? WARMUP_STATE.get(state.modalDevice.id) : null;
  const selReady = !selWs || selWs.done;
  const sfBtn = $('modal-sf-btn');
  const appSection = $('modal-app-section');
  if (!selReady) {
    modalLaunch.disabled = true;
    if (sfBtn) { sfBtn.disabled = true; sfBtn.style.opacity = '0.4'; sfBtn.style.pointerEvents = 'none'; }
    if (appSection) appSection.style.display = 'none';
  } else {
    modalLaunch.disabled = !state.modalApp;
    if (sfBtn) { sfBtn.disabled = false; sfBtn.style.opacity = ''; sfBtn.style.pointerEvents = ''; }
    if (appSection) appSection.style.display = '';
  }

  modalDevs.querySelectorAll('.dev-card').forEach(el => {
    el.onclick = async () => {
      state.modalDevice = state.devices.find(d=>d.id===el.dataset.id);
      state.modalApp = null;
      if (state.modalDevice) await loadAllUserApps(state.modalDevice.id);
      renderModalDevices(); renderModalApps(modalSearch.value);
      updateLaunchBtn();
      updateSfButton();
    };
  });
}

async function loadAllUserApps(deviceId) {
  const devId = deviceId || state.modalDevice?.id;
  if (!devId) return;
  // Return cached apps instantly, then refresh in background
  if (APPS_CACHE.has(devId)) {
    state.apps = APPS_CACHE.get(devId).apps;
    state.users = APPS_CACHE.get(devId).users;
    renderModalApps(modalSearch.value);
    // Refresh in background silently
    refreshAppsBackground(devId);
    return;
  }
  const users = await window.td.listUsers(devId);
  state.users = users;
  const results = await Promise.all(users.map(u => window.td.listApps(devId, u.id, u.label)));
  state.apps = results.flat();
  APPS_CACHE.set(devId, { apps: state.apps, users: state.users });
  loadIconsInBackground(devId, state.apps);
}

async function refreshAppsBackground(devId) {
  try {
    const users = await window.td.listUsers(devId);
    const results = await Promise.all(users.map(u => window.td.listApps(devId, u.id, u.label)));
    const apps = results.flat();
    APPS_CACHE.set(devId, { apps, users });
    // Update if still on same device
    if (state.modalDevice?.id === devId) {
      state.apps = apps;
      state.users = users;
      renderModalApps(modalSearch.value);
    }
  } catch {}
}

// Multi-launch selections: Map<deviceId, Map<pkg:uid, appObj>>
const MULTI_SEL = new Map();

function getDeviceSel(deviceId) {
  if (!MULTI_SEL.has(deviceId)) MULTI_SEL.set(deviceId, new Map());
  return MULTI_SEL.get(deviceId);
}

function totalSelected() {
  let n = 0;
  MULTI_SEL.forEach(m => { n += m.size; });
  return n;
}

function updateLaunchBtn() {
  const n = totalSelected();
  if (n > 0) {
    modalLaunch.disabled = false;
    modalLaunch.textContent = `Launch (${n})`;
  } else {
    modalLaunch.disabled = true;
    modalLaunch.textContent = 'Launch';
  }
}

function renderModalApps(q) {
  const apps = state.apps.filter(a => {
    return !q || a.label.toLowerCase().includes(q.toLowerCase()) || a.package.toLowerCase().includes(q.toLowerCase());
  });
  const devId = state.modalDevice?.id;
  const sel = devId ? getDeviceSel(devId) : new Map();

  let lastClickedIdx = null;

  getModalApps().innerHTML = apps.map((a, i) => {
    const cached = state.iconCache[a.package];
    const b64  = cached?.b64;
    const mime = cached?.mime || 'image/png';
    const color = appColor(a.package);
    const nick = getNick(a.package, a.userId || 0, devId);
    const alreadyRunning = state.tabs.some(t =>
      t.pkg === a.package && t.userId === (a.userId||0) && t.deviceId === devId
    );
    const key = `${a.package}:${a.userId||0}`;
    const checked = sel.has(key);
    return `<div class="app-row${alreadyRunning ? ' app-running' : ''}${checked ? ' on' : ''}" data-pkg="${a.package}" data-uid="${a.userId}" data-idx="${i}" ${alreadyRunning ? 'data-running="1"' : ''}>
      <div class="app-chk" style="width:18px;height:18px;border-radius:5px;border:2px solid ${checked?'var(--acc)':'var(--bd2)'};background:${checked?'var(--acc)':'transparent'};flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-right:8px;pointer-events:none">
        ${checked?'<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}
      </div>
      <div class="app-ico" style="background:${b64?'transparent':color}" data-ico-pkg="${a.package}">
        ${b64?`<img src="data:${mime};base64,${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">`:`<span>${a.label.charAt(0).toUpperCase()}</span>`}
      </div>
      <div class="app-info">
        <div class="app-name">${a.label}${nick ? ` <span style="color:var(--t3);font-size:11px">(${nick})</span>` : ''}</div>
        <div class="app-pkg">${a.package}</div>
      </div>
      ${alreadyRunning
        ? `<span class="app-running-badge">Running</span>`
        : `<span class="app-user">${a.userLabel}</span>`}
    </div>`;
  }).join('');

  getModalApps().onclick = e => {
    const row = e.target.closest('.app-row');
    if (!row || row.dataset.running === '1') return;
    const pkg = row.dataset.pkg, uid = +row.dataset.uid;
    const idx = +row.dataset.idx;
    const key = `${pkg}:${uid}`;
    const app = apps.find(a => a.package===pkg && a.userId===uid);
    if (!app) return;

    if (e.shiftKey && lastClickedIdx !== null) {
      // Shift+click: select range
      const from = Math.min(lastClickedIdx, idx);
      const to   = Math.max(lastClickedIdx, idx);
      for (let i = from; i <= to; i++) {
        const a = apps[i];
        if (!a) continue;
        const k = `${a.package}:${a.userId||0}`;
        const running = state.tabs.some(t => t.pkg===a.package && t.userId===(a.userId||0) && t.deviceId===devId);
        if (!running) sel.set(k, a);
      }
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl+click: toggle
      if (sel.has(key)) sel.delete(key);
      else sel.set(key, app);
      lastClickedIdx = idx;
    } else {
      // Regular click: toggle single
      if (sel.has(key)) sel.delete(key);
      else sel.set(key, app);
      lastClickedIdx = idx;
    }

    updateLaunchBtn();
    renderModalApps(q);
  };
}
modalSearch.oninput = () => renderModalApps(modalSearch.value);
$('modal-close').onclick = () => { closeModal(); };
$('modal-cancel').onclick = () => { closeModal(); };
backdropEl.onclick = e => { if(e.target===backdropEl) { closeModal(); } };
$('modal-sf-btn')?.addEventListener('click', openSfPanel);

modalLaunch.onclick = () => {
  const total = totalSelected();
  if (total === 0) return;
  // Save selections before closeModal clears them
  const toLaunch = [];
  MULTI_SEL.forEach((appMap, deviceId) => {
    const device = state.devices.find(d => d.id === deviceId);
    if (!device) return;
    appMap.forEach(app => toLaunch.push({ app, device }));
  });
  closeModal();
  toLaunch.forEach(({ app, device }) => launchMirror(app, device));
};

// ── Tabs ───────────────────────────────────────────────────────────────────
function uid() { return `t${++state.tabCounter}-${Math.random().toString(36).slice(2,6)}`; }
function appColor(pkg) {
  const p=['#e05c8a','#5b8af0','#f0a05b','#5be0a0','#a05bf0','#5bd4e0','#e0745c','#4caf82'];
  let h=0; for(const c of pkg) h=(h*31+c.charCodeAt(0))&0xffff;
  return p[h%p.length];
}

function createTab(app, device) {
  const id = uid();
  const color = appColor(app.package);
  const savedNick = getNick(app.package, app.userId || 0, device.id);
  const tabLabel  = savedNick || app.label;
  const tab = { id, label: tabLabel, appName: app.label, pkg:app.package, userId: app.userId||0, color, deviceId:device.id };
  state.tabs.push(tab); loadZones(id); loadMacro(id);

  // Tab element
  const el = document.createElement('div');
  el.className = 'tab'; el.dataset.tabId = id;
  el.innerHTML = `<div class="tab-icon" id="ticon-${id}">
      <span>${tabLabel.charAt(0).toUpperCase()}</span>
    </div>
    <span class="tab-name" id="tname-${id}">${tabLabel}</span>
    <button class="tab-x" title="Close">×</button>`;
  // Set icon immediately from cache (same icon as in modal)
  setTimeout(() => {
    const cached = state.iconCache[tab.pkg];
    if (cached) {
      const iconEl = document.getElementById('ticon-' + id);
      if (iconEl) iconEl.innerHTML = `<img src="data:${cached.mime};base64,${cached.b64}" style="width:100%;height:100%;object-fit:cover;border-radius:5px">`;
    }
  }, 0);

  // Single click = activate, double click = rename
  // Use timer to distinguish single vs double click
  let clickTimer = null;
  el.addEventListener('click', e => {
    if (e.target.classList.contains('tab-x')) { closeTab(id); return; }
    if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; startRename(id); return; }
    clickTimer = setTimeout(() => { clickTimer = null; activateTab(id); }, 220);
  });

  // Right-click context menu → rename
  el.addEventListener('contextmenu', e => {
    e.preventDefault();
    showTabContextMenu(id, e.clientX, e.clientY);
  });

  $('tabs').appendChild(el);
  makeDraggable(el);

  // Pane — no bottom bar
  const pane = document.createElement('div');
  pane.className = 'pane'; pane.id = 'pane-' + id;
  pane.innerHTML = `
    <div class="pane-mirror" id="mirror-${id}">
      <canvas id="canvas-${id}" style="display:none;outline:none" tabindex="0"></canvas>
      <div id="zone-overlay-${id}" class="zone-overlay"></div>
      <div class="pane-status" id="pst-${id}">
        <div class="spin"></div>
        <span style="font-size:12px;color:var(--t2);text-align:center;padding:0 20px">Starting…</span>
      </div>
    </div>`;
  panesEl.appendChild(pane);

  activateTab(id);
  emptyEl.style.display = 'none';
  panesEl.style.display = '';
  updateDeviceStatus();
  return tab;
}

function showTabContextMenu(tabId, x, y) {
  // Remove any existing context menu
  document.querySelector('.tab-ctx')?.remove();
  const menu = document.createElement('div');
  menu.className = 'tab-ctx';
  menu.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:999`;
  menu.innerHTML = `
    <div class="ctx-item" id="ctx-rename">✏ Rename</div>
    <div class="ctx-item ctx-danger" id="ctx-close">✕ Close</div>`;
  document.body.appendChild(menu);
  menu.querySelector('#ctx-rename').onclick = () => { menu.remove(); startRename(tabId); };
  menu.querySelector('#ctx-close').onclick  = () => { menu.remove(); closeTab(tabId); };
  // Close on outside click
  setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 0);
}

let _activatingFromArrow = false;

function makeDraggable(el) {
  el.setAttribute('draggable', 'true');

  el.addEventListener('dragstart', e => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', el.dataset.tabId);
    setTimeout(() => el.classList.add('dragging'), 0);
  });

  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    // Sync state.tabs order to DOM order
    const domIds = [...$('tabs').querySelectorAll('.tab')].map(t => t.dataset.tabId);
    state.tabs.sort((a, b) => domIds.indexOf(a.id) - domIds.indexOf(b.id));
  });
}

// Wire container dragover once
const tabsContainer = $('tabs');
tabsContainer.addEventListener('dragover', e => {
  e.preventDefault();
  const dragging = tabsContainer.querySelector('.tab.dragging');
  if (!dragging) return;

  // Find which tab we're hovering over
  const siblings = [...tabsContainer.querySelectorAll('.tab:not(.dragging)')];
  const next = siblings.find(sib => {
    const rect = sib.getBoundingClientRect();
    return e.clientX < rect.left + rect.width / 2;
  });

  if (next) tabsContainer.insertBefore(dragging, next);
  else tabsContainer.appendChild(dragging);
});

function activateTab(id, fromArrow = false) {
  // Close IME on the tab we're leaving — only if it had keyboard open
  const prevTab = state.activeTab;
  if (prevTab && prevTab !== id) {
    if (isWriting(prevTab)) {
      setWritingMode(false, prevTab);
      TAB_IME_PENDING.add(prevTab);
      window.td.hideIme({ tabId: prevTab });
    }
    // Close any open panel when switching tabs
    closePanel();
  }
  state.activeTab = id;
  document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('on',el.dataset.tabId===id));
  document.querySelectorAll('.pane').forEach(el=>el.classList.toggle('on',el.id==='pane-'+id));
  if (state.panel==='shortcuts') renderScTab('actions');
  updateWritingBtn(); // reflect THIS tab's writing mode

  // If this tab had IME closed due to tab switch, reopen by tapping last position
  if (TAB_IME_PENDING.has(id)) {
    TAB_IME_PENDING.delete(id);
  TAB_LAST_TAP.delete(id);
    const lastTap = TAB_LAST_TAP.get(id);
    if (lastTap) {
      setTimeout(() => {
        window.td.tap({ tabId: id, x: lastTap.x, y: lastTap.y, width: lastTap.w, height: lastTap.h });
      }, 400);
    }
  }
  // When switching via arrow keys, don't steal focus from current element
  // just move canvas focus to new tab so arrows keep working
  if (fromArrow) {
    setTimeout(() => {
      const canvas = $('canvas-' + id);
      if (canvas && canvas.style.display !== 'none') canvas.focus({ preventScroll: true });
    }, 30);
  } else {
    setTimeout(focusActiveCanvas, 80);
  }
}

function closeTab(id) {
  const tab = state.tabs.find(t=>t.id===id); if(!tab) return;
  stopMirror(id);
  // Only force-stop app if no other tab is using the same package on the same device
  const otherSameApp = state.tabs.find(t => t.id !== id && t.pkg === tab.pkg && t.deviceId === tab.deviceId);
  if (!otherSameApp) {
    window.td.shell(tab.deviceId, `am force-stop ${tab.pkg}`).catch(()=>{});
  }
  stopZoneEditor(id);
  state.tabs = state.tabs.filter(t=>t.id!==id);
  document.querySelector(`.tab[data-tab-id="${id}"]`)?.remove();
  $('pane-'+id)?.remove();
  // Clean up per-tab state
  setWritingMode(false, id);
  TAB_WRITE.delete(id);
  TAB_IME_PENDING.delete(id);
  TAB_LAST_TAP.delete(id);
  stopMacroTimer(id);
  TAB_MACRO.delete(id);
  updateMacroStatus();
  try { state.decoders.get(id)?.close(); } catch {}
  state.decoders.delete(id);
  cleanupAudio(id);
  if (!state.tabs.length) {
    state.activeTab = null;
    emptyEl.style.display = '';
    panesEl.style.display = 'none';
    setTypingMode(false);
    updateDeviceStatus();
  } else if (state.activeTab===id) {
    activateTab(state.tabs[state.tabs.length-1].id);
  }
  updateDeviceStatus();
  // Refresh modal if open so "Running" badge clears
  if (!backdropEl.classList.contains('hidden')) renderModalApps(modalSearch.value);
}

function updateTabState(id, status) {
  const el = document.querySelector(`.tab[data-tab-id="${id}"]`); if(!el) return;
  el.className = `tab${status==='running'?' running':status==='error'?' error':''}${state.activeTab===id?' on':''}`;
}

function startRename(id) {
  const nameEl = $('tname-'+id); if(!nameEl) return;
  const cur = nameEl.textContent;
  setTypingMode(false);
  const inp = document.createElement('input');
  inp.value = cur;
  inp.maxLength = 300;
  inp.style.cssText = 'background:transparent;border:none;outline:1px solid var(--bd2);border-radius:2px;color:var(--t1);font:inherit;font-size:14px;width:200px;min-width:80px;padding:0';
  nameEl.replaceWith(inp); inp.focus(); inp.select();
  const commit = () => {
    const v = inp.value.trim() || cur;
    const tab = state.tabs.find(t=>t.id===id);
    if (tab) {
      tab.label = v;
      // Save nickname: if same as app default label, clear it; otherwise save
      setNick(tab.pkg, tab.userId, tab.deviceId, v !== tab.appName ? v : '');
    }
    const span = document.createElement('span');
    span.id='tname-'+id; span.className='tab-name'; span.textContent=v;
    inp.replaceWith(span);
    focusActiveCanvas();
  };
  inp.onblur = commit;
  inp.onkeydown = e => {
    e.stopPropagation();
    if(e.key==='Enter') inp.blur();
    if(e.key==='Escape'){inp.value=cur;inp.blur();}
  };
  inp.onclick = e => e.stopPropagation();
}

// ── Mirror ─────────────────────────────────────────────────────────────────
async function launchMirror(app, device) {
  const tab = createTab(app, device);
  const s = state.settings;
  const audioEnabled = s.audio.enabled;
  try {
    await window.td.startMirror({
      deviceId:      device.id,
      appPackage:    app.package,
      tabId:         tab.id,
      userId:        app.userId,
      secureFolder:  app.secureFolder || false,
      useMainDisplay: false,
      resolution:    s.performance.resolution,
      maxFps:        s.performance.maxFps,
      bitrate:       s.performance.bitrate,
      audioEnabled,
      turnScreenOff: s.device.turnScreenOff,
    });
    // tab icon already set
    updateTabState(tab.id, 'running');
    initDecoder(tab.id);
    if (audioEnabled) initAudio(tab.id);
    // Start IME watcher for this device
    window.td.watchIme({ tabId: tab.id, deviceId: device.id }).catch(() => {});
  } catch(err) {
    updateTabState(tab.id, 'error');
    const st=$('pst-'+tab.id);
    if(st) st.innerHTML=`<span style="color:#e05c5c;font-size:12px">Error: ${err.message||err}</span>`;
  }
}

async function stopMirror(tabId) {
  try { state.decoders.get(tabId)?.close(); } catch {}
  state.decoders.delete(tabId);
  // SF cleanup
  const tab = state.tabs.find(t => t.id === tabId);
  if (tab?.app?.secureFolder) {
    window.td.sfStopCapture(tabId).catch(() => {});
    window.td.sfStopScrcpy(tabId).catch(() => {});
    if (_sfFrameHandler) _sfFrameHandler = null;
  }
  await window.td.stopMirror(tabId).catch(() => {});
}

// ── WebCodecs ──────────────────────────────────────────────────────────────
const PENDING_SPS = new Map();
const STREAM_TS   = new Map();

function makeDecoder(tabId) {
  return new VideoDecoder({
    output: frame => {
      const canvas = $('canvas-'+tabId);
      if (!canvas) { frame.close(); return; }
      const ctx = canvas.getContext('2d');
      if (canvas.width!==frame.displayWidth || canvas.height!==frame.displayHeight) {
        canvas.width=frame.displayWidth; canvas.height=frame.displayHeight;
      }
      ctx.drawImage(frame, 0, 0); frame.close();
      if (canvas.style.display==='none') {
        canvas.style.display='block';
        $('pst-'+tabId)?.remove();
        bindCanvasInput(tabId, canvas);
        // Auto-focus on first frame
        if (state.activeTab === tabId) {
          setTimeout(() => { canvas.focus({ preventScroll:true }); setTypingMode(true); }, 100);
        }
      }
    },
    error: () => {},
  });
}

function initDecoder(tabId) {
  if (!('VideoDecoder' in window)) return;
  const dec = makeDecoder(tabId);
  try { dec.configure({ codec:'avc1.42E01E', optimizeForLatency:true }); } catch {}
  state.decoders.set(tabId, dec);
  STREAM_TS.set(tabId, 0);
}

function bindCanvasInput(tabId, canvas) {
  if (canvas.__bound) return; canvas.__bound = true;

  // Track typing mode via focus/blur
  canvas.addEventListener('focus', () => setTypingMode(true));
  canvas.addEventListener('blur',  () => setTypingMode(false));

  // Helper to get canvas coords from mouse event
  function canvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * canvas.width  / rect.width,
      y: (e.clientY - rect.top)  * canvas.height / rect.height,
    };
  }

  // Track virtual finger state for Ctrl+drag pinch
  let vfingerDown = false;

  // MOUSEDOWN → normal touch OR start Ctrl+drag pinch
  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    canvas.focus({ preventScroll: true });
    const { x, y } = canvasCoords(e);
    recordTap(tabId, x, y, canvas.width, canvas.height);

    // Macro pick mode
    if (macroPickMode) {
      const mode = macroPickMode;
      if (mode === 'all') {
        const pkg = state.tabs.find(t => t.id === tabId)?.pkg;
        const targets = pkg ? state.tabs.filter(t => t.pkg === pkg) : state.tabs;
        for (const tab of targets) {
          const prev = getMacro(tab.id) || {};
          setMacro(tab.id, { rx: x / canvas.width, ry: y / canvas.height, enabled: prev.enabled||false, allEnabled: prev.allEnabled||false });
        }
      } else {
        const prev = getMacro(mode) || {};
        setMacro(mode, { rx: x / canvas.width, ry: y / canvas.height, enabled: prev.enabled||false, allEnabled: prev.allEnabled||false });
      }
      cancelMacroPick(false);
      openPanelWith('macro', 'Macro for inactivity', '', buildMacroPanel);
      return;
    }

    if (e.ctrlKey) {
      // Ctrl+drag: start pinch — real finger at cursor + virtual finger inverted through screen center
      vfingerDown = true;
      const vx = canvas.width  - x; // = 2*(w/2) - x
      const vy = canvas.height - y; // = 2*(h/2) - y
      window.td.pinchStart({ tabId, x, y, vx, vy, width: canvas.width, height: canvas.height });
    } else {
      window.td.touchDown({ tabId, x, y, width: canvas.width, height: canvas.height });
    }
  });

  // MOUSEUP → end touch or end pinch
  canvas.addEventListener('mouseup', e => {
    if (e.button !== 0) return;
    const { x, y } = canvasCoords(e);
    if (vfingerDown) {
      vfingerDown = false;
      const vx = canvas.width  - x;
      const vy = canvas.height - y;
      window.td.pinchEnd({ tabId, x, y, vx, vy, width: canvas.width, height: canvas.height });
    } else {
      window.td.touchUp({ tabId, x, y, width: canvas.width, height: canvas.height });
    }
  });

  // MOUSEMOVE while pressed → drag or pinch move
  let _lastMoveX = -1, _lastMoveY = -1;
  canvas.addEventListener('mousemove', e => {
    if (e.buttons !== 1) return;
    const { x, y } = canvasCoords(e);
    const rx = Math.round(x), ry = Math.round(y);
    if (rx === _lastMoveX && ry === _lastMoveY) return;
    _lastMoveX = rx; _lastMoveY = ry;
    if (vfingerDown) {
      const vx = canvas.width  - x;
      const vy = canvas.height - y;
      window.td.pinchMove({ tabId, x, y, vx, vy, width: canvas.width, height: canvas.height });
    } else {
      window.td.touchMove({ tabId, x, y, width: canvas.width, height: canvas.height });
    }
  });

  // WHEEL → INJECT_SCROLL_EVENT (native Android scroll)
  let _wheelTs = 0;
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const now = Date.now();
    if (now - _wheelTs < 16) return; // ~60fps throttle
    _wheelTs = now;
    const { x, y } = canvasCoords(e);
    const vscroll = e.deltaY < 0 ? 1 : -1;
    const hscroll = e.deltaX < 0 ? 1 : (e.deltaX > 0 ? -1 : 0);
    window.td.scroll({ tabId, x, y, hscroll, vscroll, width: canvas.width, height: canvas.height });
  }, { passive: false });

  // Also handle clicks on the mirror container (black area around canvas)
  const mirrorDiv = $('mirror-'+tabId);
  if (mirrorDiv) {
    mirrorDiv.addEventListener('click', e => {
      if (e.target === canvas || e.target.closest('.zone-overlay')) return;
      canvas.focus({ preventScroll: true });
    });
  }

  // Re-render zones and re-focus canvas on resize
  let _resizeTimer;
  const zoneResizeObserver = new ResizeObserver(() => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      const overlay = $('zone-overlay-' + tabId);
      if (!overlay) return;
      const isEditing = !!overlay._cleanup;
      renderZones(tabId, isEditing);
      if (isEditing) {
        const ghost = overlay.querySelector('.zone-ghost');
        if (ghost) ghost.style.display = 'none';
      }
      if (state.activeTab === tabId && canvas.style.display !== 'none') {
        canvas.focus({ preventScroll: true });
      }
    }, 60);
  });
  zoneResizeObserver.observe(canvas);

  const AK = { Backspace:67,Enter:66,Tab:61,Escape:111,ArrowLeft:21,ArrowRight:22,ArrowUp:19,ArrowDown:20,Delete:112,' ':62 };
  const AK_L = {}; 'abcdefghijklmnopqrstuvwxyz'.split('').forEach((c,i)=>AK_L[c]=29+i);
  const AK_N = {}; '0123456789'.split('').forEach((c,i)=>AK_N[c]=7+i);

  function sendKey(kc, shift=false) {
    const meta = shift ? 0x41 : 0;
    window.td.keyevent({ tabId, keycode:kc, action:0, meta });
    setTimeout(()=>window.td.keyevent({ tabId, keycode:kc, action:1, meta }), 30);
  }

  canvas.addEventListener('keydown', e => {
    // Tab key — disable completely to avoid bugging apps
    if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); return; }

    // Escape = exit typing/writing mode for this tab
    if (e.key==='Escape' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); e.stopPropagation();
      canvas.blur();
      setTypingMode(false);
      // per-tab writingMode stays as-is when canvas loses focus
      return;
    }

    // Ctrl/Meta → let bubble to global capture handler (Ctrl+T, Ctrl+W)
    if (e.ctrlKey || e.metaKey) return;

    // ArrowLeft/Right are handled by global capture handler → don't process here
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') return;

    // All other keys: prevent default, stop propagation
    e.preventDefault();
    e.stopPropagation();

    // WRITING MODE ON → all keys to device, zones disabled
    if (isWriting(tabId)) {
      if (AK[e.key] !== undefined) { sendKey(AK[e.key]); return; }
      const lower = e.key.toLowerCase();
      if (AK_L[lower] !== undefined) { sendKey(AK_L[lower], e.key !== lower); return; }
      if (AK_N[e.key] !== undefined) { sendKey(AK_N[e.key]); return; }
      if (e.key.length === 1) window.td.key({ tabId, text: e.key });
      return;
    }

    // WRITING MODE OFF → check zone shortcuts first
    const zones = getZones(tabId);
    const zone = zones.find(z => z.key === e.key);
    if (zone) {
      const cx = zone.x + Math.round(zone.w / 2);
      const cy = zone.y + Math.round(zone.h / 2);
      window.td.tap({ tabId, x: cx, y: cy, width: canvas.width, height: canvas.height });
      return;
    }

    // No zone match → send to device as keyboard input
    if (AK[e.key] !== undefined) { sendKey(AK[e.key]); return; }
    const lower = e.key.toLowerCase();
    if (AK_L[lower] !== undefined) { sendKey(AK_L[lower], e.key !== lower); return; }
    if (AK_N[e.key] !== undefined) { sendKey(AK_N[e.key]); return; }
    if (e.key.length === 1) window.td.key({ tabId, text: e.key });
  });
}

// ── Audio ─────────────────────────────────────────────────────────────────
const audioContexts = new Map(); // tabId → AudioContext
const audioDecoders = new Map(); // tabId → AudioDecoder

function initAudio(tabId) {
  if (!('AudioDecoder' in window)) {
 return; }
  try {
    const ctx = new AudioContext({ sampleRate: 48000 });
    audioContexts.set(tabId, ctx);

    const dec = new AudioDecoder({
      output: audioData => {
        const ctx = audioContexts.get(tabId);
        if (!ctx) { audioData.close(); return; }
        const numChannels = audioData.numberOfChannels;
        const numFrames   = audioData.numberOfFrames;
        const buf = ctx.createBuffer(numChannels, numFrames, audioData.sampleRate);
        for (let ch = 0; ch < numChannels; ch++) {
          audioData.copyTo(buf.getChannelData(ch), { planeIndex: ch });
        }
        audioData.close();
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start();
      },
      error: () => {},
    });
    dec.configure({ codec: 'opus', sampleRate: 48000, numberOfChannels: 2 });
    audioDecoders.set(tabId, dec);
  } catch(e) {
 }
}

function cleanupAudio(tabId) {
  try { audioDecoders.get(tabId)?.close(); } catch {}
  try { audioContexts.get(tabId)?.close(); } catch {}
  audioDecoders.delete(tabId);
  audioContexts.delete(tabId);
}

let _audioTs = new Map(); // tabId → timestamp counter
window.td.onAudio(({ tabId, data, pts }) => {
  const dec = audioDecoders.get(tabId);
  if (!dec || dec.state !== 'configured') return;
  try {
    const buf = new Uint8Array(data);
    const ts  = _audioTs.get(tabId) || 0;
    dec.decode(new EncodedAudioChunk({ type: 'key', timestamp: pts || ts, data: buf }));
    _audioTs.set(tabId, ts + 20000); // ~20ms per opus frame at 48khz
  } catch(e) {
 }
});

let _cc=0;
window.td.onChunk(({ tabId, data }) => {
  _cc++;
  const buf = new Uint8Array(data);
  if (buf.length<1) return;
  const nals=[];
  let start=-1;
  for(let i=0;i<buf.length;i++){
    if(i+3<buf.length&&buf[i]===0&&buf[i+1]===0&&buf[i+2]===0&&buf[i+3]===1){if(start>=0)nals.push(buf.slice(start,i));start=i+4;i+=3;}
    else if(i+2<buf.length&&buf[i]===0&&buf[i+1]===0&&buf[i+2]===1){if(start>=0)nals.push(buf.slice(start,i));start=i+3;i+=2;}
  }
  if(start>=0&&start<buf.length)nals.push(buf.slice(start));
  if(!nals.length)nals.push(buf);
  let ts=STREAM_TS.get(tabId)||0;
  for(const nal of nals){
    if(!nal.length)continue;
    const t=nal[0]&0x1f;
    if(t===7){PENDING_SPS.set(tabId,{...(PENDING_SPS.get(tabId)||{}),sps:nal});continue;}
    if(t===8){
      const e=PENDING_SPS.get(tabId)||{};if(!e.sps)continue;
      PENDING_SPS.set(tabId,{...e,pps:nal});
      const sps=e.sps;
      const codec=`avc1.${sps[1].toString(16).padStart(2,'0')}${sps[2].toString(16).padStart(2,'0')}${sps[3].toString(16).padStart(2,'0')}`;
      try{state.decoders.get(tabId)?.close();}catch{}
      const dec=makeDecoder(tabId);
      try{dec.configure({codec,optimizeForLatency:true});state.decoders.set(tabId,dec);STREAM_TS.set(tabId,0);ts=0;}
      catch(err){
}
      continue;
    }
    const dec=state.decoders.get(tabId);
    if(!dec||dec.state!=='configured')continue;
    const isKey=t===5;
    let payload=nal;
    if(isKey){
      const{sps,pps}=PENDING_SPS.get(tabId)||{};
      if(sps&&pps){
        const full=new Uint8Array(4+sps.length+4+pps.length+4+nal.length);
        let o=0;
        full[o]=0;full[o+1]=0;full[o+2]=0;full[o+3]=1;o+=4;full.set(sps,o);o+=sps.length;
        full[o]=0;full[o+1]=0;full[o+2]=0;full[o+3]=1;o+=4;full.set(pps,o);o+=pps.length;
        full[o]=0;full[o+1]=0;full[o+2]=0;full[o+3]=1;o+=4;full.set(nal,o);
        payload=full;
      }
    }else{const ab=new Uint8Array(4+nal.length);ab[0]=0;ab[1]=0;ab[2]=0;ab[3]=1;ab.set(nal,4);payload=ab;}
    try{dec.decode(new EncodedVideoChunk({type:isKey?'key':'delta',timestamp:ts,data:payload}));ts+=16667;}
    catch(err){}
}
  STREAM_TS.set(tabId,ts);
});

// ── IME detection ─────────────────────────────────────────────────────────
// Simple: IME open → Write mode for active tab
//         IME close → Zones mode for active tab (tab switch already closed it)

// ── Macro system ──────────────────────────────────────────────────────────
// Per-tab macro config: { x, y, w, h, enabled }
// w, h = canvas dimensions at time of recording (for coordinate scaling)
const TAB_MACRO = new Map();   // tabId → { x, y, w, h, enabled }
const TAB_MACRO_TIMER = new Map(); // tabId → intervalId
const MACRO_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const MACRO_CLICK_GAP   = 500;            // 0.5s between the two taps

function getMacro(tabId) { return TAB_MACRO.get(tabId) || null; }

function macroStorageKey(tabId) {
  // Store by pkg+userId so position persists across sessions for same app/user
  const tab = state.tabs.find(t => t.id === tabId);
  return tab ? `macro:${tab.pkg}:${tab.userId||0}` : `macro:${tabId}`;
}

function setMacro(tabId, config) {
  TAB_MACRO.set(tabId, config);
  try { localStorage.setItem(macroStorageKey(tabId), JSON.stringify(config)); } catch {}
}

function loadMacro(tabId) {
  try {
    const tab = state.tabs.find(t => t.id === tabId);
    const key = tab ? `macro:${tab.pkg}:${tab.userId||0}` : `macro:${tabId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const cfg = JSON.parse(saved);
      // Position persists but activation always starts off each session
      cfg.enabled = false;
      cfg.allEnabled = false;
      TAB_MACRO.set(tabId, cfg);
    }
  } catch {}
}

function macroFire(tabId) {
  const cfg = getMacro(tabId);
  if (!cfg || !cfg.enabled) return;
  const canvas = $('canvas-' + tabId);
  if (!canvas) return;
  const x = (cfg.rx ?? (cfg.x / (cfg.w || canvas.width))) * canvas.width;
  const y = (cfg.ry ?? (cfg.y / (cfg.h || canvas.height))) * canvas.height;
  const taps = cfg.tapsPerTrigger ?? 2;
  const gap  = cfg.tapGapMs ?? MACRO_CLICK_GAP;
  for (let i = 0; i < taps; i++) {
    setTimeout(() => {
      window.td.tap({ tabId, x, y, width: canvas.width, height: canvas.height });
    }, i * gap);
  }
}

function startMacroTimer(tabId) {
  stopMacroTimer(tabId);
  macroFire(tabId);
  const cfg = getMacro(tabId);
  const intervalMs = ((cfg?.intervalSec ?? 120)) * 1000;
  const id = setInterval(() => macroFire(tabId), intervalMs);
  TAB_MACRO_TIMER.set(tabId, id);
}

function stopMacroTimer(tabId) {
  const id = TAB_MACRO_TIMER.get(tabId);
  if (id) { clearInterval(id); TAB_MACRO_TIMER.delete(tabId); }
}

function setMacroEnabled(tabId, enabled) {
  const cfg = getMacro(tabId) || { x: 0, y: 0, w: 0, h: 0 };
  if (enabled && cfg.rx == null) return; // no position set
  cfg.enabled = enabled;
  cfg.allEnabled = false; // individual override clears "all" flag
  setMacro(tabId, cfg);
  if (enabled) startMacroTimer(tabId);
  else stopMacroTimer(tabId);
  updateMacroStatus();
  if (state.panel === 'macro') buildMacroPanel();
}

function setMacroEnabledAll(enabled, fromTabId) {
  if (state.tabs.length === 0) return;
  const pkg = fromTabId ? state.tabs.find(t => t.id === fromTabId)?.pkg : null;
  const targets = state.tabs.filter(t => !pkg || t.pkg === pkg);
  const srcCfg = fromTabId ? (getMacro(fromTabId) || {}) : {};
  for (const tab of targets) {
    const cfg = getMacro(tab.id) || {};
    if (enabled) {
      if (srcCfg.rx == null) continue;
      // Propagate position AND config from source
      cfg.rx              = srcCfg.rx;
      cfg.ry              = srcCfg.ry;
      cfg.intervalSec     = srcCfg.intervalSec    ?? 120;
      cfg.tapsPerTrigger  = srcCfg.tapsPerTrigger ?? 2;
      cfg.tapGapMs        = srcCfg.tapGapMs       ?? 500;
    }
    cfg.enabled = enabled;
    cfg.allEnabled = enabled;
    setMacro(tab.id, cfg);
    if (enabled) startMacroTimer(tab.id);
    else stopMacroTimer(tab.id);
  }
  updateMacroStatus();
  if (state.panel === 'macro') buildMacroPanel();
}

// Enter macro pick mode: next click on canvas sets the macro position
let macroPickMode = null;
let sfSelectedApp = null;
const APPS_CACHE = new Map(); // deviceId → apps array
const WARMUP_STATE = new Map(); // deviceId → { done: bool, progress: 0-100, startedAt } // tabId or 'all' or null

function startMacroPick(tabId) {
  macroPickMode = tabId;
  const canvas = $('canvas-' + (tabId === 'all' ? state.activeTab : tabId));
  if (canvas) canvas.style.cursor = 'crosshair';

  // Hide macro panel
  const panel = $('panel');
  if (panel) panel.style.visibility = 'hidden';

  // Lock topbar
  setTopbarLocked(true);

  // Add Done button next to About
  $('macro-done-btn')?.remove();
  const btn = document.createElement('button');
  btn.id = 'macro-done-btn';
  btn.className = 'nav-btn';
  btn.style.cssText = 'background:#7a2a2a;color:#fff;border:1px solid #9a3a3a;opacity:1;pointer-events:all';
  btn.textContent = '✕ Cancel';
  btn.onclick = () => cancelMacroPick(true);
  const aboutBtn = $('nav-account');
  if (aboutBtn) aboutBtn.insertAdjacentElement('afterend', btn);
}

function cancelMacroPick(fromDoneBtn) {
  // Restore cursor
  if (macroPickMode) {
    const tid = macroPickMode === 'all' ? state.activeTab : macroPickMode;
    const canvas = $('canvas-' + tid);
    if (canvas) canvas.style.cursor = '';
  }
  macroPickMode = null;

  // Remove Done button
  $('macro-done-btn')?.remove();

  // Unlock topbar
  setTopbarLocked(false);

  // Restore panel visibility
  const panel = $('panel');
  if (panel) panel.style.visibility = '';

  if (fromDoneBtn) {
    // Done pressed — close macro panel entirely
    closePanel();
  } else {
    // Position selected or cancel — rebuild panel
    if (state.panel === 'macro') buildMacroPanel();
  }
}


function buildMacroPanel() {
  if (state.panel !== 'macro') return;
  const activeTab = state.tabs.find(t => t.id === state.activeTab);
  const cfg = activeTab ? getMacro(activeTab.id) : null;
  const hasPos = cfg?.rx != null;
  const isPicking = macroPickMode !== null;
  const noTabs = state.tabs.length === 0;
  const samePkgTabs = activeTab ? state.tabs.filter(t => t.pkg === activeTab.pkg) : [];
  const allSamePkgEnabled = samePkgTabs.length > 0 && samePkgTabs.every(t => getMacro(t.id)?.enabled);
  const singleEnabled = cfg?.enabled || false;
  // "all" is active if current tab has allEnabled flag
  const allFlagActive = cfg?.allEnabled || false;

  panelBody.innerHTML = `
    <div class="ps">
      <div class="plabel">This instance${activeTab ? ' — ' + (activeTab.appName || activeTab.label) : ''}</div>
      ${noTabs || !activeTab
        ? '<p style="font-size:12px;color:var(--t3)">No instance active.</p>'
        : `<div class="macro-pos-row">
            <div class="macro-pos-box">
              ${hasPos
                ? `<span style="color:var(--t1);font-weight:600">${Math.round((cfg.rx??0)*100)}%, ${Math.round((cfg.ry??0)*100)}%</span><span style="color:var(--t3);font-size:10px;margin-left:6px">relative position</span>`
                : '<span style="color:var(--t3)">No position set</span>'}
            </div>
            <button class="btn-sm" id="macro-pick-btn" style="${isPicking && macroPickMode===activeTab.id ? 'border-color:var(--acc);color:var(--acc2);background:var(--acc-bg)' : ''}">
              ${isPicking && macroPickMode===activeTab.id ? '✕ Cancel' : '📍 Set position'}
            </button>
          </div>
          ${isPicking && macroPickMode===activeTab.id ? '<p style="font-size:11px;color:var(--acc2);margin-top:6px">Click on the mirror to set the tap position</p>' : ''}
          <div class="srow" style="margin-top:12px">
            <div>
              <div class="slbl">Enable for this instance</div>
              ${!hasPos ? '<div style="font-size:10px;color:var(--t3)">Set a position first</div>' : ''}
            </div>
            ${hasPos
              ? tog('macro-tog-single', singleEnabled && !allFlagActive)
              : '<span style="font-size:11px;color:var(--t3);opacity:.5">—</span>'}
          </div>`}
    </div>
    <div class="ps">
      <div class="plabel">All ${activeTab?.pkg ? '"' + (activeTab.appName || activeTab.label) + '"' : ''} instances (${samePkgTabs.length})</div>
      ${noTabs || !activeTab
        ? '<p style="font-size:12px;color:var(--t3)">No instances open.</p>'
        : `<div style="font-size:12px;color:var(--t2);margin-bottom:10px">
            Activates macro on all <strong style="color:var(--t1)">${activeTab.appName || activeTab.label}</strong> instances using the same tap position.
          </div>
          <div class="srow">
            <div>
              <div class="slbl">Enable for all ${activeTab.appName || activeTab.label} instances</div>
              ${!hasPos ? '<div style="font-size:10px;color:var(--t3)">Set a position first</div>' : ''}
            </div>
            ${hasPos
              ? tog('macro-tog-all', allFlagActive)
              : '<span style="font-size:11px;color:var(--t3);opacity:.5">—</span>'}
          </div>`}
    </div>
    <div class="ps">
      <div class="plabel">Config</div>
      <div class="srow">
        <label class="slbl">Trigger interval <span style="color:var(--t3);font-size:10px">(seconds, 1s = 1)</span></label>
        <input id="macro-interval-inp" type="number" min="1" max="3600" value="${cfg?.intervalSec ?? 120}"
          ${singleEnabled || allFlagActive ? 'disabled' : ''}
          style="width:70px;background:var(--elev);border:1px solid var(--bd2);border-radius:6px;color:var(--t1);padding:3px 8px;font-size:13px;text-align:center;${singleEnabled || allFlagActive ? 'opacity:.4;cursor:not-allowed' : ''}">
      </div>
      <div class="srow">
        <label class="slbl">Taps per trigger</label>
        <input id="macro-taps-inp" type="number" min="1" max="10" value="${cfg?.tapsPerTrigger ?? 2}"
          ${singleEnabled || allFlagActive ? 'disabled' : ''}
          style="width:70px;background:var(--elev);border:1px solid var(--bd2);border-radius:6px;color:var(--t1);padding:3px 8px;font-size:13px;text-align:center;${singleEnabled || allFlagActive ? 'opacity:.4;cursor:not-allowed' : ''}">
      </div>
      <div class="srow">
        <label class="slbl">Time between taps <span style="color:var(--t3);font-size:10px">(seconds)</span></label>
        <input id="macro-gap-inp" type="number" min="0.05" max="5" step="0.1" value="${((cfg?.tapGapMs ?? 500) / 1000).toFixed(2)}"
          ${singleEnabled || allFlagActive ? 'disabled' : ''}
          style="width:70px;background:var(--elev);border:1px solid var(--bd2);border-radius:6px;color:var(--t1);padding:3px 8px;font-size:13px;text-align:center;${singleEnabled || allFlagActive ? 'opacity:.4;cursor:not-allowed' : ''}">
      </div>
    </div>`;

  $('macro-pick-btn')?.addEventListener('click', () => {
    if (macroPickMode === activeTab.id) cancelMacroPick(false);
    else startMacroPick(activeTab.id);
  });

  const togSingle = $('macro-tog-single');
  if (togSingle) togSingle.onchange = () => {
    // Activating single disables "all"
    if (togSingle.checked) setMacroEnabledAll(false, activeTab.id);
    setMacroEnabled(activeTab.id, togSingle.checked);
  };

  const togAll = $('macro-tog-all');
  if (togAll) togAll.onchange = () => {
    setMacroEnabledAll(togAll.checked, activeTab.id);
  };

  const saveConfig = () => {
    const intervalSec    = Math.max(1, parseInt($('macro-interval-inp')?.value) || 120);
    const tapsPerTrigger = Math.max(1, Math.min(10, parseInt($('macro-taps-inp')?.value) || 2));
    const tapGapMs       = Math.max(50, Math.min(5000, Math.round((parseFloat($('macro-gap-inp')?.value) || 0.5) * 1000)));
    const cur = getMacro(activeTab.id) || {};
    setMacro(activeTab.id, { ...cur, intervalSec, tapsPerTrigger, tapGapMs });
    if (getMacro(activeTab.id)?.enabled) {
      stopMacroTimer(activeTab.id);
      startMacroTimer(activeTab.id);
    }
  };
  $('macro-interval-inp')?.addEventListener('change', saveConfig);
  $('macro-taps-inp')?.addEventListener('change', saveConfig);
  $('macro-gap-inp')?.addEventListener('change', saveConfig);
}

// Load icons completely in background — never awaited
function loadIconsInBackground(devId, apps) {
  const unique = [...new Map(apps.map(a => [a.package, a])).values()]
    .filter(a => !state.iconCache[a.package]);
  if (!unique.length) return;

  // Process with concurrency of 8
  let idx = 0;
  const CONCURRENCY = 8;

  async function worker() {
    while (idx < unique.length) {
      const app = unique[idx++];
      try {
        const result = await window.td.getIcon(devId, app.package);
        if (!result?.iconData) continue;
        const { iconData: b64, iconMime: mime = 'image/png' } = result;
        state.iconCache[app.package] = { b64, mime };
        // Update modal app icons
        document.querySelectorAll(`[data-ico-pkg="${app.package}"]`).forEach(el => {
          el.innerHTML = `<img src="data:${mime};base64,${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">`;
        });
        // Update tab icons for this package
        state.tabs.filter(t => t.pkg === app.package).forEach(t => {
          const iconEl = document.getElementById('ticon-' + t.id);
          if (iconEl) iconEl.innerHTML = `<img src="data:${mime};base64,${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:5px">`;
        });
      } catch {}
    }
  }

  // Launch workers — don't await
  for (let i = 0; i < CONCURRENCY; i++) worker();
}

function getDeviceId(tabId) {
  return state.tabs.find(t => t.id === tabId)?.deviceId;
}

// Tracks tabs that closed IME due to tab switch (should reopen when returning)
const TAB_IME_PENDING = new Set();
const TAB_LAST_TAP = new Map(); // tabId → {x, y, w, h} last tap that opened IME

window.td.onImeOpen(({ deviceId }) => {
  const tabId = state.activeTab;
  if (!tabId) return;
  setWritingMode(true, tabId);
});

// Track last tap per tab — used to reopen IME when returning to tab
function recordTap(tabId, x, y, w, h) {
  TAB_LAST_TAP.set(tabId, { x, y, w, h });
}

window.td.onImeClose(({ deviceId }) => {
  const tabId = state.activeTab;
  if (!tabId) return;
  if (isWriting(tabId)) {
    setWritingMode(false, tabId);
    TAB_IME_PENDING.delete(tabId); // user closed manually, don't reopen
  }
});

window.td.onMeta(({ tabId, width, height }) => {
  const canvas=$('canvas-'+tabId);
  if(canvas){canvas.width=width;canvas.height=height;}
});

window.td.onEnded(({ tabId }) => updateTabState(tabId,'stopped'));
window.td.onError(({ tabId }) => updateTabState(tabId,'error'));

// ── Global keyboard ────────────────────────────────────────────────────────

// NAVIGATION shortcuts — always active, capture phase fires BEFORE canvas keydown
document.addEventListener('keydown', e => {
  // Block Tab completely everywhere
  if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); return; }

  const inInput = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
  if (inInput) return;

  // Ctrl+T and Ctrl+W always work
  if ((e.ctrlKey||e.metaKey) && e.key==='t') { e.preventDefault(); e.stopPropagation(); openModal(); return; }
  if ((e.ctrlKey||e.metaKey) && e.key==='w' && state.activeTab) { e.preventDefault(); e.stopPropagation(); closeTab(state.activeTab); return; }

  // Arrow tab switching — ALWAYS works, even when canvas focused
  // We stop propagation so canvas doesn't also receive ArrowLeft/Right
  if (!e.ctrlKey && !e.metaKey && !e.altKey && state.tabs.length > 1) {
    if (e.key==='ArrowRight') {
      e.preventDefault(); e.stopPropagation();
      const i = state.tabs.findIndex(t=>t.id===state.activeTab);
      activateTab(state.tabs[(i+1) % state.tabs.length].id, true);
      return;
    }
    if (e.key==='ArrowLeft') {
      e.preventDefault(); e.stopPropagation();
      const i = state.tabs.findIndex(t=>t.id===state.activeTab);
      activateTab(state.tabs[(i-1+state.tabs.length) % state.tabs.length].id, true);
      return;
    }
  }

  // Escape — close panel or stop zone editor (not when canvas focused/typing)
  if (!typingMode && e.key==='Escape') {
    if (state.panel) { closePanel(); return; }
    if (state.activeTab) {
      const ov = $('zone-overlay-'+state.activeTab);
      if (ov?._cleanup) { stopZoneEditor(state.activeTab); return; }
    }
  }
}, true); // capture=true → fires before canvas keydown

// ── Devices ────────────────────────────────────────────────────────────────
async function loadDevices() {
  try {
    const devices = await window.td.listDevices();
    const online = devices.filter(d=>d.state==='device');

    const prevIds = state.devices.filter(d=>d.state==='device').map(d=>d.id).sort().join(',');
    const newIds  = online.map(d=>d.id).sort().join(',');
    const changed = prevIds !== newIds;

    state.devices = devices;

    // Warmup encoder for all online devices (new or already connected)
    online.forEach(d => {
      window.td.warmupDevice(d.id).catch(() => {});
    });

    // Update status text
    emptyStatus.textContent = online.length
      ? `${online.length} device${online.length>1?'s':''} connected`
      : 'No devices — connect via USB';

    if (!online.length) {
      // No devices — clear everything
      state.selectedDevice = null;
      state.modalDevice    = null;
      state.users          = [];
      state.apps           = [];
      if (state.panel === 'devices') buildDevices();
      updateDeviceStatus();
      if (!backdropEl.classList.contains('hidden')) {
        renderModalDevices();
        renderModalApps('');
      }
      return;
    }

    if (changed) {
      // Check if currently selected device is still connected
      const stillConnected = state.selectedDevice && online.find(d=>d.id===state.selectedDevice.id);
      const target = stillConnected || online[0];
      state.selectedDevice = target;
      state.modalDevice    = target;
      state.users = await window.td.listUsers(target.id);
      await loadAllUserApps(target.id);
      // Refresh panels
      if (state.panel === 'devices') buildDevices();
      updateDeviceStatus();
      if (!backdropEl.classList.contains('hidden')) {
        renderModalDevices();
        renderModalApps(modalSearch.value);
      }
    }

    if (!state.selectedDevice) {
      state.selectedDevice = online[0];
      state.modalDevice    = online[0];
      state.users = await window.td.listUsers(online[0].id);
      loadAllUserApps(online[0].id);
    }
  } catch { emptyStatus.textContent = 'Error scanning devices'; }
}

// Poll for device changes every 3 seconds
// ── Warmup events ──────────────────────────────────────────────────────────
window.td.onWarmupStart(({ deviceId, duration }) => {
  WARMUP_STATE.set(deviceId, { done: false, progress: 0, startedAt: Date.now(), duration });
  const interval = setInterval(() => {
    const s = WARMUP_STATE.get(deviceId);
    if (!s || s.done) { clearInterval(interval); return; }
    s.progress = Math.min(99, Math.round((Date.now() - s.startedAt) / s.duration * 100));
    // Update in real time — just the bar and percentage text
    const card = document.querySelector(`.dev-card[data-id="${deviceId}"]`);
    if (!card) return;
    const fill = card.querySelector('.warmup-fill');
    const label = card.querySelector('.warmup-label');
    if (fill) fill.style.width = s.progress + '%';
    if (label) label.textContent = `Setting up the device… ${s.progress}%`;
    // Keep launch/SF disabled and hide app section if selected device
    if (state.modalDevice?.id === deviceId) {
      modalLaunch.disabled = true;
      const sfBtn = $('modal-sf-btn');
      if (sfBtn) { sfBtn.disabled = true; sfBtn.style.opacity = '0.4'; sfBtn.style.pointerEvents = 'none'; }
      const appSection = $('modal-app-section');
      if (appSection) appSection.style.display = 'none';
    }
  }, 250);
});

window.td.onWarmupDone(({ deviceId }) => {
  const s = WARMUP_STATE.get(deviceId) || {};
  s.done = true; s.progress = 100;
  WARMUP_STATE.set(deviceId, s);
  // Update card UI to Ready
  const card = document.querySelector(`.dev-card[data-id="${deviceId}"]`);
  if (card) {
    const wrap = card.querySelector('.warmup-bar-wrap');
    if (wrap) wrap.innerHTML = '<span class="warmup-ready">✓ Ready</span>';
  }
  // Re-enable launch/SF and show app section if this is the selected device
  if (state.modalDevice?.id === deviceId) {
    modalLaunch.disabled = !state.modalApp;
    const sfBtn = $('modal-sf-btn');
    if (sfBtn) { sfBtn.disabled = false; sfBtn.style.opacity = ''; sfBtn.style.pointerEvents = ''; }
    const appSection = $('modal-app-section');
    if (appSection) appSection.style.display = '';
  }
});

setInterval(loadDevices, 3000);

// ── Nav ────────────────────────────────────────────────────────────────────
$('btn-new').onclick = openModal;
$('btn-new-empty').onclick = openModal;

$('nav-shortcuts').onclick = () => {
  if(state.panel==='shortcuts'){closePanel();return;}
  openPanelWith('shortcuts','Shortcuts',buildShortcutsHtml(),()=>bindShortcutsEvents());
};
$('nav-devices').onclick = () => {
  if(state.panel==='devices'){closePanel();return;}
  openPanelWith('devices','Devices','',buildDevices);
};
$('nav-settings').onclick = () => {
  if(state.panel==='settings'){closePanel();return;}
  openPanelWith('settings','Settings','',buildSettings);
};
$('nav-macro').onclick   = () => {
  if (state.panel === 'macro') { closePanel(); return; }
  openPanelWith('macro', 'Macro for inactivity', '', buildMacroPanel);
};
$('nav-help').onclick    = () => { closePanel(); openHelpModal(); };
$('nav-bug').onclick     = () => { closePanel(); openBugModal(); };
$('nav-account').onclick = () => {
  if(state.panel==='account'){closePanel();return;}
  openPanelWith('account','About',`
    <div class="ps" style="text-align:center;padding:20px 0">
      <div style="font-size:16px;font-weight:700;color:var(--t1);margin-bottom:4px">TabPilot</div>
      <div style="font-size:11px;color:var(--t3);margin-bottom:6px">v1.0.0</div>
      <div style="font-size:11px;color:var(--t3);margin-bottom:18px">
        Powered by <a href="#" onclick="window.td.openExternal('https://github.com/Genymobile/scrcpy/releases/tag/v4.0');return false;"
          style="color:var(--acc2);text-decoration:none" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">scrcpy v4.0</a>
      </div>
      <div style="font-size:12px;color:var(--t2);line-height:2">
        Android multi-instance mirroring<br><br>
        Created by<br>
        <strong style="color:var(--acc2);font-size:14px">Aeonxy</strong><br>
        Konnichiwa Leader (Brutas/Blair)<br>
        Built with <strong style="color:var(--acc2)">Claude AI</strong><br><br>
        © 2026 Aeonxy. All rights reserved.
      </div>
    </div>`);
};

$('win-min').onclick   = () => window.td.minimize();
$('win-max').onclick   = () => window.td.maximize();
$('win-close').onclick = () => window.td.close();
$('writing-mode-btn')?.addEventListener('click', () => {
  setWritingMode(!isWriting(state.activeTab), state.activeTab);
});

// ── Init ───────────────────────────────────────────────────────────────────
emptyEl.style.display = '';
panesEl.style.display = 'none';
loadDevices();

// Show help wizard on first launch only
if (!localStorage.getItem('tabpilot:welcomed')) {
  localStorage.setItem('tabpilot:welcomed', '1');
  setTimeout(() => openHelpModal(), 500);
}

// ── Auto update ────────────────────────────────────────────────────────────
let _updateBanner = null;

window.td.onUpdateAvailable(({ version }) => {
  if (_updateBanner) return;
  _updateBanner = document.createElement('div');
  _updateBanner.id = 'update-banner';
  _updateBanner.style.cssText = 'position:fixed;bottom:16px;right:16px;background:#1a2a1a;border:1px solid #3a7a3a;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:12px;z-index:9998;font-size:13px;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.4)';
  _updateBanner.innerHTML = `
    <span>🚀 Update available — <strong>v${version}</strong></span>
    <button id="update-dl-btn" style="background:#2a7a2a;color:#fff;border:none;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer">Download</button>
    <button id="update-dismiss" style="background:transparent;color:#888;border:none;font-size:16px;cursor:pointer;padding:0 4px">×</button>`;
  document.body.appendChild(_updateBanner);

  $('update-dl-btn').onclick = () => {
    $('update-dl-btn').textContent = 'Downloading…';
    $('update-dl-btn').disabled = true;
    window.td.downloadUpdate();
  };
  $('update-dismiss').onclick = () => { _updateBanner?.remove(); _updateBanner = null; };
});

window.td.onUpdateProgress(({ percent }) => {
  const btn = $('update-dl-btn');
  if (btn) btn.textContent = `${percent}%`;
});

window.td.onUpdateReady(() => {
  if (_updateBanner) {
    _updateBanner.innerHTML = `
      <span>✅ Update ready to install</span>
      <button id="update-install-btn" style="background:#2a5cdb;color:#fff;border:none;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer">Restart & Install</button>
      <button id="update-dismiss2" style="background:transparent;color:#888;border:none;font-size:16px;cursor:pointer;padding:0 4px">×</button>`;
    $('update-install-btn').onclick = () => window.td.installUpdate();
    $('update-dismiss2').onclick = () => { _updateBanner?.remove(); _updateBanner = null; };
  }
});