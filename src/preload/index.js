const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('td', {
  // Window controls
  minimize:   () => ipcRenderer.send('win:minimize'),
  maximize:   () => ipcRenderer.send('win:maximize'),
  close:      () => ipcRenderer.send('win:close'),
  isMaximized:() => ipcRenderer.sendSync('win:is-maximized'),

  // Devices
  listDevices: ()                         => ipcRenderer.invoke('adb:devices'),
  listUsers:   (deviceId)                 => ipcRenderer.invoke('adb:users', deviceId),
  listApps:    (deviceId, userId, userLabel) => ipcRenderer.invoke('adb:apps',  deviceId, userId, userLabel),
  getIcon:     (deviceId, pkg)            => ipcRenderer.invoke('adb:icon',  deviceId, pkg),
  shell:       (deviceId, cmd)            => ipcRenderer.invoke('adb:shell', deviceId, cmd),

  // Mirror
  startMirror: (opts)                     => ipcRenderer.invoke('mirror:start', opts),
  stopMirror:  (tabId)                    => ipcRenderer.invoke('mirror:stop',  tabId),
  setDeviceAudio: (opts)                  => ipcRenderer.invoke('device:set-audio', opts),
  tap:         (opts) => ipcRenderer.invoke('mirror:tap',       opts),
  touchDown:   (opts) => ipcRenderer.invoke('mirror:touch-down', opts),
  touchUp:     (opts) => ipcRenderer.invoke('mirror:touch-up',   opts),
  touchMove:   (opts) => ipcRenderer.invoke('mirror:touch-move', opts),
  pinchStart:  (opts) => ipcRenderer.invoke('mirror:pinch-start', opts),
  pinchMove:   (opts) => ipcRenderer.invoke('mirror:pinch-move',  opts),
  pinchEnd:    (opts) => ipcRenderer.invoke('mirror:pinch-end',   opts),
  scroll:      (opts) => ipcRenderer.invoke('mirror:scroll',     opts),
  pinchZoom:   (opts) => ipcRenderer.invoke('mirror:pinch-zoom', opts),
  key:         (opts)                     => ipcRenderer.invoke('mirror:key',      opts),
  keyevent:    (opts)                     => ipcRenderer.invoke('mirror:keyevent', opts),

  // Events main → renderer
  onChunk:    (cb) => { ipcRenderer.on('mirror:chunk',  (_e, d) => cb(d)); },
  onEnded:    (cb) => { ipcRenderer.on('mirror:ended',  (_e, d) => cb(d)); },
  onError:    (cb) => { ipcRenderer.on('mirror:error',  (_e, d) => cb(d)); },
  onMeta:     (cb) => { ipcRenderer.on('mirror:meta',   (_e, d) => cb(d)); },
  onAudio:    (cb) => { ipcRenderer.on('mirror:audio',  (_e, d) => cb(d)); },
  onImeOpen:  (cb) => { ipcRenderer.on('mirror:ime-open',  (_e, d) => cb(d)); },
  onImeClose: (cb) => { ipcRenderer.on('mirror:ime-close', (_e, d) => cb(d)); },
  watchIme:   (opts) => ipcRenderer.invoke('mirror:watch-ime', opts),
  checkIme:   (opts) => ipcRenderer.invoke('mirror:check-ime', opts),
  stopImeWatcher: (opts) => ipcRenderer.invoke('mirror:stop-ime-watcher', opts),
  showIme:    (opts) => ipcRenderer.invoke('mirror:show-ime', opts),
  hideIme:    (opts) => ipcRenderer.invoke('mirror:hide-ime', opts),
  // Shell
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  warmupDevice:   (deviceId) => ipcRenderer.invoke('device:warmup', deviceId),
  sfWaitUnlock:   (deviceId) => ipcRenderer.invoke('sf:wait-unlock', deviceId),
  sfIsUnlocked:   (deviceId) => ipcRenderer.invoke('sf:is-unlocked', deviceId),
  onWarmupStart: (cb) => ipcRenderer.on('warmup:start', (_e, data) => cb(data)),
  onWarmupDone:  (cb) => ipcRenderer.on('warmup:done',  (_e, data) => cb(data)),
  activateLicense: (key) => ipcRenderer.invoke('license:activate', key),
  clearLicense:    ()    => ipcRenderer.invoke('license:clear'),
  onLicenseValid:    (cb) => ipcRenderer.on('license:valid',    () => cb()),
  onLicenseRequired: (cb) => ipcRenderer.on('license:required', (_e, msg) => cb(msg)),
  onLicenseRevoked:  (cb) => ipcRenderer.on('license:revoked',  () => cb()),

  // Secure Folder via scrcpy window overlay
  sfLaunchScrcpy:  (opts) => ipcRenderer.invoke('sf:launch-scrcpy', opts),
  getVersion:        ()   => ipcRenderer.invoke('app:version'),
  // Auto update
  onUpdateAvailable: (cb) => ipcRenderer.on('update:available', (_e, d) => cb(d)),
  onUpdateProgress:  (cb) => ipcRenderer.on('update:progress',  (_e, d) => cb(d)),
  onUpdateReady:     (cb) => ipcRenderer.on('update:ready',     () => cb()),
  downloadUpdate:    ()   => ipcRenderer.send('update:download'),
  installUpdate:     ()   => ipcRenderer.send('update:install'),
});