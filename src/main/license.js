const { execSync } = require('child_process');
const os = require('os');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const SUPABASE_URL = 'https://jsqtmbtlnimxgpuuvdxk.supabase.co';
const SUPABASE_ANON = 'sb_publishable_6yCreA8AVZ_UrZj8gdiuAA_NVwU1YS0';

// ── Device fingerprint ─────────────────────────────────────────────────────
function getDeviceId() {
  try {
    if (process.platform === 'win32') {
      // Try PowerShell first (Windows 11 compatible)
      try {
        const out = execSync('powershell -NoProfile -Command "(Get-CimInstance Win32_ComputerSystemProduct).UUID"', { timeout: 4000 }).toString();
        const match = out.trim().match(/([A-F0-9\-]{36})/i);
        if (match) return crypto.createHash('sha256').update(match[1]).digest('hex').slice(0, 32);
      } catch {}
      // Fallback: reg query for MachineGuid
      try {
        const out = execSync('reg query HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid', { timeout: 3000 }).toString();
        const match = out.match(/MachineGuid\s+REG_SZ\s+([\w\-]+)/i);
        if (match) return crypto.createHash('sha256').update(match[1]).digest('hex').slice(0, 32);
      } catch {}
    }
  } catch {}
  // Fallback: MAC address based
  const nets = os.networkInterfaces();
  for (const iface of Object.values(nets)) {
    for (const n of iface) {
      if (!n.internal && n.mac && n.mac !== '00:00:00:00:00:00') {
        return crypto.createHash('sha256').update(n.mac + os.hostname()).digest('hex').slice(0, 32);
      }
    }
  }
  return crypto.createHash('sha256').update(os.hostname()).digest('hex').slice(0, 32);
}

// ── License file (local cache) ─────────────────────────────────────────────
function licensePath() {
  return path.join(app.getPath('userData'), 'license.json');
}

function saveLicenseLocal(key) {
  try { fs.writeFileSync(licensePath(), JSON.stringify({ key })); } catch {}
}

function loadLicenseLocal() {
  try { return JSON.parse(fs.readFileSync(licensePath(), 'utf8')); } catch { return null; }
}

function clearLicenseLocal() {
  try { fs.unlinkSync(licensePath()); } catch {}
}

// ── Supabase helpers ───────────────────────────────────────────────────────
async function supabaseFetch(path, opts = {}) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...opts.headers,
    },
    ...opts,
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// ── Activate license ───────────────────────────────────────────────────────
async function activateLicense(key) {
  const deviceId = getDeviceId();
  const deviceName = os.hostname();
  const normalizedKey = key.trim().toUpperCase();

  // Fetch license
  const { ok, data } = await supabaseFetch(
    `/licenses?key=eq.${encodeURIComponent(normalizedKey)}&select=*`
  );
  if (!ok || !Array.isArray(data) || data.length === 0)
    return { success: false, error: 'Invalid license key.' };

  const license = data[0];

  if (!license.is_active)
    return { success: false, error: 'This license has been deactivated.' };

  // Already activated on this device
  if (license.device_id === deviceId) {
    saveLicenseLocal(normalizedKey);
    return { success: true };
  }

  // Activated on another device
  if (license.device_id && license.device_id !== deviceId)
    return { success: false, error: 'This license is already in use on another device.' };

  // First activation — register device
  const patch = await supabaseFetch(
    `/licenses?key=eq.${encodeURIComponent(normalizedKey)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ device_id: deviceId, device_name: deviceName, activated_at: new Date().toISOString() }),
    }
  );
  if (!patch.ok)
    return { success: false, error: 'Could not activate license. Try again.' };

  saveLicenseLocal(normalizedKey);
  return { success: true };
}

// ── Validate saved license ─────────────────────────────────────────────────
async function validateSavedLicense() {
  const saved = loadLicenseLocal();
  if (!saved?.key) return { valid: false };

  const deviceId = getDeviceId();
  const { ok, data } = await supabaseFetch(
    `/licenses?key=eq.${encodeURIComponent(saved.key)}&select=*`
  );
  if (!ok || !Array.isArray(data) || data.length === 0)
    return { valid: false, error: 'License not found.' };

  const license = data[0];
  if (!license.is_active) return { valid: false, error: 'License deactivated.' };
  if (license.device_id !== deviceId) return { valid: false, error: 'Device mismatch.' };

  return { valid: true };
}

module.exports = { activateLicense, validateSavedLicense, clearLicenseLocal, getDeviceId };