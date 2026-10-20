/**
 * GestikFit - Adaptive Schwierigkeit & Reha-Tagebuch Manager
 * Passt Haltezeit und Zeitlimit automatisch an die motorische Verfassung an.
 * Verwaltet Reha-Streak, Hand-Präferenz und lokale Statistiken.
 */

class AdaptiveManager {
  constructor() {
    this.storageKeySettings = 'gestikfit_settings';
    this.storageKeyDiary = 'gestikfit_diary';
    this.storageKeyStreak = 'gestikfit_streak';

    // Standard-Einstellungen
    this.settings = {
      level: 1, // 1 = Sanft, 2 = Aktiv, 3 = Dynamisch
      handPreference: 'beide', // 'links', 'rechts', 'beide'
      autoAdaptive: true, // Automatische Stufenanpassung
      noTimeLimit: false, // Entspannungsmodus ohne Zeitdruck
      customHoldTime: null, // Manuelle Haltezeit-Überschreibung
      customTimeLimit: null // Manuelles Zeitlimit
    };

    // Stufen-Profile
    this.profiles = {
      1: {
        name: 'Sanft (Stufe 1)',
        desc: 'Ideal zu Beginn oder bei Spastik: Kurzes Halten, langes Zeitfenster, hohe Toleranz.',
        holdTime: 1.0,
        timeLimit: 25,
        tolerance: 1.25
      },
      2: {
        name: 'Aktiv (Stufe 2)',
        desc: 'Ausgewogenes Training: Mittlere Haltezeit für nachhaltige Muskelansteuerung.',
        holdTime: 1.8,
        timeLimit: 15,
        tolerance: 1.0
      },
      3: {
        name: 'Dynamisch (Stufe 3)',
        desc: 'Höchste Konzentration: Längere Haltezeit für maximale Kraftausdauer & Koordination.',
        holdTime: 2.6,
        timeLimit: 10,
        tolerance: 0.85
      }
    };

    this.consecutiveFastSuccesses = 0;
    this.consecutiveFails = 0;

    this.loadSettings();
    this.updateStreak();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(this.storageKeySettings);
      if (saved) {
        this.settings = Object.assign(this.settings, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load settings:', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(this.storageKeySettings, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
  }

  setLevel(newLevel) {
    if (this.profiles[newLevel]) {
      this.settings.level = newLevel;
      this.consecutiveFastSuccesses = 0;
      this.consecutiveFails = 0;
      this.saveSettings();
    }
  }

  setHandPreference(hand) {
    if (['links', 'rechts', 'beide'].includes(hand)) {
      this.settings.handPreference = hand;
      this.saveSettings();
    }
  }

  toggleAutoAdaptive() {
    this.settings.autoAdaptive = !this.settings.autoAdaptive;
    this.saveSettings();
    return this.settings.autoAdaptive;
  }

  /**
   * Liefert die aktuellen Übungsparameter (Haltezeit, Zeitlimit, Toleranz)
   */
  getCurrentParams() {
    const p = this.profiles[this.settings.level] || this.profiles[1];
    return {
      level: this.settings.level,
      levelName: p.name,
      holdTime: this.settings.customHoldTime || p.holdTime,
      timeLimit: this.settings.noTimeLimit ? 9999 : (this.settings.customTimeLimit || p.timeLimit),
      tolerance: p.tolerance,
      noTimeLimit: this.settings.noTimeLimit,
      handPreference: this.settings.handPreference,
      autoAdaptive: this.settings.autoAdaptive
    };
  }

  /**
   * Wird nach jeder abgeschlossenen Geste aufgerufen, um adaptiv zu reagieren
   */
  recordAttempt(gestureId, gestureName, durationSeconds, success = true) {
    const params = this.getCurrentParams();
    let adaptationResult = null;

    if (success) {
      this.consecutiveFails = 0;
      // Wenn die Geste schnell gelöst wurde (< 50% des Zeitlimits)
      if (durationSeconds < params.timeLimit * 0.55) {
        this.consecutiveFastSuccesses++;
      } else {
        this.consecutiveFastSuccesses = 0;
      }

      // 3x in Folge sehr schnell und stabil -> Level sanft anheben
      if (this.settings.autoAdaptive && this.consecutiveFastSuccesses >= 3 && this.settings.level < 3) {
        this.settings.level++;
        this.consecutiveFastSuccesses = 0;
        this.saveSettings();
        adaptationResult = {
          type: 'level-up',
          newLevel: this.settings.level,
          title: '🎉 Aufstieg in ' + this.profiles[this.settings.level].name,
          message: 'Deine Handkontrolle wird spürbar sicherer! Wir haben die Haltezeit sanft angepasst.'
        };
      }
    } else {
      // Fehlversuch oder Timeout
      this.consecutiveFastSuccesses = 0;
      this.consecutiveFails++;

      // 2x in Folge Timeout -> Level senken oder Zeitfenster vergrößern
      if (this.settings.autoAdaptive && this.consecutiveFails >= 2 && this.settings.level > 1) {
        this.settings.level--;
        this.consecutiveFails = 0;
        this.saveSettings();
        adaptationResult = {
          type: 'level-down',
          newLevel: this.settings.level,
          title: '🌱 Entspannter Modus aktiviert',
          message: 'Keine Hektik! Wir haben dir mehr Zeit gegeben, damit deine Finger in Ruhe arbeiten können.'
        };
      }
    }

    // Eintrag ins Tagebuch
    this.addDiaryEntry({
      timestamp: new Date().toISOString(),
      gestureId,
      gestureName,
      duration: durationSeconds,
      holdTime: params.holdTime,
      level: this.settings.level,
      hand: this.settings.handPreference,
      success
    });

    return adaptationResult;
  }

  /**
   * Reha-Tagebuch Methoden
   */
  getDiary() {
    try {
      const data = localStorage.getItem(this.storageKeyDiary);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  addDiaryEntry(entry) {
    try {
      const list = this.getDiary();
      list.unshift(entry);
      // Maximal 300 Einträge im Speicher halten
      if (list.length > 300) list.pop();
      localStorage.setItem(this.storageKeyDiary, JSON.stringify(list));
      this.updateStreak();
    } catch (e) {
      console.warn('Could not save diary entry:', e);
    }
  }

  clearDiary() {
    try {
      localStorage.removeItem(this.storageKeyDiary);
    } catch (e) {}
  }

  /**
   * Reha-Streak (Tage in Folge) berechnen
   */
  updateStreak() {
    try {
      const diary = this.getDiary();
      if (!diary || diary.length === 0) {
        localStorage.setItem(this.storageKeyStreak, JSON.stringify({ streak: 0, lastDate: null }));
        return 0;
      }

      // Alle eindeutigen Tage sammeln (YYYY-MM-DD)
      const uniqueDays = Array.from(new Set(diary.map(e => e.timestamp.slice(0, 10)))).sort().reverse();
      const today = new Date().toISOString().slice(0, 10);
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().slice(0, 10);

      let currentStreak = 0;
      let checkDate = new Date();

      // Wenn heute oder gestern trainiert wurde, zählt der Streak
      if (uniqueDays.includes(today) || uniqueDays.includes(yesterday)) {
        for (let i = 0; i < uniqueDays.length; i++) {
          const targetDayStr = checkDate.toISOString().slice(0, 10);
          if (uniqueDays.includes(targetDayStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            // Wenn heute noch nicht trainiert, aber gestern, gestern als Start nehmen
            if (i === 0 && targetDayStr === today && uniqueDays.includes(yesterday)) {
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
            break;
          }
        }
      }

      localStorage.setItem(this.storageKeyStreak, JSON.stringify({
        streak: currentStreak,
        lastDate: uniqueDays[0] || null,
        totalTrainedGestures: diary.filter(d => d.success).length
      }));

      return currentStreak;
    } catch (e) {
      return 0;
    }
  }

  getStreakStats() {
    try {
      const saved = localStorage.getItem(this.storageKeyStreak);
      return saved ? JSON.parse(saved) : { streak: 0, totalTrainedGestures: 0 };
    } catch (e) {
      return { streak: 0, totalTrainedGestures: 0 };
    }
  }
}

// Globale Instanz
const adaptiveManager = new AdaptiveManager();
