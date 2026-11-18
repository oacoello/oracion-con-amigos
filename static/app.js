(() => {
  const RING_CIRCUMFERENCE = 2 * Math.PI * 112; // ~703.72

  const SCENES = [
    { id: 'serenity', label: 'Índigo Sereno' },
    { id: 'dawn', label: 'Amanecer Cálido' },
    { id: 'forest', label: 'Bosque de Paz' },
    { id: 'lavender', label: 'Lavanda Suave' },
    { id: 'ocean', label: 'Océano Claro' },
    { id: 'amber', label: 'Ámbar Dorado' },
  ];

  const VALID_SCENES = SCENES.map((s) => s.id);

  const PRESETS = {
    general: {
      title: 'Oración con amigos',
      segments: [
        {
          id: 'p-1',
          title: 'Alabanza y Acción de Gracias',
          description: 'Agradecemos a Dios por su fidelidad, su amor y las bendiciones de esta semana.',
          durationSeconds: 180,
          scene: 'serenity',
        },
        {
          id: 'p-2',
          title: 'Por nuestras familias y seres queridos',
          description: 'Oramos por paz, salud, unidad y fortaleza en cada hogar.',
          durationSeconds: 240,
          scene: 'dawn',
        },
        {
          id: 'p-3',
          title: 'Por la iglesia y la comunidad',
          description: 'Pedimos sabiduría para los líderes, unidad en el cuerpo y corazones dispuestos a servir.',
          durationSeconds: 240,
          scene: 'forest',
        },
        {
          id: 'p-4',
          title: 'Peticiones personales y sanidad',
          description: 'Presentamos delante de Dios las necesidades específicas, cargas y procesos de sanidad.',
          durationSeconds: 300,
          scene: 'lavender',
        },
        {
          id: 'p-5',
          title: 'Cierre y envío',
          description: 'Encomendamos nuestros caminos y proyectos en las manos del Señor.',
          durationSeconds: 120,
          scene: 'ocean',
        },
      ],
    },
    express: {
      title: 'Oración Express',
      segments: [
        {
          id: 'e-1',
          title: 'Gratitud inicial',
          description: 'Damos gracias por este nuevo día y por reunirnos.',
          durationSeconds: 120,
          scene: 'amber',
        },
        {
          id: 'e-2',
          title: 'Peticiones del grupo',
          description: 'Oramos unos por otros por las necesidades de esta semana.',
          durationSeconds: 300,
          scene: 'serenity',
        },
        {
          id: 'e-3',
          title: 'Bendición final',
          description: 'Pedimos dirección, paz y protección.',
          durationSeconds: 180,
          scene: 'forest',
        },
      ],
    },
    deep: {
      title: 'Tiempo de Intercesión',
      segments: [
        {
          id: 'd-1',
          title: 'Adoración y quietud',
          description: 'Disponemos nuestro corazón en silencio y gratitud delante de Dios.',
          durationSeconds: 300,
          scene: 'lavender',
        },
        {
          id: 'd-2',
          title: 'Confesión y renovación',
          description: 'Pedimos limpieza, humildad y un corazón renovado.',
          durationSeconds: 240,
          scene: 'ocean',
        },
        {
          id: 'd-3',
          title: 'Intercesión por familias y enfermos',
          description: 'Clamamos por sanidad física, emocional y restauración familiar.',
          durationSeconds: 420,
          scene: 'dawn',
        },
        {
          id: 'd-4',
          title: 'Por la ciudad, autoridades y misiones',
          description: 'Oramos por justicia, paz en nuestra nación y obreros en el campo.',
          durationSeconds: 420,
          scene: 'forest',
        },
        {
          id: 'd-5',
          title: 'Acción de gracias y cierre',
          description: 'Declaramos confianza en que Dios escucha y responde.',
          durationSeconds: 420,
          scene: 'amber',
        },
      ],
    },
  };

  const state = {
    config: {
      title: 'Oración con amigos',
      darkMode: false,
      soundEnabled: true,
      autoAdvance: true,
      segments: PRESETS.general.segments.map((s) => ({ ...s })),
    },
    draftConfig: null,
    currentIndex: 0,
    isRunning: false,
    isCompleted: false,
    meetMode: false,
    remainingMs: 180000,
    segmentTotalMs: 180000,
    lastTickTime: null,
    rafId: null,
    audioCtx: null,
  };

  // Referencias DOM
  const el = {
    meetingTitle: document.getElementById('meetingTitle'),
    totalRemainingLabel: document.getElementById('totalRemainingLabel'),
    stepperPills: document.getElementById('stepperPills'),
    prayerCard: document.getElementById('prayerCard'),
    completedCard: document.getElementById('completedCard'),
    segmentCounterChip: document.getElementById('segmentCounterChip'),
    segmentTitle: document.getElementById('segmentTitle'),
    segmentDescription: document.getElementById('segmentDescription'),
    nextPreview: document.getElementById('nextPreview'),
    nextTitle: document.getElementById('nextTitle'),

    timerWrapper: document.getElementById('timerWrapper'),
    timerProgress: document.getElementById('timerProgress'),
    timerStatus: document.getElementById('timerStatus'),
    timerDigits: document.getElementById('timerDigits'),
    timerDurationHint: document.getElementById('timerDurationHint'),

    playPauseBtn: document.getElementById('playPauseBtn'),
    playPauseLabel: document.getElementById('playPauseLabel'),
    iconPlay: document.querySelector('#playPauseBtn .icon-play'),
    iconPause: document.querySelector('#playPauseBtn .icon-pause'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    resetBtn: document.getElementById('resetBtn'),
    minusMinBtn: document.getElementById('minusMinBtn'),
    plusMinBtn: document.getElementById('plusMinBtn'),
    restartAllBtn: document.getElementById('restartAllBtn'),

    soundToggleBtn: document.getElementById('soundToggleBtn'),
    iconSoundOn: document.querySelector('#soundToggleBtn .icon-sound-on'),
    iconSoundOff: document.querySelector('#soundToggleBtn .icon-sound-off'),
    darkModeBtn: document.getElementById('darkModeBtn'),
    iconMoon: document.querySelector('#darkModeBtn .icon-moon'),
    iconSun: document.querySelector('#darkModeBtn .icon-sun'),
    meetModeBtn: document.getElementById('meetModeBtn'),
    exitMeetBtn: document.getElementById('exitMeetBtn'),

    openConfigBtn: document.getElementById('openConfigBtn'),
    closeConfigBtn: document.getElementById('closeConfigBtn'),
    sheetBackdrop: document.getElementById('sheetBackdrop'),
    configSheet: document.getElementById('configSheet'),
    titleInput: document.getElementById('titleInput'),
    autoAdvanceInput: document.getElementById('autoAdvanceInput'),
    segmentsEditorList: document.getElementById('segmentsEditorList'),
    addSegmentBtn: document.getElementById('addSegmentBtn'),
    saveConfigBtn: document.getElementById('saveConfigBtn'),
    saveStatus: document.getElementById('saveStatus'),
  };

  // =========================================================================
  // Inicialización y Persistencia Nativa (IPC + localStorage)
  // =========================================================================
  function init() {
    loadConfig();
    loadSegment(0, false);
    bindEvents();
    renderAll();
  }

  function loadConfig() {
    if (window.__INITIAL_CONFIG__ && Array.isArray(window.__INITIAL_CONFIG__.segments) && window.__INITIAL_CONFIG__.segments.length > 0) {
      state.config = normalizeConfig(window.__INITIAL_CONFIG__);
      return;
    }

    try {
      const cached = localStorage.getItem('app_oracion_config');
      if (cached) {
        const data = JSON.parse(cached);
        if (data && Array.isArray(data.segments) && data.segments.length > 0) {
          state.config = normalizeConfig(data);
        }
      }
    } catch {
      // Usar valores por defecto
    }
  }

  function normalizeConfig(data) {
    return {
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Tiempo de Oración',
      darkMode: Boolean(data.darkMode),
      soundEnabled: data.soundEnabled !== undefined ? Boolean(data.soundEnabled) : true,
      autoAdvance: data.autoAdvance !== undefined ? Boolean(data.autoAdvance) : true,
      segments: data.segments.map((seg, idx) => ({
        id: seg.id || `seg-${Date.now()}-${idx}`,
        title: (seg.title || `Punto ${idx + 1}`).toString(),
        description: (seg.description || '').toString(),
        durationSeconds: Math.max(10, parseInt(seg.durationSeconds, 10) || 180),
        scene: VALID_SCENES.includes(seg.scene) ? seg.scene : VALID_SCENES[idx % VALID_SCENES.length],
      })),
    };
  }

  function persistConfig(configToSave) {
    const json = JSON.stringify(configToSave, null, 2);
    try {
      localStorage.setItem('app_oracion_config', json);
    } catch {
      // Ignorar si localStorage no está disponible
    }

    if (window.ipc && typeof window.ipc.postMessage === 'function') {
      window.ipc.postMessage(json);
      return true;
    }
    return false;
  }

  // =========================================================================
  // Lógica del Cronómetro
  // =========================================================================
  function loadSegment(index, keepRunning = false) {
    const segments = state.config.segments;
    if (index >= segments.length) {
      finishAll();
      return;
    }

    state.isCompleted = false;
    state.currentIndex = Math.max(0, index);
    const seg = segments[state.currentIndex];
    state.segmentTotalMs = seg.durationSeconds * 1000;
    state.remainingMs = state.segmentTotalMs;
    state.lastTickTime = performance.now();

    applyThemeAndMode();

    if (!keepRunning) {
      pauseTimer();
    } else {
      startTimerLoop();
    }

    renderAll();
  }

  function togglePlayPause() {
    if (state.isCompleted) {
      loadSegment(0, true);
      return;
    }
    if (state.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (state.isRunning || state.isCompleted) return;
    ensureAudioContext();
    state.isRunning = true;
    state.lastTickTime = performance.now();
    startTimerLoop();
    renderControlsAndTimer();
  }

  function pauseTimer() {
    state.isRunning = false;
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    renderControlsAndTimer();
  }

  function startTimerLoop() {
    if (state.rafId !== null) cancelAnimationFrame(state.rafId);
    state.lastTickTime = performance.now();

    const tick = (now) => {
      if (!state.isRunning) return;
      const delta = now - state.lastTickTime;
      state.lastTickTime = now;
      state.remainingMs = Math.max(0, state.remainingMs - delta);

      renderTimerVisuals();

      if (state.remainingMs <= 0) {
        onSegmentFinished();
        return;
      }
      state.rafId = requestAnimationFrame(tick);
    };

    state.rafId = requestAnimationFrame(tick);
  }

  function onSegmentFinished() {
    playGentleChime();
    const nextIdx = state.currentIndex + 1;

    if (nextIdx >= state.config.segments.length) {
      finishAll();
      return;
    }

    // Transición visual notable y suave hacia el siguiente punto y escenario
    el.prayerCard.classList.add('transitioning');
    setTimeout(() => {
      loadSegment(nextIdx, state.config.autoAdvance);
      el.prayerCard.classList.remove('transitioning');
    }, 300);
  }

  function finishAll() {
    pauseTimer();
    state.isCompleted = true;
    renderAll();
  }

  function adjustCurrentTime(deltaSeconds) {
    if (state.isCompleted) return;
    const deltaMs = deltaSeconds * 1000;
    state.remainingMs = Math.max(5000, state.remainingMs + deltaMs);
    if (state.remainingMs > state.segmentTotalMs) {
      state.segmentTotalMs = state.remainingMs;
    }
    renderTimerVisuals();
    updateTotalRemainingLabel();
  }

  // =========================================================================
  // Audio suave (Campana sintetizada con Web Audio API)
  // =========================================================================
  function ensureAudioContext() {
    if (!state.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new Ctx();
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume().catch(() => {});
    }
  }

  function playGentleChime() {
    if (!state.config.soundEnabled) return;
    try {
      ensureAudioContext();
      if (!state.audioCtx) return;

      const ctx = state.audioCtx;
      const now = ctx.currentTime;

      [587.33, 880.0].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.0001, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.14 / (i + 1), now + i * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.9);
      });
    } catch {
      // Ignorar errores de audio
    }
  }

  // =========================================================================
  // Renderizado UI
  // =========================================================================
  function renderAll() {
    el.meetingTitle.textContent = state.config.title;
    updateTotalRemainingLabel();
    renderStepper();

    if (state.isCompleted) {
      el.prayerCard.classList.add('hidden');
      el.completedCard.classList.remove('hidden');
    } else {
      el.prayerCard.classList.remove('hidden');
      el.completedCard.classList.add('hidden');

      const seg = state.config.segments[state.currentIndex];
      const total = state.config.segments.length;

      el.segmentCounterChip.textContent = `Punto ${state.currentIndex + 1} de ${total}`;
      el.segmentTitle.textContent = seg.title;

      if (seg.description && seg.description.trim()) {
        el.segmentDescription.textContent = seg.description;
        el.segmentDescription.classList.remove('hidden');
      } else {
        el.segmentDescription.classList.add('hidden');
      }

      if (state.currentIndex + 1 < total) {
        el.nextTitle.textContent = state.config.segments[state.currentIndex + 1].title;
      } else {
        el.nextTitle.textContent = 'Cierre del tiempo de oración';
      }
      el.nextPreview.classList.remove('hidden');
    }

    renderControlsAndTimer();
  }

  function renderStepper() {
    el.stepperPills.innerHTML = '';
    state.config.segments.forEach((seg, idx) => {
      const btn = document.createElement('button');
      btn.className = 'step-pill';
      if (!state.isCompleted && idx === state.currentIndex) {
        btn.classList.add('active');
      } else if (state.isCompleted || idx < state.currentIndex) {
        btn.classList.add('done');
      }
      btn.textContent = `${idx + 1}. ${seg.title}`;
      btn.title = seg.title;
      btn.addEventListener('click', () => {
        if (idx === state.currentIndex && !state.isCompleted) return;
        el.prayerCard.classList.add('transitioning');
        setTimeout(() => {
          loadSegment(idx, state.isRunning);
          el.prayerCard.classList.remove('transitioning');
        }, 200);
      });
      el.stepperPills.appendChild(btn);
    });
  }

  function renderControlsAndTimer() {
    el.playPauseLabel.textContent = state.isRunning ? 'Pausar' : 'Iniciar';
    el.iconPlay.classList.toggle('hidden', state.isRunning);
    el.iconPause.classList.toggle('hidden', !state.isRunning);

    el.timerWrapper.classList.toggle('is-running', state.isRunning);
    el.timerStatus.textContent = state.isRunning
      ? 'En curso'
      : state.remainingMs < state.segmentTotalMs
      ? 'En pausa'
      : 'Listo';

    el.iconSoundOn.classList.toggle('hidden', !state.config.soundEnabled);
    el.iconSoundOff.classList.toggle('hidden', state.config.soundEnabled);

    renderTimerVisuals();
  }

  function renderTimerVisuals() {
    const totalSeconds = Math.ceil(state.remainingMs / 1000);
    el.timerDigits.textContent = formatMMSS(totalSeconds);
    el.timerDurationHint.textContent = `de ${formatMMSS(Math.round(state.segmentTotalMs / 1000))}`;

    const ratio = state.segmentTotalMs > 0 ? state.remainingMs / state.segmentTotalMs : 0;
    const offset = RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, ratio)));
    el.timerProgress.style.strokeDashoffset = offset.toFixed(2);

    el.timerWrapper.classList.toggle('is-ending', state.isRunning && totalSeconds <= 15);
  }

  function updateTotalRemainingLabel() {
    const totalSecs = state.config.segments.reduce((acc, s) => acc + s.durationSeconds, 0);
    el.totalRemainingLabel.textContent = `Duración total: ${formatMMSS(totalSecs)}`;
  }

  function applyThemeAndMode() {
    const seg = state.config.segments[state.currentIndex];
    const scene = seg && VALID_SCENES.includes(seg.scene)
      ? seg.scene
      : VALID_SCENES[state.currentIndex % VALID_SCENES.length];

    document.body.setAttribute('data-theme', scene);
    document.body.setAttribute('data-mode', state.config.darkMode ? 'dark' : 'light');
    el.iconMoon.classList.toggle('hidden', state.config.darkMode);
    el.iconSun.classList.toggle('hidden', !state.config.darkMode);
  }

  function formatMMSS(totalSeconds) {
    const secs = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // =========================================================================
  // Editor de Configuración (Side Sheet)
  // =========================================================================
  function openConfigSheet() {
    state.draftConfig = JSON.parse(JSON.stringify(state.config));
    el.titleInput.value = state.draftConfig.title;
    el.autoAdvanceInput.checked = state.draftConfig.autoAdvance;
    el.saveStatus.textContent = '';

    renderEditorSegments();

    el.sheetBackdrop.classList.remove('hidden');
    el.configSheet.classList.remove('hidden');
  }

  function closeConfigSheet() {
    el.sheetBackdrop.classList.add('hidden');
    el.configSheet.classList.add('hidden');
  }

  function renderEditorSegments() {
    el.segmentsEditorList.innerHTML = '';
    const segments = state.draftConfig.segments;

    segments.forEach((seg, idx) => {
      const mins = Math.floor(seg.durationSeconds / 60);
      const secs = seg.durationSeconds % 60;
      const currentScene = VALID_SCENES.includes(seg.scene)
        ? seg.scene
        : VALID_SCENES[idx % VALID_SCENES.length];

      const sceneOptionsHtml = SCENES.map(
        (sc) => `<option value="${sc.id}" ${sc.id === currentScene ? 'selected' : ''}>Escenario: ${sc.label}</option>`
      ).join('');

      const card = document.createElement('div');
      card.className = 'segment-editor-item';
      card.innerHTML = `
        <div class="segment-editor-top">
          <span class="segment-order-badge">Punto ${idx + 1}</span>
          <div class="segment-item-actions">
            <button type="button" class="mini-icon-btn" data-action="up" title="Subir" ${idx === 0 ? 'disabled' : ''}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <button type="button" class="mini-icon-btn" data-action="down" title="Bajar" ${idx === segments.length - 1 ? 'disabled' : ''}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <button type="button" class="mini-icon-btn danger" data-action="delete" title="Eliminar" ${segments.length <= 1 ? 'disabled' : ''}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>
            </button>
          </div>
        </div>
        <input type="text" class="m3-input seg-title-input" value="${escapeHtml(seg.title)}" placeholder="Título del punto de oración" />
        <textarea class="m3-textarea seg-desc-input" placeholder="Guía o versículo breve (opcional)">${escapeHtml(seg.description || '')}</textarea>
        <div class="duration-inputs-row">
          <label class="duration-field">
            <input type="number" class="seg-min-input" min="0" max="120" value="${mins}" />
            <span>min</span>
          </label>
          <label class="duration-field">
            <input type="number" class="seg-sec-input" min="0" max="59" value="${secs}" />
            <span>seg</span>
          </label>
        </div>
        <select class="scene-select">${sceneOptionsHtml}</select>
      `;

      const titleInput = card.querySelector('.seg-title-input');
      const descInput = card.querySelector('.seg-desc-input');
      const minInput = card.querySelector('.seg-min-input');
      const secInput = card.querySelector('.seg-sec-input');
      const sceneSelect = card.querySelector('.scene-select');

      titleInput.addEventListener('input', (e) => {
        seg.title = e.target.value;
      });
      descInput.addEventListener('input', (e) => {
        seg.description = e.target.value;
      });
      sceneSelect.addEventListener('change', (e) => {
        seg.scene = e.target.value;
      });

      const updateDuration = () => {
        const m = Math.max(0, parseInt(minInput.value, 10) || 0);
        const s = Math.max(0, Math.min(59, parseInt(secInput.value, 10) || 0));
        seg.durationSeconds = Math.max(10, m * 60 + s);
      };
      minInput.addEventListener('change', updateDuration);
      secInput.addEventListener('change', updateDuration);

      card.querySelector('[data-action="up"]').addEventListener('click', () => {
        if (idx > 0) {
          [segments[idx - 1], segments[idx]] = [segments[idx], segments[idx - 1]];
          renderEditorSegments();
        }
      });

      card.querySelector('[data-action="down"]').addEventListener('click', () => {
        if (idx < segments.length - 1) {
          [segments[idx + 1], segments[idx]] = [segments[idx], segments[idx + 1]];
          renderEditorSegments();
        }
      });

      card.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if (segments.length > 1) {
          segments.splice(idx, 1);
          renderEditorSegments();
        }
      });

      el.segmentsEditorList.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function saveAndApplyConfig() {
    state.draftConfig.title = el.titleInput.value.trim() || 'Tiempo de Oración';
    state.draftConfig.autoAdvance = el.autoAdvanceInput.checked;
    state.config = normalizeConfig(state.draftConfig);

    const savedToFile = persistConfig(state.config);
    el.saveStatus.textContent = savedToFile ? 'Guardado en archivo local' : 'Guardado';

    const targetIdx = Math.min(state.currentIndex, state.config.segments.length - 1);
    loadSegment(targetIdx, false);

    setTimeout(() => {
      closeConfigSheet();
    }, 280);
  }

  // =========================================================================
  // Eventos y Atajos de Teclado
  // =========================================================================
  function toggleMeetMode() {
    state.meetMode = !state.meetMode;
    document.body.classList.toggle('meet-mode', state.meetMode);
    el.exitMeetBtn.classList.toggle('hidden', !state.meetMode);
  }

  function bindEvents() {
    el.playPauseBtn.addEventListener('click', togglePlayPause);
    el.prevBtn.addEventListener('click', () => {
      if (state.currentIndex > 0) loadSegment(state.currentIndex - 1, state.isRunning);
    });
    el.nextBtn.addEventListener('click', () => {
      loadSegment(state.currentIndex + 1, state.isRunning);
    });
    el.resetBtn.addEventListener('click', () => {
      loadSegment(state.currentIndex, false);
    });
    el.minusMinBtn.addEventListener('click', () => adjustCurrentTime(-60));
    el.plusMinBtn.addEventListener('click', () => adjustCurrentTime(60));
    el.restartAllBtn.addEventListener('click', () => loadSegment(0, false));

    el.soundToggleBtn.addEventListener('click', () => {
      state.config.soundEnabled = !state.config.soundEnabled;
      persistConfig(state.config);
      renderControlsAndTimer();
    });

    el.darkModeBtn.addEventListener('click', () => {
      state.config.darkMode = !state.config.darkMode;
      applyThemeAndMode();
      persistConfig(state.config);
    });

    el.meetModeBtn.addEventListener('click', toggleMeetMode);
    el.exitMeetBtn.addEventListener('click', toggleMeetMode);

    el.openConfigBtn.addEventListener('click', openConfigSheet);
    el.closeConfigBtn.addEventListener('click', closeConfigSheet);
    el.sheetBackdrop.addEventListener('click', closeConfigSheet);
    el.saveConfigBtn.addEventListener('click', saveAndApplyConfig);

    el.addSegmentBtn.addEventListener('click', () => {
      const nextScene = VALID_SCENES[state.draftConfig.segments.length % VALID_SCENES.length];
      state.draftConfig.segments.push({
        id: `seg-${Date.now()}`,
        title: `Nuevo punto ${state.draftConfig.segments.length + 1}`,
        description: '',
        durationSeconds: 180,
        scene: nextScene,
      });
      renderEditorSegments();
      el.segmentsEditorList.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = PRESETS[btn.dataset.preset];
        if (!preset) return;
        state.draftConfig.title = preset.title;
        state.draftConfig.segments = preset.segments.map((s) => ({ ...s, id: `${s.id}-${Date.now()}` }));
        el.titleInput.value = state.draftConfig.title;
        renderEditorSegments();
      });
    });

    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') closeConfigSheet();
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowRight') {
        loadSegment(state.currentIndex + 1, state.isRunning);
      } else if (e.key === 'ArrowLeft') {
        if (state.currentIndex > 0) loadSegment(state.currentIndex - 1, state.isRunning);
      } else if (e.key.toLowerCase() === 'r') {
        loadSegment(state.currentIndex, false);
      } else if (e.key.toLowerCase() === 'h') {
        toggleMeetMode();
      } else if (e.key.toLowerCase() === 'm') {
        state.config.soundEnabled = !state.config.soundEnabled;
        persistConfig(state.config);
        renderControlsAndTimer();
      } else if (e.key === 'Escape' && !el.configSheet.classList.contains('hidden')) {
        closeConfigSheet();
      }
    });
  }

  init();
})();
