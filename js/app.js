/**
 * GestikFit - Haupt-Applikationslogik
 * Verwaltet Navigation, Kamera, MediaPipe Hands Integration,
 * Trainings-Sequenzen, adaptiven Loop, UI-Feedback und Barrierefreiheit.
 */

class GestikApp {
  constructor() {
    this.currentTab = 'start';
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;
    this.cameraInstance = null;
    this.mediaPipeHands = null;

    // Trainings-Zustand
    this.isTrainingActive = false;
    this.trainingQueue = [];
    this.currentQueueIndex = 0;
    this.currentGesture = null;
    this.isPaused = false;
    this.simulationMode = false;

    // Timer & Haltezeit-Tracking
    this.holdProgress = 0; // 0 bis 1
    this.holdStartTime = null;
    this.gestureStartTime = null;
    this.timeLimitInterval = null;
    this.timeRemaining = 0;
    this.isHoldCompleted = false;
    this.lastTickTime = 0;

    // Video Facing Mode (User / Environment)
    this.facingMode = 'user';
  }

  /**
   * App Initialisierung beim DOM-Ready
   */
  init() {
    this.videoElement = document.getElementById('webcam-video');
    this.canvasElement = document.getElementById('detection-canvas');
    if (this.canvasElement) {
      this.canvasCtx = this.canvasElement.getContext('2d');
    }

    this.initAccessibility();
    this.initMediaPipe();
    this.renderGesturesCatalogs();
    this.updateUIState();
    this.renderDiary();

    // Tastaturkürzel zur Barrierefreiheit
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' && this.isTrainingActive) {
        // Leertaste = Pause/Weiter
        e.preventDefault();
        this.togglePause();
      }
    });

    console.log('GestikFit erfolgreich initialisiert.');
  }

  // =========================================================================
  // BARRIEREFREIHEIT & SETTINGS
  // =========================================================================

  initAccessibility() {
    // Gespeicherte Schriftgröße laden
    const savedFontSize = localStorage.getItem('gestikfit_fontsize') || 'normal';
    this.setFontSize(savedFontSize);

    // Gespeicherten Kontrastmodus laden
    const savedContrast = localStorage.getItem('gestikfit_contrast') === 'true';
    if (savedContrast) {
      document.documentElement.classList.add('high-contrast');
    }

    // Gespeichertes Hand-Setting anwenden
    const params = adaptiveManager.getCurrentParams();
    this.updateHandUI(params.handPreference);
  }

  setFontSize(size) {
    document.documentElement.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    document.documentElement.classList.add('font-size-' + size);
    localStorage.setItem('gestikfit_fontsize', size);

    // Button-Highlights
    ['normal', 'large', 'xlarge'].forEach(s => {
      const btn = document.getElementById('btn-font-' + s);
      if (btn) {
        if (s === size) {
          btn.classList.add('bg-teal-600', 'text-white');
          btn.classList.remove('text-slate-700');
        } else {
          btn.classList.remove('bg-teal-600', 'text-white');
          btn.classList.add('text-slate-700');
        }
      }
    });
  }

  toggleHighContrast() {
    const isHigh = document.documentElement.classList.toggle('high-contrast');
    localStorage.setItem('gestikfit_contrast', isHigh ? 'true' : 'false');
  }

  setHandPreference(hand) {
    adaptiveManager.setHandPreference(hand);
    this.updateHandUI(hand);
    appAudio.speak('Trainiere jetzt ' + (hand === 'links' ? 'linke Hand' : hand === 'rechts' ? 'rechte Hand' : 'beide Hände'));
  }

  updateHandUI(hand) {
    ['links', 'rechts', 'beide'].forEach(h => {
      const btn = document.getElementById('btn-hand-' + h);
      if (btn) {
        if (h === hand) {
          btn.classList.add('bg-teal-600', 'text-white', 'shadow-sm');
          btn.classList.remove('bg-white', 'text-slate-700');
        } else {
          btn.classList.remove('bg-teal-600', 'text-white', 'shadow-sm');
          btn.classList.add('bg-white', 'text-slate-700');
        }
      }
    });

    const badge = document.getElementById('header-hand-badge');
    if (badge) {
      badge.textContent = hand === 'links' ? '✋ Links' : hand === 'rechts' ? '🤚 Rechts' : '🤲 Beide Hände';
    }
  }

  // =========================================================================
  // TAB NAVIGATION
  // =========================================================================

  switchTab(tabId) {
    this.currentTab = tabId;

    // Alle Tab-Inhalte umschalten
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.add('hidden');
    });
    const target = document.getElementById('tab-' + tabId);
    if (target) {
      target.classList.remove('hidden');
    }

    // Navigation-Buttons aktualisieren
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('bg-teal-600', 'text-white');
        btn.classList.remove('text-slate-700', 'hover:bg-slate-200');
      } else {
        btn.classList.remove('bg-teal-600', 'text-white');
        btn.classList.add('text-slate-700', 'hover:bg-slate-200');
      }
    });

    // Wenn aus dem Trainingstab herausgewechselt wird, Training pausieren
    if (tabId !== 'training' && this.isTrainingActive) {
      this.pauseTraining();
    }

    if (tabId === 'diary') {
      this.renderDiary();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // GESTEN-KATALOGE RENDERN
  // =========================================================================

  renderGesturesCatalogs() {
    const handContainer = document.getElementById('hand-gestures-grid');
    const armContainer = document.getElementById('arm-gestures-grid');

    if (handContainer) {
      const handGestures = GESTURES_DATA.filter(g => g.category === 'hand');
      handContainer.innerHTML = handGestures.map(g => this.createGestureCardHTML(g)).join('');
    }

    if (armContainer) {
      const armGestures = GESTURES_DATA.filter(g => g.category === 'arm');
      armContainer.innerHTML = armGestures.map(g => this.createGestureCardHTML(g)).join('');
    }
  }

  createGestureCardHTML(gesture) {
    const diffStars = '⭐'.repeat(gesture.schwierigkeit);
    return `
      <div class="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-teal-500 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-100 shrink-0">
              <span class="text-4xl" role="img" aria-label="${gesture.name}">${gesture.emoji}</span>
            </div>
            <div class="text-right">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                ${diffStars}
              </span>
            </div>
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-1">${gesture.name}</h3>
          <p class="text-sm font-bold text-teal-700 mb-3">${gesture.kurzbeschreibung}</p>
          <div class="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs text-slate-600 mb-4 space-y-1">
            <p><strong>Erkennung:</strong> ${gesture.erkennung}</p>
            <p><strong>Reha-Fokus:</strong> ${gesture.rehaNutzen}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button onclick="app.startSingleGesture('${gesture.id}')" class="btn-touch flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-base font-black shadow-md shadow-teal-600/20">
            Jetzt üben 🎯
          </button>
          <button onclick="appAudio.speak('${gesture.name}. ${gesture.kurzbeschreibung}. ${gesture.erkennung}')" class="btn-touch p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl" title="Vorlesen">
            🔊
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // MEDIAPIPE HANDS & KAMERA INITIALISIERUNG
  // =========================================================================

  async initMediaPipe() {
    const statusText = document.getElementById('camera-status-text');
    const statusDot = document.getElementById('camera-status-dot');

    if (typeof Hands === 'undefined') {
      console.warn('MediaPipe Hands SDK nicht direkt geladen. Simulator-Modus bereit.');
      if (statusText) statusText.textContent = 'Simulator aktiv';
      if (statusDot) statusDot.className = 'w-3 h-3 rounded-full bg-amber-400';
      return;
    }

    try {
      this.mediaPipeHands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.mediaPipeHands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.55
      });

      this.mediaPipeHands.onResults((results) => this.onMediaPipeResults(results));

      if (statusText) statusText.textContent = 'KI bereit';
      if (statusDot) statusDot.className = 'w-3 h-3 rounded-full bg-emerald-400';
    } catch (e) {
      console.warn('MediaPipe Initialisierungsfehler:', e);
      if (statusText) statusText.textContent = 'Simulator-Modus';
    }
  }

  async startCamera() {
    const statusText = document.getElementById('camera-status-text');
    const statusDot = document.getElementById('camera-status-dot');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.enableSimulatorMode('Webcam im aktuellen Browser nicht verfügbar (bitte auf localhost oder HTTPS öffnen).');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      this.videoElement.srcObject = stream;
      await this.videoElement.play();

      if (statusText) statusText.textContent = 'Kamera aktiv';
      if (statusDot) statusDot.className = 'w-3 h-3 rounded-full bg-emerald-400 animate-pulse';

      this.resizeCanvas();
      this.startCameraProcessingLoop();
      return true;
    } catch (err) {
      console.warn('Kamera konnte nicht gestartet werden:', err);
      this.enableSimulatorMode('Kamera-Zugriff wurde verweigert oder ist nicht verfügbar. Simulator aktiviert!');
      return false;
    }
  }

  stopCamera() {
    if (this.videoElement && this.videoElement.srcObject) {
      const tracks = this.videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.videoElement.srcObject = null;
    }
    const statusText = document.getElementById('camera-status-text');
    const statusDot = document.getElementById('camera-status-dot');
    if (statusText) statusText.textContent = 'Kamera aus';
    if (statusDot) statusDot.className = 'w-3 h-3 rounded-full bg-slate-400';
  }

  async switchCameraFacing() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    this.stopCamera();
    await this.startCamera();
  }

  resizeCanvas() {
    if (this.videoElement && this.canvasElement) {
      const w = this.videoElement.videoWidth || 640;
      const h = this.videoElement.videoHeight || 480;
      this.canvasElement.width = w;
      this.canvasElement.height = h;
    }
  }

  startCameraProcessingLoop() {
    const processFrame = async () => {
      if (this.videoElement && this.videoElement.readyState >= 2 && !this.videoElement.paused && !this.isPaused) {
        if (this.mediaPipeHands) {
          try {
            await this.mediaPipeHands.send({ image: this.videoElement });
          } catch (e) {
            // Frame überspringen bei hohem Durchsatz
          }
        }
      }
      if (this.videoElement && this.videoElement.srcObject) {
        requestAnimationFrame(processFrame);
      }
    };
    requestAnimationFrame(processFrame);
  }

  enableSimulatorMode(reason = '') {
    this.simulationMode = true;
    const simBox = document.getElementById('simulator-panel');
    if (simBox) simBox.classList.remove('hidden');

    const statusText = document.getElementById('camera-status-text');
    const statusDot = document.getElementById('camera-status-dot');
    if (statusText) statusText.textContent = 'Simulator aktiv';
    if (statusDot) statusDot.className = 'w-3 h-3 rounded-full bg-amber-400';

    if (reason) {
      const reasonEl = document.getElementById('simulator-reason');
      if (reasonEl) reasonEl.textContent = reason;
    }
  }

  // =========================================================================
  // MEDIAPIPE FRAME RESULTS & HALTEZEIT-TRACKING
  // =========================================================================

  onMediaPipeResults(results) {
    if (!this.canvasCtx || !this.canvasElement) return;

    const w = this.canvasElement.width;
    const h = this.canvasElement.height;

    // Canvas säubern
    this.canvasCtx.clearRect(0, 0, w, h);

    if (!this.isTrainingActive || this.isPaused || !this.currentGesture) {
      // Wenn kein aktives Training: Skelett zeichnen, falls Hand im Bild
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          gestureDetector.drawLandmarks(this.canvasCtx, landmarks, w, h, false);
        }
      }
      return;
    }

    const params = adaptiveManager.getCurrentParams();
    gestureDetector.setTolerance(params.tolerance);

    // Geste analysieren
    const analysis = gestureDetector.analyze(
      this.currentGesture.id,
      results.multiHandLandmarks,
      results.multiHandedness,
      params.handPreference
    );

    // Hand-Skelette zeichnen
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        gestureDetector.drawLandmarks(this.canvasCtx, landmarks, w, h, analysis.detected);
      }
    }

    // UI-Hinweis aktualisieren
    this.updateDetectionFeedback(analysis);

    // Haltezeit auswerten
    this.processHoldDetection(analysis.detected);
  }

  updateDetectionFeedback(analysis) {
    const hintEl = document.getElementById('training-hint');
    const statusBadge = document.getElementById('training-status-badge');

    if (analysis.detected) {
      if (statusBadge) {
        statusBadge.textContent = '✅ Geste erkannt! Jetzt ruhig halten';
        statusBadge.className = 'px-4 py-2 rounded-2xl text-sm sm:text-base font-black bg-emerald-500 text-white shadow-md animate-pulse';
      }
      if (hintEl) hintEl.textContent = analysis.hint || 'Super! Halteposition beibehalten';
    } else {
      if (statusBadge) {
        statusBadge.textContent = '🔍 Suche Geste...';
        statusBadge.className = 'px-4 py-2 rounded-2xl text-sm sm:text-base font-black bg-blue-100 text-blue-900 border border-blue-200';
      }
      if (hintEl) hintEl.textContent = analysis.hint || 'Bringe deine Hand in Position';
    }
  }

  processHoldDetection(isDetected) {
    if (this.isHoldCompleted) return;

    const params = adaptiveManager.getCurrentParams();
    const requiredHoldTime = params.holdTime;
    const now = Date.now();

    if (isDetected) {
      if (!this.holdStartTime) {
        this.holdStartTime = now;
      }

      const elapsedHold = (now - this.holdStartTime) / 1000;
      this.holdProgress = Math.min(1.0, elapsedHold / requiredHoldTime);

      // Sanfter Tick alle 350ms beim Halten
      if (now - this.lastTickTime > 350) {
        appAudio.playHoldTick();
        this.lastTickTime = now;
      }

      this.updateHoldCircle(this.holdProgress, true);

      // Haltezeit erfolgreich abgeschlossen!
      if (this.holdProgress >= 1.0) {
        this.completeGestureSuccess();
      }
    } else {
      // Wenn die Geste verloren geht: Haltefortschritt sanft abbauen
      this.holdStartTime = null;
      this.holdProgress = Math.max(0, this.holdProgress - 0.05);
      this.updateHoldCircle(this.holdProgress, false);
    }
  }

  updateHoldCircle(progress, isHolding) {
    const circleBar = document.getElementById('hold-progress-bar');
    const circleText = document.getElementById('hold-progress-text');
    if (!circleBar) return;

    const circumference = 283; // 2 * PI * 45
    const offset = circumference - (progress * circumference);
    circleBar.style.strokeDashoffset = offset;

    if (circleText) {
      const params = adaptiveManager.getCurrentParams();
      const currentHold = (progress * params.holdTime).toFixed(1);
      circleText.textContent = `${currentHold}s / ${params.holdTime.toFixed(1)}s`;
    }

    if (isHolding && progress > 0.1) {
      circleBar.className = 'hold-circle-bar holding';
    } else {
      circleBar.className = 'hold-circle-bar searching';
    }
  }

  // =========================================================================
  // TRAININGS-SEQUENZ & WORKOUTS
  // =========================================================================

  startSingleGesture(gestureId) {
    const g = GESTURES_MAP[gestureId];
    if (!g) return;

    this.trainingQueue = [g];
    this.currentQueueIndex = 0;
    this.startTrainingSession();
  }

  startDailyWorkout() {
    // 6 ausgewogene Gesten (4 Hände, 2 Arme)
    const dailyIds = ['daumen-hoch', 'offene-hand', 'peace', 'haende-hoch', 'ok-zeichen', 'haende-zusammen'];
    this.trainingQueue = dailyIds.map(id => GESTURES_MAP[id]).filter(Boolean);
    this.currentQueueIndex = 0;
    this.startTrainingSession();
  }

  startHandWorkout() {
    // 8 Handzeichen
    const handIds = ['daumen-hoch', 'daumen-runter', 'faust', 'offene-hand', 'peace', 'zeigefinger', 'ok-zeichen', 'gespreizte-hand'];
    this.trainingQueue = handIds.map(id => GESTURES_MAP[id]).filter(Boolean);
    this.currentQueueIndex = 0;
    this.startTrainingSession();
  }

  startArmWorkout() {
    // Alle 5 Armbewegungen
    const armIds = ['haende-hoch', 'haende-offen', 'haende-zusammen', 'winken', 'muskel-zeigen'];
    this.trainingQueue = armIds.map(id => GESTURES_MAP[id]).filter(Boolean);
    this.currentQueueIndex = 0;
    this.startTrainingSession();
  }

  async startTrainingSession() {
    this.switchTab('training');
    this.isTrainingActive = true;
    this.isPaused = false;

    // Kamera starten falls nicht aktiv
    if (!this.simulationMode && (!this.videoElement.srcObject || this.videoElement.paused)) {
      await this.startCamera();
    }

    this.loadCurrentQueueGesture();
  }

  loadCurrentQueueGesture() {
    if (this.currentQueueIndex >= this.trainingQueue.length) {
      this.finishWorkout();
      return;
    }

    this.currentGesture = this.trainingQueue[this.currentQueueIndex];
    this.holdProgress = 0;
    this.holdStartTime = null;
    this.isHoldCompleted = false;
    this.gestureStartTime = Date.now();

    const params = adaptiveManager.getCurrentParams();
    this.timeRemaining = params.timeLimit;

    // UI aktualisieren
    this.updateTrainingViewUI();
    this.updateHoldCircle(0, false);

    // Audio-Ankündigung
    appAudio.playStartTone();
    appAudio.speak(`${this.currentGesture.name}. ${this.currentGesture.kurzbeschreibung}`);

    // Zeitlimit-Timer starten
    this.startTimeLimitTimer();
  }

  updateTrainingViewUI() {
    const g = this.currentGesture;
    if (!g) return;

    const emojiEl = document.getElementById('target-gesture-emoji');
    const nameEl = document.getElementById('target-gesture-name');
    const descEl = document.getElementById('target-gesture-desc');
    const counterEl = document.getElementById('training-step-counter');
    const levelBadgeEl = document.getElementById('training-level-badge');
    const benefitEl = document.getElementById('training-reha-benefit');

    if (emojiEl) emojiEl.textContent = g.emoji;
    if (nameEl) nameEl.textContent = g.name;
    if (descEl) descEl.textContent = g.kurzbeschreibung;
    if (benefitEl) benefitEl.textContent = g.rehaNutzen;

    if (counterEl) {
      counterEl.textContent = `Übung ${this.currentQueueIndex + 1} von ${this.trainingQueue.length}`;
    }

    const params = adaptiveManager.getCurrentParams();
    if (levelBadgeEl) {
      levelBadgeEl.textContent = `${params.levelName} (${params.holdTime.toFixed(1)}s Halten)`;
    }

    this.updateTimerDisplay();
  }

  startTimeLimitTimer() {
    if (this.timeLimitInterval) clearInterval(this.timeLimitInterval);

    this.timeLimitInterval = setInterval(() => {
      if (this.isPaused || this.isHoldCompleted) return;

      const params = adaptiveManager.getCurrentParams();
      if (params.noTimeLimit) {
        this.timeRemaining = 999;
        this.updateTimerDisplay();
        return;
      }

      this.timeRemaining--;
      this.updateTimerDisplay();

      // Akustische Warnung bei letzten 3 Sekunden
      if (this.timeRemaining <= 3 && this.timeRemaining > 0) {
        appAudio.playWarningTick();
      }

      if (this.timeRemaining <= 0) {
        clearInterval(this.timeLimitInterval);
        this.handleTimeLimitExpired();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timerEl = document.getElementById('training-time-remaining');
    const params = adaptiveManager.getCurrentParams();

    if (!timerEl) return;
    if (params.noTimeLimit) {
      timerEl.textContent = '⏱️ Zeit: Entspannt';
      return;
    }

    timerEl.textContent = `⏱️ Zeit: ${this.timeRemaining}s`;
    if (this.timeRemaining <= 5) {
      timerEl.className = 'font-black text-rose-600 animate-pulse';
    } else {
      timerEl.className = 'font-bold text-slate-700';
    }
  }

  handleTimeLimitExpired() {
    appAudio.speak('Zeit ist abgelaufen. Ganz entspannt bleiben!');

    // Adaptiver Manager reagiert auf Fehlversuch
    const adaptRes = adaptiveManager.recordAttempt(
      this.currentGesture.id,
      this.currentGesture.name,
      adaptiveManager.getCurrentParams().timeLimit,
      false
    );

    this.showEncouragementModal(
      '🌱 Kein Problem! Jeder Versuch trainiert dein Gehirn.',
      'Nimm dir Zeit. Du kannst die Geste wiederholen oder zur nächsten übergehen.',
      adaptRes
    );
  }

  completeGestureSuccess() {
    if (this.isHoldCompleted) return;
    this.isHoldCompleted = true;
    if (this.timeLimitInterval) clearInterval(this.timeLimitInterval);

    const duration = (Date.now() - this.gestureStartTime) / 1000;

    // 1. Audio Fanfare & Stimme
    appAudio.playSuccessChime();
    const praiseMsg = appAudio.speakRandomEncouragement();

    // 2. Konfetti!
    confettiManager.fire(80);

    // 3. Adaptiver Manager registriert Erfolg
    const adaptRes = adaptiveManager.recordAttempt(
      this.currentGesture.id,
      this.currentGesture.name,
      duration,
      true
    );

    // 4. Feier-Overlay zeigen
    const statusBadge = document.getElementById('training-status-badge');
    if (statusBadge) {
      statusBadge.textContent = '🎉 ' + praiseMsg;
      statusBadge.className = 'px-6 py-3 rounded-2xl text-lg font-black bg-emerald-600 text-white shadow-xl animate-bounce';
    }

    // 5. Automatisch weiter nach 2.4 Sekunden
    setTimeout(() => {
      if (adaptRes && adaptRes.type === 'level-up') {
        appAudio.playLevelUpFanfare();
        this.showEncouragementModal(adaptRes.title, adaptRes.message, adaptRes, () => {
          this.advanceToNextGesture();
        });
      } else {
        this.advanceToNextGesture();
      }
    }, 2400);
  }

  advanceToNextGesture() {
    this.currentQueueIndex++;
    if (this.currentQueueIndex < this.trainingQueue.length) {
      this.loadCurrentQueueGesture();
    } else {
      this.finishWorkout();
    }
  }

  finishWorkout() {
    this.isTrainingActive = false;
    if (this.timeLimitInterval) clearInterval(this.timeLimitInterval);

    appAudio.playLevelUpFanfare();
    confettiManager.fire(120);

    const streakStats = adaptiveManager.getStreakStats();
    appAudio.speak('Herzlichen Glückwunsch! Du hast das heutige Reha-Workout erfolgreich abgeschlossen.');

    this.showEncouragementModal(
      '🏆 Workout erfolgreich gemeistert!',
      `Du hast ${this.trainingQueue.length} Übungen abgeschlossen. Dein Reha-Streak liegt bei ${streakStats.streak} Tag(en) in Folge!`,
      null,
      () => {
        this.switchTab('diary');
      }
    );
  }

  // =========================================================================
  // STEUERUNG: PAUSE, WEITER, SIMULATOR-TRIGGER
  // =========================================================================

  togglePause() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById('btn-pause-training');
    if (btn) {
      btn.textContent = this.isPaused ? '▶️ Weiter' : '⏸️ Pause';
      btn.classList.toggle('bg-amber-500', this.isPaused);
      btn.classList.toggle('bg-slate-200', !this.isPaused);
    }
  }

  pauseTraining() {
    this.isPaused = true;
    const btn = document.getElementById('btn-pause-training');
    if (btn) btn.textContent = '▶️ Weiter';
  }

  skipCurrentGesture() {
    if (this.timeLimitInterval) clearInterval(this.timeLimitInterval);
    appAudio.speak('Übung übersprungen');
    this.advanceToNextGesture();
  }

  repeatCurrentGesture() {
    this.loadCurrentQueueGesture();
  }

  simulateGestureSuccess() {
    // Simulator-Knopf für Testbetrieb ohne Kamera
    if (!this.isTrainingActive) {
      this.startSingleGesture('daumen-hoch');
    }
    this.processHoldDetection(true);
    setTimeout(() => {
      this.completeGestureSuccess();
    }, 1200);
  }

  // =========================================================================
  // MODALS & ERMUTIGUNGS-DIALOGE
  // =========================================================================

  showEncouragementModal(title, message, adaptData = null, onClose = null) {
    const modal = document.getElementById('encouragement-modal');
    if (!modal) return;

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-desc').textContent = message;

    modal.classList.remove('hidden');

    const nextBtn = document.getElementById('modal-btn-next');
    nextBtn.onclick = () => {
      modal.classList.add('hidden');
      if (onClose) onClose();
    };
  }

  closeModal() {
    const modal = document.getElementById('encouragement-modal');
    if (modal) modal.classList.add('hidden');
  }

  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    const params = adaptiveManager.getCurrentParams();
    document.getElementById('setting-level-select').value = params.level;
    document.getElementById('setting-auto-adaptive').checked = params.autoAdaptive;
    document.getElementById('setting-no-timelimit').checked = params.noTimeLimit;

    modal.classList.remove('hidden');
  }

  saveSettingsModal() {
    const lvl = parseInt(document.getElementById('setting-level-select').value, 10);
    const auto = document.getElementById('setting-auto-adaptive').checked;
    const noLimit = document.getElementById('setting-no-timelimit').checked;

    adaptiveManager.setLevel(lvl);
    adaptiveManager.settings.autoAdaptive = auto;
    adaptiveManager.settings.noTimeLimit = noLimit;
    adaptiveManager.saveSettings();

    document.getElementById('settings-modal').classList.add('hidden');
    this.updateUIState();
    appAudio.speak('Einstellungen gespeichert.');
  }

  // =========================================================================
  // TAGEBUCH & STATISTIK RENDERN
  // =========================================================================

  renderDiary() {
    const listEl = document.getElementById('diary-list');
    const streakEl = document.getElementById('diary-streak-badge');
    const totalEl = document.getElementById('diary-total-count');
    const successRateEl = document.getElementById('diary-success-rate');

    const diary = adaptiveManager.getDiary();
    const streakStats = adaptiveManager.getStreakStats();

    if (streakEl) streakEl.textContent = `${streakStats.streak} Tage`;
    if (totalEl) totalEl.textContent = `${diary.length} Einheiten`;

    const successfulAttempts = diary.filter(d => d.success).length;
    const rate = diary.length > 0 ? Math.round((successfulAttempts / diary.length) * 100) : 100;
    if (successRateEl) successRateEl.textContent = `${rate}%`;

    if (!listEl) return;

    if (diary.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-12 text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <p class="text-4xl mb-2">📖</p>
          <p class="font-bold">Noch keine Trainingseinträge vorhanden.</p>
          <p class="text-xs">Starte heute dein erstes Gestik-Training!</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = diary.slice(0, 50).map(entry => {
      const date = new Date(entry.timestamp);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
      const statusIcon = entry.success ? '✅' : '⏳';
      const statusColor = entry.success ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200';

      return `
        <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${statusIcon}</span>
            <div>
              <p class="font-black text-slate-900">${entry.gestureName}</p>
              <p class="text-xs text-slate-500">${dateStr} um ${timeStr} Uhr · Hand: ${entry.hand}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="inline-block px-2.5 py-1 rounded-xl text-xs font-black border ${statusColor}">
              ${entry.success ? `${entry.holdTime}s gehalten` : 'Timeout'}
            </span>
            <p class="text-[11px] text-slate-400 mt-1">Stufe ${entry.level}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  exportDiaryJSON() {
    const data = adaptiveManager.getDiary();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestikfit-reha-bericht-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  updateUIState() {
    const params = adaptiveManager.getCurrentParams();
    this.updateHandUI(params.handPreference);
  }
}

// Globales Singleton
const app = new GestikApp();

// Auto-Start nach Laden des DOM
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
