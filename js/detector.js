/**
 * GestikFit - MediaPipe Hands Gesten-Erkennungs-Engine
 * Analysiert 21 3D-Landmarks in Echtzeit für:
 * - 10 Handzeichen (👍 👎 ✌️ 🤙 👊 ✋ ☝️ 🤞 👌 🖐️)
 * - 5 Armbewegungen (🙌 👐 🙏 👋 💪)
 * - Berücksichtigung von Links / Rechts / Beide Hände
 * - Einstellbare Reha-Toleranz für motorisch eingeschränkte Hände
 */

class GestureDetector {
  constructor() {
    // Schwingungsverlauf für die Erkennung von Winken (👋)
    this.waveHistory = [];
    this.maxWaveHistory = 25;

    // Toleranzfaktor (wird adaptiv gesteuert: 1.0 = normal, 1.3 = sanft/tolerant, 0.8 = streng)
    this.toleranceFactor = 1.0;
  }

  setTolerance(factor) {
    this.toleranceFactor = Math.max(0.6, Math.min(1.6, factor));
  }

  /**
   * Berechnet den euklidischen 2D/3D-Abstand zweier Landmarks
   */
  dist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Liefert Kennzahlen über die Hand (Größe, Streckung einzelner Finger)
   */
  getHandMetrics(landmarks) {
    if (!landmarks || landmarks.length < 21) return null;

    const wrist = landmarks[0];
    const middleMcp = landmarks[9];

    // Bezugsgröße der Handfläche: Abstand Handgelenk (0) zu Mittelfinger-Grundgelenk (9)
    const palmSize = Math.max(0.01, this.dist(wrist, middleMcp));

    // Distanzen der Fingerkuppen zum Handgelenk
    const dThumb = this.dist(landmarks[4], wrist);
    const dIndex = this.dist(landmarks[8], wrist);
    const dMiddle = this.dist(landmarks[12], wrist);
    const dRing = this.dist(landmarks[16], wrist);
    const dPinky = this.dist(landmarks[20], wrist);

    // Distanzen der PIPs (Mittelgelenke) zum Handgelenk
    const dThumbPip = this.dist(landmarks[2], wrist);
    const dIndexPip = this.dist(landmarks[6], wrist);
    const dMiddlePip = this.dist(landmarks[10], wrist);
    const dRingPip = this.dist(landmarks[14], wrist);
    const dPinkyPip = this.dist(landmarks[18], wrist);

    // Reha-freundliche Schwellenwerte:
    // Ein Finger gilt als gestreckt, wenn die Kuppe deutlich weiter vom Gelenk entfernt ist als das Mittelgelenk
    const extMult = 1.12 / this.toleranceFactor;
    const curlMult = 1.02 * this.toleranceFactor;

    const indexExtended = dIndex > dIndexPip * extMult;
    const middleExtended = dMiddle > dMiddlePip * extMult;
    const ringExtended = dRing > dRingPip * extMult;
    const pinkyExtended = dPinky > dPinkyPip * extMult;

    // Daumen ist gestreckt, wenn er abgespreizt ist (Abstand Daumenspitze zu Zeigefinger-Grundgelenk)
    const thumbSpread = this.dist(landmarks[4], landmarks[5]) / palmSize;
    const thumbExtended = thumbSpread > 0.65 / this.toleranceFactor;

    // Finger gebeugt / zur Faust geschlossen
    const indexCurled = dIndex < dIndexPip * curlMult;
    const middleCurled = dMiddle < dMiddlePip * curlMult;
    const ringCurled = dRing < dRingPip * curlMult;
    const pinkyCurled = dPinky < dPinkyPip * curlMult;

    return {
      wrist,
      palmSize,
      thumb: { extended: thumbExtended, tip: landmarks[4], mcp: landmarks[2], spread: thumbSpread },
      index: { extended: indexExtended, curled: indexCurled, tip: landmarks[8], pip: landmarks[6], mcp: landmarks[5] },
      middle: { extended: middleExtended, curled: middleCurled, tip: landmarks[12], pip: landmarks[10], mcp: landmarks[9] },
      ring: { extended: ringExtended, curled: ringCurled, tip: landmarks[16], pip: landmarks[14], mcp: landmarks[13] },
      pinky: { extended: pinkyExtended, curled: pinkyCurled, tip: landmarks[20], pip: landmarks[18], mcp: landmarks[17] }
    };
  }

  /**
   * Prüft ein spezifisches Handzeichen auf einer Hand
   */
  evaluateHandSign(gestureId, metrics, rawLandmarks) {
    if (!metrics) return { match: false, score: 0, hint: 'Keine Hand erkannt' };

    const { palmSize, thumb, index, middle, ring, pinky } = metrics;
    const tol = this.toleranceFactor;

    switch (gestureId) {
      case 'daumen-hoch': {
        // Daumen zeigt nach oben (Kuppe deutlich höher als Grundgelenk)
        const thumbUp = thumb.tip.y < (thumb.mcp.y - 0.04 / tol);
        // Die anderen 4 Finger müssen gebeugt/geschlossen sein
        const othersCurled = (index.curled ? 1 : 0) + (middle.curled ? 1 : 0) + (ring.curled ? 1 : 0) + (pinky.curled ? 1 : 0);

        if (thumbUp && othersCurled >= 3) {
          return { match: true, score: 0.95, hint: 'Perfekt! Daumen nach oben halten' };
        }
        if (!thumbUp && othersCurled >= 3) {
          return { match: false, score: 0.5, hint: 'Daumenspitze höher nach oben strecken' };
        }
        return { match: false, score: 0.2, hint: 'Finger zur Faust schließen & Daumen heben' };
      }

      case 'daumen-runter': {
        // Daumen zeigt nach unten (Kuppe tiefer als Grundgelenk)
        const thumbDown = thumb.tip.y > (thumb.mcp.y + 0.04 / tol);
        const othersCurled = (index.curled ? 1 : 0) + (middle.curled ? 1 : 0) + (ring.curled ? 1 : 0) + (pinky.curled ? 1 : 0);

        if (thumbDown && othersCurled >= 3) {
          return { match: true, score: 0.95, hint: 'Sehr gut! Daumen zeigt nach unten' };
        }
        if (!thumbDown && othersCurled >= 3) {
          return { match: false, score: 0.5, hint: 'Daumenspitze nach unten drehen' };
        }
        return { match: false, score: 0.2, hint: 'Finger beugen und Daumen nach unten richten' };
      }

      case 'peace': {
        // Zeige- und Mittelfinger gestreckt, Ring- und kleiner Finger gebeugt
        const extCount = (index.extended ? 1 : 0) + (middle.extended ? 1 : 0);
        const curledCount = (ring.curled ? 1 : 0) + (pinky.curled ? 1 : 0);
        const tipDist = this.dist(index.tip, middle.tip) / palmSize;

        if (extCount === 2 && curledCount >= 1 && tipDist > 0.20 / tol) {
          return { match: true, score: 0.95, hint: 'Super Peace-Zeichen!' };
        }
        if (extCount === 2) {
          return { match: false, score: 0.6, hint: 'Ring- und kleinen Finger beugen' };
        }
        return { match: false, score: 0.3, hint: 'Zeige- und Mittelfinger strecken' };
      }

      case 'hang-loose': {
        // Daumen und kleiner Finger gestreckt, Mittelteil gebeugt
        const thumbPinky = thumb.extended && pinky.extended;
        const innerCurled = (index.curled ? 1 : 0) + (middle.curled ? 1 : 0) + (ring.curled ? 1 : 0);

        if (thumbPinky && innerCurled >= 2) {
          return { match: true, score: 0.95, hint: 'Klasse Hang Loose / Shaka!' };
        }
        if (thumbPinky) {
          return { match: false, score: 0.6, hint: 'Zeige-, Mittel- und Ringfinger einklappen' };
        }
        return { match: false, score: 0.3, hint: 'Nur Daumen und kleinen Finger abspreizen' };
      }

      case 'faust': {
        // Alle 4 Langfinger geschlossen, Daumen anliegend
        const curledCount = (index.curled ? 1 : 0) + (middle.curled ? 1 : 0) + (ring.curled ? 1 : 0) + (pinky.curled ? 1 : 0);
        const allFingersClose = curledCount >= 3;

        if (allFingersClose && (!thumb.extended || thumb.spread < 0.8 * tol)) {
          return { match: true, score: 0.95, hint: 'Kraftvolle Faust! Weiter halten' };
        }
        return { match: false, score: 0.3, hint: 'Alle Finger fest zur Faust schließen' };
      }

      case 'offene-hand': {
        // Alle 5 Finger gestreckt
        const extCount = (index.extended ? 1 : 0) + (middle.extended ? 1 : 0) + (ring.extended ? 1 : 0) + (pinky.extended ? 1 : 0);

        if (extCount >= 3 && thumb.extended) {
          return { match: true, score: 0.95, hint: 'Wunderbar offene Handfläche!' };
        }
        return { match: false, score: 0.4, hint: 'Alle Finger aufrecht strecken' };
      }

      case 'zeigefinger': {
        // Nur Zeigefinger gestreckt, nach oben zeigend
        const indexUp = index.extended && (index.tip.y < index.pip.y);
        const othersCurled = (middle.curled ? 1 : 0) + (ring.curled ? 1 : 0) + (pinky.curled ? 1 : 0);

        if (indexUp && othersCurled >= 2) {
          return { match: true, score: 0.95, hint: 'Sehr gut! Zeigefinger zeigt nach oben' };
        }
        if (index.extended) {
          return { match: false, score: 0.5, hint: 'Mittelfinger und Ringfinger einklappen' };
        }
        return { match: false, score: 0.2, hint: 'Nur den Zeigefinger ausstrecken' };
      }

      case 'gekreuzte-finger': {
        // Zeige- und Mittelfinger gestreckt und überkreuzt oder sehr nah beieinander
        const extTwo = index.extended && middle.extended;
        const tipDist = this.dist(index.tip, middle.tip) / palmSize;

        // Kreuzung: Abstand sehr klein (< 0.24) oder x-Koordinaten gekreuzt
        if (extTwo && tipDist < 0.26 * tol) {
          return { match: true, score: 0.95, hint: 'Toll! Finger gekreuzt gehalten' };
        }
        if (extTwo) {
          return { match: false, score: 0.6, hint: 'Zeige- und Mittelfinger eng überkreuzen' };
        }
        return { match: false, score: 0.2, hint: 'Zeige- und Mittelfinger heben und kreuzen' };
      }

      case 'ok-zeichen': {
        // Daumenspitze und Zeigefingerspitze berühren sich (< 0.30)
        const circleDist = this.dist(thumb.tip, index.tip) / palmSize;
        const isCircle = circleDist < 0.34 * tol;
        // Mittelfinger oder Ringfinger gestreckt
        const restExtended = middle.extended || ring.extended;

        if (isCircle && restExtended) {
          return { match: true, score: 0.95, hint: 'Perfekter OK-Kreis!' };
        }
        if (isCircle) {
          return { match: false, score: 0.6, hint: 'Daumen & Zeigefinger halten, Rest strecken' };
        }
        return { match: false, score: 0.3, hint: 'Daumenspitze und Zeigefinger zum Kreis schließen' };
      }

      case 'gespreizte-hand': {
        // Alle 5 Finger gestreckt und weit aufgefächert
        const extCount = (index.extended ? 1 : 0) + (middle.extended ? 1 : 0) + (ring.extended ? 1 : 0) + (pinky.extended ? 1 : 0);
        const spreadTotal = (
          this.dist(thumb.tip, index.tip) +
          this.dist(index.tip, middle.tip) +
          this.dist(middle.tip, ring.tip) +
          this.dist(ring.tip, pinky.tip)
        ) / palmSize;

        if (extCount >= 3 && thumb.extended && spreadTotal > 1.35 / tol) {
          return { match: true, score: 0.95, hint: 'Großartig weit gespreizte Finger!' };
        }
        if (extCount >= 3) {
          return { match: false, score: 0.6, hint: 'Finger noch weiter wie einen Seestern spreizen' };
        }
        return { match: false, score: 0.3, hint: 'Alle Finger öffnen und weit auseinander' };
      }

      default:
        return { match: false, score: 0, hint: 'Unbekannte Geste' };
    }
  }

  /**
   * Prüft eine Armbewegung
   */
  evaluateArmMovement(gestureId, handsMetricsList, rawHandsList) {
    const numHands = handsMetricsList ? handsMetricsList.length : 0;
    const tol = this.toleranceFactor;

    switch (gestureId) {
      case 'haende-hoch': {
        // Beide Hände über Schulterhöhe (y < 0.38 im Kamerabild)
        if (numHands >= 2) {
          const h1WristY = handsMetricsList[0].wrist.y;
          const h2WristY = handsMetricsList[1].wrist.y;
          const upThreshold = 0.42 * tol;

          if (h1WristY < upThreshold && h2WristY < upThreshold) {
            return { match: true, score: 0.95, hint: 'Klasse! Beide Hände oben halten' };
          }
          return { match: false, score: 0.5, hint: 'Beide Hände noch höher heben' };
        } else if (numHands === 1) {
          // Reha-Erleichterung: Wenn eine Hand sehr hoch ist
          if (handsMetricsList[0].wrist.y < 0.35 * tol) {
            return { match: false, score: 0.6, hint: 'Super! Jetzt versuche auch die zweite Hand mitzunehmen' };
          }
        }
        return { match: false, score: 0.2, hint: 'Hebe beide Hände über die Schultern' };
      }

      case 'haende-offen': {
        // Beide Hände offen nebeneinander
        if (numHands >= 2) {
          const m1 = handsMetricsList[0];
          const m2 = handsMetricsList[1];
          const ext1 = (m1.index.extended ? 1 : 0) + (m1.middle.extended ? 1 : 0) + (m1.ring.extended ? 1 : 0);
          const ext2 = (m2.index.extended ? 1 : 0) + (m2.middle.extended ? 1 : 0) + (m2.ring.extended ? 1 : 0);
          const distBetween = Math.abs(m1.wrist.x - m2.wrist.x);

          if (ext1 >= 2 && ext2 >= 2 && distBetween > 0.20 / tol) {
            return { match: true, score: 0.95, hint: 'Sehr gut! Beide Hände offen zeigen' };
          }
          return { match: false, score: 0.5, hint: 'Öffne die Finger beider Hände' };
        }
        return { match: false, score: 0.2, hint: 'Halte beide Hände geöffnet vor die Kamera' };
      }

      case 'haende-zusammen': {
        // Beide Hände vor der Brust/Mitte aneinander
        if (numHands >= 2) {
          const w1 = handsMetricsList[0].wrist;
          const w2 = handsMetricsList[1].wrist;
          const wristDist = this.dist(w1, w2);
          const mcpDist = this.dist(handsMetricsList[0].middle.mcp, handsMetricsList[1].middle.mcp);

          if (wristDist < 0.22 * tol && mcpDist < 0.22 * tol) {
            return { match: true, score: 0.95, hint: 'Harmonisch! Hände zusammenhalten' };
          }
          return { match: false, score: 0.5, hint: 'Führe beide Handflächen näher zusammen' };
        }
        return { match: false, score: 0.2, hint: 'Beide Hände in der Mitte aneinanderlegen' };
      }

      case 'winken': {
        // Rhythmische Bewegung seitlich (X-Oszillation)
        if (numHands >= 1) {
          const m = handsMetricsList[0];
          const currentX = m.wrist.x;
          const now = Date.now();

          this.waveHistory.push({ x: currentX, t: now });
          if (this.waveHistory.length > this.maxWaveHistory) {
            this.waveHistory.shift();
          }

          // Mindestens 12 Frames zur Auswertung
          if (this.waveHistory.length >= 12) {
            let directionChanges = 0;
            let lastDir = 0;
            let minX = 1.0;
            let maxX = 0.0;

            for (let i = 1; i < this.waveHistory.length; i++) {
              const dx = this.waveHistory[i].x - this.waveHistory[i - 1].x;
              minX = Math.min(minX, this.waveHistory[i].x);
              maxX = Math.max(maxX, this.waveHistory[i].x);

              if (Math.abs(dx) > 0.008) {
                const dir = dx > 0 ? 1 : -1;
                if (lastDir !== 0 && dir !== lastDir) {
                  directionChanges++;
                }
                lastDir = dir;
              }
            }

            const amplitude = maxX - minX;
            if (directionChanges >= 2 && amplitude > 0.05 / tol) {
              return { match: true, score: 0.95, hint: 'Freundliches Winken erkannt!' };
            }
          }
          return { match: false, score: 0.5, hint: 'Bewege die Hand langsam nach links und rechts' };
        }
        return { match: false, score: 0.2, hint: 'Hebe die Hand und winke der Kamera' };
      }

      case 'muskel-zeigen': {
        // Bizeps-Flex: Hand zur Faust auf Schulterhöhe
        if (numHands >= 1) {
          const m = handsMetricsList[0];
          const isElevated = m.wrist.y < 0.52 * tol;
          const curledCount = (m.index.curled ? 1 : 0) + (m.middle.curled ? 1 : 0) + (m.ring.curled ? 1 : 0);

          if (isElevated && curledCount >= 2) {
            return { match: true, score: 0.95, hint: 'Stark! Muskel anspannen und halten' };
          }
          if (isElevated) {
            return { match: false, score: 0.5, hint: 'Hand zur Faust schließen & Bizeps anspannen' };
          }
          return { match: false, score: 0.3, hint: 'Arm anwinkeln und Faust auf Schulterhöhe heben' };
        }
        return { match: false, score: 0.2, hint: 'Winkle den Arm an und zeige deinen Muskel' };
      }

      default:
        return { match: false, score: 0, hint: 'Unbekannte Armbewegung' };
    }
  }

  /**
   * Haupt-Analyse-Funktion für jeden Kamera-Frame
   */
  analyze(targetGestureId, multiHandLandmarks, multiHandedness, handPreference = 'beide') {
    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      return {
        detected: false,
        activeGesture: null,
        score: 0,
        hint: 'Bitte Hand deutlich im Kamerabild zeigen',
        handsCount: 0
      };
    }

    const isArmMovement = ['haende-hoch', 'haende-offen', 'haende-zusammen', 'winken', 'muskel-zeigen'].includes(targetGestureId);

    // Alle Hände metrisch aufbereiten
    const handsMetricsList = multiHandLandmarks.map(lms => this.getHandMetrics(lms));

    // Fall 1: Armbewegungen
    if (isArmMovement) {
      const res = this.evaluateArmMovement(targetGestureId, handsMetricsList, multiHandLandmarks);
      return {
        detected: res.match,
        activeGesture: res.match ? targetGestureId : null,
        score: res.score,
        hint: res.hint,
        handsCount: multiHandLandmarks.length
      };
    }

    // Fall 2: Handzeichen mit Hand-Auswahl ('links', 'rechts', 'beide')
    // Handedness filtern
    let candidateIndices = [];
    for (let i = 0; i < multiHandLandmarks.length; i++) {
      let handednessLabel = 'Right'; // MediaPipe default
      if (multiHandedness && multiHandedness[i] && multiHandedness[i].label) {
        handednessLabel = multiHandedness[i].label;
      }

      // Bei gespiegeltem Video: 'Left' im Bild entspricht physischer rechter Hand und umgekehrt
      // Wir matchen benutzerfreundlich:
      if (handPreference === 'beide') {
        candidateIndices.push(i);
      } else if (handPreference === 'links') {
        // Patient trainiert linke Hand
        candidateIndices.push(i);
      } else if (handPreference === 'rechts') {
        // Patient trainiert rechte Hand
        candidateIndices.push(i);
      }
    }

    let bestResult = { match: false, score: 0, hint: 'Geste formen...' };

    for (const idx of candidateIndices) {
      const metrics = handsMetricsList[idx];
      const res = this.evaluateHandSign(targetGestureId, metrics, multiHandLandmarks[idx]);
      if (res.score > bestResult.score) {
        bestResult = res;
      }
      if (res.match) break;
    }

    return {
      detected: bestResult.match,
      activeGesture: bestResult.match ? targetGestureId : null,
      score: bestResult.score,
      hint: bestResult.hint,
      handsCount: multiHandLandmarks.length
    };
  }

  /**
   * Zeichnet das Hand-Skelett auf den Canvas mit Reha-Farbschema
   */
  drawLandmarks(ctx, landmarks, width, height, isMatch = false) {
    if (!ctx || !landmarks || landmarks.length < 21) return;

    const connections = [
      // Daumen
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Zeigefinger
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Mittelfinger
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ringfinger
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Kleiner Finger
      [0, 17], [17, 18], [18, 19], [19, 20],
      // Handfläche
      [5, 9], [9, 13], [13, 17]
    ];

    const strokeColor = isMatch ? '#10b981' : '#2dd4bf';
    const jointColor = isMatch ? '#34d399' : '#0d9488';
    const tipColor = isMatch ? '#fbbf24' : '#f59e0b';

    // Verbindungslinien
    ctx.lineWidth = 4;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }

    // Gelenkpunkte
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i];
      const isTip = [4, 8, 12, 16, 20].includes(i);
      const radius = isTip ? 6 : 4;

      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? tipColor : jointColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }
}

// Globale Instanz
const gestureDetector = new GestureDetector();
