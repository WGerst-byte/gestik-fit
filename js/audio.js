/**
 * GestikFit - Audio & Sprachausgabe Modul
 * 1. Web Audio API: Sanfte, melodische Signaltöne ohne Schreckeffekt
 * 2. Web Speech API: Deutliche, verlangsamte deutsche Sprachausgabe (Tempo 0.8)
 * 3. Ermutigendes Positives Feedback System
 */

class GestikAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.synth = window.speechSynthesis || null;
    this.speechRate = 0.85; // Leicht verlangsamt für optimale Verständlichkeit
    this.speechPitch = 1.0;
    this.germanVoice = null;
    this.lastFeedbackIndex = -1;

    this.encouragements = [
      'Großartig gemacht!',
      'Wunderbar gehalten!',
      'Klasse Bewegung!',
      'Perfekte Fingerhaltung!',
      'Hervorragend! Weiter so!',
      'Jeder Millimeter bringt Kraft zurück!',
      'Ganz stark gekämpft!',
      'Fantastisch, deine Hand reagiert super!',
      'Schön entspannt bleiben, spitze gelöst!',
      'Tolles Handtraining! Du machst Fortschritte!'
    ];

    this.initVoice();
    if (this.synth && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.initVoice();
    }
  }

  /**
   * Sucht eine hochwertige deutsche Stimme
   */
  initVoice() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      this.germanVoice = voices.find(v => v.lang && v.lang.startsWith('de') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Katja') || v.name.includes('Stefan')))
        || voices.find(v => v.lang && v.lang.startsWith('de'))
        || null;
    } catch (e) {
      console.warn('Voice init warning:', e);
    }
  }

  /**
   * AudioContext bei erster Nutzerinteraktion initialisieren
   */
  initAudioContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Stummschaltung umschalten
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.synth) {
      this.synth.cancel();
    }
    return this.isMuted;
  }

  /**
   * Sanften Sinuston abspielen (Weiches Ein- und Ausblenden)
   */
  playTone(frequency, duration = 0.25, gainVal = 0.12) {
    if (this.isMuted) return;
    try {
      this.initAudioContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainVal, this.ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('playTone error:', e);
    }
  }

  /**
   * Startton beim Start einer Geste
   */
  playStartTone() {
    this.playTone(523.25, 0.2, 0.1); // C5
  }

  /**
   * Leiser Klick / Tick beim Halten
   */
  playHoldTick() {
    this.playTone(659.25, 0.06, 0.04); // E5 ganz leise
  }

  /**
   * Warnton bei ablaufender Zeit (sanfter Takt)
   */
  playWarningTick() {
    this.playTone(392.00, 0.1, 0.06); // G4
  }

  /**
   * Harmonischer Dur-Dreiklang bei erfolgreichem Halten der Geste
   */
  playSuccessChime() {
    if (this.isMuted) return;
    try {
      this.initAudioContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const playNote = (freq, start, dur) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.12, now + start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      };

      playNote(523.25, 0.0, 0.25); // C5
      playNote(659.25, 0.12, 0.25); // E5
      playNote(783.99, 0.24, 0.40); // G5
      playNote(1046.50, 0.38, 0.55); // C6 Jubelton
    } catch (e) {
      console.warn('playSuccessChime error:', e);
    }
  }

  /**
   * Feierliche Fanfare bei Workout-Abschluss / Levelaufstieg
   */
  playLevelUpFanfare() {
    if (this.isMuted) return;
    try {
      this.initAudioContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0.0, d: 0.2 },
        { f: 659.25, t: 0.18, d: 0.2 },
        { f: 783.99, t: 0.36, d: 0.2 },
        { f: 1046.50, t: 0.54, d: 0.6 }
      ];

      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.001, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.15, now + n.t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } catch (e) {
      console.warn('playLevelUpFanfare error:', e);
    }
  }

  /**
   * Sprachausgabe (Web Speech API)
   */
  speak(text) {
    if (this.isMuted || !this.synth) return;
    try {
      this.synth.cancel(); // Vorherige Sätze abbrechen
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = this.speechRate;
      utterance.pitch = this.speechPitch;
      if (this.germanVoice) {
        utterance.voice = this.germanVoice;
      }
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }

  /**
   * Positives, ermutigendes Feedback zufällig auswählen und vorlesen
   */
  speakRandomEncouragement() {
    let index = Math.floor(Math.random() * this.encouragements.length);
    if (index === this.lastFeedbackIndex) {
      index = (index + 1) % this.encouragements.length;
    }
    this.lastFeedbackIndex = index;
    const msg = this.encouragements[index];
    this.speak(msg);
    return msg;
  }
}

// Globale Audio-Instanz
const appAudio = new GestikAudio();
