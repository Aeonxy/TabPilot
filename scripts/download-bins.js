#!/usr/bin/env node
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');
const { execFileSync } = require('child_process');

const SCRCPY  = '3.3.4';
const URLS = {
  platformTools: 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip',
  scrcpy: `https://github.com/Genymobile/scrcpy/releases/download/v${SCRCPY}/scrcpy-win64-v${SCRCPY}.zip`,
};

const OUT = path.join(__dirname, '..', 'bin', 'win32');
const TMP = path.join(os.tmpdir(), 'tabdesk-bins');
const log = m => console.log(`[bins] ${m}`);
const mkd = d => fs.mkdirSync(d, { recursive: true });

function dl(url, dest) {
  return new Promise((res, rej) => {
    if (fs.existsSync(dest)) { log(`cached: ${path.basename(dest)}`); return res(); }
    log(`downloading ${path.basename(dest)}...`);
    const f = fs.createWriteStream(dest);
    function get(u) {
      https.get(u, r => {
        if (r.statusCode === 301 || r.statusCode === 302) return get(r.headers.location);
        if (r.statusCode !== 200) return rej(new Error(`HTTP ${r.statusCode}`));
        const tot = parseInt(r.headers['content-length'] || '0');
        let got = 0;
        r.on('data', c => { got += c.length; if (tot) process.stdout.write(`\r[bins] ${Math.round(got/tot*100)}%  `); });
        r.pipe(f);
        f.on('finish', () => { process.stdout.write('\n'); f.close(res); });
      }).on('error', rej);
    }
    get(url);
  });
}

function unzip(src, dest) {
  log(`extracting ${path.basename(src)}...`);
  mkd(dest);
  execFileSync('powershell', ['-NoProfile', '-Command',
    `Expand-Archive -Path '${src}' -DestinationPath '${dest}' -Force`], { stdio: 'inherit' });
}

function copy(src, dst) {
  if (!fs.existsSync(src)) return;
  mkd(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

async function main() {
  mkd(TMP); mkd(OUT);
  log(`scrcpy v${SCRCPY} + adb → bin/win32/`);

  // adb
  const ptZip = path.join(TMP, 'pt-win32.zip');
  const ptDir = path.join(TMP, 'pt');
  await dl(URLS.platformTools, ptZip);
  unzip(ptZip, ptDir);
  const pt = path.join(ptDir, 'platform-tools');
  for (const f of ['adb.exe', 'AdbWinApi.dll', 'AdbWinUsbApi.dll']) copy(path.join(pt, f), path.join(OUT, f));
  log('✓ adb → bin/win32/');

  // scrcpy
  const scrZip = path.join(TMP, 'scrcpy-win32.zip');
  const scrDir = path.join(TMP, 'scr');
  await dl(URLS.scrcpy, scrZip);
  unzip(scrZip, scrDir);
  const sub = fs.readdirSync(scrDir).find(d => fs.statSync(path.join(scrDir, d)).isDirectory()) || '.';
  for (const f of fs.readdirSync(path.join(scrDir, sub))) {
    copy(path.join(scrDir, sub, f), path.join(OUT, f));
  }
  log('✓ scrcpy → bin/win32/');
  log('Done! Run: npm start');
}

main().catch(e => { console.error(e.message); process.exit(1); });
