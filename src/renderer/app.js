'use strict';

// ── Settings ───────────────────────────────────────────────────────────────
// ── i18n system ────────────────────────────────────────────────────────────
const LANG_NAMES = {
  en: { en:'English',   es:'Spanish',    pt:'Portuguese', ja:'Japanese', de:'German',  fr:'French'  },
  es: { en:'Inglés',    es:'Español',    pt:'Portugués',  ja:'Japonés',  de:'Alemán',  fr:'Francés' },
  pt: { en:'Inglês',    es:'Espanhol',   pt:'Português',  ja:'Japonês',  de:'Alemão',  fr:'Francês' },
  ja: { en:'英語',       es:'スペイン語',  pt:'ポルトガル語', ja:'日本語',   de:'ドイツ語', fr:'フランス語' },
  de: { en:'Englisch',  es:'Spanisch',   pt:'Portugiesisch', ja:'Japanisch', de:'Deutsch', fr:'Französisch' },
  fr: { en:'Anglais',   es:'Espagnol',   pt:'Portugais',  ja:'Japonais', de:'Allemand', fr:'Français' },
};
const LANGS = {
  en: { flag:'US', name:'English',    native:'English'    },
  es: { flag:'ES', name:'Spanish',    native:'Español'    },
  pt: { flag:'BR', name:'Portuguese', native:'Português'  },
  ja: { flag:'JP', name:'Japanese',   native:'日本語'      },
  de: { flag:'DE', name:'German',     native:'Deutsch'    },
  fr: { flag:'FR', name:'French',     native:'Français'   },
};

const BASE = {
  newInstance:'New instance', shortcuts:'Shortcuts', record:'Record',
  settings:'Settings', help:'Help', reportBug:'Report a bug', about:'About',
  devices:'Devices', manageDevices:'Manage devices', viewDevices:'📱 View devices',
  connected:'Connected', offline:'Offline', noDevices:'No devices connected',
  launchTitle:'Launch an instance', device:'DEVICE', application:'APPLICATION',
  searchApp:'Search by name or package…', cancel:'Cancel', launch:'Launch',
  launchN:'Launch ({n})', openSF:'🔒 Open Secure Folder',
  preset:'PRESET', options:'OPTIONS', audio:'Audio', turnOffScreen:'Turn off screen',
  ultra:'Ultra', high:'High', medium:'Medium', low:'Low', eco:'Eco (low heat)', custom:'Custom',
  customizeWhenLaunching:'Configure when launching',
  resolution:'Resolution', fps:'Max FPS', bitrate:'Bitrate', dpi:'DPI', iframe:'I-frame interval',
  performance:'Performance', advanced:'Advanced',
  turnOffScreenFull:'Turn off screen while mirroring', enableAudio:'Enable audio',
  settingsTitle:'Settings',
  shortcutsTitle:'Shortcuts', actions:'Actions', navigation:'Navigation',
  addZones:'+ Add zones', addMoreZones:'✏ Add more zones', noZonesYet:'No zones configured yet.',
  thisInstanceOnly:'(this instance only)', copyShortcuts:'📋 Copy shortcuts to another instance',
  copyTitle:'Copy shortcuts to another instance', selectTarget:'Select target instance(s):',
  continueBtn:'Continue →', areYouSure:'Are you sure?',
  copyWarning:'The shortcut configuration from this instance will be copied to all selected target instances.\nIf one or more target instances were initialized with a different preset, some shortcut mappings may not match the intended actions.\nThis operation will overwrite the current shortcut configuration of the selected instance(s).',
  confirm:'Confirm', recordTitle:'Record', noRecords:'No records yet. Hit Record to start.',
  recordBtn:'● Record', close:'✕', recordingInProgress:'Recording in progress…',
  taps:'taps', pause:'⏸', resume:'▶', stop:'⏹',
  recSettings:'Record Settings', repeatAction:'Repeat', times:'times',
  forDuration:'For', infinitely:'Infinitely until stopped',
  intervalBetween:'Interval between executions', playbackSpeed:'Playback speed',
  save:'Save',
  thisInstance:'This instance', allInstances:'All instances',
  navNewInstance:'New instance', navCloseTab:'Close instance', navNextTab:'Switch tab →', navPrevTab:'Switch tab ←', navClosePanel:'Close panel / Exit zone editor',
  navRemapHint:'Click a key to remap it.',
  escFixed:'Escape — Close panel / Exit zone editor (fixed)',
  deviceReady:'✓ Ready', deviceConnected:'devices connected', deviceConnectedOne:'device connected',
  activityActive:'records active', activityActiveOne:'active',
  helpTitle:'Usage Guide', aboutTitle:'About',
  licenseTitle:'Welcome to TabPilot', licenseSubtitle:'Enter your license key to continue.',
  licenseKey:'License key', activate:'Activate', activating:'Activating…',
  licenseAdminHint:'Contact your administrator if you need a license key.',
  licenseActivated:'License activated!',
  settingUp:'Setting up devices…', errorScanning:'Error scanning devices',
  noDevicesConnect:'No devices — connect via USB',
  language:'Language',
  setupGuide:'Setup Guide', usageGuide:'Usage Guide',
  stepOf:'Step {n} of {total}', previous:'Previous', next:'Next', finish:'Finish', closeBtn:'Close',
  howToUse:'How to use TabPilot',
  troubleshooting:'Troubleshooting', backToGuide:'Back to guide',
  troubleItems:"Make sure you're using a <strong>data cable</strong>, not a charge-only cable.|Try a different USB port directly on the PC.|On Xiaomi: enable <strong>USB Debugging (Security settings)</strong> in Developer Options.|Disconnect and reconnect the device while it's <strong>unlocked</strong>.|Revoke USB debugging authorizations and re-authorize.|Restart ADB: run <code>adb kill-server</code> then reconnect.",
  bugTitle:'Join the TabPilot Community',
  bugBody:'To report a bug, give feedback, or connect with other TabPilot users, join our Discord server. Share your experience, suggest features, and help make TabPilot better for everyone.',
  joinDiscord:'Join Discord',
  upToDate:'Up to date', aboutDesc:'Android multi-instance mirroring',
  createdBy:'Created by', builtWith:'Built with', allRights:'All rights reserved',
  // Setup guide steps
  h_s1_title:'Connect your phone', h_s1_goal:'Connect your Android device to the PC.',
  h_s1_s1:'Use a USB <strong>data</strong> cable — not just a charging cable.',
  h_s1_s2:'When Android prompts you, select <strong>File Transfer (MTP)</strong> mode.',
  h_s1_s3:'Connect directly to the PC — avoid USB hubs.',
  h_s1_tip:'If the device only charges and is not detected, the cable is likely charge-only.',
  h_s2_title:'Enable Developer Options', h_s2_goal:'Unlock the developer menu on Android.',
  h_s2_s1:'Open <strong>Settings → About phone</strong>.', h_s2_s2:'Find <strong>Build Number</strong>.',
  h_s2_s3:'Tap it <strong>7 times</strong> until you see "You are now a developer".',
  h_s3_title:'Enable USB Debugging', h_s3_goal:'Allow ADB communication with the device.',
  h_s3_s1:'Open <strong>Settings → System → Developer Options</strong>.', h_s3_s2:'Enable <strong>USB Debugging</strong>.',
  h_s3_tip:'On some brands (Xiaomi, Realme, Oppo…) you may need to enable additional USB-related options in Developer Options.',
  h_s4_title:'Authorize the connection', h_s4_goal:'Approve the computer from your phone.',
  h_s4_s1:'A dialog will appear: <strong>"Allow USB debugging?"</strong>',
  h_s4_s2:'Check <strong>"Always allow from this computer"</strong>.', h_s4_s3:'Tap <strong>Allow</strong>.',
  h_s4_tip:'If the dialog does not appear, disconnect and reconnect the device while keeping it unlocked.',
  h_s5_title:'Device ready!', h_s5_goal:'Confirm the phone was detected correctly.',
  h_s5_s1:'Your device appears in the <strong>Devices</strong> panel.',
  h_s5_s2:'Click <strong>"+"</strong> to launch an app.',
  h_s5_s3:'Each instance runs in its own virtual display.',
  // Usage guide
  u1_title:'Launching an instance', u1_body:'Click <strong>+</strong> to open the launch dialog.<br><br>Select your device and app. The <strong>Settings panel</strong> on the right lets you pick a preset or configure Custom settings.',
  u2_title:'Secure Folder', u2_body:'If your Samsung device has Secure Folder, an <strong>Open Secure Folder</strong> button appears in the launch dialog.<br><br>Manually unlock Secure Folder on the device first, then press <strong>Continue</strong>.',
  u3_title:'Touch & gestures', u3_body:'<strong>Click</strong> — tap. <strong>Hold</strong> — long press. <strong>Drag</strong> — swipe. <strong>Scroll</strong> — native scroll. <strong>Ctrl+drag</strong> — pinch zoom.',
  u4_title:'Keyboard & typing', u4_body:'Click the mirror to focus it, then type. Keys mapped to <strong>Shortcuts</strong> trigger zone taps. When the keyboard appears, use the <strong>⌨ Write</strong> button to switch to typing mode.',
  u5_title:'Shortcuts (zones)', u5_body:'Open <strong>Shortcuts → Actions</strong> and click <strong>Add zones</strong>. Click on the mirror to place a zone, then press a key to assign it. Use <strong>Copy shortcuts</strong> to share them across instances. Save and load zone sets via <strong>Shortcuts → Profiles</strong> — profiles store the resolution and DPI they were created with, so a mismatch warning appears if you apply one to a different preset.',
  u6_title:'Record', u6_body:'Open <strong>Record</strong> and click <strong>● Record</strong>. Perform taps — they are captured with exact timing. Stop to save. Enable <strong>This instance</strong> or <strong>All instances</strong> toggles, then press <strong>▶ Play</strong> to start. The button turns into <strong>⏹ Stop</strong> while running. Configure repeat, duration, interval and speed via ⚙.',
  u7_title:'Settings', u7_body:'<strong>Presets</strong> — Ultra, High, Medium, Low, Eco. <strong>Custom</strong> — configure resolution, FPS, bitrate, DPI and i-frame interval. <strong>Turn off screen</strong> — saves battery. <strong>Auto-reconnect</strong> — automatically restores a mirror that drops unexpectedly. <strong>Show FPS</strong> — displays live FPS on each tab.',
  u8_title:'Navigation shortcuts', u8_body:'Open <strong>Shortcuts → Navigation</strong> to remap: new instance, close, switch tabs. Click a key badge to reassign it.',
  u9_title:'Broadcast', u9_body:'Click the 📡 button in the topbar (or press <strong>B</strong>) to enter Broadcast mode — every click on the active mirror is sent to all other instances of the same app simultaneously. <strong>Shift+click</strong> broadcasts a single tap without toggling the mode.',
  u10_title:'Layouts', u10_body:'Click the ⊞ button in the topbar to open the Layout Manager. Save your current set of open instances as a named layout. Restore a layout to reopen all its instances in one click — devices must be connected.',
  u9_title:'Tabs & nicknames', u9_body:'<strong>Double-click</strong> or <strong>right-click</strong> a tab to rename it. Drag to reorder.',
};

const TRANSLATIONS = {
  en: { ...BASE },
  es: { ...BASE,
    newInstance:'Nueva instancia', shortcuts:'Atajos', record:'Grabar',
    settings:'Configuración', help:'Ayuda', reportBug:'Reportar bug', about:'Acerca de',
    devices:'Dispositivos', manageDevices:'Gestionar dispositivos', viewDevices:'📱 Ver dispositivos',
    connected:'Conectados', offline:'Sin conexión', noDevices:'Sin dispositivos conectados',
    launchTitle:'Lanzar una instancia', device:'DISPOSITIVO', application:'APLICACIÓN',
    searchApp:'Buscar por nombre o paquete…', cancel:'Cancelar', launch:'Lanzar',
    launchN:'Lanzar ({n})', openSF:'🔒 Abrir Carpeta Segura',
    preset:'PRESET', options:'OPCIONES', audio:'Audio', turnOffScreen:'Apagar pantalla',
    ultra:'Ultra', high:'Alto', medium:'Medio', low:'Bajo', eco:'Eco (bajo calor)', custom:'Personalizado',
    customizeWhenLaunching:'Configurar al lanzar',
    resolution:'Resolución', fps:'FPS máx', bitrate:'Tasa de bits', iframe:'Intervalo i-frame',
    performance:'Rendimiento', advanced:'Avanzado',
    turnOffScreenFull:'Apagar pantalla al duplicar', enableAudio:'Habilitar audio',
    actions:'Acciones', navigation:'Navegación',
    addZones:'+ Agregar zonas', addMoreZones:'✏ Más zonas', noZonesYet:'Sin zonas configuradas.',
    thisInstanceOnly:'(solo esta instancia)', copyShortcuts:'📋 Copiar atajos a otra instancia',
    copyTitle:'Copiar atajos a otra instancia', selectTarget:'Selecciona instancias destino:',
    continueBtn:'Continuar →', areYouSure:'¿Estás seguro?',
    copyWarning:'La configuración de atajos se copiará a las instancias seleccionadas.\nSi fueron iniciadas con un preset diferente, algunos atajos pueden no coincidir.\nEsta operación sobreescribirá la configuración actual.',
    confirm:'Confirmar', noRecords:'Sin grabaciones. Presiona Grabar para empezar.',
    recordBtn:'● Grabar', taps:'toques',
    recSettings:'Config. de grabación', repeatAction:'Repetir', times:'veces',
    forDuration:'Por', infinitely:'Infinitamente hasta detener',
    intervalBetween:'Intervalo entre ejecuciones', playbackSpeed:'Velocidad de reproducción',
    thisInstance:'Esta instancia', allInstances:'Todas las instancias', navNewInstance:'Nueva instancia', navCloseTab:'Cerrar instancia', navNextTab:'Cambiar tab →', navPrevTab:'Cambiar tab ←',
    save:'Guardar', navRemapHint:'Clic en una tecla para reasignarla.',
    escFixed:'Escape — Cerrar panel / Salir del editor de zonas (fijo)',
    deviceReady:'✓ Listo', deviceConnected:'dispositivos conectados', deviceConnectedOne:'dispositivo conectado',
    activityActive:'grabaciones activas', activityActiveOne:'activa',
    licenseSubtitle:'Ingresa tu clave de licencia para continuar.',
    activate:'Activar', activating:'Activando…', licenseError:'Licencia inválida o ya en uso.', licenseAdminHint:'Contacta a tu administrador si necesitas una clave de licencia.',
    settingUp:'Configurando dispositivos…', errorScanning:'Error al buscar dispositivos',
    noDevicesConnect:'Sin dispositivos — conecta por USB', language:'Idioma',
    setupGuide:'Guía de configuración', usageGuide:'Guía de uso',
    stepOf:'Paso {n} de {total}', previous:'Anterior', next:'Siguiente', finish:'Finalizar', closeBtn:'Cerrar',
    howToUse:'Cómo usar TabPilot', troubleshooting:'Solución de problemas', backToGuide:'← Volver a la guía',
    troubleItems:'Asegúrate de usar un cable <strong>de datos</strong>, no solo de carga.|Prueba otro puerto USB directamente en el PC.|En Xiaomi: habilita <strong>Depuración USB (Configuración de seguridad)</strong>.|Desconecta y reconecta el dispositivo mientras está <strong>desbloqueado</strong>.|Revoca las autorizaciones de depuración USB y vuelve a autorizar.|Reinicia ADB: ejecuta <code>adb kill-server</code> y reconecta.',
    bugTitle:'Únete a la comunidad TabPilot',
    bugBody:'Para reportar un bug, dar feedback o conectar con otros usuarios, únete a nuestro servidor de Discord.',
    joinDiscord:'Unirse a Discord',
    upToDate:'Actualizado', aboutDesc:'Duplicación multi-instancia de Android',
    createdBy:'Creado por', builtWith:'Hecho con', allRights:'Todos los derechos reservados',
    h_s1_title:'Conecta tu teléfono', h_s1_goal:'Conecta tu dispositivo Android al PC.',
    h_s1_s1:'Usa un cable USB <strong>de datos</strong> — no solo de carga.',
    h_s1_s2:'Cuando Android lo solicite, selecciona <strong>Transferencia de archivos (MTP)</strong>.',
    h_s1_s3:'Conecta directamente al PC — evita hubs USB.',
    h_s1_tip:'Si el dispositivo solo carga y no se detecta, el cable probablemente es solo de carga.',
    h_s2_title:'Habilitar opciones de desarrollador', h_s2_goal:'Desbloquea el menú de desarrollador en Android.',
    h_s2_s1:'Abre <strong>Configuración → Acerca del teléfono</strong>.', h_s2_s2:'Busca <strong>Número de compilación</strong>.',
    h_s2_s3:'Tócalo <strong>7 veces</strong> hasta ver "Ahora eres desarrollador".',
    h_s3_title:'Habilitar depuración USB', h_s3_goal:'Permite la comunicación ADB con el dispositivo.',
    h_s3_s1:'Abre <strong>Configuración → Sistema → Opciones de desarrollador</strong>.', h_s3_s2:'Activa <strong>Depuración USB</strong>.',
    h_s3_tip:'En algunas marcas (Xiaomi, Realme, Oppo…) puede que necesites habilitar opciones USB adicionales.',
    h_s4_title:'Autorizar la conexión', h_s4_goal:'Aprueba la computadora desde tu teléfono.',
    h_s4_s1:'Aparecerá un diálogo: <strong>"¿Permitir depuración USB?"</strong>',
    h_s4_s2:'Marca <strong>"Permitir siempre desde esta computadora"</strong>.', h_s4_s3:'Toca <strong>Permitir</strong>.',
    h_s4_tip:'Si no aparece el diálogo, desconecta y reconecta el dispositivo manteniéndolo desbloqueado.',
    h_s5_title:'¡Dispositivo listo!', h_s5_goal:'Confirma que el teléfono fue detectado correctamente.',
    h_s5_s1:'Tu dispositivo aparece en el panel de <strong>Dispositivos</strong>.',
    h_s5_s2:'Haz clic en <strong>"+"</strong> para lanzar una app.',
    h_s5_s3:'Cada instancia corre en su propio display virtual.',
    u1_title:'Lanzar una instancia', u1_body:'Haz clic en <strong>+</strong> para abrir el diálogo de lanzamiento. Selecciona tu dispositivo y app. El panel derecho te permite elegir un preset o configuración personalizada.',
    u2_title:'Carpeta Segura', u2_body:'Si tu Samsung tiene Carpeta Segura, aparece el botón en el diálogo. Desbloquea la carpeta primero en el dispositivo, luego presiona <strong>Continuar</strong>.',
    u3_title:'Toque y gestos', u3_body:'<strong>Clic</strong> — toque. <strong>Mantener</strong> — pulsación larga. <strong>Arrastrar</strong> — deslizar. <strong>Rueda</strong> — scroll. <strong>Ctrl+arrastrar</strong> — zoom.',
    u4_title:'Teclado y escritura', u4_body:'Haz clic en el espejo para enfocarlo y escribe normalmente. Las teclas asignadas a zonas activan sus acciones. Usa el botón <strong>⌨ Escribir</strong> para modo de escritura.',
    u5_title:'Atajos (zonas)', u5_body:'Abre <strong>Atajos → Acciones</strong> y haz clic en <strong>Agregar zonas</strong>. Haz clic en el espejo para colocar una zona y presiona una tecla para asignarla.',
    u6_title:'Grabar', u6_body:'Abre <strong>Grabar</strong> y haz clic en <strong>● Grabar</strong>. Realiza toques — se capturan con temporización exacta. Pausa/reanuda o detén para guardar.',
    u7_title:'Configuración', u7_body:'<strong>Presets</strong> — Ultra, Alto, Medio, Bajo. <strong>Personalizado</strong> — configura resolución, FPS, bitrate, DPI e i-frame. <strong>Apagar pantalla</strong> — ahorra batería.',
    u8_title:'Atajos de navegación', u8_body:'Abre <strong>Atajos → Navegación</strong> para reasignar: nueva instancia, cerrar, cambiar tabs.',
    u9_title:'Tabs y apodos', u9_body:'<strong>Doble clic</strong> o <strong>clic derecho</strong> en un tab para renombrarlo. Arrastra para reordenar.',
  },
  pt: { ...BASE,
    newInstance:'Nova instância', shortcuts:'Atalhos', record:'Gravar',
    settings:'Configurações', help:'Ajuda', reportBug:'Reportar bug', about:'Sobre',
    devices:'Dispositivos', manageDevices:'Gerenciar dispositivos', viewDevices:'📱 Ver dispositivos',
    connected:'Conectados', offline:'Desconectados', noDevices:'Nenhum dispositivo conectado',
    launchTitle:'Iniciar uma instância', device:'DISPOSITIVO', application:'APLICATIVO',
    searchApp:'Pesquisar por nome ou pacote…', cancel:'Cancelar', launch:'Iniciar',
    preset:'PRESET', options:'OPÇÕES', audio:'Áudio', turnOffScreen:'Desligar tela',
    ultra:'Ultra', high:'Alto', medium:'Médio', low:'Baixo', custom:'Personalizado',
    customizeWhenLaunching:'Configurar ao iniciar',
    resolution:'Resolução', fps:'FPS máx', bitrate:'Taxa de bits', iframe:'Intervalo i-frame',
    performance:'Desempenho', advanced:'Avançado',
    turnOffScreenFull:'Desligar tela ao espelhar', enableAudio:'Habilitar áudio',
    actions:'Ações', navigation:'Navegação',
    addZones:'+ Adicionar zonas', addMoreZones:'✏ Mais zonas', noZonesYet:'Nenhuma zona configurada.',
    thisInstanceOnly:'(somente esta instância)', copyShortcuts:'📋 Copiar atalhos para outra instância',
    copyTitle:'Copiar atalhos', selectTarget:'Selecione instâncias destino:',
    continueBtn:'Continuar →', areYouSure:'Tem certeza?',
    copyWarning:'A configuração será copiada para as instâncias selecionadas.\nAlguns atalhos podem não corresponder se inicializados com preset diferente.\nEsta operação substituirá a configuração atual.',
    confirm:'Confirmar', noRecords:'Nenhuma gravação. Pressione Gravar.',
    recordBtn:'● Gravar', taps:'toques',
    recSettings:'Config. de gravação', repeatAction:'Repetir', times:'vezes',
    forDuration:'Por', infinitely:'Infinitamente até parar',
    intervalBetween:'Intervalo entre execuções', playbackSpeed:'Velocidade de reprodução',
    thisInstance:'Esta instância', allInstances:'Todas as instâncias', navNewInstance:'Nova instância', navCloseTab:'Fechar instância', navNextTab:'Trocar aba →', navPrevTab:'Trocar aba ←',
    save:'Salvar', navRemapHint:'Clique em uma tecla para remapeá-la.',
    escFixed:'Escape — Fechar painel / Sair do editor de zonas (fixo)',
    deviceReady:'✓ Pronto', deviceConnected:'dispositivos conectados', deviceConnectedOne:'dispositivo conectado',
    activityActive:'gravações ativas', activityActiveOne:'ativa',
    licenseSubtitle:'Insira sua chave de licença para continuar.',
    activate:'Ativar', activating:'Ativando…', licenseError:'Licença inválida ou já em uso.', licenseAdminHint:'Entre em contato com seu administrador se precisar de uma chave de licença.',
    settingUp:'Configurando dispositivos…', errorScanning:'Erro ao buscar dispositivos',
    noDevicesConnect:'Sem dispositivos — conecte via USB', language:'Idioma',
    setupGuide:'Guia de configuração', usageGuide:'Guia de uso',
    stepOf:'Passo {n} de {total}', previous:'Anterior', next:'Próximo', finish:'Finalizar', closeBtn:'Fechar',
    howToUse:'Como usar o TabPilot', troubleshooting:'Solução de problemas', backToGuide:'← Voltar ao guia',
    troubleItems:'Use um cabo USB <strong>de dados</strong>, não apenas de carga.|Tente uma porta USB diferente diretamente no PC.|No Xiaomi: ative <strong>Depuração USB (Configurações de segurança)</strong>.|Desconecte e reconecte com o dispositivo <strong>desbloqueado</strong>.|Revogue as autorizações de depuração USB e reautorize.|Reinicie o ADB: execute <code>adb kill-server</code> e reconecte.',
    bugTitle:'Junte-se à comunidade TabPilot',
    bugBody:'Para reportar bugs, dar feedback ou conectar com outros usuários, entre no servidor do Discord.',
    joinDiscord:'Entrar no Discord',
    upToDate:'Atualizado', aboutDesc:'Espelhamento multi-instância Android',
    createdBy:'Criado por', builtWith:'Feito com', allRights:'Todos os direitos reservados',
    h_s1_title:'Conecte seu telefone', h_s1_goal:'Conecte seu dispositivo Android ao PC.',
    h_s1_s1:'Use um cabo USB <strong>de dados</strong> — não apenas de carregamento.',
    h_s1_s2:'Quando o Android solicitar, selecione <strong>Transferência de arquivos (MTP)</strong>.',
    h_s1_s3:'Conecte diretamente ao PC — evite hubs USB.',
    h_s1_tip:'Se o dispositivo apenas carrega e não é detectado, o cabo provavelmente é apenas de carga.',
    h_s2_title:'Ativar Opções do desenvolvedor', h_s2_goal:'Desbloqueie o menu de desenvolvedor.',
    h_s2_s1:'Abra <strong>Configurações → Sobre o telefone</strong>.', h_s2_s2:'Encontre <strong>Número da versão</strong>.',
    h_s2_s3:'Toque <strong>7 vezes</strong> até ver "Você agora é um desenvolvedor".',
    h_s3_title:'Ativar Depuração USB', h_s3_goal:'Permite comunicação ADB com o dispositivo.',
    h_s3_s1:'Abra <strong>Configurações → Sistema → Opções do desenvolvedor</strong>.', h_s3_s2:'Ative <strong>Depuração USB</strong>.',
    h_s3_tip:'Em algumas marcas (Xiaomi, Realme, Oppo…) pode ser necessário ativar opções USB adicionais.',
    h_s4_title:'Autorizar a conexão', h_s4_goal:'Aprove o computador pelo telefone.',
    h_s4_s1:'Um diálogo aparecerá: <strong>"Permitir depuração USB?"</strong>',
    h_s4_s2:'Marque <strong>"Sempre permitir deste computador"</strong>.', h_s4_s3:'Toque em <strong>Permitir</strong>.',
    h_s4_tip:'Se o diálogo não aparecer, desconecte e reconecte com o dispositivo desbloqueado.',
    h_s5_title:'Dispositivo pronto!', h_s5_goal:'Confirme que o telefone foi detectado.',
    h_s5_s1:'Seu dispositivo aparece no painel.', h_s5_s2:'Clique em <strong>"+"</strong> para iniciar um app.',
    h_s5_s3:'Cada instância roda em seu próprio display virtual.',
    u1_title:'Iniciar uma instância', u1_body:'Clique em <strong>+</strong> para abrir o diálogo. Selecione dispositivo e app.',
    u2_title:'Pasta Segura', u2_body:'Se seu Samsung tem Pasta Segura, desbloqueie-a primeiro no dispositivo, depois pressione <strong>Continuar</strong>.',
    u3_title:'Toque e gestos', u3_body:'<strong>Clique</strong> — toque. <strong>Segurar</strong> — pressão longa. <strong>Arrastar</strong> — deslizar. <strong>Ctrl+arrastar</strong> — zoom.',
    u4_title:'Teclado e digitação', u4_body:'Clique no espelho e digite normalmente. Use o botão <strong>⌨ Escrever</strong> para modo de digitação.',
    u5_title:'Atalhos (zonas)', u5_body:'Abra <strong>Atalhos → Ações</strong> e clique em <strong>Adicionar zonas</strong>.',
    u6_title:'Gravar', u6_body:'Abra <strong>Gravar</strong> e clique em <strong>● Gravar</strong>. Realize toques e pare para salvar.',
    u7_title:'Configurações', u7_body:'<strong>Presets</strong> — Ultra, Alto, Médio, Baixo. <strong>Personalizado</strong> — resolução, FPS, bitrate, DPI.',
    u8_title:'Atalhos de navegação', u8_body:'Abra <strong>Atalhos → Navegação</strong> para reatribuir teclas.',
    u9_title:'Abas e apelidos', u9_body:'<strong>Duplo clique</strong> ou <strong>clique direito</strong> numa aba para renomear.',
  },
  ja: { ...BASE,
    newInstance:'新しいインスタンス', shortcuts:'ショートカット', record:'録画',
    settings:'設定', help:'ヘルプ', reportBug:'バグ報告', about:'について',
    devices:'デバイス', manageDevices:'デバイス管理', viewDevices:'📱 デバイスを見る',
    connected:'接続中', offline:'オフライン', noDevices:'デバイスが接続されていません',
    launchTitle:'インスタンスを起動', device:'デバイス', application:'アプリ',
    searchApp:'名前またはパッケージで検索…', cancel:'キャンセル', launch:'起動',
    preset:'プリセット', options:'オプション', audio:'オーディオ', turnOffScreen:'画面をオフ',
    ultra:'ウルトラ', high:'高', medium:'中', low:'低', custom:'カスタム',
    customizeWhenLaunching:'起動時に設定',
    resolution:'解像度', fps:'最大FPS', bitrate:'ビットレート', iframe:'iフレーム間隔',
    performance:'パフォーマンス', advanced:'詳細',
    turnOffScreenFull:'ミラーリング中に画面をオフ', enableAudio:'オーディオを有効にする',
    actions:'アクション', navigation:'ナビゲーション',
    addZones:'+ ゾーンを追加', addMoreZones:'✏ ゾーンをさらに追加', noZonesYet:'ゾーンが設定されていません。',
    thisInstanceOnly:'(このインスタンスのみ)', copyShortcuts:'📋 別のインスタンスにコピー',
    copyTitle:'ショートカットをコピー', selectTarget:'コピー先を選択:',
    continueBtn:'続行 →', areYouSure:'本当によろしいですか？',
    copyWarning:'このインスタンスのショートカット設定が選択されたインスタンスにコピーされます。\n別のプリセットでは一部が一致しない場合があります。\n現在の設定が上書きされます。',
    confirm:'確認', noRecords:'録画がありません。録画ボタンを押してください。',
    recordBtn:'● 録画', taps:'タップ',
    recSettings:'録画設定', repeatAction:'繰り返し', times:'回',
    forDuration:'期間', infinitely:'停止するまで無限に',
    intervalBetween:'実行間隔', playbackSpeed:'再生速度',
    thisInstance:'このインスタンス', allInstances:'全インスタンス', navNewInstance:'新しいインスタンス', navCloseTab:'インスタンスを閉じる', navNextTab:'タブ切り替え →', navPrevTab:'タブ切り替え ←',
    save:'保存', navRemapHint:'キーをクリックして再マッピングします。',
    escFixed:'Escape — パネルを閉じる / ゾーンエディタを終了（固定）',
    deviceReady:'✓ 準備完了', deviceConnected:'台接続中', deviceConnectedOne:'台接続中',
    activityActive:'件のレコードがアクティブ', activityActiveOne:'アクティブ',
    licenseSubtitle:'続行するにはライセンスキーを入力してください。',
    activate:'アクティベート', activating:'アクティベート中…', licenseError:'ライセンスキーが無効または使用済みです。', licenseAdminHint:'ライセンスキーが必要な場合は管理者にお問い合わせください。',
    settingUp:'デバイスを設定中…', errorScanning:'デバイスのスキャンエラー',
    noDevicesConnect:'デバイスなし — USBで接続してください', language:'言語',
    setupGuide:'セットアップガイド', usageGuide:'使用ガイド',
    stepOf:'{n}/{total} ステップ', previous:'前へ', next:'次へ', finish:'完了', closeBtn:'閉じる',
    howToUse:'TabPilotの使い方', troubleshooting:'トラブルシューティング', backToGuide:'← ガイドに戻る',
    troubleItems:'<strong>データケーブル</strong>（充電専用ではなく）を使用してください。|PCに直接別のUSBポートを試してください。|Xiaomiの場合：<strong>USBデバッグ（セキュリティ設定）</strong>を有効にしてください。|デバイスを<strong>ロック解除</strong>した状態で再接続してください。|USBデバッグの認証を取り消して再認証してください。|ADBを再起動：<code>adb kill-server</code>を実行して再接続。',
    bugTitle:'TabPilotコミュニティに参加',
    bugBody:'バグ報告、フィードバック、またはユーザーとの交流のために、Discordサーバーに参加してください。',
    joinDiscord:'Discordに参加',
    upToDate:'最新', aboutDesc:'Androidマルチインスタンスミラーリング',
    createdBy:'作成者', builtWith:'使用技術', allRights:'全著作権所有',
    h_s1_title:'スマートフォンを接続', h_s1_goal:'AndroidデバイスをPCに接続します。',
    h_s1_s1:'USB <strong>データ</strong>ケーブルを使用してください（充電専用ではなく）。',
    h_s1_s2:'Androidが促したら、<strong>ファイル転送（MTP）</strong>モードを選択。',
    h_s1_s3:'PCに直接接続 — USBハブは避けてください。',
    h_s1_tip:'デバイスが充電のみでき検出されない場合、ケーブルが充電専用の可能性があります。',
    h_s2_title:'開発者オプションを有効化', h_s2_goal:'Androidの開発者メニューを解放します。',
    h_s2_s1:'<strong>設定 → 端末情報</strong>を開く。', h_s2_s2:'<strong>ビルド番号</strong>を見つける。',
    h_s2_s3:'<strong>7回</strong>タップして「開発者になりました」と表示されるまで続ける。',
    h_s3_title:'USBデバッグを有効化', h_s3_goal:'デバイスとのADB通信を許可します。',
    h_s3_s1:'<strong>設定 → システム → 開発者オプション</strong>を開く。', h_s3_s2:'<strong>USBデバッグ</strong>を有効化。',
    h_s3_tip:'一部のブランド（Xiaomi、Realme、Oppo…）では追加のUSBオプションの有効化が必要な場合があります。',
    h_s4_title:'接続を認証', h_s4_goal:'スマートフォンからコンピューターを承認します。',
    h_s4_s1:'ダイアログが表示されます：<strong>「USBデバッグを許可しますか？」</strong>',
    h_s4_s2:'<strong>「このコンピューターからは常に許可する」</strong>にチェック。', h_s4_s3:'<strong>許可</strong>をタップ。',
    h_s4_tip:'ダイアログが表示されない場合は、デバイスをロック解除した状態で再接続してください。',
    h_s5_title:'デバイス準備完了！', h_s5_goal:'スマートフォンが正しく検出されたことを確認します。',
    h_s5_s1:'デバイスがパネルに表示されます。', h_s5_s2:'<strong>"+"</strong>をクリックしてアプリを起動。',
    h_s5_s3:'各インスタンスは独自の仮想ディスプレイで実行されます。',
    u1_title:'インスタンスの起動', u1_body:'<strong>+</strong>をクリックして起動ダイアログを開きます。デバイスとアプリを選択してください。',
    u2_title:'セキュアフォルダ', u2_body:'Samsung端末でセキュアフォルダが利用可能な場合、まずデバイスで解除してから<strong>続行</strong>を押してください。',
    u3_title:'タッチとジェスチャー', u3_body:'<strong>クリック</strong>—タップ。<strong>長押し</strong>—ロングプレス。<strong>ドラッグ</strong>—スワイプ。<strong>Ctrl+ドラッグ</strong>—ピンチズーム。',
    u4_title:'キーボードと入力', u4_body:'ミラーをクリックしてフォーカスし、通常通り入力します。<strong>⌨ 書き込み</strong>ボタンで入力モードに切り替えられます。',
    u5_title:'ショートカット（ゾーン）', u5_body:'<strong>ショートカット → アクション</strong>を開き、<strong>ゾーンを追加</strong>をクリック。ミラー上でクリックしてゾーンを配置し、キーを押して割り当てます。',
    u6_title:'録画', u6_body:'<strong>録画</strong>を開き<strong>● 録画</strong>をクリック。タップを実行し、停止して保存します。',
    u7_title:'設定', u7_body:'<strong>プリセット</strong> — ウルトラ、高、中、低。<strong>カスタム</strong> — 解像度、FPS、ビットレート、DPIを設定。',
    u8_title:'ナビゲーションショートカット', u8_body:'<strong>ショートカット → ナビゲーション</strong>でキーを再マッピングできます。',
    u9_title:'タブとニックネーム', u9_body:'タブを<strong>ダブルクリック</strong>または<strong>右クリック</strong>して名前を変更できます。',
  },
  de: { ...BASE,
    newInstance:'Neue Instanz', shortcuts:'Tastenkürzel', record:'Aufnahme',
    settings:'Einstellungen', help:'Hilfe', reportBug:'Fehler melden', about:'Über',
    devices:'Geräte', manageDevices:'Geräte verwalten', viewDevices:'📱 Geräte anzeigen',
    connected:'Verbunden', offline:'Offline', noDevices:'Keine Geräte verbunden',
    launchTitle:'Instanz starten', device:'GERÄT', application:'ANWENDUNG',
    searchApp:'Nach Name oder Paket suchen…', cancel:'Abbrechen', launch:'Starten',
    preset:'VOREINSTELLUNG', options:'OPTIONEN', audio:'Audio', turnOffScreen:'Bildschirm aus',
    ultra:'Ultra', high:'Hoch', medium:'Mittel', low:'Niedrig', custom:'Benutzerdefiniert',
    customizeWhenLaunching:'Beim Start konfigurieren',
    resolution:'Auflösung', fps:'Max FPS', bitrate:'Bitrate', iframe:'I-Frame-Intervall',
    performance:'Leistung', advanced:'Erweitert',
    turnOffScreenFull:'Bildschirm beim Spiegeln ausschalten', enableAudio:'Audio aktivieren',
    actions:'Aktionen', navigation:'Navigation',
    addZones:'+ Zonen hinzufügen', addMoreZones:'✏ Weitere Zonen', noZonesYet:'Keine Zonen konfiguriert.',
    thisInstanceOnly:'(nur diese Instanz)', copyShortcuts:'📋 Kürzel auf andere Instanz kopieren',
    copyTitle:'Tastenkürzel kopieren', selectTarget:'Zielinstanz(en) auswählen:',
    continueBtn:'Weiter →', areYouSure:'Sind Sie sicher?',
    copyWarning:'Die Shortcut-Konfiguration wird auf die ausgewählten Instanzen kopiert.\nBei anderem Preset können einige Shortcuts nicht übereinstimmen.\nDie aktuelle Konfiguration wird überschrieben.',
    confirm:'Bestätigen', noRecords:'Keine Aufnahmen. Drücke Aufnahme.',
    recordBtn:'● Aufnahme', taps:'Tipps',
    recSettings:'Aufnahmeeinstellungen', repeatAction:'Wiederholen', times:'mal',
    forDuration:'Für', infinitely:'Endlos bis zum Stopp',
    intervalBetween:'Intervall zwischen Ausführungen', playbackSpeed:'Wiedergabegeschwindigkeit',
    thisInstance:'Diese Instanz', allInstances:'Alle Instanzen', navNewInstance:'Neue Instanz', navCloseTab:'Instanz schließen', navNextTab:'Tab wechseln →', navPrevTab:'Tab wechseln ←',
    save:'Speichern', navRemapHint:'Klicken Sie auf eine Taste zum Neuzuweisen.',
    escFixed:'Escape — Panel schließen / Zonen-Editor beenden (fest)',
    deviceReady:'✓ Bereit', deviceConnected:'Geräte verbunden', deviceConnectedOne:'Gerät verbunden',
    activityActive:'Aufnahmen aktiv', activityActiveOne:'aktiv',
    licenseSubtitle:'Geben Sie Ihren Lizenzschlüssel ein.',
    activate:'Aktivieren', activating:'Aktivierung…', licenseError:'Ungültiger oder bereits verwendeter Lizenzschlüssel.', licenseAdminHint:'Wenden Sie sich an Ihren Administrator, wenn Sie einen Lizenzschlüssel benötigen.',
    settingUp:'Geräte werden eingerichtet…', errorScanning:'Fehler beim Scannen',
    noDevicesConnect:'Keine Geräte — per USB verbinden', language:'Sprache',
    setupGuide:'Einrichtungsanleitung', usageGuide:'Benutzerhandbuch',
    stepOf:'Schritt {n} von {total}', previous:'Zurück', next:'Weiter', finish:'Fertig', closeBtn:'Schließen',
    howToUse:'So verwenden Sie TabPilot', troubleshooting:'Fehlerbehebung', backToGuide:'← Zurück zum Handbuch',
    troubleItems:'Verwenden Sie ein USB-<strong>Datenkabel</strong>, kein Ladekabel.|Versuchen Sie einen anderen USB-Anschluss direkt am PC.|Bei Xiaomi: <strong>USB-Debugging (Sicherheitseinstellungen)</strong> aktivieren.|Gerät trennen und wieder verbinden, während es entsperrt ist.|USB-Debugging-Autorisierungen widerrufen und neu autorisieren.|ADB neu starten: <code>adb kill-server</code> ausführen und neu verbinden.',
    bugTitle:'Treten Sie der TabPilot-Community bei',
    bugBody:'Um Fehler zu melden, Feedback zu geben oder sich mit anderen Benutzern zu verbinden, treten Sie unserem Discord-Server bei.',
    joinDiscord:'Discord beitreten',
    upToDate:'Aktuell', aboutDesc:'Android-Multi-Instanz-Spiegelung',
    createdBy:'Erstellt von', builtWith:'Entwickelt mit', allRights:'Alle Rechte vorbehalten',
    h_s1_title:'Telefon verbinden', h_s1_goal:'Verbinden Sie Ihr Android-Gerät mit dem PC.',
    h_s1_s1:'Verwenden Sie ein USB-<strong>Datenkabel</strong> — kein Ladekabel.',
    h_s1_s2:'Wenn Android fragt, wählen Sie <strong>Dateiübertragung (MTP)</strong>.',
    h_s1_s3:'Direkt an den PC anschließen — USB-Hubs vermeiden.',
    h_s1_tip:'Wenn das Gerät nur lädt und nicht erkannt wird, ist das Kabel wahrscheinlich nur ein Ladekabel.',
    h_s2_title:'Entwickleroptionen aktivieren', h_s2_goal:'Entwicklermenü auf Android freischalten.',
    h_s2_s1:'<strong>Einstellungen → Über das Telefon</strong> öffnen.', h_s2_s2:'<strong>Build-Nummer</strong> finden.',
    h_s2_s3:'<strong>7 Mal</strong> tippen, bis „Sie sind jetzt Entwickler" erscheint.',
    h_s3_title:'USB-Debugging aktivieren', h_s3_goal:'ADB-Kommunikation mit dem Gerät erlauben.',
    h_s3_s1:'<strong>Einstellungen → System → Entwickleroptionen</strong> öffnen.', h_s3_s2:'<strong>USB-Debugging</strong> aktivieren.',
    h_s3_tip:'Bei einigen Marken (Xiaomi, Realme, Oppo…) müssen möglicherweise zusätzliche USB-Optionen aktiviert werden.',
    h_s4_title:'Verbindung autorisieren', h_s4_goal:'Den Computer vom Telefon aus genehmigen.',
    h_s4_s1:'Ein Dialog erscheint: <strong>„USB-Debugging erlauben?"</strong>',
    h_s4_s2:'<strong>„Von diesem Computer immer erlauben"</strong> ankreuzen.', h_s4_s3:'<strong>Erlauben</strong> tippen.',
    h_s4_tip:'Wenn der Dialog nicht erscheint, Gerät trennen und entsperrt wieder verbinden.',
    h_s5_title:'Gerät bereit!', h_s5_goal:'Bestätigen Sie, dass das Telefon erkannt wurde.',
    h_s5_s1:'Ihr Gerät erscheint im Panel.', h_s5_s2:'Klicken Sie auf <strong>"+"</strong> um eine App zu starten.',
    h_s5_s3:'Jede Instanz läuft in einem eigenen virtuellen Display.',
    u1_title:'Instanz starten', u1_body:'Klicken Sie auf <strong>+</strong> um den Dialog zu öffnen.',
    u2_title:'Sicherer Ordner', u2_body:'Entsperren Sie den Sicheren Ordner zuerst auf dem Gerät, dann klicken Sie <strong>Weiter</strong>.',
    u3_title:'Touch & Gesten', u3_body:'<strong>Klick</strong>—Tippen. <strong>Halten</strong>—Langes Drücken. <strong>Ziehen</strong>—Wischen. <strong>Ctrl+Ziehen</strong>—Zoom.',
    u4_title:'Tastatur & Eingabe', u4_body:'Klicken Sie auf den Spiegel und tippen Sie. Nutzen Sie <strong>⌨ Schreiben</strong> für den Eingabemodus.',
    u5_title:'Tastenkürzel (Zonen)', u5_body:'Öffnen Sie <strong>Tastenkürzel → Aktionen</strong> und klicken Sie auf <strong>Zonen hinzufügen</strong>.',
    u6_title:'Aufnahme', u6_body:'Öffnen Sie <strong>Aufnahme</strong> und klicken Sie auf <strong>● Aufnahme</strong>. Führen Sie Tipps aus und stoppen Sie zum Speichern.',
    u7_title:'Einstellungen', u7_body:'<strong>Voreinstellungen</strong> — Ultra, Hoch, Mittel, Niedrig. <strong>Benutzerdefiniert</strong> — Auflösung, FPS, Bitrate, DPI.',
    u8_title:'Navigationskürzel', u8_body:'Öffnen Sie <strong>Tastenkürzel → Navigation</strong> um Tasten neu zuzuweisen.',
    u9_title:'Tabs & Spitznamen', u9_body:'<strong>Doppelklick</strong> oder <strong>Rechtsklick</strong> auf einen Tab zum Umbenennen.',
  },
  fr: { ...BASE,
    newInstance:'Nouvelle instance', shortcuts:'Raccourcis', record:'Enregistrer',
    settings:'Paramètres', help:'Aide', reportBug:'Signaler un bug', about:'À propos',
    devices:'Appareils', manageDevices:'Gérer les appareils', viewDevices:'📱 Voir les appareils',
    connected:'Connectés', offline:'Hors ligne', noDevices:'Aucun appareil connecté',
    launchTitle:'Lancer une instance', device:'APPAREIL', application:'APPLICATION',
    searchApp:'Rechercher par nom ou paquet…', cancel:'Annuler', launch:'Lancer',
    preset:'PRÉRÉGLAGE', options:'OPTIONS', audio:'Audio', turnOffScreen:"Éteindre l'écran",
    ultra:'Ultra', high:'Élevé', medium:'Moyen', low:'Bas', custom:'Personnalisé',
    customizeWhenLaunching:'Configurer au lancement',
    resolution:'Résolution', fps:'FPS max', bitrate:'Débit', iframe:'Intervalle i-frame',
    performance:'Performance', advanced:'Avancé',
    turnOffScreenFull:"Éteindre l'écran pendant le mirroring", enableAudio:"Activer l'audio",
    actions:'Actions', navigation:'Navigation',
    addZones:'+ Ajouter des zones', addMoreZones:'✏ Plus de zones', noZonesYet:'Aucune zone configurée.',
    thisInstanceOnly:'(cette instance uniquement)', copyShortcuts:'📋 Copier vers une autre instance',
    copyTitle:'Copier les raccourcis', selectTarget:"Sélectionner l'instance cible :",
    continueBtn:'Continuer →', areYouSure:'Êtes-vous sûr ?',
    copyWarning:"La configuration sera copiée vers les instances sélectionnées.\nSi initialisées avec un préréglage différent, certains raccourcis peuvent ne pas correspondre.\nCette opération écrasera la configuration actuelle.",
    confirm:'Confirmer', noRecords:"Pas d'enregistrements. Appuyez sur Enregistrer.",
    recordBtn:'● Enregistrer', taps:'appuis',
    recSettings:"Paramètres d'enregistrement", repeatAction:'Répéter', times:'fois',
    forDuration:'Pendant', infinitely:"Indéfiniment jusqu'à l'arrêt",
    intervalBetween:'Intervalle entre les exécutions', playbackSpeed:'Vitesse de lecture',
    thisInstance:'Cette instance', allInstances:'Toutes les instances', navNewInstance:'Nouvelle instance', navCloseTab:"Fermer l'instance", navNextTab:'Changer onglet →', navPrevTab:'Changer onglet ←',
    save:'Enregistrer', navRemapHint:'Cliquez sur une touche pour la réassigner.',
    escFixed:"Escape — Fermer le panneau / Quitter l'éditeur de zones (fixe)",
    deviceReady:'✓ Prêt', deviceConnected:'appareils connectés', deviceConnectedOne:'appareil connecté',
    activityActive:'enregistrements actifs', activityActiveOne:'actif',
    licenseSubtitle:'Entrez votre clé de licence pour continuer.',
    activate:'Activer', activating:'Activation…', licenseError:'Clé de licence invalide ou déjà utilisée.', licenseAdminHint:"Contactez votre administrateur si vous avez besoin d'une clé de licence.",
    settingUp:'Configuration des appareils…', errorScanning:'Erreur de scan des appareils',
    noDevicesConnect:'Aucun appareil — connectez via USB', language:'Langue',
    setupGuide:'Guide de configuration', usageGuide:"Guide d'utilisation",
    stepOf:'Étape {n} sur {total}', previous:'Précédent', next:'Suivant', finish:'Terminer', closeBtn:'Fermer',
    howToUse:'Comment utiliser TabPilot', troubleshooting:'Dépannage', backToGuide:'← Retour au guide',
    troubleItems:"Utilisez un câble USB <strong>de données</strong>, pas seulement de charge.|Essayez un autre port USB directement sur le PC.|Sur Xiaomi : activez <strong>Débogage USB (Paramètres de sécurité)</strong>.|Déconnectez et reconnectez l'appareil déverrouillé.|Révoquez les autorisations de débogage USB et réautorisez.|Redémarrez ADB : exécutez <code>adb kill-server</code> puis reconnectez.",
    bugTitle:'Rejoignez la communauté TabPilot',
    bugBody:"Pour signaler un bug, donner un retour ou vous connecter avec d'autres utilisateurs, rejoignez notre serveur Discord.",
    joinDiscord:'Rejoindre Discord',
    upToDate:'À jour', aboutDesc:'Mirroring multi-instance Android',
    createdBy:'Créé par', builtWith:'Développé avec', allRights:'Tous droits réservés',
    h_s1_title:'Connectez votre téléphone', h_s1_goal:'Connectez votre appareil Android au PC.',
    h_s1_s1:"Utilisez un câble USB <strong>de données</strong> — pas seulement de charge.",
    h_s1_s2:"Quand Android vous y invite, sélectionnez <strong>Transfert de fichiers (MTP)</strong>.",
    h_s1_s3:'Connectez directement au PC — évitez les hubs USB.',
    h_s1_tip:"Si l'appareil ne charge que et n'est pas détecté, le câble est probablement de charge uniquement.",
    h_s2_title:'Activer les Options développeur', h_s2_goal:'Déverrouillez le menu développeur sur Android.',
    h_s2_s1:'Ouvrez <strong>Paramètres → À propos du téléphone</strong>.', h_s2_s2:'Trouvez <strong>Numéro de build</strong>.',
    h_s2_s3:'Appuyez dessus <strong>7 fois</strong> jusqu\'à voir "Vous êtes maintenant développeur".',
    h_s3_title:'Activer le Débogage USB', h_s3_goal:'Autorisez la communication ADB avec l\'appareil.',
    h_s3_s1:'Ouvrez <strong>Paramètres → Système → Options développeur</strong>.', h_s3_s2:'Activez <strong>Débogage USB</strong>.',
    h_s3_tip:'Sur certaines marques (Xiaomi, Realme, Oppo…) vous devrez peut-être activer des options USB supplémentaires.',
    h_s4_title:'Autoriser la connexion', h_s4_goal:"Approuvez l'ordinateur depuis votre téléphone.",
    h_s4_s1:'Un dialogue apparaîtra : <strong>« Autoriser le débogage USB ? »</strong>',
    h_s4_s2:'Cochez <strong>« Toujours autoriser depuis cet ordinateur »</strong>.', h_s4_s3:'Appuyez sur <strong>Autoriser</strong>.',
    h_s4_tip:"Si le dialogue n'apparaît pas, déconnectez et reconnectez l'appareil déverrouillé.",
    h_s5_title:'Appareil prêt !', h_s5_goal:"Confirmez que le téléphone a été détecté.",
    h_s5_s1:"Votre appareil apparaît dans le panneau.", h_s5_s2:'Cliquez sur <strong>"+"</strong> pour lancer une app.',
    h_s5_s3:'Chaque instance fonctionne dans son propre affichage virtuel.',
    u1_title:'Lancer une instance', u1_body:'Cliquez sur <strong>+</strong> pour ouvrir le dialogue.',
    u2_title:'Dossier Sécurisé', u2_body:"Déverrouillez d'abord le Dossier Sécurisé sur l'appareil, puis appuyez sur <strong>Continuer</strong>.",
    u3_title:'Toucher & gestes', u3_body:'<strong>Clic</strong>—appui. <strong>Maintenir</strong>—appui long. <strong>Glisser</strong>—balayer. <strong>Ctrl+glisser</strong>—zoom.',
    u4_title:'Clavier & saisie', u4_body:'Cliquez sur le miroir et tapez normalement. Utilisez le bouton <strong>⌨ Écrire</strong> pour le mode de saisie.',
    u5_title:'Raccourcis (zones)', u5_body:'Ouvrez <strong>Raccourcis → Actions</strong> et cliquez sur <strong>Ajouter des zones</strong>.',
    u6_title:'Enregistrement', u6_body:"Ouvrez <strong>Enregistrer</strong> et cliquez sur <strong>● Enregistrer</strong>. Effectuez des appuis et arrêtez pour sauvegarder.",
    u7_title:'Paramètres', u7_body:'<strong>Préréglages</strong> — Ultra, Élevé, Moyen, Bas. <strong>Personnalisé</strong> — résolution, FPS, débit, DPI.',
    u8_title:'Raccourcis de navigation', u8_body:'Ouvrez <strong>Raccourcis → Navigation</strong> pour réassigner les touches.',
    u9_title:'Onglets & surnoms', u9_body:'<strong>Double-cliquez</strong> ou <strong>faites un clic droit</strong> sur un onglet pour le renommer.',
  },
};
let _lang = localStorage.getItem('tabpilot:lang') || 'en';
function t(key) { return (TRANSLATIONS[_lang]?.[key] ?? TRANSLATIONS.en[key]) || key; }
function setLang(lang) {
  if (!TRANSLATIONS[lang]) return;
  _lang = lang;
  localStorage.setItem('tabpilot:lang', lang);
  // If license screen is showing, re-render it
  if (document.getElementById('license-screen')) {
    showLicenseScreen();
    return;
  }
  applyLang();
}
function applyLang() {
  // Nav buttons text nodes
  const navMap = {
    'nav-shortcuts': 'shortcuts', 'nav-macro': 'record', 'nav-settings': 'settings',
    'nav-help': 'help', 'nav-bug': 'reportBug', 'nav-account': 'about',
  };
  Object.entries(navMap).forEach(([id, key]) => {
    const el = $(id); if (!el) return;
    const nodes = [...el.childNodes];
    const textNode = nodes.find(n => n.nodeType === 3 && n.textContent.trim());
    if (textNode) textNode.textContent = ' ' + t(key);
  });
  $('btn-new') && ($('btn-new').title = t('newInstance'));
  const btnEmpty = $('btn-new-empty'); if (btnEmpty) btnEmpty.textContent = '+ ' + t('newInstance');
  // Re-render whatever is open
  if (state?.panel === 'settings')   buildSettings();
  if (state?.panel === 'shortcuts')  renderScTab(document.querySelector('.sc-tab.on')?.dataset?.tab || 'actions');
  if (state?.panel === 'macro')      buildRecordPanel();
  if (state?.panel === 'devices')    buildDevices();
  if (!backdropEl?.classList.contains('hidden')) {
    renderModalDevices();
    renderModalApps($('modal-search')?.value || '');
    buildModalPresetPanel();
  }
  updateDeviceStatus();
  updateRecordStatus();
  // Update status pills immediately
  updateDeviceStatus?.();
  updateRecordStatus?.();
  // Rebuild all lang pickers to show translated names
  document.querySelectorAll('.lang-picker-root').forEach(wrap => {
    wrap.replaceWith(buildLangPicker());
  });
}

function flagImg(code, size = 20) {
  return `<img src="flags/${LANGS[code].flag}.png" width="${size}" height="${size}" style="border-radius:3px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">`;
}

function buildLangPicker(cls = 'lang-picker') {
  const wrap = document.createElement('div');
  wrap.className = 'lang-picker-root';
  wrap.style.cssText = 'position:relative;-webkit-app-region:no-drag';

  const btn = document.createElement('button');
  btn.className = 'lang-picker-btn';
  btn.style.cssText = 'background:var(--elev);border:1px solid var(--bd2);border-radius:6px;color:var(--t1);padding:3px 8px;cursor:pointer;display:flex;align-items:center;gap:6px;-webkit-app-region:no-drag;height:26px';
  btn.innerHTML = `${flagImg(_lang, 18)} <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" style="opacity:.6"><path d="M0 0l4 5 4-5z"/></svg>`;

  const menu = document.createElement('div');
  menu.style.cssText = 'position:absolute;top:calc(100% + 4px);right:0;background:var(--surf);border:1px solid var(--bd2);border-radius:8px;padding:4px;z-index:9999;display:none;flex-direction:column;gap:2px;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.5)';

  Object.entries(LANGS).forEach(([code, info]) => {
    const item = document.createElement('button');
    item.style.cssText = `display:flex;align-items:center;gap:8px;padding:6px 10px;border:none;border-radius:6px;background:${code===_lang?'var(--act)':'none'};color:var(--t1);font-size:14px;cursor:pointer;text-align:left;width:100%;-webkit-app-region:no-drag`;
    item.innerHTML = `${flagImg(code, 18)} ${LANG_NAMES[_lang]?.[code] || info.native}`;
    item.onclick = (e) => {
      e.stopPropagation();
      setLang(code);
      menu.style.display = 'none';
      // Update all picker buttons
      document.querySelectorAll('.lang-picker-btn').forEach(b => {
        b.innerHTML = `${flagImg(code, 18)} <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" style="opacity:.6"><path d="M0 0l4 5 4-5z"/></svg>`;
      });
      menu.querySelectorAll('button').forEach(b2 => b2.style.background = 'none');
      item.style.background = 'var(--act)';
    };
    menu.appendChild(item);
  });

  btn.onclick = (e) => {
    e.stopPropagation();
    const isOpen = menu.style.display === 'flex';
    // Close all other pickers first
    document.querySelectorAll('.lang-menu').forEach(m => m.style.display = 'none');
    menu.style.display = isOpen ? 'none' : 'flex';
  };
  menu.className = 'lang-menu';
  document.addEventListener('click', () => { menu.style.display = 'none'; });

  wrap.appendChild(btn);
  wrap.appendChild(menu);
  return wrap;
}

const PRESETS = {
  ultra:  { resolution:'2560x1440', maxFps:60, bitrate:16, iFrameInterval:1,  dpi:320 },
  high:   { resolution:'1920x1080', maxFps:60, bitrate:8,  iFrameInterval:3,  dpi:240 },
  medium: { resolution:'1280x720',  maxFps:45, bitrate:4,  iFrameInterval:5,  dpi:160 },
  low:    { resolution:'960x540',   maxFps:30, bitrate:2,  iFrameInterval:10, dpi:120 },
  eco:    { resolution:'854x480',   maxFps:15, bitrate:1,  iFrameInterval:10, dpi:120 },
};
function defaultSettings() {
  return { preset:'high', performance:{ ...PRESETS.high, iFrameInterval:3, dpi:240 },
    audio:{ enabled:true, codec:'opus', source:'device', volume:80 },
    device:{ turnScreenOff:true },
    autoReconnect: true,
    showFps: false,
    notifications: true,
  };
}
function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('td-settings') || 'null');
    if (!saved) return defaultSettings();
    const def = defaultSettings();
    // Merge to ensure new fields exist
    const preset = saved.preset || def.preset;
    const presetDefaults = PRESETS[preset] || PRESETS.high;
    return {
      preset,
      performance: { ...def.performance, ...presetDefaults, ...saved.performance },
      audio:  { ...def.audio,  ...saved.audio  },
      device: { ...def.device, ...saved.device },
      autoReconnect: saved.autoReconnect ?? def.autoReconnect,
      showFps:       saved.showFps       ?? def.showFps,
      notifications: saved.notifications ?? def.notifications,
    };
  } catch { return defaultSettings(); }
}
function saveSettings() { localStorage.setItem('td-settings', JSON.stringify(state.settings)); }


// ── License gate ───────────────────────────────────────────────────────────
function showLicenseScreen(errorMsg) {
  const existing = document.getElementById('license-screen');
  if (existing) existing.remove();

  const screen = document.createElement('div');
  screen.id = 'license-screen';
  screen.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;-webkit-app-region:drag';

  screen.innerHTML = `
    <div style="-webkit-app-region:no-drag;display:flex;flex-direction:column;align-items:center;gap:22px;width:380px;position:relative">
      <div style="position:absolute;top:-48px;right:0" id="lic-lang-wrap"></div>

      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:4px">
        <div style="font-size:30px;font-weight:800;letter-spacing:-.8px;background:linear-gradient(135deg,#fff 0%,#a78bfa 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent">TabPilot</div>
        <div style="font-size:14px;color:var(--t3)">${t('licenseSubtitle')}</div>
      </div>

      <div style="width:100%;display:flex;flex-direction:column;gap:10px">
        <input id="lic-input" type="text" placeholder="TABP-XXXX-XXXX-XXXX" maxlength="19"
          autocomplete="off" spellcheck="false"
          style="width:100%;box-sizing:border-box;
            background:rgba(255,255,255,.04);
            border:1px solid rgba(108,99,255,.25);
            border-radius:12px;color:var(--t1);font-size:15px;
            padding:14px 18px;text-align:center;letter-spacing:3px;
            outline:none;font-family:monospace;transition:all .2s"
          onfocus="this.style.borderColor='rgba(108,99,255,.6)';this.style.boxShadow='0 0 0 3px rgba(108,99,255,.15)'"
          onblur="this.style.borderColor='rgba(108,99,255,.25)';this.style.boxShadow='none'">

        <button id="lic-btn"
          style="width:100%;background:linear-gradient(135deg,#6c63ff,#a78bfa);
            color:#fff;border:none;border-radius:12px;
            padding:13px;font-size:15px;font-weight:700;cursor:pointer;
            transition:all .2s;box-shadow:0 4px 16px rgba(108,99,255,.35)"
          onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 8px 24px rgba(108,99,255,.5)'"
          onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 16px rgba(108,99,255,.35)'">
          ${t('activate')}
        </button>
      </div>

      <div id="lic-msg" style="font-size:13px;color:#f87171;min-height:18px;text-align:center">${errorMsg || ''}</div>
      <div style="font-size:12px;color:var(--t3);text-align:center">${t('licenseAdminHint')}</div>
    </div>`;

  document.body.appendChild(screen);

  // Lang picker — re-renders entire screen on change
  const licLangWrap = document.getElementById('lic-lang-wrap');
  if (licLangWrap) {
    const picker = buildLangPicker();
    // Override setLang to re-render screen
    picker.querySelectorAll && picker.addEventListener('click', () => {
      setTimeout(() => { showLicenseScreen(errorMsg); }, 50);
    });
    licLangWrap.appendChild(picker);
  }

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
    btn.textContent = t('activating');
    msg.textContent = '';
    msg.style.color = '#888';
    const result = await window.td.activateLicense(key);
    if (result.success) {
      msg.style.color = '#4caf50';
      msg.textContent = t('licenseActivated') || 'License activated!';
      setTimeout(() => { screen.remove(); initApp(); }, 800);
    } else {
      btn.disabled = false;
      btn.textContent = t('activate');
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
  // Apply saved language after shell elements exist
  setTimeout(() => {
    const langWrap = $('lang-picker-wrap');
    if (langWrap && !langWrap.hasChildNodes()) langWrap.appendChild(buildLangPicker());
    applyLang();
  }, 0);
}

// ── License check on load ──────────────────────────────────────────────────
window.td.onLicenseValid(() => initApp());
window.td.onLicenseRequired(msg => showLicenseScreen(msg));
// Show a subtle loading screen while main process validates
{
  const loading = document.createElement('div');
  loading.id = 'license-loading';
  loading.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:9998;flex-direction:column;gap:20px;-webkit-app-region:drag';
  loading.innerHTML = `
    <div style="font-size:22px;font-weight:800;letter-spacing:-.5px;background:linear-gradient(135deg,#a78bfa,#6c63ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent">TabPilot</div>
    <div style="position:relative;width:36px;height:36px">
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(108,99,255,.12)"></div>
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid transparent;border-top-color:#6c63ff;border-right-color:rgba(167,139,250,.4);animation:rot .9s linear infinite"></div>
    </div>
    <style>@keyframes rot{to{transform:rotate(360deg)}}</style>`;
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
  const hasTab = !!state.activeTab;
  btn.style.display = hasTab ? 'flex' : 'none';
  if (hasTab) {
    btn.style.background = writing ? 'var(--acc)' : 'none';
    btn.style.color = writing ? '#fff' : 'var(--t2)';
    btn.textContent = writing ? '⌨ Write' : '⌨ Zones';
    btn.title = writing
      ? 'Writing mode — all keys to device, zones disabled. Click or press F1 to toggle.'
      : 'Zone mode — zone keys trigger taps. Click or press F1 to type freely.';
  }
}

function updateDeviceStatus() {
  const el = $('device-status-pill');
  if (!el) return;
  const online = state.devices.filter(d=>d.state==='device');
  if (state.tabs.length > 0 && online.length > 0) {
    el.classList.remove('hidden');
    el.textContent = `📱 ${online.length} ${online.length>1?t('deviceConnected'):t('deviceConnectedOne')}`;
  } else {
    el.classList.add('hidden');
  }
}

function updateMacroStatus() { updateRecordStatus(); }

function focusActiveCanvas() {
  if (!state.activeTab) return;
  // Don't steal focus if user is typing in an input or dialog
  const ae = document.activeElement;
  if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.closest('.key-capture-dialog'))) return;
  const canvas = $('canvas-' + state.activeTab);
  if (canvas && canvas.style.display !== 'none') {
    canvas.focus({ preventScroll: true });
    setTypingMode(true);
  }
}

// ── Zone system ────────────────────────────────────────────────────────────
const TAB_ZONES = new Map(); // tabId → zones (per instance)
const APPS_CACHE   = new Map(); // deviceId → { apps, users }
const NICK_CACHE   = new Map(); // "pkg:userId:deviceId" → nickname

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
// ── Zone template matching ─────────────────────────────────────────────────
const THUMB_SIZE = 60;

function captureZoneThumb(tabId, rx, ry) {
  const canvas = $('canvas-' + tabId);
  if (!canvas) return null;
  try {
    const ctx = canvas.getContext('2d');

    // Calculate ghost size in canvas pixels
    // Ghost is ZONE_PX (24px) on screen, canvas is scaled via object-fit:contain
    const rect = canvas.getBoundingClientRect();
    const canvasAspect = canvas.width / canvas.height;
    const rectAspect   = rect.width / rect.height;
    let drawW, drawH;
    if (canvasAspect > rectAspect) {
      drawW = rect.width; drawH = rect.width / canvasAspect;
    } else {
      drawH = rect.height; drawW = rect.height * canvasAspect;
    }
    // How many canvas pixels does the ghost (ZONE_PX screen pixels) cover?
    const scaleX = canvas.width  / drawW;
    const scaleY = canvas.height / drawH;
    const capW = Math.round(ZONE_PX * scaleX);
    const capH = Math.round(ZONE_PX * scaleY);

    const cx = Math.round(rx * canvas.width);
    const cy = Math.round(ry * canvas.height);
    const sx = Math.max(0, cx - Math.round(capW/2));
    const sy = Math.max(0, cy - Math.round(capH/2));
    const sw = Math.min(capW, canvas.width  - sx);
    const sh = Math.min(capH, canvas.height - sy);
    if (sw <= 0 || sh <= 0) return null;
    const data = ctx.getImageData(sx, sy, sw, sh);
    return {
      data: Array.from(data.data),
      width: sw, height: sh,
      srcW: canvas.width, srcH: canvas.height,
    };
  } catch(e) { return null; }
}

function resizeImageData(data, sw, sh, dw, dh) {
  const out = new Float32Array(dw * dh * 3);
  const scaleX = sw / dw, scaleY = sh / dh;
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      // Bilinear interpolation
      const srcX = x * scaleX, srcY = y * scaleY;
      const x0 = Math.floor(srcX), y0 = Math.floor(srcY);
      const x1 = Math.min(x0 + 1, sw - 1), y1 = Math.min(y0 + 1, sh - 1);
      const fx = srcX - x0, fy = srcY - y0;
      const i00 = (y0 * sw + x0) * 4;
      const i10 = (y0 * sw + x1) * 4;
      const i01 = (y1 * sw + x0) * 4;
      const i11 = (y1 * sw + x1) * 4;
      const di = (y * dw + x) * 3;
      for (let c = 0; c < 3; c++) {
        out[di+c] = (data[i00+c]*(1-fx)*(1-fy) + data[i10+c]*fx*(1-fy) +
                     data[i01+c]*(1-fx)*fy     + data[i11+c]*fx*fy);
      }
    }
  }
  return out;
}

function searchThumb(fullData, cw, ch, thumbData, tw, th) {
  // Search thumb in full image, return best match position and score
  let bestScore = Infinity, bestX = 0, bestY = 0;
  const step = Math.max(1, Math.round(Math.min(cw, ch) / 200)); // adaptive step
  const sp = 2; // sample every 2nd pixel

  for (let y = 0; y <= ch - th; y += step) {
    for (let x = 0; x <= cw - tw; x += step) {
      let diff = 0;
      for (let ty = 0; ty < th; ty += sp) {
        for (let tx = 0; tx < tw; tx += sp) {
          const ti = (ty * tw + tx) * 3;
          const fi = ((y + ty) * cw + (x + tx)) * 4;
          diff += Math.abs(fullData[fi]   - thumbData[ti])
                + Math.abs(fullData[fi+1] - thumbData[ti+1])
                + Math.abs(fullData[fi+2] - thumbData[ti+2]);
        }
      }
      if (diff < bestScore) { bestScore = diff; bestX = x; bestY = y; }
    }
  }
  const samples = Math.ceil(tw / sp) * Math.ceil(th / sp);
  return { score: bestScore / (samples * 3), x: bestX, y: bestY };
}

function templateMatch(tabId, thumb) {
  const canvas = $('canvas-' + tabId);
  if (!canvas || !thumb) return null;
  try {
    const ctx = canvas.getContext('2d');
    const cw = canvas.width, ch = canvas.height;
    const full = ctx.getImageData(0, 0, cw, ch);

    const scaleW = cw / (thumb.srcW || cw);
    const scaleH = ch / (thumb.srcH || ch);
    const baseScale = (scaleW + scaleH) / 2;

    // Try scales from 50% to 150% of expected
    const scales = [];
    for (let s = 0.5; s <= 1.5; s += 0.1) {
      scales.push(+(baseScale * s).toFixed(2));
    }

    let best = null;
    for (const sc of [...new Set(scales)].filter(s => s > 0.1)) {
      const tw = Math.max(4, Math.round(thumb.width  * sc));
      const th = Math.max(4, Math.round(thumb.height * sc));
      if (tw > cw || th > ch) continue;
      const scaledThumb = resizeImageData(thumb.data, thumb.width, thumb.height, tw, th);
      const result = searchThumb(full.data, cw, ch, scaledThumb, tw, th);
      if (!best || result.score < best.score) {
        best = { score: result.score, rx: (result.x + tw/2) / cw, ry: (result.y + th/2) / ch };
      }
    }

    if (!best) return null;
    // Always return best match — let caller decide if good enough
    return { rx: best.rx, ry: best.ry, confidence: Math.max(0, 1 - best.score/50) };
  } catch(e) {
    console.error('[templateMatch error]', e);
    return null;
  }
}

// Per-tab matched positions: tabId → Map<zoneIndex, {rx,ry}>
const ZONE_TAB_POS = new Map();

function getZonePos(tabId, idx, z) {
  const tabPos = ZONE_TAB_POS.get(tabId);
  if (tabPos?.has(idx)) return tabPos.get(idx);
  // Always fall back to rx/ry — never hide a zone
  return { rx: z.rx ?? 0.5, ry: z.ry ?? 0.5 };
}

function applyZoneThumbsToTab(tabId) {
  const zones = TAB_ZONES.get(tabId);
  if (!zones || zones.length === 0) return;
  const canvas = $('canvas-' + tabId);
  if (!canvas || canvas.width === 0) return;
  const posMap = ZONE_TAB_POS.get(tabId) || new Map();
  zones.forEach((z, idx) => {
    if (posMap.has(idx)) return;
    if (!z.thumb) { posMap.set(idx, { rx: z.rx ?? 0.5, ry: z.ry ?? 0.5 }); return; }
    const match = templateMatch(tabId, z.thumb);
    posMap.set(idx, match ? { rx: match.rx, ry: match.ry } : { rx: z.rx ?? 0.5, ry: z.ry ?? 0.5 });
  });
  ZONE_TAB_POS.set(tabId, posMap);
  renderZones(tabId, false);
}

function recaptureZoneThumbs(tabId) {
  const zones = TAB_ZONES.get(tabId);
  if (!zones) return;
  const canvas = $('canvas-' + tabId);
  if (!canvas || canvas.width === 0) return;
  let changed = false;
  const updated = zones.map(z => {
    if (z.thumb) return z;
    const thumb = captureZoneThumb(tabId, z.rx ?? 0.5, z.ry ?? 0.5);
    if (thumb) { changed = true; return { ...z, thumb }; }
    return z;
  });
  if (changed) { TAB_ZONES.set(tabId, updated); saveTabZones(tabId); }
}

// ── Zones (per-tab) ────────────────────────────────────────────────────────
function getZones(tabId) { return TAB_ZONES.get(tabId) || []; }

function setZones(tabId, zones) {
  TAB_ZONES.set(tabId, zones);
  saveTabZones(tabId);
  ZONE_TAB_POS.delete(tabId);
  renderZones(tabId, false);
}

function zoneKey(tabId) {
  const tab = state.tabs.find(t => t.id === tabId);
  return tab ? `${tab.pkg}:${tab.userId||0}:${tab.deviceId}` : tabId;
}

function saveTabZones(tabId) {
  try {
    const zones = TAB_ZONES.get(tabId) || [];
    const zonesNoThumb = zones.map(({ thumb, ...rest }) => rest);
    const key = zoneKey(tabId);
    localStorage.setItem('zones:inst:' + key, JSON.stringify(zonesNoThumb));
    const thumbs = zones.map(z => z.thumb || null);
    localStorage.setItem('zones:inst:thumbs:' + key, JSON.stringify(thumbs));
  } catch {}
}

function loadZones(tabId) {
  if (TAB_ZONES.has(tabId)) return;
  try {
    const key = zoneKey(tabId);
    const saved = localStorage.getItem('zones:inst:' + key);
    if (saved) {
      let zones = JSON.parse(saved);
      try {
        const thumbsRaw = localStorage.getItem('zones:inst:thumbs:' + key);
        if (thumbsRaw) {
          const thumbs = JSON.parse(thumbsRaw);
          zones = zones.map((z, i) => thumbs[i] ? { ...z, thumb: thumbs[i] } : z);
        }
      } catch {}
      zones = zones.map(z => (z.rx !== undefined && z.ry !== undefined) ? z : { key: z.key, name: z.name || '', rx: 0.5, ry: 0.5 });
      TAB_ZONES.set(tabId, zones);
    } else {
      TAB_ZONES.set(tabId, []);
    }
  } catch { TAB_ZONES.set(tabId, []); }
}

function deleteTabZones(tabId) {
  TAB_ZONES.delete(tabId);
  ZONE_TAB_POS.delete(tabId);
  // Don't delete from localStorage — user may reopen the same instance
}

function clampZone(z) {
  // Ensure zone is within canvas bounds
  return { ...z, rx: Math.max(0.01, Math.min(0.99, z.rx ?? 0.5)), ry: Math.max(0.01, Math.min(0.99, z.ry ?? 0.5)) };
}

function copyZonesToTab(fromTabId, toTabId) {
  const zones = TAB_ZONES.get(fromTabId) || [];
  const clamped = zones.map(clampZone);
  TAB_ZONES.set(toTabId, clamped);
  saveTabZones(toTabId);
  ZONE_TAB_POS.delete(toTabId);
  // Run template matching to reposition zones in target canvas
  const canvas = $('canvas-' + toTabId);
  if (canvas && canvas.width > 0) applyZoneThumbsToTab(toTabId);
  renderZones(toTabId, false);
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

  // Account for object-fit:contain letterboxing
  const canvasAspect = canvas.width / canvas.height;
  const rectAspect   = rect.width / rect.height;
  let drawW, drawH, drawX, drawY;
  if (canvasAspect > rectAspect) {
    drawW = rect.width; drawH = rect.width / canvasAspect;
    drawX = rect.left;  drawY = rect.top + (rect.height - drawH) / 2;
  } else {
    drawH = rect.height; drawW = rect.height * canvasAspect;
    drawY = rect.top;    drawX = rect.left + (rect.width - drawW) / 2;
  }
  const offsetX = drawX - mirrorRect.left;
  const offsetY = drawY - mirrorRect.top;

  const ghost = overlay.querySelector('.zone-ghost');

  const boxes = zones.map((z, i) => {
    const pos = getZonePos(tabId, i, z);
    if (!pos) return null; // no match yet — don't render
    const div = document.createElement('div');
    div.className = 'zone-box editable';
    const px = offsetX + pos.rx * drawW;
    const py = offsetY + pos.ry * drawH;
    div.style.cssText = `left:${px}px;top:${py}px;width:${ZONE_PX}px;height:${ZONE_PX}px;cursor:grab`;
    div.innerHTML = `<span class="zone-label">${z.broadcast ? '📡 ' : ''}${z.name ? z.key+' · '+z.name : z.key}</span>`;

    // ── Drag to move ──────────────────────────────────────────────
    let dragging = false, dragStartMX, dragStartMY, dragStartRX, dragStartRY;
    div.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.stopPropagation();
      dragging = false;
      dragStartMX = e.clientX; dragStartMY = e.clientY;
      dragStartRX = pos.rx; dragStartRY = pos.ry;
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
        const newRX = Math.max(0, Math.min(1, dragStartRX + dx / drawW));
        const newRY = Math.max(0, Math.min(1, dragStartRY + dy / drawH));
        div.style.left = (offsetX + newRX * drawW) + 'px';
        div.style.top  = (offsetY + newRY * drawH) + 'px';
        pos.rx = newRX; pos.ry = newRY;
      };
      const onUp = () => {
        div.style.cursor = 'grab';
        div.style.zIndex = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (dragging) {
          dragging = false;
          // Save new rx/ry and recapture thumb from new position
          z.rx = pos.rx; z.ry = pos.ry;
          z.thumb = captureZoneThumb(tabId, pos.rx, pos.ry) || z.thumb;
          setZones(tabId, zones);
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
  boxes.filter(Boolean).forEach(b => overlay.appendChild(b));

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
      zones[idx].broadcast = captured.broadcast || false;
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
  ghost.style.cssText = `width:${ZONE_PX}px;height:${ZONE_PX}px;display:none;border-radius:50%;position:absolute;pointer-events:none`;
  overlay.appendChild(ghost);

  const onMove = e => {
    const cr = canvas.getBoundingClientRect();
    const or = overlay.getBoundingClientRect();
    const canvasAspect = canvas.width / canvas.height;
    const rectAspect   = cr.width / cr.height;
    let drawW, drawH, drawX, drawY;
    if (canvasAspect > rectAspect) {
      drawW = cr.width; drawH = cr.width / canvasAspect;
      drawX = cr.left;  drawY = cr.top + (cr.height - drawH) / 2;
    } else {
      drawH = cr.height; drawW = cr.height * canvasAspect;
      drawY = cr.top;    drawX = cr.left + (cr.width - drawW) / 2;
    }
    if (e.clientX < drawX || e.clientX > drawX + drawW ||
        e.clientY < drawY || e.clientY > drawY + drawH) {
      ghost.style.display = 'none'; return;
    }
    ghost.style.display = 'block';
    ghost.style.left = (e.clientX - or.left) + 'px';
    ghost.style.top  = (e.clientY - or.top)  + 'px';
  };

  const onClick = e => {
    if (e.target.classList.contains('zone-del')) return;
    if (e.target.closest('.zone-box')) return;
    // Use letterbox-aware coordinates
    const cr = canvas.getBoundingClientRect();
    const canvasAspect = canvas.width / canvas.height;
    const rectAspect   = cr.width / cr.height;
    let drawW, drawH, drawX, drawY;
    if (canvasAspect > rectAspect) {
      drawW = cr.width; drawH = cr.width / canvasAspect;
      drawX = cr.left;  drawY = cr.top + (cr.height - drawH) / 2;
    } else {
      drawH = cr.height; drawW = cr.height * canvasAspect;
      drawY = cr.top;    drawX = cr.left + (cr.width - drawW) / 2;
    }
    const rx = Math.max(0, Math.min(1, (e.clientX - drawX) / drawW));
    const ry = Math.max(0, Math.min(1, (e.clientY - drawY) / drawH));
    const thumb = captureZoneThumb(tabId, rx, ry);
    showKeyCapture(tabId, { rx, ry, thumb });
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
    zones[idx] = { ...zones[idx], key: result.key, label: result.label || result.key, broadcast: result.broadcast || false };
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
    <label class="kcd-broadcast-row" style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--t2);cursor:pointer;margin-top:6px">
      <input type="checkbox" id="kcd-broadcast" ${existing?.broadcast?'checked':''}
        style="width:14px;height:14px;accent-color:var(--acc);cursor:pointer">
      Broadcast — tap all active instances
    </label>
    <div class="kcd-btns">
      <button class="btn-ghost kcd-cancel">Cancel</button>
      <button class="btn-accent kcd-save" ${existing?'':'disabled'}>Save</button>
    </div></div>`;
  document.body.appendChild(dlg);
  let capturedKey = existing?.key || '';
  const keyEl = dlg.querySelector('#kcd-key');
  const saveBtn = dlg.querySelector('.kcd-save');
  const labelIn = dlg.querySelector('#kcd-label');
  // NumPad digits: when NumLock is OFF, e.key reports navigation actions
  // (End, ArrowDown, PageDown, etc) instead of the digit, even though the
  // physical key is a number. e.code always identifies the physical key
  // regardless of NumLock state, so use it as a reliable fallback.
  const NUMPAD_CODE_TO_DIGIT = {
    Numpad0:'0', Numpad1:'1', Numpad2:'2', Numpad3:'3', Numpad4:'4',
    Numpad5:'5', Numpad6:'6', Numpad7:'7', Numpad8:'8', Numpad9:'9',
  };
  const onKey = e => {
    // Don't capture keys when typing in the name field
    if (document.activeElement === labelIn) return;
    e.preventDefault(); e.stopPropagation();
    if (e.key === 'Escape') { cleanup(); return; }
    if (['Control','Shift','Alt','Meta'].includes(e.key)) return;
    // ESC and Enter are reserved for the auto-detected close/open-chat
    // button taps in Dofus Touch - block them from being assigned to a
    // zone shortcut there so they can't conflict with that behavior.
    // (Escape itself is already handled above as "cancel dialog" so this
    // really only matters for Enter, but both are excluded for clarity.)
    if (_tabIsDofus(state.activeTab) && (e.key === 'Enter' || e.key === 'Escape')) {
      keyEl.textContent = 'Reserved in Dofus Touch';
      keyEl.classList.add('kcd-key-blocked');
      setTimeout(() => { keyEl.classList.remove('kcd-key-blocked'); keyEl.textContent = capturedKey ? (capturedKey.length===1?capturedKey.toUpperCase():capturedKey) : '—'; }, 1200);
      return;
    }
    // Resolve NumPad digit regardless of NumLock state
    const resolvedKey = NUMPAD_CODE_TO_DIGIT[e.code] ?? e.key;
    capturedKey = resolvedKey;
    keyEl.textContent = resolvedKey.length === 1 ? resolvedKey.toUpperCase() : resolvedKey;
    saveBtn.disabled = false;
    // Focus name field so user can type a name
    setTimeout(() => labelIn.focus(), 50);
  };
  const cleanup = () => { document.removeEventListener('keydown', onKey, true); dlg.remove(); };
  document.addEventListener('keydown', onKey, true);
  dlg.querySelector('.kcd-cancel').onclick = cleanup;
  saveBtn.onclick = () => {
    cleanup();
    onSave({ key: capturedKey, label: labelIn.value.trim(), broadcast: dlg.querySelector('#kcd-broadcast')?.checked || false });
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
    const cr = canvas.getBoundingClientRect();
    const canvasAspect = canvas.width / canvas.height;
    const rectAspect   = cr.width / cr.height;
    let drawW, drawH, drawX, drawY;
    if (canvasAspect > rectAspect) {
      drawW = cr.width; drawH = cr.width / canvasAspect;
      drawX = cr.left;  drawY = cr.top + (cr.height - drawH) / 2;
    } else {
      drawH = cr.height; drawW = cr.height * canvasAspect;
      drawY = cr.top;    drawX = cr.left + (cr.width - drawW) / 2;
    }
    const rx = Math.max(0, Math.min(1, (e.clientX - drawX) / drawW));
    const ry = Math.max(0, Math.min(1, (e.clientY - drawY) / drawH));
    const thumb = captureZoneThumb(tabId, rx, ry);
    zones[idx] = { ...zone, rx, ry, thumb };
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
        <span style="font-size:15px;font-weight:700;color:var(--t1)">${t('reportBug')}</span>
        <button class="help-x" id="bug-close">×</button>
      </div>
      <div style="padding:28px 32px;display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center">
        <div style="font-size:40px">🐛</div>
        <div style="font-size:16px;font-weight:700;color:var(--t1)">${t('bugTitle')}</div>
        <div style="font-size:14px;color:var(--t2);line-height:1.7">${t('bugBody')}</div>
        <button onclick="window.td.openExternal('discord://-/invite/KZHeDJzMgg').catch(()=>window.td.openExternal('https://discord.gg/KZHeDJzMgg'))"
          style="display:flex;align-items:center;gap:10px;background:#5865F2;color:#fff;border-radius:10px;
          padding:12px 24px;font-size:15px;font-weight:700;border:none;cursor:pointer;transition:opacity .15s"
          onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
          <svg width="22" height="22" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"/></svg>
          ${t('joinDiscord')}
        </button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  $('bug-close').onclick = () => { backdrop.remove(); focusActiveCanvas(); };
  backdrop.addEventListener('mousedown', e => { if (e.target === backdrop) { backdrop.remove(); focusActiveCanvas(); } });
}

function openHelpModal() {
  const getSteps = () => [
    { num:1, icon:'🔌', title:t('h_s1_title'), goal:t('h_s1_goal'), steps:[t('h_s1_s1'),t('h_s1_s2'),t('h_s1_s3')], tip:t('h_s1_tip') },
    { num:2, icon:'🛠️', title:t('h_s2_title'), goal:t('h_s2_goal'), steps:[t('h_s2_s1'),t('h_s2_s2'),t('h_s2_s3')], tip:null },
    { num:3, icon:'🐛', title:t('h_s3_title'), goal:t('h_s3_goal'), steps:[t('h_s3_s1'),t('h_s3_s2')], tip:t('h_s3_tip') },
    { num:4, icon:'✅', title:t('h_s4_title'), goal:t('h_s4_goal'), steps:[t('h_s4_s1'),t('h_s4_s2'),t('h_s4_s3')], tip:t('h_s4_tip') },
    { num:5, icon:'🚀', title:t('h_s5_title'), goal:t('h_s5_goal'), steps:[t('h_s5_s1'),t('h_s5_s2'),t('h_s5_s3')], tip:null },
  ];
  const getUsage = () => [
    { icon:'📱', title:t('u1_title'), body:t('u1_body') },
    { icon:'🔒', title:t('u2_title'), body:t('u2_body') },
    { icon:'🖱️', title:t('u3_title'), body:t('u3_body') },
    { icon:'⌨️', title:t('u4_title'), body:t('u4_body') },
    { icon:'🎯', title:t('u5_title'), body:t('u5_body') },
    { icon:'⏺️', title:t('u6_title'), body:t('u6_body') },
    { icon:'⚙️', title:t('u7_title'), body:t('u7_body') },
    { icon:'🔄', title:t('u8_title'), body:t('u8_body') },
    { icon:'📡', title:t('u9_title'),  body:t('u9_body')  },
    { icon:'⊞',  title:t('u10_title'), body:t('u10_body') },
    { icon:'🏷️', title:t('u9_title'), body:t('u9_body') },
  ];

  let step = 0;
  let activeTab = 'setup';
  const backdrop = document.createElement('div');
  backdrop.className = 'help-backdrop';

  const render = () => {
    const steps = getSteps();
    const usageSections = getUsage();
    const TOTAL = steps.length;
    const s = steps[step];
    backdrop.innerHTML = `
    <div class="help-modal">
      <div class="help-head">
        <span class="help-head-title">${t('help')}</span>
        <button class="help-x" id="help-close">×</button>
      </div>
      <div class="help-tabs">
        <button class="help-tab${activeTab==='setup'?' active':''}" data-tab="setup">${t('setupGuide')}</button>
        <button class="help-tab${activeTab==='usage'?' active':''}" data-tab="usage">${t('usageGuide')}</button>
      </div>
      <div style="height:1px;background:var(--bd2);margin:0;flex-shrink:0"></div>
      ${activeTab === 'usage' ? `
        <div class="help-progress-bar">
          ${usageSections.map((_,i) => `<div class="help-seg${i < step ? ' done' : i === step ? ' active' : ''}"></div>`).join('')}
        </div>
        <div class="help-progress-label">${t('stepOf').replace('{n}',step+1).replace('{total}',usageSections.length)}</div>
        <div class="help-content">
          <div class="help-left">
            <div class="help-big-icon">${usageSections[step]?.icon||''}</div>
            <div class="help-step-num">0${step+1}</div>
          </div>
          <div class="help-right">
            <div class="help-goal">${t('howToUse')}</div>
            <div class="help-step-title">${usageSections[step]?.title||''}</div>
            <div class="help-step-body">${usageSections[step]?.body||''}</div>
          </div>
        </div>
        <div class="help-foot">
          <span></span>
          <div class="help-foot-btns">
            <button class="btn-ghost" id="help-prev" ${step===0?'disabled':''}>← ${t('previous')}</button>
            <button class="btn-accent" id="help-next">${step===usageSections.length-1?t('closeBtn'):`${t('next')} →`}</button>
          </div>
        </div>
      ` : `
        <div class="help-progress-bar">
          ${steps.map((_,i) => `<div class="help-seg${i < step ? ' done' : i === step ? ' active' : ''}"></div>`).join('')}
        </div>
        <div class="help-progress-label">${t('stepOf').replace('{n}',step+1).replace('{total}',TOTAL)}</div>
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
          <a class="help-trouble" href="#" id="help-trouble">${t('troubleshooting')} ↗</a>
          <div class="help-foot-btns">
            <button class="btn-ghost" id="help-prev" ${step===0?'disabled':''}>← ${t('previous')}</button>
            <button class="btn-accent" id="help-next">${step===TOTAL-1?t('finish'):`${t('next')} →`}</button>
          </div>
        </div>
      `}
    </div>`;

    $('help-close').onclick = () => { backdrop.remove(); focusActiveCanvas(); };
    backdrop.querySelectorAll('.help-tab').forEach(btn => {
      btn.onclick = () => { activeTab = btn.dataset.tab; step = 0; render(); };
    });
    $('help-prev')?.addEventListener('click', () => { step--; render(); });
    if (activeTab === 'usage') {
      $('help-next')?.addEventListener('click', () => {
        if (step < usageSections.length-1) { step++; render(); }
        else { backdrop.remove(); focusActiveCanvas(); }
      });
    } else {
      $('help-next')?.addEventListener('click', () => {
        if (step < TOTAL-1) { step++; render(); } else { backdrop.remove(); focusActiveCanvas(); }
      });
      $('help-trouble')?.addEventListener('click', e => {
        e.preventDefault();
        const rt = backdrop.querySelector('.help-right');
        rt.innerHTML = `
          <div class="help-step-title" style="margin-bottom:12px">${t('troubleshooting')}</div>
          <ul class="help-list">
            ${t('troubleItems').split('|').map(i=>`<li>${i}</li>`).join('')}
          </ul>
          <button class="btn-ghost" id="help-back-steps" style="margin-top:12px">← ${t('backToGuide')}</button>`;
        $('help-back-steps').onclick = render;
      });
    }
  };
  document.body.appendChild(backdrop);
  render();
}

// ── Shortcuts panel ────────────────────────────────────────────────────────
function buildShortcutsHtml(active = 'nav') {
  return `<div class="sc-tabs">
    <button class="sc-tab${active==='nav'?' on':''}" data-stab="nav">${t('navigation')}</button>
    <button class="sc-tab${active==='actions'?' on':''}" data-stab="actions">${t('actions')}</button>
    <button class="sc-tab${active==='profiles'?' on':''}" data-stab="profiles">Profiles</button>
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
// ── Shortcut Profiles ──────────────────────────────────────────────────────
function loadProfiles() {
  try { return JSON.parse(localStorage.getItem('tabpilot:sc-profiles') || '[]'); } catch { return []; }
}
function saveProfiles(profiles) {
  try { localStorage.setItem('tabpilot:sc-profiles', JSON.stringify(profiles)); } catch {}
}

function saveCurrentProfile(name) {
  const tab = state.tabs.find(t => t.id === state.activeTab);
  if (!tab) return;
  const zones = TAB_ZONES.get(tab.id) || [];
  const profiles = loadProfiles();
  const profile = {
    id: 'prof-' + Date.now(),
    name: name.trim(),
    zones: zones.map(({ thumb, ...z }) => z), // strip thumbnails - they're per-instance
    preset: state.settings.preset,
    resolution: state.settings.performance.resolution,
    dpi: state.settings.performance.dpi,
    createdAt: Date.now(),
  };
  profiles.push(profile);
  saveProfiles(profiles);
  toast('Profile saved', `"${profile.name}" — ${zones.length} zones`, 'success');
  renderScTab('profiles');
}

function applyProfile(profile) {
  const tab = state.tabs.find(t => t.id === state.activeTab);
  if (!tab) return;

  const currentRes  = state.settings.performance.resolution;
  const currentDpi  = state.settings.performance.dpi;
  const mismatch    = profile.resolution !== currentRes || profile.dpi !== currentDpi;

  const doApply = () => {
    const zones = profile.zones.map(clampZone);
    TAB_ZONES.set(tab.id, zones);
    saveTabZones(tab.id);
    ZONE_TAB_POS.delete(tab.id);
    const canvas = $('canvas-' + tab.id);
    if (canvas && canvas.width > 0) applyZoneThumbsToTab(tab.id);
    renderZones(tab.id, false);
    toast('Profile applied', `"${profile.name}" loaded`, 'success');
    renderScTab('profiles');
  };

  if (mismatch) {
    // Same warning as copy shortcuts — different resolution/DPI
    const warn = document.createElement('div');
    warn.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
    warn.innerHTML = `
      <div style="background:var(--surf);border:1px solid var(--bd2);border-radius:14px;padding:28px 32px;width:420px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center">
        <div style="font-size:32px">⚠️</div>
        <div style="font-size:16px;font-weight:700;color:var(--t1)">Resolution mismatch</div>
        <div style="font-size:13px;color:#e05c5c;line-height:1.7;font-weight:600">
          This profile was created at <strong>${profile.resolution} / DPI ${profile.dpi}</strong>.<br>
          Current instance is running at <strong>${currentRes} / DPI ${currentDpi}</strong>.<br>
          Zone positions may not match the intended actions.
        </div>
        <div style="font-size:13px;color:var(--t2);line-height:1.6">${t('copyWarning').split('\n').slice(2).join(' ')}</div>
        <div style="display:flex;gap:10px;justify-content:center">
          <button id="pmatch-cancel" style="background:var(--elev);color:var(--t2);border:1px solid var(--bd);border-radius:8px;padding:9px 20px;font-size:14px;cursor:pointer">${t('cancel')}</button>
          <button id="pmatch-confirm" style="background:#2a5cdb;color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:14px;font-weight:600;cursor:pointer">${t('confirm')}</button>
        </div>
      </div>`;
    document.body.appendChild(warn);
    warn.querySelector('#pmatch-cancel').onclick = () => warn.remove();
    warn.querySelector('#pmatch-confirm').onclick = () => { warn.remove(); doApply(); };
  } else {
    doApply();
  }
}

function renderProfilesTab() {
  const el = $('sc-content'); if (!el) return;
  const profiles = loadProfiles();
  const tab = state.tabs.find(t => t.id === state.activeTab);
  const hasActive = !!tab;

  el.innerHTML = `<div class="ps" style="display:flex;flex-direction:column;gap:10px">
    ${hasActive ? `
      <div style="display:flex;gap:8px">
        <input id="prof-name-in" placeholder="Profile name…" maxlength="32"
          style="flex:1;background:var(--elev);border:1px solid var(--bd2);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--t1);outline:none">
        <button id="prof-save-btn" class="btn-accent" style="padding:8px 14px;font-size:13px;white-space:nowrap">💾 Save current</button>
      </div>` : `<p style="font-size:13px;color:var(--t3)">No active instance — launch one to save or apply profiles.</p>`}
    ${profiles.length === 0
      ? `<p style="font-size:13px;color:var(--t3);text-align:center;padding:16px 0">No profiles saved yet.</p>`
      : profiles.map(p => `
        <div class="sc-row" style="flex-direction:column;align-items:stretch;gap:6px;padding:10px 12px" data-prof-id="${p.id}">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:14px;font-weight:600;flex:1;color:var(--t1)">${p.name}</span>
            <span style="font-size:11px;color:var(--t3)">${p.resolution} / DPI ${p.dpi}</span>
          </div>
          <div style="font-size:12px;color:var(--t3)">${p.zones.length} zones · ${new Date(p.createdAt).toLocaleDateString()}</div>
          <div style="display:flex;gap:6px;margin-top:2px">
            ${hasActive ? `<button class="btn-sm prof-apply-btn" data-prof-id="${p.id}" style="flex:1">▶ Apply</button>` : ''}
            <button class="btn-sm prof-delete-btn" data-prof-id="${p.id}" style="color:#e05c5c;border-color:#5c2020">✕ Delete</button>
          </div>
        </div>`).join('')
    }
  </div>`;

  $('prof-save-btn')?.addEventListener('click', () => {
    const name = $('prof-name-in')?.value.trim();
    if (!name) { $('prof-name-in')?.focus(); return; }
    saveCurrentProfile(name);
  });
  $('prof-name-in')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.stopPropagation(); $('prof-save-btn')?.click(); }
  });
  el.querySelectorAll('.prof-apply-btn').forEach(btn => {
    btn.onclick = () => {
      const p = loadProfiles().find(x => x.id === btn.dataset.profId);
      if (p) applyProfile(p);
    };
  });
  el.querySelectorAll('.prof-delete-btn').forEach(btn => {
    btn.onclick = () => {
      const profiles = loadProfiles().filter(x => x.id !== btn.dataset.profId);
      saveProfiles(profiles);
      renderScTab('profiles');
    };
  });
}

function renderScTab(tab) {
  const el = $('sc-content'); if (!el) return;
  if (tab === 'profiles') { renderProfilesTab(); return; }
  if (tab === 'nav') {
    el.innerHTML = `<div class="ps">
      <p style="font-size:14px;color:var(--t2);margin-bottom:12px">${t('navRemapHint')}</p>
      ${Object.entries(state.navKeys).map(([action, nk]) => `
        <div class="sc-row" style="margin-bottom:6px">
          <span class="sc-desc" style="flex:1">${t(nk.label)}</span>
          <button class="sc-key nav-remap-btn" data-action="${action}" style="cursor:pointer;min-width:80px;text-align:center">${navKeyDisplay(action)}</button>
          ${navKeyDisplay(action) !== NAV_DEFAULTS[action].default.replace(/ctrl\+/i,'Ctrl+') && navKeyDisplay(action) !== NAV_DEFAULTS[action].default
            ? `<button class="btn-sm nav-reset-btn" data-action="${action}" style="margin-left:4px;font-size:13px" title="Reset">↺</button>`
            : ''}
        </div>`).join('')}
    </div>`;

    el.querySelectorAll('.nav-remap-btn').forEach(btn => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        btn.textContent = '…press a key';
        btn.style.borderColor = 'var(--acc)';
        const onKey = e => {
          if (['Shift','Alt','Meta'].includes(e.key)) return;
          e.preventDefault(); e.stopPropagation();
          document.removeEventListener('keydown', onKey, true);
          state.navKeys[action] = { ...state.navKeys[action], ctrl: e.ctrlKey || e.metaKey, key: e.key };
          saveNavKeys();
          renderScTab('nav');
        };
        setTimeout(() => document.addEventListener('keydown', onKey, true), 50);
      };
    });

    el.querySelectorAll('.nav-reset-btn').forEach(btn => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        state.navKeys[action] = { ...NAV_DEFAULTS[action] };
        saveNavKeys();
        renderScTab('nav');
      };
    });
  } else {
    const activeTab = state.tabs.find(t2=>t2.id===state.activeTab);
    const zones = activeTab ? getZones(activeTab.id) : [];
    const otherTabs = state.tabs.filter(t2 => t2.id !== state.activeTab);
    el.innerHTML = `<div class="ps">
      <p style="font-size:15px;color:var(--t2);margin-bottom:10px">
        ${t('shortcutsTitle')} — <strong style="color:var(--t1)">${activeTab?.appName || activeTab?.label || ''}</strong> <span style="color:var(--t3);font-size:13px">${t('thisInstanceOnly')}</span>
      </p>
      ${!activeTab ? `<div style="font-size:14px;color:var(--t3)">${t('noDevicesConnect')}</div>` :
        zones.length === 0
        ? `<div style="font-size:14px;color:var(--t3);padding:4px 0 8px">${t('noZonesYet')}</div>`
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
        ${zones.length ? t('addMoreZones') : t('addZones')}
      </button>` : ''}
      ${activeTab && zones.length > 0 && otherTabs.length > 0 ? `
      <button id="btn-copy-zones" class="btn-sm" style="margin-top:6px;width:100%;padding:9px;text-align:center;background:var(--elev);border-color:var(--acc)">
        ${t('copyShortcuts')}
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

      $('btn-copy-zones')?.addEventListener('click', () => {
        if (!activeTab || otherTabs.length === 0) return;
        // Show wizard
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
      $('btn-copy-zones')?.addEventListener('click', () => {
        if (!activeTab || otherTabs.length === 0) return;

        // Step 1 — select instances
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
        overlay.innerHTML = `
          <div style="background:var(--surf);border:1px solid var(--bd2);border-radius:14px;padding:24px 28px;width:380px;display:flex;flex-direction:column;gap:14px">
            <div style="font-size:16px;font-weight:700;color:var(--t1)">${t('copyTitle')}</div>
            <div style="font-size:14px;color:var(--t2)">${t('selectTarget')}</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${otherTabs.map(t2 => {
                const cached = state.iconCache[t2.pkg];
                const b64 = cached?.b64, mime = cached?.mime || 'image/png';
                const color = appColor(t2.pkg);
                const icon = b64
                  ? `<img src="data:${mime};base64,${b64}" style="width:28px;height:28px;border-radius:6px;object-fit:cover">`
                  : `<div style="width:28px;height:28px;border-radius:6px;background:${color};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff">${(t2.appName||t2.label||'?').charAt(0)}</div>`;
                return `<label style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;border:1px solid var(--bd);cursor:pointer;background:var(--elev)">
                  <input type="checkbox" name="copy-target" value="${t2.id}" style="accent-color:var(--acc);width:15px;height:15px;flex-shrink:0">
                  ${icon}
                  <span style="font-size:14px;color:var(--t1)">${t2.label || t2.appName || t2.id}</span>
                </label>`;
              }).join('')}
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end">
              <button id="copy-cancel-btn" style="background:var(--elev);color:var(--t2);border:1px solid var(--bd);border-radius:8px;padding:8px 18px;font-size:14px;cursor:pointer">${t('cancel')}</button>
              <button id="copy-next-btn" style="background:var(--acc);color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer">${t('continueBtn')}</button>
            </div>
          </div>`;
        document.body.appendChild(overlay);

        overlay.querySelector('#copy-cancel-btn').onclick = () => overlay.remove();
        overlay.querySelector('#copy-next-btn').onclick = () => {
          const selected = [...overlay.querySelectorAll('input[name="copy-target"]:checked')].map(el => el.value);
          if (selected.length === 0) return;
          overlay.remove();

          // Step 2 — warning
          const warn = document.createElement('div');
          warn.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
          warn.innerHTML = `
            <div style="background:var(--surf);border:1px solid var(--bd2);border-radius:14px;padding:28px 32px;width:400px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center">
              <div style="font-size:32px">⚠️</div>
              <div style="font-size:16px;font-weight:700;color:var(--t1)">${t('areYouSure')}</div>
              <div style="font-size:14px;color:#e05c5c;line-height:1.7;font-weight:600">
                ${t('copyWarning').replace(/\n/g,'<br>')}
              </div>
              <div style="display:flex;gap:10px;justify-content:center">
                <button id="warn-cancel" style="background:var(--elev);color:var(--t2);border:1px solid var(--bd);border-radius:8px;padding:9px 20px;font-size:14px;cursor:pointer">${t('cancel')}</button>
                <button id="warn-confirm" style="background:#2a5cdb;color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:14px;font-weight:600;cursor:pointer">${t('confirm')}</button>
              </div>
            </div>`;
          document.body.appendChild(warn);

          warn.querySelector('#warn-cancel').onclick = () => warn.remove();
          warn.querySelector('#warn-confirm').onclick = () => {
            warn.remove();
            selected.forEach(targetId => copyZonesToTab(activeTab.id, targetId));
            renderScTab('actions');
          };
        };
      });
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

function buildSettings() {
  const s = state.settings;
  panelBody.innerHTML = `
    <div class="ps">
      <div class="plabel">${t('performance')}</div>
      <div class="preset-grid">
        ${['ultra','high','medium','low','eco'].map(p=>`
          <div class="preset${s.preset===p?' on':''}" data-p="${p}">
            <div class="preset-name">${t(p)}</div>
            <div class="preset-meta">${PRESETS[p].resolution.replace('x','×')} · ${PRESETS[p].maxFps}fps</div>
            <div class="preset-meta">${PRESETS[p].bitrate}Mbps · ${PRESETS[p].dpi}dpi · ${PRESETS[p].iFrameInterval}s</div>
          </div>`).join('')}
        <div class="preset wide${s.preset==='custom'?' on':''}" data-p="custom">
          <div class="preset-name">${t('custom')}</div><div class="preset-meta">${t('customizeWhenLaunching')}</div>
        </div>
      </div>
    </div>
    <div class="ps" id="s-custom-section" style="${s.preset!=='custom'?'display:none':''}">
      <div class="plabel">${t('advanced')}</div>
      ${srow(t('resolution'),`<select class="ssel" id="s-res">${['3840x2160','2560x1440','1920x1080','1600x900','1280x720','960x540','854x480'].map(r=>`<option value="${r}"${s.performance.resolution===r?' selected':''}>${r.replace('x','×')} ${({'3840x2160':'(4K)','2560x1440':'(QHD)','1920x1080':'(Full HD)','1600x900':'','1280x720':'(HD)','960x540':'(qHD)','854x480':'(FWVGA)'})[r]||''}</option>`).join('')}</select>`)}
      ${srow(t('fps'),`<select class="ssel" id="s-fps">${[15,20,30,45,60].map(f=>`<option value="${f}"${s.performance.maxFps===f?' selected':''}>${f} FPS</option>`).join('')}</select>`)}
      ${srow(t('bitrate'),`<select class="ssel" id="s-bit">${[1,2,4,6,8,12,16,24].map(b=>`<option value="${b}"${s.performance.bitrate===b?' selected':''}>${b} Mbps</option>`).join('')}</select>`)}
      ${srow(t('dpi'),`<select class="ssel" id="s-dpi">${[120,160,200,240,280,320,420].map(d=>`<option value="${d}"${(s.performance.dpi||240)===d?' selected':''}>${d}</option>`).join('')}</select>`)}
      ${srow(t('iframe'),`<select class="ssel" id="s-iframe">${[[1,'fast'],[2,''],[3,''],[5,''],[10,'light']].map(([v,l])=>`<option value="${v}"${(s.performance.iFrameInterval||3)===v?' selected':''}>${v} sec${l?' ('+l+')':''}</option>`).join('')}</select>`)}
    </div>
    <div class="ps">
      <div class="plabel">${t('devices')}</div>
      ${srow(t('manageDevices'),`<button class="btn-sm" id="s-devices-btn" style="padding:5px 12px">${t('viewDevices')}</button>`)}
      ${srow(t('turnOffScreenFull'),tog('tog-scr',s.device.turnScreenOff))}
      ${srow(t('enableAudio'),tog('tog-audio',s.audio.enabled))}
      ${srow('Auto-reconnect on disconnect',tog('tog-autoreconnect',s.autoReconnect))}
      ${srow('Show FPS counter on tabs',tog('tog-showfps',s.showFps))}
    </div>`;
  panelBody.querySelectorAll('.preset').forEach(el => {
    el.onclick = () => {
      const p = el.dataset.p;
      panelBody.querySelectorAll('.preset').forEach(x=>x.classList.remove('on'));
      el.classList.add('on'); s.preset = p;
      if (p!=='custom') Object.assign(s.performance, PRESETS[p]);
      const customSec = $('s-custom-section');
      if (customSec) customSec.style.display = p==='custom' ? '' : 'none';
      saveSettings();
      if (!backdropEl.classList.contains('hidden')) buildModalPresetPanel();
    };
  });
  ['s-res','s-fps','s-bit','s-dpi','s-iframe'].forEach(id => {
    const el=$(id); if(!el) return;
    el.onchange = () => {
      s.preset='custom';
      panelBody.querySelectorAll('.preset').forEach(x=>x.classList.toggle('on',x.dataset.p==='custom'));
      if(id==='s-res') s.performance.resolution=el.value;
      if(id==='s-fps') s.performance.maxFps=+el.value;
      if(id==='s-bit') s.performance.bitrate=+el.value;
      if(id==='s-dpi') s.performance.dpi=+el.value;
      if(id==='s-iframe') s.performance.iFrameInterval=+el.value;
      saveSettings();
      if (!backdropEl.classList.contains('hidden')) buildModalPresetPanel();
    };
  });
  const ts=$('tog-scr');
  if(ts) ts.onchange=()=>{ s.device.turnScreenOff=ts.checked; saveSettings(); if (!backdropEl.classList.contains('hidden')) buildModalPresetPanel(); };
  const ta=$('tog-audio');
  if(ta) ta.onchange=()=>{ setGlobalAudioEnabled(ta.checked); if (!backdropEl.classList.contains('hidden')) buildModalPresetPanel(); };
  const tar=$('tog-autoreconnect');
  if(tar) tar.onchange=()=>{ s.autoReconnect=tar.checked; saveSettings(); };
  const tfps=$('tog-showfps');
  if(tfps) tfps.onchange=()=>{ s.showFps=tfps.checked; saveSettings(); updateAllFpsDisplays(); };

  $('s-devices-btn')?.addEventListener('click', () => {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
    const online = state.devices.filter(d=>d.state==='device');
    const offline = state.devices.filter(d=>d.state!=='device');
    ov.innerHTML = `<div style="background:var(--surf);border:1px solid var(--bd2);border-radius:14px;padding:24px 28px;width:400px;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:16px;font-weight:700;color:var(--t1)">${t('devices')}</span>
        <button id="dev-modal-close" style="background:none;border:none;color:var(--t3);font-size:20px;cursor:pointer">×</button>
      </div>
      <div style="font-size:13px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.08em">${t('connected')} (${online.length})</div>
      ${online.length ? online.map(d=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--elev);border-radius:8px;border:1px solid var(--bd)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
        <div><div style="font-size:15px;color:var(--t1);font-weight:500">${d.model||d.id}</div><div style="font-size:13px;color:var(--t3)">${d.id}</div></div>
        <div style="margin-left:auto;font-size:13px;color:#4ade80">● ${t('connected')}</div>
      </div>`).join('') : `<div style="font-size:14px;color:var(--t3)">${t('noDevices')}</div>`}
      ${offline.length ? `<div style="font-size:13px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.08em">${t('offline')} (${offline.length})</div>
      ${offline.map(d=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--elev);border-radius:8px;border:1px solid var(--bd);opacity:.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
        <div><div style="font-size:15px;color:var(--t2)">${d.model||d.id}</div><div style="font-size:13px;color:var(--t3)">${d.id}</div></div>
      </div>`).join('')}` : ''}
    </div>`;
    document.body.appendChild(ov);
    $('dev-modal-close').onclick = () => ov.remove();
    ov.onclick = e => { if (e.target === ov) ov.remove(); };
  });
}
  panelBody.querySelectorAll('.preset').forEach(el => {
    el.onclick = () => {
      const p = el.dataset.p;
      panelBody.querySelectorAll('.preset').forEach(x=>x.classList.remove('on'));
      el.classList.add('on'); s.preset = p;
      if (p!=='custom') Object.assign(s.performance, PRESETS[p]);
      const customSec = $('s-custom-section');
      if (customSec) customSec.style.display = p==='custom' ? '' : 'none';
      saveSettings();
      if (!backdropEl.classList.contains('hidden')) buildModalPresetPanel();
    };
  });
  ['s-res','s-fps','s-bit','s-dpi','s-iframe'].forEach(id => {
    const el=$(id); if(!el) return;
    el.onchange = () => {
      s.preset='custom';
      panelBody.querySelectorAll('.preset').forEach(x=>x.classList.toggle('on',x.dataset.p==='custom'));
      if(id==='s-res') s.performance.resolution=el.value;
      if(id==='s-fps') s.performance.maxFps=+el.value;
      if(id==='s-bit') s.performance.bitrate=+el.value;
      if(id==='s-dpi') s.performance.dpi=+el.value;
      if(id==='s-iframe') s.performance.iFrameInterval=+el.value;
      saveSettings();
      if (!backdropEl.classList.contains('hidden')) buildModalPresetPanel();
    };
  });
  const ts=$('tog-scr');
  if(ts) ts.onchange=()=>{ s.device.turnScreenOff=ts.checked; saveSettings(); if (!backdropEl.classList.contains('hidden')) buildModalPresetPanel(); };
  const ta=$('tog-audio');
  if(ta) ta.onchange=()=>{ setGlobalAudioEnabled(ta.checked); if (!backdropEl.classList.contains('hidden')) buildModalPresetPanel(); };

function srow(label, ctrl) {
  return `<div class="srow"><label class="slbl">${label}</label>${ctrl}</div>`;
}
function tog(id, checked) {
  return `<div class="tog"><input type="checkbox" id="${id}"${checked?' checked':''}><label class="ttrack" for="${id}"></label></div>`;
}

// ── Modal ──────────────────────────────────────────────────────────────────
function openModal() {
  if (_recordingLockTabId) return; // block launching new instances while recording
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
  updateLaunchBtn();
  updateSfButton();
  buildModalPresetPanel();
  // Translate modal labels
  const _mhead = document.querySelector('#modal .modal-head span'); if (_mhead) _mhead.textContent = t('launchTitle');
  const _mdlbl = $('modal-device-lbl'); if (_mdlbl) _mdlbl.textContent = t('device');
  const _mcancel = $('modal-cancel'); if (_mcancel) _mcancel.textContent = t('cancel');
  if (modalSearch) modalSearch.placeholder = t('searchApp');
  if (modalLaunch) modalLaunch.textContent = t('launch');
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

function buildModalPresetPanel() {
  const s = state.settings;
  const panel = $('modal-preset-panel');
  if (!panel) return;
  const isCustom = s.preset === 'custom';

  // Translate static labels
  const optLbl = $('mp-options-lbl'); if (optLbl) optLbl.textContent = t('options');
  const audLbl = $('mp-audio-lbl'); if (audLbl) audLbl.textContent = t('audio');
  const scrLbl = $('mp-screen-lbl'); if (scrLbl) scrLbl.textContent = t('turnOffScreen');
  const mpHead = panel.querySelector('.modal-head span'); if (mpHead) mpHead.textContent = t('settings');
  const mpCHead = $('modal-custom-panel')?.querySelector('.modal-head span'); if (mpCHead) mpCHead.textContent = t('custom');

  panel.querySelector('#mp-preset-grid').innerHTML = ['ultra','high','medium','low','eco','custom'].map(p => `
    <div class="preset${s.preset===p?' on':''}" data-mp="${p}" style="cursor:pointer">
      <div class="preset-name">${t(p)}</div>
      <div class="preset-meta">${p!=='custom' ? PRESETS[p].resolution.replace('x','×')+' · '+PRESETS[p].maxFps+'fps' : t('customizeWhenLaunching')}</div>
      ${p!=='custom' ? `<div class="preset-meta">${PRESETS[p].bitrate}Mbps · ${PRESETS[p].dpi}dpi · ${PRESETS[p].iFrameInterval}s</div>` : ''}
    </div>`).join('');

  // Show/hide custom panel
  const customPanel = $('modal-custom-panel');
  const presetPanel = $('modal-preset-panel');
  if (customPanel) {
    customPanel.style.display = isCustom ? 'flex' : 'none';
    if (presetPanel) {
      presetPanel.style.borderRadius = isCustom ? '0' : '0 12px 12px 0';
    }
  }

  const customSec = $('mp-custom-section');
  if (customSec && isCustom) {
    customSec.innerHTML = `
      <div class="srow" style="padding:0"><label class="slbl">${t('resolution')}</label>
        <select class="ssel" id="mp-res">${['3840x2160','2560x1440','1920x1080','1600x900','1280x720','960x540','854x480'].map(r=>`<option value="${r}"${s.performance.resolution===r?' selected':''}>${r.replace('x','×')}</option>`).join('')}</select></div>
      <div class="srow" style="padding:0"><label class="slbl">${t('fps')}</label>
        <select class="ssel" id="mp-fps">${[15,20,30,45,60].map(f=>`<option value="${f}"${s.performance.maxFps===f?' selected':''}>${f} FPS</option>`).join('')}</select></div>
      <div class="srow" style="padding:0"><label class="slbl">${t('bitrate')}</label>
        <select class="ssel" id="mp-bit">${[1,2,4,6,8,12,16,24].map(b=>`<option value="${b}"${s.performance.bitrate===b?' selected':''}>${b} Mbps</option>`).join('')}</select></div>
      <div class="srow" style="padding:0"><label class="slbl">${t('dpi')}</label>
        <select class="ssel" id="mp-dpi">${[120,160,200,240,280,320,420].map(d=>`<option value="${d}"${(s.performance.dpi||240)===d?' selected':''}>${d}</option>`).join('')}</select></div>
      <div class="srow" style="padding:0"><label class="slbl">${t('iframe')}</label>
        <select class="ssel" id="mp-iframe">${[[1,'fast'],[2,''],[3,''],[5,''],[10,'light']].map(([v,l])=>`<option value="${v}"${(s.performance.iFrameInterval||3)===v?' selected':''}>${v}s${l?' ('+l+')':''}</option>`).join('')}</select></div>`;
  }

  // Audio toggle
  const audioTog = $('mp-audio-tog');
  if (audioTog) {
    audioTog.innerHTML = tog('mp-tog-audio', s.audio.enabled);
    const el = $('mp-tog-audio');
    if (el) el.onchange = e => { setGlobalAudioEnabled(e.target.checked); if (state.panel==='settings') buildSettings(); };
  }

  // Screen toggle
  const screenTog = $('mp-screen-tog');
  if (screenTog) {
    screenTog.innerHTML = tog('mp-tog-scr', s.device.turnScreenOff);
    const el = $('mp-tog-scr');
    if (el) el.onchange = e => { s.device.turnScreenOff = e.target.checked; saveSettings(); if (state.panel==='settings') buildSettings(); };
  }

  // Preset clicks
  panel.querySelectorAll('[data-mp]').forEach(el => {
    el.onclick = () => {
      const p = el.dataset.mp;
      s.preset = p;
      if (p !== 'custom') Object.assign(s.performance, PRESETS[p]);
      saveSettings();
      buildModalPresetPanel();
      if (state.panel === 'settings') buildSettings();
    };
  });

  // Custom selects
  $('mp-res')?.addEventListener('change', e => { s.performance.resolution = e.target.value; saveSettings(); if (state.panel==='settings') buildSettings(); });
  $('mp-fps')?.addEventListener('change', e => { s.performance.maxFps = +e.target.value; saveSettings(); if (state.panel==='settings') buildSettings(); });
  $('mp-bit')?.addEventListener('change', e => { s.performance.bitrate = +e.target.value; saveSettings(); if (state.panel==='settings') buildSettings(); });
  $('mp-dpi')?.addEventListener('change', e => { s.performance.dpi = +e.target.value; saveSettings(); if (state.panel==='settings') buildSettings(); });
  $('mp-iframe')?.addEventListener('change', e => { s.performance.iFrameInterval = +e.target.value; saveSettings(); if (state.panel==='settings') buildSettings(); });
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
    const devSelCount = getDeviceSel(d.id).size;
    return `<div class="dev-card${d.id===state.modalDevice?.id?' on':''}" data-id="${d.id}">
      <span class="dev-dot"></span>
      <div style="flex:1">
        <div class="dev-name">${d.model}${devSelCount > 0 ? ` <span style="background:var(--acc);color:#fff;border-radius:10px;font-size:10px;padding:1px 6px;margin-left:4px">${devSelCount}</span>` : ''}</div>
        <div class="dev-id">${d.id}</div>

      </div>
      ${d.id===state.modalDevice?.id?'':''}
    </div>`;
  }).join('') || '<p style="font-size:12px;color:var(--t3)">No devices found.</p>';

  const sfBtn = $('modal-sf-btn');
  const appSection = $('modal-app-section');
  modalLaunch.disabled = !state.modalApp;
  if (sfBtn) { sfBtn.disabled = false; sfBtn.style.opacity = ''; sfBtn.style.pointerEvents = ''; }
  if (appSection) appSection.style.display = '';

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
  state.tabs.push(tab); loadZones(id);

  // Tab element
  const el = document.createElement('div');
  el.className = 'tab'; el.dataset.tabId = id;
  el.innerHTML = `<div class="tab-icon" id="ticon-${id}">
      <span>${tabLabel.charAt(0).toUpperCase()}</span>
    </div>
    <span class="tab-name" id="tname-${id}">${tabLabel}</span>
    <span class="tab-fps" id="fps-${id}" style="display:${state.settings.showFps?'':'none'}">-- FPS</span>
    <button class="tab-restart" title="Restart mirroring"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg></button>
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
    if (e.target.closest('.tab-restart')) { restartMirror(id); return; }
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
      <canvas id="ambient-${id}" class="ambient-bg" style="display:none"></canvas>
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
  const v = getTabVolume(tabId);
  const menu = document.createElement('div');
  menu.className = 'tab-ctx';
  menu.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:999`;
  menu.innerHTML = `
    <div class="ctx-item" id="ctx-rename">✏ Rename</div>
    <div class="ctx-vol-row" id="ctx-vol-row">
      <button class="ctx-vol-mute" id="ctx-vol-mute" title="${v.muted ? 'Unmute' : 'Mute'}">${v.muted ? '🔇' : '🔊'}</button>
      <input type="range" class="ctx-vol-slider" id="ctx-vol-slider" min="0" max="100" value="${v.volume}" ${v.muted ? 'disabled' : ''}>
      <span class="ctx-vol-pct" id="ctx-vol-pct">${v.volume}%</span>
    </div>
    <div class="ctx-item ctx-danger" id="ctx-close">✕ Close</div>`;
  document.body.appendChild(menu);

  // Closing the menu (any way) must return keyboard focus to the active
  // tab's canvas - the volume slider is a real focusable <input>, and
  // without this, focus is left nowhere after closing the menu, silently
  // breaking ALL keyboard shortcuts until the user manually clicks the
  // canvas again.
  function closeMenuAndRestoreFocus() {
    menu.remove();
    focusActiveCanvas();
  }

  menu.querySelector('#ctx-rename').onclick = () => {
    document.removeEventListener('click', onOutsideClick);
    menu.remove();
    startRename(tabId);
  };
  menu.querySelector('#ctx-close').onclick  = () => { closeMenuAndRestoreFocus(); closeTab(tabId); };

  const slider = menu.querySelector('#ctx-vol-slider');
  const pct = menu.querySelector('#ctx-vol-pct');
  const muteBtn = menu.querySelector('#ctx-vol-mute');
  slider.oninput = () => {
    setTabVolume(tabId, +slider.value);
    pct.textContent = slider.value + '%';
  };
  // Prevent slider drag from closing the menu via the outside-click handler
  slider.onclick = e => e.stopPropagation();
  muteBtn.onclick = e => {
    e.stopPropagation();
    const nowMuted = !getTabVolume(tabId).muted;
    setTabMuted(tabId, nowMuted);
    muteBtn.textContent = nowMuted ? '🔇' : '🔊';
    muteBtn.title = nowMuted ? 'Unmute' : 'Mute';
    slider.disabled = nowMuted;
  };

  // Close only on a click OUTSIDE the menu - the previous version closed on
  // ANY click anywhere, which destroyed the menu the instant you touched
  // the volume slider (mousedown counts as a click), making it impossible
  // to actually drag the slider.
  const onOutsideClick = e => {
    if (!menu.contains(e.target)) {
      closeMenuAndRestoreFocus();
      document.removeEventListener('click', onOutsideClick);
    }
  };
  setTimeout(() => document.addEventListener('click', onOutsideClick), 0);
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
  // Block switching tabs while a recording is in progress (any tab, not just
  // the recorded one, to avoid losing the recording overlay context).
  if (_recordingLockTabId) return;
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
  updateWritingBtn();

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
  if (_recordingLockTabId) return; // block closing tabs while recording
  const tab = state.tabs.find(t=>t.id===id); if(!tab) return;
  // Cancel any pending auto-reconnect
  if (tab._reconnectInterval) { clearInterval(tab._reconnectInterval); tab._reconnectInterval = null; }
  if (tab._countdownEl) { tab._countdownEl.remove(); tab._countdownEl = null; }
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
  deleteTabZones(id);
  setWritingMode(false, id);
  TAB_WRITE.delete(id);
  TAB_IME_PENDING.delete(id);
  TAB_LAST_TAP.delete(id);
  updateMacroStatus();
  try { state.decoders.get(id)?.close(); } catch {}
  state.decoders.delete(id);
  cleanupAudio(id);
  _ambientFrameCounter.delete(id);
  TAB_VOLUME.delete(id);
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
  el.className = `tab${status==='running'?' running':status==='error'?' error':status==='reconnecting'?' reconnecting':''}${state.activeTab===id?' on':''}`;
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
      dpi:           s.performance.dpi || 240,
      iFrameInterval: s.performance.iFrameInterval || 3,
      audioEnabled,
      turnScreenOff: s.device.turnScreenOff,
    });
    // tab icon already set
    updateTabState(tab.id, 'running');
    initDecoder(tab.id);
    if (audioEnabled) initAudio(tab.id);
    // Start IME watcher for this device
    window.td.watchIme({ tabId: tab.id, deviceId: device.id }).catch(() => {});
    // Restore persisted volume ~2.5s after launch (scrcpy needs time to
    // register its WASAPI audio session before SetMasterVolume works).
    setTimeout(() => {
      const _t = state.tabs.find(t => t.id === tab.id);
      if (_t) { const _v = getTabVolume(tab.id); setTabVolume(tab.id, _v.volume); }
    }, 2500);
  } catch(err) {
    updateTabState(tab.id, 'error');
    const st=$('pst-'+tab.id);
    if(st) st.innerHTML=`<span style="color:#e05c5c;font-size:12px">Error: ${err.message||err}</span>`;
  }
}

// Restarts the scrcpy mirroring stream for an existing tab WITHOUT closing
// the tab itself - keeps the same tabId, position, zones, and writing mode
// state. Useful when the stream freezes, the device drops the connection,
// or after waking the phone from sleep.
async function restartMirror(tabId) {
  if (_recordingLockTabId) return; // block restarting tabs while recording
  const tab = state.tabs.find(t => t.id === tabId);
  if (!tab) return;

  const btn = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-restart`);
  if (btn) btn.classList.add('spinning');

  const device = state.devices.find(d => d.id === tab.deviceId);
  if (!device) {
    if (btn) btn.classList.remove('spinning');
    // Device not in state yet — may still be reconnecting at ADB level.
    // If the tab has _wasReconnecting, retry after 3 more seconds.
    if (tab._wasReconnecting) {
      setTimeout(() => {
        if (state.tabs.find(t => t.id === tabId)) restartMirror(tabId);
      }, 3000);
    }
    return;
  }

  updateTabState(tabId, 'loading');
  const s = state.settings;
  const audioEnabled = s.audio.enabled;

  try {
    // Tear down the existing decoder/audio/stream for this tab
    try { state.decoders.get(tabId)?.close(); } catch {}
    state.decoders.delete(tabId);
    cleanupAudio(tabId);
    _ambientFrameCounter.delete(tabId);
    await window.td.stopMirror(tabId).catch(() => {});

    // Bring the stream back up using the SAME tabId, so canvas/zones/UI
    // stay attached to this tab instead of creating a duplicate
    await window.td.startMirror({
      deviceId:       tab.deviceId,
      appPackage:     tab.pkg,
      tabId:          tab.id,
      userId:         tab.userId || 0,
      secureFolder:   false,
      useMainDisplay: false,
      resolution:     s.performance.resolution,
      maxFps:         s.performance.maxFps,
      bitrate:        s.performance.bitrate,
      dpi:            s.performance.dpi || 240,
      iFrameInterval: s.performance.iFrameInterval || 3,
      audioEnabled,
      turnScreenOff:  s.device.turnScreenOff,
    });

    updateTabState(tabId, 'running');
    // Notify if this was an auto-reconnect (tab had a reconnect interval pending)
    const _tab = state.tabs.find(t => t.id === tabId);
    if (_tab?._wasReconnecting) { notify('Reconnected', `${_tab.label || _tab.pkg} is back online`, 'success'); _tab._wasReconnecting = false; }
    initDecoder(tabId);
    if (audioEnabled) initAudio(tabId);
    window.td.watchIme({ tabId, deviceId: tab.deviceId }).catch(() => {});
    // Restore persisted volume ~2.5s after restart.
    setTimeout(() => {
      const _t = state.tabs.find(t => t.id === tabId);
      if (_t) { const _v = getTabVolume(tabId); setTabVolume(tabId, _v.volume); }
    }, 2500);
  } catch (err) {
    updateTabState(tabId, 'error');
    const st = $('pst-' + tabId);
    if (st) st.innerHTML = `<span style="color:#e05c5c;font-size:12px">Error: ${err.message || err}</span>`;
  } finally {
    if (btn) btn.classList.remove('spinning');
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

const _ambientFrameCounter = new Map(); // tabId -> count, throttles ambient bg updates
const _fpsState = new Map(); // tabId -> { frames, last, fps }

function updateFpsDisplay(tabId, fps) {
  const el = $('fps-' + tabId);
  if (el) el.textContent = fps + ' FPS';
}
function updateAllFpsDisplays() {
  state.tabs.forEach(tab => {
    const el = $('fps-' + tab.id);
    if (el) el.style.display = state.settings.showFps ? '' : 'none';
  });
}

function makeDecoder(tabId) {
  return new VideoDecoder({
    output: frame => {
      const canvas = $('canvas-'+tabId);
      if (!canvas) { frame.close(); return; }
      const ctx = canvas.getContext('2d');
      if (canvas.width!==frame.displayWidth || canvas.height!==frame.displayHeight) {
        canvas.width=frame.displayWidth; canvas.height=frame.displayHeight;
      }
      ctx.drawImage(frame, 0, 0);

      // FPS counter
      const now = performance.now();
      if (!_fpsState.has(tabId)) _fpsState.set(tabId, { frames: 0, last: now, fps: 0 });
      const fs = _fpsState.get(tabId);
      fs.frames++;
      if (now - fs.last >= 1000) {
        fs.fps = Math.round(fs.frames * 1000 / (now - fs.last));
        fs.frames = 0; fs.last = now;
        if (state.settings.showFps) updateFpsDisplay(tabId, fs.fps);
      }

      // Ambient blurred background: updated at a reduced rate (every 6th
      // frame) and at low resolution since the blur filter hides detail
      // anyway - keeps the cost of this extra draw negligible.
      const n = (_ambientFrameCounter.get(tabId) || 0) + 1;
      _ambientFrameCounter.set(tabId, n);
      if (n % 6 === 0) {
        const amb = $('ambient-'+tabId);
        if (amb) {
          const AMB_W = 64, AMB_H = Math.round(64 * frame.displayHeight / frame.displayWidth);
          if (amb.width !== AMB_W || amb.height !== AMB_H) { amb.width = AMB_W; amb.height = AMB_H; }
          amb.getContext('2d').drawImage(frame, 0, 0, AMB_W, AMB_H);
          if (amb.style.display === 'none') amb.style.display = 'block';
        }
      }

      frame.close();
      if (canvas.style.display==='none') {
        canvas.style.display='block';
        $('pst-'+tabId)?.remove();
        bindCanvasInput(tabId, canvas);
        // Apply zone matching on first frame (only if zones were copied from another instance)
        setTimeout(() => {
          recaptureZoneThumbs(tabId);
        }, 800);
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
  startBtnPolling();

  // Track typing mode via focus/blur
  canvas.addEventListener('focus', () => setTypingMode(true));
  canvas.addEventListener('blur',  () => setTypingMode(false));

  // Helper to get canvas coords from mouse event
  function canvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    // Account for object-fit:contain letterboxing
    const canvasAspect = canvas.width / canvas.height;
    const rectAspect   = rect.width  / rect.height;
    let drawW, drawH, drawX, drawY;
    if (canvasAspect > rectAspect) {
      // Letterbox top/bottom
      drawW = rect.width;
      drawH = rect.width / canvasAspect;
      drawX = rect.left;
      drawY = rect.top + (rect.height - drawH) / 2;
    } else {
      // Letterbox left/right
      drawH = rect.height;
      drawW = rect.height * canvasAspect;
      drawY = rect.top;
      drawX = rect.left + (rect.width - drawW) / 2;
    }
    return {
      x: (e.clientX - drawX) * canvas.width  / drawW,
      y: (e.clientY - drawY) * canvas.height / drawH,
    };
  }

  function canvasRxRy(e) {
    const rect = canvas.getBoundingClientRect();
    const canvasAspect = canvas.width / canvas.height;
    const rectAspect   = rect.width  / rect.height;
    let drawW, drawH, drawX, drawY;
    if (canvasAspect > rectAspect) {
      drawW = rect.width; drawH = rect.width / canvasAspect;
      drawX = rect.left;  drawY = rect.top + (rect.height - drawH) / 2;
    } else {
      drawH = rect.height; drawW = rect.height * canvasAspect;
      drawY = rect.top;    drawX = rect.left + (rect.width - drawW) / 2;
    }
    return {
      rx: Math.max(0, Math.min(1, (e.clientX - drawX) / drawW)),
      ry: Math.max(0, Math.min(1, (e.clientY - drawY) / drawH)),
      drawX, drawY, drawW, drawH,
    };
  }

  // Track virtual finger state for Ctrl+drag pinch
  let vfingerDown = false;

  // MOUSEDOWN → normal touch OR start Ctrl+drag pinch
  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    canvas.focus({ preventScroll: true });
    const { x, y } = canvasCoords(e);
    recordTapForRecord(tabId, x, y, canvas.width, canvas.height);

    if (e.ctrlKey) {
      // Ctrl+drag: start pinch — real finger at cursor + virtual finger inverted through screen center
      vfingerDown = true;
      const vx = canvas.width  - x; // = 2*(w/2) - x
      const vy = canvas.height - y; // = 2*(h/2) - y
      window.td.pinchStart({ tabId, x, y, vx, vy, width: canvas.width, height: canvas.height });
    } else {
      window.td.touchDown({ tabId, x, y, width: canvas.width, height: canvas.height });
      // Broadcast to all other active instances
      if (_broadcastMode || e.shiftKey) {
        const rx = x / canvas.width, ry = y / canvas.height;
        const srcTab = state.tabs.find(t => t.id === tabId);
        state.tabs.forEach(t => {
          if (t.id === tabId) return;
          if (t.pkg !== srcTab?.pkg) return; // only same app type
          const tc = $('canvas-' + t.id);
          if (!tc || tc.style.display === 'none' || tc.width === 0) return;
          window.td.touchDown({ tabId: t.id, x: Math.round(rx * tc.width), y: Math.round(ry * tc.height), width: tc.width, height: tc.height });
        });
      }
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
      // Broadcast to all other active instances
      if (_broadcastMode || e.shiftKey) {
        const rx = x / canvas.width, ry = y / canvas.height;
        const srcTab = state.tabs.find(t => t.id === tabId);
        state.tabs.forEach(t => {
          if (t.id === tabId) return;
          if (t.pkg !== srcTab?.pkg) return; // only same app type
          const tc = $('canvas-' + t.id);
          if (!tc || tc.style.display === 'none' || tc.width === 0) return;
          window.td.touchUp({ tabId: t.id, x: Math.round(rx * tc.width), y: Math.round(ry * tc.height), width: tc.width, height: tc.height });
        });
      }
    }
    // After every tap, poll once fast to catch keyboard opening
    // This fixes the "second time keyboard doesn't trigger" bug on Samsung
    setTimeout(() => window.td.checkIme?.({ tabId }), 400);
    setTimeout(() => window.td.checkIme?.({ tabId }), 900);
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
  // NumPad digits: when NumLock is OFF, e.key reports navigation actions
  // (End, ArrowDown, PageDown, etc) instead of the digit, even though the
  // physical key is a number. e.code identifies the physical key regardless
  // of NumLock state. We only use it to resolve a digit for ZONE SHORTCUT
  // matching (so "1" assigned to a zone fires from the numpad too) - we
  // don't touch e.key itself, so NumPad still works as real navigation keys
  // when no shortcut claims that digit.
  const NUMPAD_CODE_TO_DIGIT = {
    Numpad0:'0', Numpad1:'1', Numpad2:'2', Numpad3:'3', Numpad4:'4',
    Numpad5:'5', Numpad6:'6', Numpad7:'7', Numpad8:'8', Numpad9:'9',
  };
  function numpadDigit(e) { return NUMPAD_CODE_TO_DIGIT[e.code]; }

  function sendKey(kc, shift=false) {
    const meta = shift ? 0x41 : 0;
    window.td.keyevent({ tabId, keycode:kc, action:0, meta });
    setTimeout(()=>window.td.keyevent({ tabId, keycode:kc, action:1, meta }), 30);
  }

  canvas.addEventListener('keydown', e => {
    // F1 → toggle writing/zone mode quickly
    if (e.key === 'F1') {
      e.preventDefault(); e.stopPropagation();
      setWritingMode(!isWriting(tabId), tabId);
      return;
    }

    // Escape = exit typing/writing mode for this tab
    if (e.key==='Escape' && !e.ctrlKey && !e.metaKey) {
      if (closeBtnAvailable(tabId)) return; // global handler taps the close button
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
    // If scrcpy buttons visible, bypass zones and send key to device
    const _scrcpyVis = scrcpyVisible(tabId);
    if (window.__btnDebug) {
      console.debug('[TabPilot] shortcut gate check:', { tabId, isDofus: _tabIsDofus(tabId), chatOpen: CHAT_OPEN.get(tabId), scrcpyVisible: _scrcpyVis, key: e.key });
    }
    if (_scrcpyVis) {
      if (AK[e.key] !== undefined) { sendKey(AK[e.key]); return; }
      const lk = e.key.toLowerCase();
      if (AK_L[lk] !== undefined) { sendKey(AK_L[lk], e.key !== lk); return; }
      if (AK_N[e.key] !== undefined) { sendKey(AK_N[e.key]); return; }
      if (e.key.length === 1) window.td.key({ tabId, text: e.key });
      return;
    }
    const zones = getZones(tabId);
    const npDigit = numpadDigit(e);
    // Safety net: ESC/Enter can no longer be ASSIGNED to a zone in Dofus
    // Touch (blocked in the key-capture dialog), but in case a zone from
    // before that restriction still has one bound, skip it here too so it
    // can never shadow the reserved close/open-chat tap behavior.
    const reservedInDofus = _tabIsDofus(tabId) && (e.key === 'Enter' || e.key === 'Escape');
    let zoneIdx = reservedInDofus ? -1 : zones.findIndex(z => z.key === e.key);
    if (zoneIdx === -1 && !reservedInDofus && npDigit !== undefined) zoneIdx = zones.findIndex(z => z.key === npDigit);
    if (zoneIdx !== -1) {
      const z = zones[zoneIdx];
      const pos = getZonePos(tabId, zoneIdx, z);
      const cx = Math.round(pos.rx * canvas.width);
      const cy = Math.round(pos.ry * canvas.height);
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

// Toggling the global "enable audio" setting in Settings now also mutes/
// unmutes ALL currently-running instances in real time, instead of only
// affecting instances launched afterwards. The underlying scrcpy audio
// stream keeps running either way (muting happens client-side via the
// GainNode), so this is instant and doesn\'t require restarting anything.
function setGlobalAudioEnabled(enabled) {
  state.settings.audio.enabled = enabled;
  saveSettings();
  state.tabs.forEach(tab => setTabMuted(tab.id, !enabled));
}

// ── Audio ─────────────────────────────────────────────────────────────────
const audioContexts = new Map(); // tabId → AudioContext
const audioDecoders = new Map(); // tabId → AudioDecoder
const audioGains    = new Map(); // tabId → GainNode (per-instance volume/mute control)
const TAB_VOLUME    = new Map(); // tabId → {volume:0-100, muted:bool} - in-memory cache for the running session

// Volume persists ACROSS APP RESTARTS keyed by device+package+userId (same
// identity scheme as zone shortcuts and nicknames), NOT by tabId - tabIds
// are randomly generated per-session and would never match between runs,
// so persisting by tabId would never actually survive a restart.
function volumeKey(tab) {
  return `vol:${tab.deviceId || ''}:${tab.pkg || ''}:${+tab.userId || 0}`;
}

function loadPersistedVolume(tab) {
  try {
    const raw = localStorage.getItem(volumeKey(tab));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.volume === 'number' && typeof parsed.muted === 'boolean') return parsed;
  } catch {}
  return null;
}

function savePersistedVolume(tab, v) {
  try { localStorage.setItem(volumeKey(tab), JSON.stringify({ volume: v.volume, muted: v.muted })); } catch {}
}

function getTabVolume(tabId) {
  if (!TAB_VOLUME.has(tabId)) {
    const tab = state.tabs.find(t => t.id === tabId);
    const persisted = tab ? loadPersistedVolume(tab) : null;
    TAB_VOLUME.set(tabId, persisted || { volume: state.settings.audio.volume ?? 80, muted: false });
  }
  return TAB_VOLUME.get(tabId);
}

// Applies the current volume/mute state to the live GainNode (if audio is
// active for this tab). Safe to call even if audio isn't initialized yet -
// the value just gets read from TAB_VOLUME next time initAudio runs.
// Uses setValueAtTime (scheduled on the audio clock) instead of a direct
// .value assignment, which is the more reliable way to change gain in Web
// Audio and avoids any chance of the change being silently dropped.
function applyTabVolume(tabId) {
  const gain = audioGains.get(tabId);
  if (!gain) return;
  const v = getTabVolume(tabId);
  const target = v.muted ? 0 : v.volume / 100;
  try {
    gain.gain.cancelScheduledValues(gain.context.currentTime);
    gain.gain.setValueAtTime(target, gain.context.currentTime);
  } catch {
    gain.gain.value = target; // fallback if context isn't in a state that allows scheduling
  }
}

function setTabVolume(tabId, volume) {
  const v = getTabVolume(tabId);
  v.volume = Math.max(0, Math.min(100, volume));
  const tab = state.tabs.find(t => t.id === tabId);
  if (tab) {
    savePersistedVolume(tab, v);
    // Audio runs in a separate OS-level scrcpy process (--no-video) that
    // plays back directly through the Windows mixer - it never passes
    // through the renderer's Web Audio stack. Control it via IPC to the
    // main process which calls the Windows Audio Session API by PID.
    window.td.setDeviceAudio({ deviceId: tab.deviceId, volume: v.volume, muted: v.muted }).catch(() => {});
  }
  console.debug('[TabPilot] setTabVolume', { tabId, volume: v.volume, muted: v.muted, deviceId: tab?.deviceId });
}

function setTabMuted(tabId, muted) {
  const v = getTabVolume(tabId);
  v.muted = muted;
  const tab = state.tabs.find(t => t.id === tabId);
  if (tab) {
    savePersistedVolume(tab, v);
    window.td.setDeviceAudio({ deviceId: tab.deviceId, volume: v.volume, muted: v.muted }).catch(() => {});
  }
  console.debug('[TabPilot] setTabMuted', { tabId, volume: v.volume, muted: v.muted, deviceId: tab?.deviceId });
}

function initAudio(tabId) {
  if (!('AudioDecoder' in window)) {
 return; }
  try {
    const ctx = new AudioContext({ sampleRate: 48000 });
    audioContexts.set(tabId, ctx);

    // Single persistent gain node this tab's audio always routes through -
    // lets us mute/adjust volume instantly without touching the decoder or
    // the underlying scrcpy audio stream (which keeps running regardless).
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    audioGains.set(tabId, gain);
    applyTabVolume(tabId);

    const dec = new AudioDecoder({
      output: audioData => {
        const ctx = audioContexts.get(tabId);
        const gainNode = audioGains.get(tabId);
        if (!ctx || !gainNode) { audioData.close(); return; }
        // If muted or at 0%, skip creating/starting a source entirely
        // instead of relying solely on the GainNode reaching zero - this is
        // a hard guarantee with no dependency on Web Audio's scheduling.
        const v = getTabVolume(tabId);
        if (v.muted || v.volume <= 0) { audioData.close(); return; }
        const numChannels = audioData.numberOfChannels;
        const numFrames   = audioData.numberOfFrames;
        const buf = ctx.createBuffer(numChannels, numFrames, audioData.sampleRate);
        for (let ch = 0; ch < numChannels; ch++) {
          audioData.copyTo(buf.getChannelData(ch), { planeIndex: ch });
        }
        audioData.close();
        // Keep the GainNode in sync too, for smooth volume changes between 1-100%
        applyTabVolume(tabId);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(gainNode);
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
  try { audioGains.get(tabId)?.disconnect(); } catch {}
  try { audioContexts.get(tabId)?.close(); } catch {}
  audioDecoders.delete(tabId);
  audioGains.delete(tabId);
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

// ── Scrcpy button detection ───────────────────────────────────────────────────
//
// Detection uses TWO independent checks per button, both derived from
// the actual pixel data of the reference PNGs:
//
// CLOSE (green X on yellow-green background)
//   Check 1 - Color:   G channel >> B channel  (G-B avg > 100)
//   Check 2 - Pattern: 8 sampled corners MUCH brighter than 8 X-diagonal
//             pixels (corner_avg - xdiag_avg > 120). The dark X shape
//             inside the bright background creates this contrast.
//
// CHAT (house icon on neutral gray background)
//   Check 1 - Color:   all channels roughly equal (|G-B| avg < 25)
//   Check 2 - Pattern: top half brighter than bottom half (> 20 pts),
//             AND center-top brighter than side-top (> 15 pts).
//             This is the house silhouette: roof peak at top-center,
//             dark base at bottom.
//
// Candidate positions are found by a fast color pre-filter (single pixel
// sample per grid cell), then the full structural check only runs on
// positions that passed the color filter. Zero async, zero canvas copies.

// Three distinct detections with three distinct purposes:
//   - CHAT (house icon, while chat is OPEN): gates zone shortcuts
//   - CLOSE (green X): tap target when ESC is pressed
//   - OPENCHAT (green chat-bubble, while chat is CLOSED): tap target when Enter is pressed
const CHAT_OPEN           = new Map(); // tabId -> bool (chat window visible)
const CLOSE_BTN_POSITIONS = new Map(); // tabId -> [{cx,cy}] (close X button positions)
const OPENCHAT_BTN_POSITIONS = new Map(); // tabId -> [{cx,cy}] (open-chat bubble positions)

// Button detection only runs for this app's instances — avoids false positives
// from other games' UI elements that happen to share similar colors.
const SCRCPY_DETECT_PKG = 'com.ankama.dofustouch';

function _tabIsDofus(tabId) {
  const tab = state.tabs.find(t => t.id === tabId);
  return tab && tab.pkg === SCRCPY_DETECT_PKG;
}

// Shortcuts are suspended only when the in-game chat is open, and only for
// Dofus Touch instances.
function scrcpyVisible(tabId) { return _tabIsDofus(tabId) && CHAT_OPEN.get(tabId) === true; }

// ESC should tap the green X close button whenever one is visible — this is
// independent of whether the chat window is open (e.g. dismissing a system
// dialog like "Conexion rechazada"). Only applies to Dofus Touch instances.
function closeBtnAvailable(tabId) {
  return _tabIsDofus(tabId) && (CLOSE_BTN_POSITIONS.get(tabId) || []).length > 0;
}

// Enter should tap the green open-chat bubble whenever it's visible AND the
// chat isn't already open (if it's open, Enter is for sending the typed
// message instead - we must not hijack it). Only applies to Dofus Touch.
function enterBtnAvailable(tabId) {
  return _tabIsDofus(tabId) && !scrcpyVisible(tabId) &&
    (OPENCHAT_BTN_POSITIONS.get(tabId) || []).length > 0;
}

// Sample one pixel from imageData at canvas coords (px, py)
function _px(data, fw, px, py) {
  const i = (py * fw + px) * 4;
  return { r: data[i], g: data[i+1], b: data[i+2] };
}

// Sample a relative position inside a bounding box.
// rx,ry in [0,1] maps to the box at (bx,by,bw,bh).
function _bpx(data, fw, bx, by, bw, bh, rx, ry) {
  return _px(data, fw,
    Math.round(bx + rx * (bw - 1)),
    Math.round(by + ry * (bh - 1)));
}

// CLOSE button structural check on a candidate box.
// Returns true if the box looks like the green-X button.
function _checkClose(data, fw, bx, by, bw, bh) {
  // Check 1: green dominates blue strongly across the box
  // Sample 6 spread points, average G-B
  const pts = [[0.1,0.1],[0.9,0.1],[0.1,0.9],[0.9,0.9],[0.5,0.0],[0.0,0.5]];
  let gbSum = 0;
  for (const [rx,ry] of pts) {
    const p = _bpx(data, fw, bx, by, bw, bh, rx, ry);
    gbSum += p.g - p.b;
  }
  if (gbSum / pts.length < 80) return false; // not green-dominant

  // Check 2: corners >> X-diagonals (bright background, dark X shape)
  // 4 corners
  const corners = [
    _bpx(data, fw, bx, by, bw, bh, 0.05, 0.05),
    _bpx(data, fw, bx, by, bw, bh, 0.95, 0.05),
    _bpx(data, fw, bx, by, bw, bh, 0.05, 0.90),
    _bpx(data, fw, bx, by, bw, bh, 0.95, 0.90),
  ];
  // 4 X-diagonal interior points (where the X arms cross)
  const xpts = [
    _bpx(data, fw, bx, by, bw, bh, 0.25, 0.25),
    _bpx(data, fw, bx, by, bw, bh, 0.75, 0.25),
    _bpx(data, fw, bx, by, bw, bh, 0.25, 0.75),
    _bpx(data, fw, bx, by, bw, bh, 0.75, 0.75),
  ];
  const cornerAvg = corners.reduce((s,p) => s + (p.r+p.g+p.b)/3, 0) / corners.length;
  const xAvg      = xpts.reduce((s,p)   => s + (p.r+p.g+p.b)/3, 0) / xpts.length;
  return (cornerAvg - xAvg) > 100;
}

// CHAT button structural check on a candidate box.
// Returns true if the box looks like the house/chat icon.
function _checkChat(data, fw, bx, by, bw, bh) {
  // Check 1: neutral gray (G and B channels close together)
  const pts = [[0.3,0.3],[0.7,0.3],[0.5,0.5],[0.3,0.7],[0.7,0.7]];
  let gbSum = 0, rgSum = 0;
  for (const [rx,ry] of pts) {
    const p = _bpx(data, fw, bx, by, bw, bh, rx, ry);
    gbSum += Math.abs(p.g - p.b);
    rgSum += Math.abs(p.r - p.g);
  }
  const gbAvg = gbSum / pts.length;
  const rgAvg = rgSum / pts.length;
  if (gbAvg > 30 || rgAvg > 30) return false; // not neutral gray

  // Check 2: top half brighter than bottom (house: light top, dark base)
  const topPts = [[0.2,0.15],[0.5,0.15],[0.8,0.15],[0.3,0.35],[0.7,0.35]];
  const botPts = [[0.2,0.75],[0.5,0.75],[0.8,0.75],[0.3,0.90],[0.7,0.90]];
  const topAvg = topPts.reduce((s,[rx,ry]) => { const p=_bpx(data,fw,bx,by,bw,bh,rx,ry); return s+(p.r+p.g+p.b)/3; }, 0) / topPts.length;
  const botAvg = botPts.reduce((s,[rx,ry]) => { const p=_bpx(data,fw,bx,by,bw,bh,rx,ry); return s+(p.r+p.g+p.b)/3; }, 0) / botPts.length;
  if (topAvg - botAvg < 20) return false; // top not brighter than bottom

  // Check 3: center-top brighter than sides (the roof peak)
  const centerTop = _bpx(data, fw, bx, by, bw, bh, 0.5, 0.25);
  const leftSide  = _bpx(data, fw, bx, by, bw, bh, 0.1, 0.25);
  const rightSide = _bpx(data, fw, bx, by, bw, bh, 0.9, 0.25);
  const cBright = (centerTop.r+centerTop.g+centerTop.b)/3;
  const sBright = ((leftSide.r+leftSide.g+leftSide.b) + (rightSide.r+rightSide.g+rightSide.b)) / 6;
  return (cBright - sBright) > 15;
}

// Sample a pixel directly by absolute canvas coords (no box context needed)
function _pxAt(data, fw, x, y) { return _px(data, fw, x, y); }

// CLOSE shape check given the ACTUAL bounding box of the detected green blob
// (not a guessed size) - much more reliable than fixed-size grid search.
function _verifyCloseBlob(data, fw, bx, by, bw, bh) {
  if (bw < 4 || bh < 4) return -1;
  // The real Close button is roughly square (reference PNG is 29x26, ratio ~1.12).
  // Large decorative banners (event art, etc) that share the same green-yellow
  // color are usually much wider/taller or oddly proportioned - reject those.
  const aspect = bw / bh;
  if (aspect < 0.75 || aspect > 1.5) return -1;

  // corners (background of the X icon) vs center cross (the dark X strokes)
  const corners = [
    _bpx(data, fw, bx, by, bw, bh, 0.08, 0.08),
    _bpx(data, fw, bx, by, bw, bh, 0.92, 0.08),
    _bpx(data, fw, bx, by, bw, bh, 0.08, 0.92),
    _bpx(data, fw, bx, by, bw, bh, 0.92, 0.92),
  ];
  const xpts = [
    _bpx(data, fw, bx, by, bw, bh, 0.5, 0.5),
    _bpx(data, fw, bx, by, bw, bh, 0.3, 0.3),
    _bpx(data, fw, bx, by, bw, bh, 0.7, 0.3),
    _bpx(data, fw, bx, by, bw, bh, 0.3, 0.7),
    _bpx(data, fw, bx, by, bw, bh, 0.7, 0.7),
  ];
  const cornerAvg = corners.reduce((s,p) => s + (p.r+p.g+p.b)/3, 0) / corners.length;
  const xAvg      = xpts.reduce((s,p)   => s + (p.r+p.g+p.b)/3, 0) / xpts.length;
  // Also confirm corners are actually green (background), not just bright
  const cornerGB = corners.reduce((s,p) => s + (p.g - p.b), 0) / corners.length;
  if (cornerGB <= 50) return -1;
  const contrast = cornerAvg - xAvg;

  // Decisive discriminator vs the Open-Chat bubble (which shares this same
  // color family): sample the horizontal mid-row NEAR THE EDGES (rx=0.15
  // and 0.85). The X's darkness is confined to its diagonal strokes near
  // the center, so these near-edge points must be BRIGHT (background). The
  // bubble icon instead has a dark band spanning the ENTIRE width at
  // certain rows, so those same near-edge points would be dark too. Without
  // this check, the bubble button was being misclassified as Close before
  // ever reaching the Open-Chat verifier, since it also passes the
  // corner/center contrast test above.
  const midRowLeft  = _bpx(data, fw, bx, by, bw, bh, 0.15, 0.5);
  const midRowRight = _bpx(data, fw, bx, by, bw, bh, 0.85, 0.5);
  const midEdgeAvg = ((midRowLeft.r+midRowLeft.g+midRowLeft.b)/3 + (midRowRight.r+midRowRight.g+midRowRight.b)/3) / 2;
  if (midEdgeAvg < 140) return -1; // edges of the X's row must be bright, not part of a dark band

  if (contrast <= 30) return -1;

  // Dead-center darkness check: the X's two diagonals physically CROSS at
  // the exact center, so that single point must be dark. A gear/settings
  // icon (same green-yellow rounded styling, similar corner/diagonal
  // contrast) instead has a hollow/bright center where its circular hub
  // sits, even though its teeth create dark samples at the 0.3/0.7
  // diagonal points just like an X would. This was causing the in-game
  // Settings gear button to be falsely detected as Close.
  const deadCenter = _bpx(data, fw, bx, by, bw, bh, 0.5, 0.5);
  const deadCenterBrightness = (deadCenter.r + deadCenter.g + deadCenter.b) / 3;
  if (deadCenterBrightness > 120) return -1;

  // The X icon's dark strokes should ALSO be fairly dark in absolute terms
  // (not just dark *relative* to the corners) - a vibrant banner full of
  // sparkle effects can have bright "X-point" samples too, just slightly
  // less bright than the corners, which would still pass the contrast test
  // above. Real X strokes are genuinely dark (background-level brightness).
  if (xAvg > 140) return -1;

  // Fill-density check: the real button is a solid green icon with the X cut
  // into it (~75-85% of its bbox is green when measured at coarse sampling).
  // A decorative banner with scattered sparkle/particle effects on a dark
  // background has much lower and patchier green coverage. Sample a small
  // grid across the whole bbox to estimate this.
  let greenHits = 0, sampled = 0;
  for (let gy = 0.1; gy <= 0.95; gy += 0.15) {
    for (let gx = 0.1; gx <= 0.95; gx += 0.15) {
      const p = _bpx(data, fw, bx, by, bw, bh, gx, gy);
      sampled++;
      if ((p.g - p.b) > 50 && p.g > 150) greenHits++;
    }
  }
  const fillRatio = greenHits / sampled;
  if (fillRatio < 0.5) return -1; // too sparse to be the solid button icon

  // Perimeter continuity check: the real button is a solid rounded-square
  // icon, so green pixels run CONTINUOUSLY all the way around its border.
  // Scattered sparkle/particle noise in a banner creates a blob shape with
  // gaps in its outline (the "blob" only forms because nearby sparkles
  // happened to connect via the density-based grow, not because there's an
  // actual solid edge). Sample points all around the perimeter and require
  // a high hit rate.
  const perimPts = [];
  for (let t = 0; t < 1; t += 0.08) {
    perimPts.push([t, 0.04]);   // top edge
    perimPts.push([t, 0.96]);   // bottom edge
    perimPts.push([0.04, t]);   // left edge
    perimPts.push([0.96, t]);   // right edge
  }
  let perimHits = 0;
  for (const [rx, ry] of perimPts) {
    const p = _bpx(data, fw, bx, by, bw, bh, rx, ry);
    if ((p.g - p.b) > 40 && p.g > 130) perimHits++;
  }
  const perimRatio = perimHits / perimPts.length;
  if (perimRatio < 0.85) return -1; // border isn't continuous enough to be a solid icon

  return contrast; // score = X-vs-background contrast strength
}

// OPEN-CHAT button (green chat-bubble icon, appears when the chat window is
// CLOSED - tapping it opens the chat). Same green-yellow color family as the
// Close X button, but wider aspect ratio (bubble shape ~1.4-1.7 vs the
// near-square Close icon ~0.75-1.5) and the dark interior is a rounded
// bubble silhouette rather than an X.
// OPEN-CHAT button (green chat-bubble icon, appears when the chat window is
// CLOSED - tapping it opens the chat).
//
// IMPORTANT: the bounding box this button occupies SCALES with resolution/
// DPI/UI scaling settings, so its overall aspect ratio is NOT reliable for
// detection (unlike the Close X button, which stays roughly square). What
// IS invariant across scales is the internal structural pattern: the
// bubble's "speech tail" renders as two small dark dots, symmetric left/
// right, positioned at roughly 28% down from the top and at ~38%/~68% of
// the width. We detect by checking for that two-dot signature directly,
// rather than by bounding-box shape.
function _verifyOpenChatBlob(data, fw, bx, by, bw, bh) {
  if (bw < 4 || bh < 4) return -1;

  // Real globito button measured from an isolated reference crop: 58x62,
  // aspect ~0.94 (nearly square, slightly taller than wide).
  const aspect = bw / bh;
  if (aspect < 0.7 || aspect > 1.25) return -1;

  // Background (corners) must match the button's exact yellow-green color
  // family - same strict test as the pre-filter, not a generic "greenish"
  // check. This alone rejects most random scenery.
  const isBtnGreen = (p) => p.g > 200 && (p.g - p.b) > 80 && (p.r - p.b) > 70 && p.r > 150;

  const corners = [
    _bpx(data, fw, bx, by, bw, bh, 0.05, 0.05),
    _bpx(data, fw, bx, by, bw, bh, 0.95, 0.05),
    _bpx(data, fw, bx, by, bw, bh, 0.05, 0.95),
    _bpx(data, fw, bx, by, bw, bh, 0.95, 0.95),
  ];
  let cornerGreenHits = 0;
  for (const p of corners) if (isBtnGreen(p)) cornerGreenHits++;
  if (cornerGreenHits < 3) return -1;

  function rowAvgBrightness(ry) {
    return [0.2, 0.4, 0.6, 0.8].reduce((s, rx) => {
      const p = _bpx(data, fw, bx, by, bw, bh, rx, ry);
      return s + (p.r+p.g+p.b)/3;
    }, 0) / 4;
  }

  const topEdge = rowAvgBrightness(0.02);
  const botEdge = rowAvgBrightness(0.98);
  // Both edges must be bright (the button's plain background color)
  if (topEdge < 155 || botEdge < 155) return -1;
  const edgeAvg = (topEdge + botEdge) / 2;

  // The KEY discriminator vs the Close X: the bubble icon has dark bands
  // spanning the FULL WIDTH at certain heights (the bubble outline/tail),
  // whereas Close's darkness is confined to a narrow diagonal cross near
  // the center. We verify full-width darkness by sampling near BOTH edges
  // (rx=0.1 and rx=0.9) at the same row - if only the center were dark
  // (like an X), these near-edge points would still be bright.
  function fullWidthDark(ry) {
    const left  = _bpx(data, fw, bx, by, bw, bh, 0.12, ry);
    const right = _bpx(data, fw, bx, by, bw, bh, 0.88, ry);
    const mid   = _bpx(data, fw, bx, by, bw, bh, 0.5,  ry);
    const lb = (left.r+left.g+left.b)/3, rb = (right.r+right.g+right.b)/3, mb = (mid.r+mid.g+mid.b)/3;
    return { lb, rb, mb, avg: (lb+rb+mb)/3 };
  }

  // Check the upper dark band (~ry 0.08-0.12, the bubble's top outline)
  const upper = fullWidthDark(0.10);
  // Check the lower dark band (~ry 0.55-0.70, the bubble body/tail)
  const lower = fullWidthDark(0.60);

  // Both bands must be dark ACROSS THE FULL WIDTH (all 3 sample points),
  // not just at the center - this is what Close's X would fail.
  const upperOk = upper.lb < 140 && upper.rb < 140 && upper.mb < 140;
  const lowerOk = lower.lb < 140 && lower.rb < 140 && lower.mb < 140;
  if (!upperOk && !lowerOk) return -1; // need at least one genuine full-width dark band

  const bestBandAvg = Math.min(upper.avg, lower.avg);
  const contrast = edgeAvg - bestBandAvg;
  if (contrast < 40) return -1;

  return contrast; // score
}

// CHAT shape check given the ACTUAL bounding box of the detected gray blob.
function _verifyChatBlob(data, fw, bx, by, bw, bh) {
  if (bw < 4 || bh < 4) return false;
  const aspect = bw / bh;
  if (aspect < 0.85 || aspect > 1.6) return false;
  const center = _bpx(data, fw, bx, by, bw, bh, 0.5, 0.5);
  if (center.b - center.r > 8) return false;
  const centerSat = Math.max(center.r,center.g,center.b) - Math.min(center.r,center.g,center.b);
  if (centerSat > 40) return false;
  const checkPts = [[0.2,0.2],[0.8,0.2],[0.5,0.5],[0.2,0.8],[0.8,0.8]];
  for (const [rx,ry] of checkPts) {
    const p = _bpx(data, fw, bx, by, bw, bh, rx, ry);
    if (Math.max(p.r,p.g,p.b) - Math.min(p.r,p.g,p.b) > 35) return false;
  }
  const topAvg = [[0.2,0.15],[0.5,0.15],[0.8,0.15]]
    .reduce((s,[rx,ry]) => { const p=_bpx(data,fw,bx,by,bw,bh,rx,ry); return s+(p.r+p.g+p.b)/3; }, 0) / 3;
  const botAvg = [[0.2,0.85],[0.5,0.85],[0.8,0.85]]
    .reduce((s,[rx,ry]) => { const p=_bpx(data,fw,bx,by,bw,bh,rx,ry); return s+(p.r+p.g+p.b)/3; }, 0) / 3;
  if ((topAvg - botAvg) <= 25) return false;
  const centerTop = _bpx(data, fw, bx, by, bw, bh, 0.5, 0.28);
  const leftTop   = _bpx(data, fw, bx, by, bw, bh, 0.15, 0.28);
  const rightTop  = _bpx(data, fw, bx, by, bw, bh, 0.85, 0.28);
  const cB = (centerTop.r+centerTop.g+centerTop.b)/3;
  const lB = (leftTop.r+leftTop.g+leftTop.b)/3;
  const rB = (rightTop.r+rightTop.g+rightTop.b)/3;
  if ((cB - lB) < 40 || (cB - rB) < 40) return false;

  return true;
}

// Flood-fill style blob finder: starting from a seed pixel that matched the
// color pre-filter, grow a bounding box by scanning outward in 4 directions
// until the color condition stops matching. This finds the ACTUAL size and
// position of the button regardless of where on the grid we first sampled it,
// which is what makes detection reliable instead of "occasionally working".
// Grows a bounding box from a seed pixel using ROW/COLUMN density scanning
// instead of single-pixel-line tracing. This is critical because the button
// icons (X strokes, house shape) cut through the middle of the colored blob -
// if growth only follows a single center row/column, it hits a dark icon
// stroke almost immediately and stops, producing a tiny/wrong bounding box.
// Density scanning checks what FRACTION of pixels in each row/column match
// the color test, tolerating icon strokes that only occupy part of the line.
function _growBlob(data, fw, fh, seedX, seedY, colorTest, maxSize) {
  const MIN_DENSITY = 0.35; // a row/col counts as "still in the blob" if >=35% of its pixels match

  function rowDensity(y, x0, x1) {
    let hits = 0, total = 0;
    for (let x = x0; x <= x1; x += 2) {
      total++;
      if (colorTest(_pxAt(data, fw, x, y))) hits++;
    }
    return total > 0 ? hits / total : 0;
  }
  function colDensity(x, y0, y1) {
    let hits = 0, total = 0;
    for (let y = y0; y <= y1; y += 2) {
      total++;
      if (colorTest(_pxAt(data, fw, x, y))) hits++;
    }
    return total > 0 ? hits / total : 0;
  }

  // First, find horizontal extent at the seed row (single-line is fine here
  // since we immediately refine with full density checks below)
  let left = seedX, right = seedX;
  while (right < fw - 1 && right - seedX < maxSize && colorTest(_pxAt(data, fw, right + 1, seedY))) right++;
  while (left > 0 && seedX - left < maxSize && colorTest(_pxAt(data, fw, left - 1, seedY))) left--;

  let top = seedY, bottom = seedY;
  while (bottom < fh - 1 && bottom - seedY < maxSize && colorTest(_pxAt(data, fw, seedX, bottom + 1))) bottom++;
  while (top > 0 && seedY - top < maxSize && colorTest(_pxAt(data, fw, seedX, top - 1))) top--;

  // Now expand all 4 sides using density (tolerates icon strokes mid-line)
  // Expand bottom
  while (bottom < fh - 1 && bottom - top < maxSize) {
    if (rowDensity(bottom + 1, left, right) < MIN_DENSITY) break;
    bottom++;
  }
  // Expand top
  while (top > 0 && bottom - top < maxSize) {
    if (rowDensity(top - 1, left, right) < MIN_DENSITY) break;
    top--;
  }
  // Expand right (using refined top/bottom)
  while (right < fw - 1 && right - left < maxSize) {
    if (colDensity(right + 1, top, bottom) < MIN_DENSITY) break;
    right++;
  }
  // Expand left
  while (left > 0 && right - left < maxSize) {
    if (colDensity(left - 1, top, bottom) < MIN_DENSITY) break;
    left--;
  }

  return { bx: left, by: top, bw: right - left + 1, bh: bottom - top + 1 };
}

// Like _growBlob but works in region-local coords (lx,ly) and returns
// bbox in global canvas coords by adding the region offset (ox,oy).
function _detectBtns(tabId) {
  if (!_tabIsDofus(tabId)) return [];
  const cv = $('canvas-' + tabId);
  if (!cv || cv.width === 0 || cv.height === 0) return [];
  const cw = cv.width, ch = cv.height;
  // Downsample to 256px wide before reading pixels - reduces getImageData
  // from ~3.5MB (1280x720) to ~150KB (256x144), eliminating the main-thread
  // stutter. Buttons are 3-6% of canvas height so they're still 7-15px tall
  // at this resolution, which is enough to detect reliably.
  // Fixed scan height of 480px (never upscale) - ensures buttons are
  // large enough for structural checks across all resolution/DPI presets.
  const SCAN_H = Math.min(ch, 480);
  const SCAN_W = Math.round(cw * SCAN_H / ch);
  const offscreen = document.createElement('canvas');
  offscreen.width = SCAN_W; offscreen.height = SCAN_H;
  const offCtx = offscreen.getContext('2d');
  offCtx.drawImage(cv, 0, 0, SCAN_W, SCAN_H);
  let data;
  try { data = offCtx.getImageData(0, 0, SCAN_W, SCAN_H).data; } catch { return []; }
  const fw = SCAN_W, fh = SCAN_H;
  // Scale factor to convert scan coords back to real canvas coords for tapping
  const scaleX = cw / SCAN_W, scaleY = ch / SCAN_H;

  const results = [];
  const maxBlobSize      = Math.round(fh * 0.06);
  const maxGreenBlobSize = Math.round(fh * 0.09);
  const minBlobSize      = Math.round(fh * 0.015);
  const isGreen = (p) => p.g > 200 && (p.g - p.b) > 80 && (p.r - p.b) > 70 && p.r > 150;
  const isGray  = (p) => Math.abs(p.g - p.b) < 20 && Math.abs(p.r - p.g) < 20 && (p.r - p.b) > -10 && p.r > 60 && p.r < 180;

  const claimed = [];
  const isClaimed = (x, y) => claimed.some(b => x >= b.bx && x <= b.bx+b.bw && y >= b.by && y <= b.by+b.bh);

  for (let y = 0; y < fh; y += 3) {
    for (let x = 0; x < fw; x += 3) {
      if (isClaimed(x, y)) continue;
      const p = _pxAt(data, fw, x, y);

      if (isGreen(p)) {
        const blob = _growBlob(data, fw, fh, x, y, isGreen, maxGreenBlobSize);
        const truncated = blob.bw >= maxGreenBlobSize || blob.bh >= maxGreenBlobSize;
        if (!truncated && blob.bw >= minBlobSize && blob.bh >= minBlobSize) {
          // Scale center coords back to real canvas for tapping
          const rcx = Math.round((blob.bx + blob.bw/2) * scaleX);
          const rcy = Math.round((blob.by + blob.bh/2) * scaleY);
          const closeScore = _verifyCloseBlob(data, fw, blob.bx, blob.by, blob.bw, blob.bh);
          if (closeScore >= 0) {
            results.push({ cx: rcx, cy: rcy, name: 'close', score: closeScore });
            claimed.push(blob); continue;
          }
          const chatScore = _verifyOpenChatBlob(data, fw, blob.bx, blob.by, blob.bw, blob.bh);
          if (chatScore >= 0) {
            results.push({ cx: rcx, cy: rcy, name: 'openchat', score: chatScore });
            claimed.push(blob); continue;
          }
        }
      }

      if (isGray(p)) {
        const blob = _growBlob(data, fw, fh, x, y, isGray, maxBlobSize);
        if (blob.bw >= minBlobSize && blob.bh >= minBlobSize && blob.bw <= maxBlobSize && blob.bh <= maxBlobSize) {
          const rcx = Math.round((blob.bx + blob.bw/2) * scaleX);
          const rcy = Math.round((blob.by + blob.bh/2) * scaleY);
          if (_verifyChatBlob(data, fw, blob.bx, blob.by, blob.bw, blob.bh)) {
            results.push({ cx: rcx, cy: rcy, name: 'chat',
              bx: Math.round(blob.bx*scaleX), by: Math.round(blob.by*scaleY),
              bw: Math.round(blob.bw*scaleX), bh: Math.round(blob.bh*scaleY) });
            claimed.push(blob); continue;
          }
        }
      }
    }
  }
  return results;
}

let _btnPollRunning = false;
let _btnWorker = null;
let _btnWorkerBusy = false;

function _getBtnWorker() {
  if (!_btnWorker) {
    _btnWorker = new Worker('btn-detector.worker.js');
  }
  return _btnWorker;
}

function startBtnPolling() {
  if (_btnPollRunning) return;
  _btnPollRunning = true;
  function poll() {
    const tabId = state.activeTab;
    if (tabId) {
      const cv = $('canvas-' + tabId);
      if (cv && cv.style.display !== 'none' && cv.width > 0 && _tabIsDofus(tabId)) {
        if (!_btnWorkerBusy) {
          try {
            const cw = cv.width, ch = cv.height;
            const SCAN_H = Math.min(ch, 480);
            const SCAN_W = Math.round(cw * SCAN_H / ch);
            const scaleX = cw / SCAN_W, scaleY = ch / SCAN_H;
            _btnWorkerBusy = true;
            // createImageBitmap is async and doesn't block the main thread
            // The worker receives the bitmap and does its own pixel reading
            createImageBitmap(cv, { resizeWidth: SCAN_W, resizeHeight: SCAN_H })
              .then(bitmap => {
                const worker = _getBtnWorker();
                worker.onmessage = (e) => {
                  _btnWorkerBusy = false;
                  const found = e.data.results;
                  const closePositions    = found.filter(b => b.name === 'close').map(({cx,cy}) => ({cx,cy}));
                  const openChatPositions = found.filter(b => b.name === 'openchat').map(({cx,cy}) => ({cx,cy}));
                  // Chat is open when the Close (X) button is visible.
                  // The X button detection already works reliably across all
                  // resolutions/DPI - no need for separate gray icon detection.
                  const chatFound = closePositions.length > 0;
                  if (window.__btnDebug) {
                    console.debug(`[TabPilot] poll: chatFound=${chatFound} close=${closePositions.length} openchat=${openChatPositions.length}`,
                      chatFound ? found.filter(b=>b.name==='chat').map(b=>`(${b.bx},${b.by}) ${b.bw}x${b.bh}`) : '');
                  }
                  CLOSE_BTN_POSITIONS.set(tabId, closePositions);
                  OPENCHAT_BTN_POSITIONS.set(tabId, openChatPositions);
                  CHAT_OPEN.set(tabId, chatFound);
                  if (chatFound) {
                    setWritingMode(true, tabId);
                  } else {
                    setWritingMode(false, tabId);
                    focusActiveCanvas();
                  }
                  if (window.__btnDebug) {
                    _drawBtnDebugOverlay(tabId, cv, found);
                  }
                };
                worker.onerror = () => { _btnWorkerBusy = false; CHAT_OPEN.set(tabId, false); };
                // Transfer bitmap to worker (zero-copy)
                worker.postMessage({ bitmap, fw: SCAN_W, fh: SCAN_H, scaleX, scaleY }, [bitmap]);
              })
              .catch(() => { _btnWorkerBusy = false; CHAT_OPEN.set(tabId, false); });
          } catch { CHAT_OPEN.set(tabId, false); }
        }
      } else {
        CHAT_OPEN.set(tabId, false);
        OPENCHAT_BTN_POSITIONS.set(tabId, []);
      }
    }
    state.tabs.forEach(t => { if (t.id !== tabId) CHAT_OPEN.set(t.id, false); });
    setTimeout(poll, 300);
  }
  setTimeout(poll, 300);
}

// DEBUG TOOL: draws colored boxes over every detected blob so we can see
// exactly what's matching. Enable from DevTools console with:
//   window.__btnDebug = true
// Red box = 'close' match (with score), Blue box = 'chat' match.
// Disable with: window.__btnDebug = false
function _drawBtnDebugOverlay(tabId, gameCanvas, found) {
  let dbg = document.getElementById('btn-debug-' + tabId);
  if (!dbg) {
    dbg = document.createElement('canvas');
    dbg.id = 'btn-debug-' + tabId;
    dbg.style.position = 'absolute';
    dbg.style.pointerEvents = 'none';
    dbg.style.zIndex = '9999';
    gameCanvas.parentElement.style.position = gameCanvas.parentElement.style.position || 'relative';
    gameCanvas.parentElement.appendChild(dbg);
  }
  // Match the overlay to the game canvas's displayed size/position
  const rect = gameCanvas.getBoundingClientRect();
  const parentRect = gameCanvas.parentElement.getBoundingClientRect();
  dbg.style.left = (rect.left - parentRect.left) + 'px';
  dbg.style.top = (rect.top - parentRect.top) + 'px';
  dbg.style.width = rect.width + 'px';
  dbg.style.height = rect.height + 'px';
  dbg.width = gameCanvas.width;
  dbg.height = gameCanvas.height;

  const ctx = dbg.getContext('2d');
  ctx.clearRect(0, 0, dbg.width, dbg.height);
  ctx.font = '16px monospace';
  ctx.lineWidth = 3;

  found.forEach(b => {
    let color, label;
    if (b.name === 'close') { color = 'red'; label = `close(${b.score?.toFixed(0) ?? '?'})`; }
    else if (b.name === 'openchat') { color = 'lime'; label = `openchat(${b.score?.toFixed(0) ?? '?'})`; }
    else { color = 'blue'; label = 'chat'; }
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    const sz = 24; // approximate marker size since we only have center point
    ctx.strokeRect(b.cx - sz/2, b.cy - sz/2, sz, sz);
    ctx.fillText(label, b.cx - sz/2, b.cy - sz/2 - 6);
  });
}

// Taps the green X close button(s). Only valid for Dofus Touch instances —
// callers must already have confirmed closeBtnAvailable()/tab package before
// invoking this, but we double-check here as a safety net.
function tapScrcpyBtns(tabId) {
  if (!_tabIsDofus(tabId)) return;
  const cv = $('canvas-' + tabId);
  if (!cv) return;
  (CLOSE_BTN_POSITIONS.get(tabId) || []).forEach(({ cx, cy }, i) =>
    setTimeout(() => window.td.tap({ tabId, x: cx, y: cy, width: cv.width, height: cv.height }), i * 80)
  );
}

// Taps the green open-chat bubble(s). Mirrors tapScrcpyBtns but for the
// Enter-key shortcut. Callers must already have confirmed
// enterBtnAvailable() before invoking this.
function tapOpenChatBtn(tabId) {
  if (!_tabIsDofus(tabId)) return;
  const cv = $('canvas-' + tabId);
  if (!cv) return;
  (OPENCHAT_BTN_POSITIONS.get(tabId) || []).forEach(({ cx, cy }, i) =>
    setTimeout(() => window.td.tap({ tabId, x: cx, y: cy, width: cv.width, height: cv.height }), i * 80)
  );
}
// ─────────────────────────────────────────────────────────────────────────

// ── IME detection ─────────────────────────────────────────────────────────
// Simple: IME open → Write mode for active tab
//         IME close → Zones mode for active tab (tab switch already closed it)

// ── Record system ──────────────────────────────────────────────────────────
let RECORDS = [];
const RECORD_TIMERS = new Map();

function loadRecords() {
  try { RECORDS = JSON.parse(localStorage.getItem('tabpilot:records') || '[]'); } catch { RECORDS = []; }
}
function saveRecords() { try { localStorage.setItem('tabpilot:records', JSON.stringify(RECORDS)); } catch {} }
loadRecords();

function defaultRecordSettings() {
  return { mode: 'repeat', repeatCount: 1, durationHH: 0, durationMM: 0, durationSS: 0, intervalMin: 0, intervalSec: 5, speed: 1 };
}

function updateRecordStatus() {
  const el = $('macro-status-pill');
  if (!el) return;
  const active = RECORDS.filter(r => r.enabledAll || r.enabledTabs?.some(id => state.tabs.find(t2 => t2.id === id)));
  if (active.length > 0) {
    el.classList.remove('hidden');
    el.textContent = `⚡ ${active.length === 1 ? active[0].name + ' ' + t('activityActiveOne') : active.length + ' ' + t('activityActive')}`;
  } else {
    el.classList.add('hidden');
  }
}

// Legacy stub so old references don't crash
function getMacro() { return null; }
function loadMacro() {}
function stopMacroTimer() {}

// ── Recording state ────────────────────────────────────────────────────────
let _recording = null;
let _recordingLockTabId = null; // tabId being recorded - blocks tab switch/close/restart while set
let _broadcastMode = false; // when true, all canvas clicks propagate to all active instances
let _recTimerInterval = null;
let _recElapsed = 0;

function startRecording(tabId) {
  _recording = { taps: [], startTime: Date.now(), pausedAt: null, pausedDuration: 0, tabId };
}
function pauseRecording() {
  if (!_recording || _recording.pausedAt) return;
  _recording.pausedAt = Date.now();
}
function resumeRecording() {
  if (!_recording || !_recording.pausedAt) return;
  _recording.pausedDuration += Date.now() - _recording.pausedAt;
  _recording.pausedAt = null;
}
function recordTapForRecord(tabId, x, y, w, h) {
  if (!_recording || _recording.tabId !== tabId || _recording.pausedAt) return;
  const elapsed = Date.now() - _recording.startTime - _recording.pausedDuration;
  _recording.taps.push({ x, y, w, h, delay: elapsed });
}
function stopRecordingSession() {
  const rec = _recording;
  _recording = null;
  return rec;
}

// ── Playback ───────────────────────────────────────────────────────────────
function playRecord(record, tabIds) {
  const taps = record.taps;
  if (!taps || taps.length === 0) return;
  const settings = record.settings || defaultRecordSettings();
  const speed = settings.speed || 1;
  const totalDuration = taps[taps.length - 1].delay / speed;
  const intervalMs = ((settings.intervalMin || 0) * 60 + (settings.intervalSec || 5)) * 1000;

  const executeTaps = (tabId) => {
    taps.forEach((tap, i) => {
      const delay = i === 0 ? 0 : (tap.delay - taps[i-1].delay) / speed;
      setTimeout(() => {
        window.td.tap({ tabId, x: tap.x, y: tap.y, width: tap.w, height: tap.h });
      }, delay);
    });
  };

  const runOnce = () => tabIds.forEach(executeTaps);
  stopRecord(record.id);

  if (settings.mode === 'infinite') {
    runOnce();
    const id = setInterval(runOnce, totalDuration + intervalMs);
    RECORD_TIMERS.set(record.id, { intervalId: id });
  } else if (settings.mode === 'duration') {
    const endTime = Date.now() + ((settings.durationHH||0)*3600 + (settings.durationMM||0)*60 + (settings.durationSS||0)) * 1000;
    runOnce();
    const id = setInterval(() => {
      if (Date.now() >= endTime) { stopRecord(record.id); updateRecordStatus(); if(state.panel==='macro') buildRecordPanel(); return; }
      runOnce();
    }, totalDuration + intervalMs);
    RECORD_TIMERS.set(record.id, { intervalId: id });
  } else {
    let count = 0;
    const total = settings.repeatCount || 1;
    runOnce(); count++;
    if (count >= total) return;
    const id = setInterval(() => {
      runOnce(); count++;
      if (count >= total) { stopRecord(record.id); updateRecordStatus(); if(state.panel==='macro') buildRecordPanel(); }
    }, totalDuration + intervalMs);
    RECORD_TIMERS.set(record.id, { intervalId: id });
  }
}

function stopRecord(recordId) {
  const t = RECORD_TIMERS.get(recordId);
  if (t) { clearInterval(t.intervalId); RECORD_TIMERS.delete(recordId); }
}

function setRecordEnabled(record, tabId, enabled) {
  if (!record.enabledTabs) record.enabledTabs = [];
  if (enabled) {
    if (!record.enabledTabs.includes(tabId)) record.enabledTabs.push(tabId);
    record.enabledAll = false;
  } else {
    record.enabledTabs = record.enabledTabs.filter(id => id !== tabId);
    if (RECORD_TIMERS.has(record.id)) stopRecord(record.id);
  }
  saveRecords(); updateRecordStatus();
  if (state.panel === 'macro') buildRecordPanel();
}

function setRecordEnabledAll(record, enabled) {
  record.enabledAll = enabled;
  record.enabledTabs = [];
  if (!enabled && RECORD_TIMERS.has(record.id)) stopRecord(record.id);
  saveRecords(); updateRecordStatus();
  if (state.panel === 'macro') buildRecordPanel();
}

function playRecordFromPanel(record) {
  const tabIds = record.enabledAll
    ? state.tabs.map(t => t.id)
    : (record.enabledTabs || []);
  if (tabIds.length === 0) return;
  playRecord(record, tabIds);
  if (state.panel === 'macro') buildRecordPanel();
}

function stopRecordFromPanel(record) {
  stopRecord(record.id);
  if (state.panel === 'macro') buildRecordPanel();
}

// Disables (visually + functionally) all controls that shouldn't be touched
// while a recording is in progress: the entire left nav bar (+, Shortcuts,
// Record, Settings, Help, Report a bug, About), Discord, language picker,
// tab switching, and per-tab close/restart buttons. Re-enables everything
// when recording stops.
function setRecordingUiLock(locked, tabId) {
  _recordingLockTabId = locked ? tabId : null;

  const ids = ['topbar-left', 'btn-discord', 'lang-picker-wrap'];
  ids.forEach(id => {
    const el = $(id);
    if (el) el.classList.toggle('recording-disabled', locked);
  });

  // Disable switching to / closing / restarting ANY tab while recording -
  // not just the one being recorded, since the user shouldn't navigate away.
  document.querySelectorAll('.tab').forEach(tabEl => {
    tabEl.classList.toggle('recording-disabled', locked);
  });
}

function showRecordingOverlay(tabId) {
  removeRecordingOverlay();
  const bar = $('rec-topbar');
  if (bar) bar.style.display = 'flex';
  setRecordingUiLock(true, tabId);

  $('rec-pause-btn').onclick = () => {
    if (_recording?.pausedAt) {
      resumeRecording();
      $('rec-pause-btn').textContent = '⏸';
      $('rec-dot').style.background = '#e05c5c';
    } else {
      pauseRecording();
      $('rec-pause-btn').textContent = '▶';
      $('rec-dot').style.background = '#888';
    }
  };

  $('rec-stop-btn').onclick = () => {
    clearInterval(_recTimerInterval); _recTimerInterval = null;
    const rec = stopRecordingSession();
    removeRecordingOverlay();
    if (rec && rec.taps.length > 0) {
      const recName = 'Record '+(RECORDS.length+1);
      RECORDS.push({ id:'rec-'+Date.now(), name: recName, taps:rec.taps, settings:defaultRecordSettings(), enabledAll:false, enabledTabs:[] });
      saveRecords();
      notify('Recording saved', `${recName} — ${rec.taps.length} taps`, 'success');
    }
    // Re-open the Record panel
    openPanelWith('macro', t('record'), '', buildRecordPanel);
  };

  _recTimerInterval = setInterval(() => {
    if (!_recording || _recording.pausedAt) return;
    _recElapsed = Date.now() - _recording.startTime - _recording.pausedDuration;
    const m = Math.floor(_recElapsed/60000), s = Math.floor((_recElapsed%60000)/1000), ds = Math.floor((_recElapsed%1000)/100);
    const te = $('rec-timer'); if (te) te.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${ds}`;
    const tc = $('rec-tap-count'); if (tc) tc.textContent = `${_recording?.taps.length||0} taps`;
  }, 100);
}

function removeRecordingOverlay() {
  clearInterval(_recTimerInterval); _recTimerInterval = null;
  const bar = $('rec-topbar');
  if (bar) { bar.style.display = 'none'; }
  const timer = $('rec-timer'); if (timer) timer.textContent = '00:00.0';
  const taps = $('rec-tap-count'); if (taps) taps.textContent = '0 taps';
  const dot = $('rec-dot'); if (dot) dot.style.background = '#e05c5c';
  const pb = $('rec-pause-btn'); if (pb) pb.textContent = '⏸';
  setRecordingUiLock(false, null);
}

function buildRecordPanel() {
  if (state.panel !== 'macro') return;
  const activeTab = state.tabs.find(t => t.id === state.activeTab);

  panelBody.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="flex:1;overflow-y:auto;padding:8px 14px;min-height:0">
        ${RECORDS.length === 0
          ? `<div style="font-size:14px;color:var(--t3);padding:12px 0">${t('noRecords')}</div>`
          : RECORDS.map(r => {
              const isThisEnabled = !!(activeTab && r.enabledTabs?.includes(activeTab.id));
              const isAllEnabled = !!r.enabledAll;
              const isPlaying = RECORD_TIMERS.has(r.id);
              const hasTarget = isThisEnabled || isAllEnabled;
              const dur = ((r.taps?.[r.taps.length-1]?.delay||0)/1000).toFixed(1);
              return `<div style="background:var(--elev);border:1px solid var(--bd);border-radius:10px;padding:10px 12px;margin-bottom:8px">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                  <input class="rec-name-inp" data-rid="${r.id}" value="${r.name}" style="flex:1;background:transparent;border:none;border-bottom:1px solid var(--bd);color:var(--t1);font-size:14px;font-weight:600;padding:2px 4px;outline:none">
                  <button class="btn-sm rec-settings-btn" data-rid="${r.id}" title="${t('recSettings')}" style="padding:3px 7px">\u2699</button>
                  <button class="btn-sm rec-del-btn" data-rid="${r.id}" title="Delete" style="padding:3px 7px;color:#e05c5c">\✕</button>
                </div>
                <div style="font-size:13px;color:var(--t3);margin-bottom:8px">${r.taps?.length||0} ${t('taps')} · ${dur}s</div>
                <div class="srow" style="padding:0;margin-bottom:4px">
                  <span class="slbl" style="font-size:13px">${t('thisInstance')}</span>
                  ${tog('rec-tog-single-'+r.id, isThisEnabled)}
                </div>
                <div class="srow" style="padding:0;margin-bottom:${hasTarget?'8px':'0'}">
                  <span class="slbl" style="font-size:13px">${t('allInstances')}</span>
                  ${tog('rec-tog-all-'+r.id, isAllEnabled)}
                </div>
                ${hasTarget ? `
                <button class="btn-sm rec-play-btn" data-rid="${r.id}"
                  style="width:100%;padding:7px;font-size:13px;font-weight:600;
                    background:${isPlaying?'#5c2020':'var(--acc)'};
                    color:#fff;border-color:${isPlaying?'#7a2a2a':'var(--acc)'}">
                  ${isPlaying ? '\u23f9 Stop' : '\u25b6 Play'}
                </button>` : ''}
              </div>`;
            }).join('')}
      </div>
      <div style="padding:10px 14px;border-top:1px solid var(--bd);display:flex;gap:6px">
        <button id="rec-start-btn" class="btn-sm" style="flex:1;padding:10px;background:var(--acc);color:#fff;border-color:var(--acc)">${t('recordBtn')}</button>
        <button id="rec-close-btn" class="btn-sm" style="padding:10px 16px">${t('close')}</button>
      </div>
    </div>`;

  panelBody.querySelectorAll('.rec-name-inp').forEach(inp => {
    inp.onchange = () => { const r=RECORDS.find(r=>r.id===inp.dataset.rid); if(r){r.name=inp.value.trim()||r.name;saveRecords();updateRecordStatus();} };
    inp.onkeydown = e => e.stopPropagation();
  });
  panelBody.querySelectorAll('.rec-del-btn').forEach(btn => {
    btn.onclick = () => { stopRecord(btn.dataset.rid); RECORDS=RECORDS.filter(r=>r.id!==btn.dataset.rid); saveRecords(); updateRecordStatus(); buildRecordPanel(); };
  });
  panelBody.querySelectorAll('.rec-settings-btn').forEach(btn => {
    btn.onclick = () => showRecordSettings(btn.dataset.rid);
  });
  RECORDS.forEach(rec => {
    const ts=$('rec-tog-single-'+rec.id); if(ts) ts.onchange=e=>setRecordEnabled(rec,activeTab?.id,e.target.checked);
    const ta=$('rec-tog-all-'+rec.id);   if(ta) ta.onchange=e=>setRecordEnabledAll(rec,e.target.checked);
  });
  panelBody.querySelectorAll('.rec-play-btn').forEach(btn => {
    btn.onclick = () => {
      const rec = RECORDS.find(r => r.id === btn.dataset.rid);
      if (!rec) return;
      if (RECORD_TIMERS.has(rec.id)) stopRecordFromPanel(rec);
      else playRecordFromPanel(rec);
    };
  });

  $('rec-start-btn')?.addEventListener('click', () => {
    if (!activeTab) return;
    startRecording(activeTab.id);
    _recElapsed = 0;
    closePanel(); // hide panel during recording
    showRecordingOverlay(activeTab.id);
  });

  $('rec-close-btn')?.addEventListener('click', () => closePanel());
}

function showRecordSettings(recordId) {
  const rec=RECORDS.find(r=>r.id===recordId); if(!rec) return;
  const s=rec.settings||defaultRecordSettings();
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
  ov.innerHTML=`<div style="background:var(--surf);border:1px solid var(--bd2);border-radius:14px;padding:24px 28px;width:380px;display:flex;flex-direction:column;gap:14px">
    <div style="font-size:16px;font-weight:700;color:var(--t1)">${t('recSettings')}</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--t1);cursor:pointer">
        <input type="radio" name="rm" value="repeat" ${s.mode==='repeat'?'checked':''} style="accent-color:var(--acc)">
        ${t('repeatAction')}
        <input id="rs-rep" type="number" min="1" value="${s.repeatCount||1}" style="width:50px;background:var(--elev);border:1px solid var(--bd);border-radius:6px;color:var(--t1);padding:2px 6px;font-size:13px;text-align:center">
        ${t('times')}
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:14px;color:var(--t1);cursor:pointer;flex-wrap:wrap">
        <input type="radio" name="rm" value="duration" ${s.mode==='duration'?'checked':''} style="accent-color:var(--acc)">
        ${t('forDuration')}
        <input id="rs-hh" type="number" min="0" max="23" value="${s.durationHH||0}" style="width:44px;background:var(--elev);border:1px solid var(--bd);border-radius:6px;color:var(--t1);padding:2px 6px;font-size:13px;text-align:center">HH
        <input id="rs-mm" type="number" min="0" max="59" value="${s.durationMM||0}" style="width:44px;background:var(--elev);border:1px solid var(--bd);border-radius:6px;color:var(--t1);padding:2px 6px;font-size:13px;text-align:center">MM
        <input id="rs-ss" type="number" min="0" max="59" value="${s.durationSS||0}" style="width:44px;background:var(--elev);border:1px solid var(--bd);border-radius:6px;color:var(--t1);padding:2px 6px;font-size:13px;text-align:center">SS
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--t1);cursor:pointer">
        <input type="radio" name="rm" value="infinite" ${s.mode==='infinite'?'checked':''} style="accent-color:var(--acc)">
        ${t('infinitely')}
      </label>
    </div>
    <div style="display:flex;align-items:center;gap:6px;font-size:14px;color:var(--t1)">
      ${t('intervalBetween')}
      <input id="rs-imin" type="number" min="0" value="${s.intervalMin||0}" style="width:44px;background:var(--elev);border:1px solid var(--bd);border-radius:6px;color:var(--t1);padding:2px 6px;font-size:13px;text-align:center">min
      <input id="rs-isec" type="number" min="0" value="${s.intervalSec||5}" style="width:44px;background:var(--elev);border:1px solid var(--bd);border-radius:6px;color:var(--t1);padding:2px 6px;font-size:13px;text-align:center">sec
    </div>
    <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--t1)">
      ${t('playbackSpeed')}
      <select id="rs-spd" style="background:var(--elev);border:1px solid var(--bd);border-radius:6px;color:var(--t1);padding:3px 8px;font-size:13px">
        ${[0.25,0.5,0.75,1,1.25,1.5,2].map(v=>`<option value="${v}"${(s.speed||1)===v?' selected':''}>${v}x</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button id="rs-cancel" style="background:var(--elev);color:var(--t2);border:1px solid var(--bd);border-radius:8px;padding:8px 18px;font-size:14px;cursor:pointer">${t('cancel')}</button>
      <button id="rs-save" style="background:var(--acc);color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer">${t('save')}</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('#rs-cancel').onclick=()=>ov.remove();
  ov.querySelector('#rs-save').onclick=()=>{
    rec.settings={
      mode:ov.querySelector('input[name="rm"]:checked')?.value||'repeat',
      repeatCount:+($('rs-rep')?.value||1),
      durationHH:+($('rs-hh')?.value||0), durationMM:+($('rs-mm')?.value||0), durationSS:+($('rs-ss')?.value||0),
      intervalMin:+($('rs-imin')?.value||0), intervalSec:+($('rs-isec')?.value||5),
      speed:+($('rs-spd')?.value||1),
    };
    saveRecords(); ov.remove();
  };
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
  // Apply to all tabs of this device, not just the active one
  const affectedTabs = state.tabs.filter(t => t.deviceId === deviceId);
  if (affectedTabs.length === 0 && state.activeTab) {
    // Fallback: apply to active tab if device match fails
    setWritingMode(true, state.activeTab);
    return;
  }
  affectedTabs.forEach(t => setWritingMode(true, t.id));
});

// Track last tap per tab — used to reopen IME when returning to tab
function recordTap(tabId, x, y, w, h) {
  TAB_LAST_TAP.set(tabId, { x, y, w, h });
}

window.td.onImeClose(({ deviceId }) => {
  const affectedTabs = state.tabs.filter(t => t.deviceId === deviceId);
  const targets = affectedTabs.length > 0 ? affectedTabs.map(t => t.id) : [state.activeTab].filter(Boolean);
  targets.forEach(tabId => {
    if (isWriting(tabId)) {
      setWritingMode(false, tabId);
      TAB_IME_PENDING.delete(tabId);
    }
  });
});

window.td.onMeta(({ tabId, width, height }) => {
  const canvas=$('canvas-'+tabId);
  if(canvas){canvas.width=width;canvas.height=height;}
});

window.td.onEnded(({ tabId, unexpected }) => {
  updateTabState(tabId, 'stopped');
  const tab = state.tabs.find(t => t.id === tabId);
  if (!unexpected || !tab || !state.settings.autoReconnect) return;
  notify('Connection lost', `${tab.label || tab.pkg} disconnected — reconnecting…`, 'warn');

  // Unexpected disconnect — auto-reconnect after 3s with visual countdown
  let secondsLeft = 3;
  updateTabState(tabId, 'reconnecting');
  // Create a temporary overlay on the canvas for the countdown
  const cv = $('canvas-' + tabId);
  let countdownEl = null;
  if (cv && cv.parentElement) {
    countdownEl = document.createElement('div');
    countdownEl.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:5;pointer-events:none';
    countdownEl.innerHTML = `<span style="color:#fff;font-size:14px;opacity:.9">Reconnecting in ${secondsLeft}s…</span>`;
    cv.parentElement.appendChild(countdownEl);
  }
  const showCountdown = () => {
    if (countdownEl) countdownEl.querySelector('span').textContent = `Reconnecting in ${secondsLeft}s…`;
  };
  const interval = setInterval(() => {
    secondsLeft--;
    if (secondsLeft <= 0) {
      clearInterval(interval);
      const _t = state.tabs.find(t => t.id === tabId);
      if (_t) { _t._wasReconnecting = true; if (countdownEl) countdownEl.remove(); restartMirror(tabId); }
    } else {
      showCountdown();
    }
  }, 1000);
  // Store interval so closeTab can cancel it
  tab._reconnectInterval = interval;
  tab._countdownEl = countdownEl;
});
window.td.onError(({ tabId }) => {
  updateTabState(tabId,'error');
  const tab = state.tabs.find(t => t.id === tabId);
  notify('Mirror error', `${tab?.label || tab?.pkg || 'Instance'} failed to connect`, 'error');
});

// ── Global keyboard ────────────────────────────────────────────────────────

// ── Remappable navigation keys ─────────────────────────────────────────────
const NAV_DEFAULTS = {
  newInstance:  { label: 'navNewInstance', default: 'Ctrl+T',      ctrl: true,  key: 't' },
  closeTab:     { label: 'navCloseTab',    default: 'Ctrl+W',      ctrl: true,  key: 'w' },
  nextTab:      { label: 'navNextTab',     default: 'ArrowRight',  ctrl: false, key: 'ArrowRight' },
  prevTab:      { label: 'navPrevTab',     default: 'ArrowLeft',   ctrl: false, key: 'ArrowLeft'  },
  closePanel:   { label: 'navClosePanel',  default: 'Escape',      ctrl: false, key: 'Escape'     },
};

function loadNavKeys() {
  try {
    const saved = JSON.parse(localStorage.getItem('tabpilot:navkeys') || 'null');
    if (saved) return { ...NAV_DEFAULTS, ...Object.fromEntries(Object.entries(saved).map(([k,v]) => [k, { ...NAV_DEFAULTS[k], ...v }])) };
  } catch {}
  return { ...NAV_DEFAULTS };
}
function saveNavKeys() { try { localStorage.setItem('tabpilot:navkeys', JSON.stringify(Object.fromEntries(Object.entries(state.navKeys).map(([k,v]) => [k, { ctrl: v.ctrl, key: v.key }])))); } catch {} }

state.navKeys = loadNavKeys();

function navKeyMatches(action, e) {
  const nk = state.navKeys[action];
  if (!nk) return false;
  const needsCtrl = nk.ctrl;
  if (needsCtrl !== (e.ctrlKey || e.metaKey)) return false;
  return e.key === nk.key || e.key.toLowerCase() === nk.key.toLowerCase();
}

function navKeyDisplay(action) {
  const nk = state.navKeys[action];
  if (!nk) return '';
  return (nk.ctrl ? 'Ctrl+' : '') + (nk.key.length === 1 ? nk.key.toUpperCase() : nk.key);
}

// ── Collapsible top UI (hide topbar + tabbar to maximize game view) ────────
function toggleUiCollapse(force) {
  const shell = $('shell');
  if (!shell) return;
  const collapsed = force !== undefined ? force : !shell.classList.contains('ui-collapsed');
  shell.classList.toggle('ui-collapsed', collapsed);
  const trigger = $('ui-reveal-trigger');
  if (trigger) trigger.style.display = collapsed ? 'block' : 'none';
  const btn = $('btn-collapse-ui');
  if (btn) {
    btn.classList.toggle('active', collapsed);
    btn.title = collapsed ? 'Show bar (F11)' : 'Hide bar (F11)';
    const collapseIcon = btn.querySelector('.collapse-icon');
    const expandIcon = btn.querySelector('.expand-icon');
    if (collapseIcon) collapseIcon.style.display = collapsed ? 'none' : '';
    if (expandIcon) expandIcon.style.display = collapsed ? '' : 'none';
  }
  // Re-focus the active canvas so keyboard input keeps working immediately
  if (collapsed) setTimeout(() => focusActiveCanvas(), 50);
}

document.getElementById('btn-collapse-ui')?.addEventListener('click', () => toggleUiCollapse());

// ── Broadcast mode ─────────────────────────────────────────────────────────
function setBroadcastMode(on) {
  _broadcastMode = on;
  const btn = $('btn-broadcast');
  if (btn) {
    btn.style.background   = on ? 'var(--acc)'  : 'var(--elev)';
    btn.style.borderColor  = on ? 'var(--acc)'  : 'var(--bd2)';
    btn.style.color        = on ? '#fff'         : 'var(--t2)';
    btn.title = on ? 'Broadcast ON — click propagates to all instances (B)' : 'Broadcast clicks to all instances (B)';
  }
  if (on) toast('Broadcast ON', 'All clicks will propagate to every active instance', 'info');
}
$('btn-broadcast')?.addEventListener('click', () => setBroadcastMode(!_broadcastMode));

// Clicking inside the reveal-trigger strip (top edge, only visible while
// collapsed) permanently brings the bars back - same single source of
// truth as the button.
document.getElementById('ui-reveal-trigger')?.addEventListener('click', () => toggleUiCollapse(false));

// Hovering the top-edge trigger TEMPORARILY overlays the bars (ui-peek) on
// top of the game view without affecting layout - moving the mouse below
// the revealed bars' combined height hides them again.
//
// Implementation note: topbar/tabbar are siblings of the trigger, not
// children, so mouseenter/mouseleave between them is unreliable (leaving
// the 14px trigger strip to enter the now-visible topbar above it would
// incorrectly fire mouseleave on the trigger first). A single mousemove
// listener checking the cursor's Y position against the combined bar
// height avoids that sibling-boundary problem entirely.
document.addEventListener('mousemove', e => {
  const shell = $('shell');
  if (!shell || !shell.classList.contains('ui-collapsed')) return;
  const rootStyle = getComputedStyle(document.documentElement);
  const topH = parseInt(rootStyle.getPropertyValue('--top')) || 48;
  const tabH = parseInt(rootStyle.getPropertyValue('--tab')) || 40;
  const isPeeking = shell.classList.contains('ui-peek');
  // Show: mouse must be at the very top edge (4px)
  // Hide: mouse moved below the full revealed bar height
  if (!isPeeking && e.clientY <= 4) {
    shell.classList.add('ui-peek');
  } else if (isPeeking && e.clientY > topH + tabH) {
    shell.classList.remove('ui-peek');
  }
});

// NAVIGATION shortcuts — always active, capture phase fires BEFORE canvas keydown
document.addEventListener('keydown', e => {
  // Tab — no longer blocked globally, can be used for remapping
  const inInput = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
  if (inInput) return;

  // F11 or Ctrl+Shift+H toggles the collapsible UI (hide topbar/tabbar)
  if (e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h')) {
    e.preventDefault(); e.stopPropagation();
    toggleUiCollapse();
    return;
  }

  // B toggles broadcast mode
  if (e.key === 'b' || e.key === 'B') {
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault(); e.stopPropagation();
      setBroadcastMode(!_broadcastMode);
      return;
    }
  }

  if (navKeyMatches('newInstance', e)) { e.preventDefault(); e.stopPropagation(); openModal(); return; }
  if (navKeyMatches('closeTab', e) && state.activeTab) { e.preventDefault(); e.stopPropagation(); closeTab(state.activeTab); return; }

  if (!e.ctrlKey && !e.metaKey && !e.altKey && state.tabs.length > 1) {
    if (navKeyMatches('nextTab', e)) {
      e.preventDefault(); e.stopPropagation();
      const i = state.tabs.findIndex(t=>t.id===state.activeTab);
      activateTab(state.tabs[(i+1) % state.tabs.length].id, true);
      return;
    }
    if (navKeyMatches('prevTab', e)) {
      e.preventDefault(); e.stopPropagation();
      const i = state.tabs.findIndex(t=>t.id===state.activeTab);
      activateTab(state.tabs[(i-1+state.tabs.length) % state.tabs.length].id, true);
      return;
    }
  }

  if (e.key==='Escape') {
    // Only fires when the active instance's canvas actually has keyboard
    // focus - prevents ESC from tapping the close button when the user's
    // focus is elsewhere in TabPilot's own UI (Settings panel, etc).
    const canvasHasFocus = document.activeElement?.id === ('canvas-' + state.activeTab);
    if (state.activeTab && canvasHasFocus && closeBtnAvailable(state.activeTab)) {
      e.preventDefault(); e.stopPropagation();
      tapScrcpyBtns(state.activeTab);
      return;
    }
    if (!typingMode) {
      if (state.panel && navKeyMatches('closePanel', e)) { e.preventDefault(); e.stopPropagation(); closePanel(); return; }
      if (state.activeTab && navKeyMatches('closePanel', e)) {
        const ov = $('zone-overlay-'+state.activeTab);
        if (ov?._cleanup) { e.preventDefault(); e.stopPropagation(); stopZoneEditor(state.activeTab); return; }
      }
    }
  }

  if (e.key==='Enter') {
    // Same focus requirement as ESC above. enterBtnAvailable() already
    // excludes the case where chat is open (so we never hijack Enter while
    // the user is actually typing/sending a chat message).
    const canvasHasFocus = document.activeElement?.id === ('canvas-' + state.activeTab);
    if (state.activeTab && canvasHasFocus && enterBtnAvailable(state.activeTab)) {
      e.preventDefault(); e.stopPropagation();
      tapOpenChatBtn(state.activeTab);
      return;
    }
  }

  // Block arrow tab-switch when scrcpy buttons visible
  if (!e.ctrlKey && !e.metaKey && !e.altKey && state.tabs.length > 1
      && state.activeTab && scrcpyVisible(state.activeTab)) {
    if (navKeyMatches('nextTab', e) || navKeyMatches('prevTab', e)) return;
  }
}, true);

// ── Devices ────────────────────────────────────────────────────────────────
async function loadDevices() {
  try {
    const devices = await window.td.listDevices();
    const online = devices.filter(d=>d.state==='device');

    const prevIds = state.devices.filter(d=>d.state==='device').map(d=>d.id).sort().join(',');
    const newIds  = online.map(d=>d.id).sort().join(',');
    const changed = prevIds !== newIds;

    state.devices = devices;


    // Update status text
    emptyStatus.textContent = online.length
      ? `${online.length} ${online.length>1?t('deviceConnected'):t('deviceConnectedOne')}`
      : t('noDevicesConnect');

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
  } catch { emptyStatus.textContent = t('errorScanning'); }
}

// Poll for device changes every 3 seconds
// ── Warmup events ──────────────────────────────────────────────────────────
// ── Toast / in-app notification system ────────────────────────────────────
(function() {
  let container = null;
  function getContainer() {
    if (!container || !container.isConnected) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
  const DURATION = { info: 4000, success: 4000, error: 6000, warn: 5000 };

  window.toast = function(title, message, type = 'info', duration) {
    const ct = getContainer();
    const ms = duration ?? DURATION[type] ?? 4000;
    const el = document.createElement('div');
    el.className = `toast toast-${type} toast-entering`;
    el.innerHTML = `
      <span class="toast-icon">${ICONS[type]}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-msg">${message}</div>` : ''}
      </div>
      <button class="toast-close" title="Dismiss">×</button>
      <div class="toast-progress" style="width:100%;transition-duration:${ms}ms"></div>`;
    ct.appendChild(el);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.remove('toast-entering');
        // Start progress bar drain
        el.querySelector('.toast-progress').style.width = '0%';
      });
    });

    const dismiss = () => {
      if (!el.isConnected) return;
      el.classList.add('toast-leaving');
      setTimeout(() => el.remove(), 380);
    };

    el.querySelector('.toast-close').onclick = dismiss;
    const timer = setTimeout(dismiss, ms);
    el.addEventListener('mouseenter', () => {
      // Pause on hover
      clearTimeout(timer);
      el.querySelector('.toast-progress').style.transitionDuration = '0ms';
    });
    el.addEventListener('mouseleave', () => {
      // Resume on leave with remaining time ~500ms
      const prog = el.querySelector('.toast-progress');
      prog.style.transitionDuration = '500ms';
      prog.style.width = '0%';
      setTimeout(dismiss, 500);
    });

    return el;
  };
})();

// Override the OS notify() to use in-app toasts instead
function notify(title, body, type) {
  window.toast(title, body, type || 'info');
}

setInterval(loadDevices, 3000);

// ── Nav ────────────────────────────────────────────────────────────────────
$('btn-new').onclick = openModal;

// ── Layout Manager ─────────────────────────────────────────────────────────
function loadLayouts() {
  try { return JSON.parse(localStorage.getItem('tabpilot:layouts') || '[]'); } catch { return []; }
}
function saveLayouts(layouts) {
  try { localStorage.setItem('tabpilot:layouts', JSON.stringify(layouts)); } catch {}
}

function saveCurrentLayout(name) {
  if (!state.tabs.length) { toast('No instances open', 'Open at least one instance first', 'warn'); return; }
  const layouts = loadLayouts();
  const layout = {
    id: 'layout-' + Date.now(),
    name: name.trim(),
    tabs: state.tabs.map((t, i) => ({
      pkg: t.pkg, userId: t.userId || 0, deviceId: t.deviceId,
      label: t.label, appName: t.appName,
    })),
    activeIndex: state.tabs.findIndex(t => t.id === state.activeTab),
    createdAt: Date.now(),
  };
  layouts.push(layout);
  saveLayouts(layouts);
  toast('Layout saved', `"${layout.name}" — ${layout.tabs.length} instance${layout.tabs.length!==1?'s':''}`, 'success');
  renderLayoutsModal();
}

async function restoreLayout(layout) {
  // Close all current tabs first
  const toClose = [...state.tabs.map(t => t.id)];
  toClose.forEach(id => closeTab(id));

  let successCount = 0;
  for (const entry of layout.tabs) {
    const device = state.devices.find(d => d.id === entry.deviceId);
    if (!device) {
      toast('Device not found', `${entry.deviceId} — skipped`, 'warn');
      continue;
    }
    // Find the app — try iconCache keys or fetch app list
    let app = null;
    const allApps = await window.td.listApps(device.id, entry.userId).catch(() => []);
    app = allApps.find(a => a.package === entry.pkg && (a.userId || 0) === entry.userId);
    if (!app) {
      toast('App not found', `${entry.pkg} — skipped`, 'warn');
      continue;
    }
    await launchMirror(app, device).catch(() => {});
    successCount++;
  }
  if (successCount > 0) toast('Layout restored', `"${layout.name}" — ${successCount} instance${successCount!==1?'s':''}`, 'success');
}

function renderLayoutsModal() {
  let modal = $('layouts-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'layouts-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  const layouts = loadLayouts();
  modal.innerHTML = `
    <div style="background:var(--surf);border:1px solid var(--bd2);border-radius:14px;padding:24px 28px;width:420px;max-height:80vh;display:flex;flex-direction:column;gap:14px;overflow:hidden">
      <div style="font-size:16px;font-weight:700;color:var(--t1)">Layout Manager</div>
      <div style="display:flex;gap:8px">
        <input id="layout-name-in" placeholder="Layout name…" maxlength="40"
          style="flex:1;background:var(--elev);border:1px solid var(--bd2);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--t1);outline:none">
        <button id="layout-save-btn" class="btn-accent" style="padding:8px 14px;font-size:13px;white-space:nowrap">💾 Save</button>
      </div>
      <div style="overflow-y:auto;display:flex;flex-direction:column;gap:8px;flex:1">
        ${layouts.length === 0
          ? `<p style="font-size:13px;color:var(--t3);text-align:center;padding:20px 0">No layouts saved yet.<br>Open some instances and save a layout.</p>`
          : layouts.map(l => `
            <div style="background:var(--elev);border:1px solid var(--bd);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:6px">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:14px;font-weight:600;flex:1;color:var(--t1)">${l.name}</span>
                <span style="font-size:11px;color:var(--t3)">${new Date(l.createdAt).toLocaleDateString()}</span>
              </div>
              <div style="font-size:12px;color:var(--t3)">${l.tabs.length} instance${l.tabs.length!==1?'s':''} · ${[...new Set(l.tabs.map(t=>t.deviceId))].length} device${[...new Set(l.tabs.map(t=>t.deviceId))].length!==1?'s':''}</div>
              <div style="font-size:12px;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.tabs.map(t=>t.label||t.appName||t.pkg).join(' · ')}</div>
              <div style="display:flex;gap:6px;margin-top:4px">
                <button class="btn-sm layout-restore-btn" data-lid="${l.id}" style="flex:1">▶ Restore</button>
                <button class="btn-sm layout-delete-btn" data-lid="${l.id}" style="color:#e05c5c;border-color:#5c2020">✕</button>
              </div>
            </div>`).join('')
        }
      </div>
      <button id="layout-close-btn" style="background:var(--elev);color:var(--t2);border:1px solid var(--bd);border-radius:8px;padding:9px;font-size:14px;cursor:pointer">Close</button>
    </div>`;

  modal.querySelector('#layout-save-btn').onclick = () => {
    const name = modal.querySelector('#layout-name-in').value.trim();
    if (!name) { modal.querySelector('#layout-name-in').focus(); return; }
    saveCurrentLayout(name);
  };
  modal.querySelector('#layout-name-in').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.stopPropagation(); modal.querySelector('#layout-save-btn').click(); }
    if (e.key === 'Escape') modal.remove();
  });
  modal.querySelector('#layout-close-btn').onclick = () => modal.remove();
  modal.querySelectorAll('.layout-restore-btn').forEach(btn => {
    btn.onclick = () => {
      const l = loadLayouts().find(x => x.id === btn.dataset.lid);
      if (!l) return;
      modal.remove();
      restoreLayout(l);
    };
  });
  modal.querySelectorAll('.layout-delete-btn').forEach(btn => {
    btn.onclick = () => {
      const layouts = loadLayouts().filter(x => x.id !== btn.dataset.lid);
      saveLayouts(layouts);
      renderLayoutsModal();
    };
  });
}

$('btn-layouts')?.addEventListener('click', renderLayoutsModal);
$('btn-new-empty').onclick = openModal;

$('nav-shortcuts').onclick = () => {
  if(state.panel==='shortcuts'){closePanel();return;}
  openPanelWith('shortcuts',t('shortcuts'),buildShortcutsHtml(),()=>bindShortcutsEvents());
};
$('btn-discord')?.addEventListener('click', () => {
  if (_recordingLockTabId) return; // block opening Discord while recording
  window.td.openExternal('discord://-/invite/KZHeDJzMgg').catch(()=>window.td.openExternal('https://discord.gg/KZHeDJzMgg'));
});
$('nav-settings').onclick = () => {
  if(state.panel==='settings'){closePanel();return;}
  openPanelWith('settings',t('settings'),'',buildSettings);
};
$('nav-macro').onclick   = () => {
  if (state.panel === 'macro') { closePanel(); return; }
  openPanelWith('macro', t('record'), '', buildRecordPanel);
};
$('nav-help').onclick    = () => { closePanel(); openHelpModal(); };
$('nav-bug').onclick     = () => { closePanel(); openBugModal(); };
$('nav-account').onclick = () => {
  if(state.panel==='account'){closePanel();return;}
  window.td.getVersion().then(version => {
    openPanelWith('account', t('about'), `
      <div class="ps" style="text-align:center;padding:20px 0">
        <div style="font-size:17px;font-weight:700;color:var(--t1);margin-bottom:4px">TabPilot</div>
        <div style="font-size:13px;color:var(--t3);margin-bottom:6px">v${version}</div>
        <div style="font-size:13px;color:var(--t3);margin-bottom:6px">
          Powered by <a href="#" onclick="window.td.openExternal('https://github.com/Genymobile/scrcpy/releases/tag/v4.0');return false;"
            style="color:var(--acc2);text-decoration:none" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">scrcpy v4.0</a>
        </div>
        <div id="about-update-status" style="font-size:13px;color:#4caf82;margin-bottom:18px">✓ ${t('upToDate')}</div>
        <div style="font-size:14px;color:var(--t2);line-height:2">
          ${t('aboutDesc')}<br><br>
          ${t('createdBy')}<br>
          <strong style="color:var(--acc2);font-size:15px">Aeonxy</strong><br>
          ${t('builtWith')} <strong style="color:var(--acc2)">Claude AI</strong><br><br>
          © 2026 Aeonxy. ${t('allRights')}.
        </div>
      </div>`);
  });
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

// Init language picker in topbar
const langWrap = $('lang-picker-wrap');
if (langWrap && !langWrap.hasChildNodes()) langWrap.appendChild(buildLangPicker());
applyLang();

// Show help wizard on first launch only
if (!localStorage.getItem('tabpilot:welcomed')) {
  localStorage.setItem('tabpilot:welcomed', '1');
  setTimeout(() => openHelpModal(), 500);
}

// ── Auto update ────────────────────────────────────────────────────────────
let _updateBanner = null;

window.td.onUpdateAvailable(({ version }) => {
  // Update About panel status if open
  const statusEl = $('about-update-status');
  if (statusEl) {
    statusEl.style.color = '#f0a05b';
    statusEl.textContent = `↑ v${version} available`;
  }
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
      <button id="update-install-btn" style="background:#2a5cdb;color:#fff;border:none;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer">Restart to update</button>
      <button id="update-dismiss2" style="background:transparent;color:#888;border:none;font-size:16px;cursor:pointer;padding:0 4px">×</button>`;
    $('update-install-btn').onclick = () => window.td.installUpdate();
    $('update-dismiss2').onclick = () => { _updateBanner?.remove(); _updateBanner = null; };
  }
});