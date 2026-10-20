# GestikFit – Gestik-Training PWA: Handzeichen & Armbewegungen

**Barrierearme, KI-gestützte Web-Applikation (PWA)** für das selbstständige oder begleitete Training von Handzeichen und Armbewegungen in der neurologischen Rehabilitation (nach Schlaganfall, bei Hemiparese oder motorischen Einschränkungen).

Entwickelt nach dem bewährten Muster und Qualitätsstandard von **SchlaganfallFit**.

---

## 🌟 Kernfunktionen & Highlights

- **🤖 MediaPipe Hands KI-Erkennung:** Lokale Echtzeit-Erkennung von 21 Hand-Gelenkpunkten (Landmarks) direkt im Browser über die Webcam – ohne Übertragung von Videodaten an externe Server (100% Datenschutz).
- **✋ 10 Handzeichen (Feinmotorik & Tonusregulation):**
  1. 👍 **Daumen hoch:** Daumen nach oben gestreckt, Finger geschlossen (schult isolierte Daumenabduktion)
  2. 👎 **Daumen runter:** Daumen nach unten gestreckt, Finger geschlossen (schult Unterarm-Pronation)
  3. ✌️ **Peace / Victory:** Zeige- und Mittelfinger gestreckt, Ring/klein gebeugt (durchbricht Beugesynergien)
  4. 🤙 **Hang Loose / Shaka:** Daumen und kleiner Finger gestreckt (öffnet Hohlhandbogen)
  5. 👊 **Faust machen:** Alle 5 Finger geschlossen (aktiviert Kraftgriff)
  6. ✋ **Offene Hand:** Alle Finger gestreckt (hemmt Beugespastik, dehnt Sehnen)
  7. ☝️ **Zeigefinger:** Nur Zeigefinger aufrecht gestreckt (Alltagstauglichkeit: Tippen & Drücken)
  8. 🤞 **Gekreuzte Finger:** Zeige- und Mittelfinger überkreuzt (hohe Schule der Zwischenknochenmuskeln)
  9. 👌 **OK-Zeichen:** Daumen und Zeigefinger bilden Kreis (Präzisions-Spitzgriff)
  10. 🖐️ **Gespreizte Hand:** Alle Finger weit fächerförmig gespreizt (aktiviert dorsale Interossei)
- **💪 5 Armbewegungen (Grobmotorik & Schultergesundheit):**
  1. 🙌 **Hände hoch:** Beide Hände über Schulterhöhe (Überkopf-Mobilisation)
  2. 👐 **Hände offen:** Beide Hände gleichzeitig offen zeigen (bilaterale Rumpf-Aufrichtung)
  3. 🙏 **Hände zusammen:** Handflächen vor der Brust aneinander (Überquerung der Körpermitte)
  4. 👋 **Winken:** Hand seitlich hin- und herbewegen (dynamische Radio-Ulnar-Mobilisation)
  5. 💪 **Muskel zeigen:** Faust machen, Arm anwinkeln (kontrollierte Bizeps-Beugung)
- **🤲 Hand-Auswahl (Individueller Reha-Fokus):**
  - **Links:** Gezieltes Training der betroffenen linken Hand
  - **Rechts:** Gezieltes Training der rechten Hand
  - **Beide Hände:** Koordinatives Training beider Hemisphären
- **📈 Adaptive Schwierigkeit (Passt sich automatisch an):**
  - **Stufe 1 (Sanft):** 1.0s Haltezeit · 25s Zeitlimit · Hohe Toleranz
  - **Stufe 2 (Aktiv):** 1.8s Haltezeit · 15s Zeitlimit · Mittlere Toleranz
  - **Stufe 3 (Dynamisch):** 2.6s Haltezeit · 10s Zeitlimit · Präzise Erkennung
  - **Dynamische Auto-Anpassung:** Bei 3 schnellen Erfolgen in Serie steigt die Stufe sanft an. Bei Timeouts wird die Haltezeit erleichtert und mehr Zeit gegeben.
  - **Stressfreier Modus:** Zeitlimit kann komplett abgeschaltet werden.
- **🎉 Positives Feedback & Motivation:**
  - Sanfte Web Audio Chimes (harmonische Dur-Akkorde ohne schrille Töne)
  - Deutsche Sprachausgabe (Web Speech API) mit ermutigenden Lob-Meldungen
  - Bunter Konfetti-Regen auf dem Bildschirm
  - Reha-Streak (Tage in Folge) und lokales Tagebuch
- **♿ Barrierefreiheit (One-Thumb & Ergonomie):**
  - Große Touch-Targets (mindestens 64 × 64 px)
  - Dynamischer Schriftgrößen-Umschalter (`A` = 20px, `A+` = 24px, `A++` = 28px)
  - Hoher Kontrast Modus (Gelb/Schwarz)
  - Notfall-Leitfaden (BE-FAST Kasten)
- **📱 PWA & Offline-Fähigkeit:**
  - Installierbar auf Android, iOS und Desktop (Windows/Mac)
  - Vollständiges App-Manifest und Service Worker

---

## 📁 Dateistruktur

```
gestik-fit/
├── index.html                 # Hauptseite mit allen Reitern, Kamera-Player & Modals
├── manifest.json              # PWA-Konfiguration (Android, iOS & Desktop)
├── sw.js                      # Service Worker für Offline-Caching
├── Starte_GestikFit.bat       # Bequemer Starter (startet lokalen Server für Webcam-Support)
├── README.md                  # Dokumentation
├── css/
│   └── custom.css             # Barrierefreie Typografie, Kontraste, Kamera-Mirror & Ring-Timer
├── icons/
│   ├── icon.svg               # Vektor-App-Icon (Hand & KI-Tracking-Punkte)
│   ├── icon-192.png           # PWA Icon 192x192
│   └── icon-512.png           # PWA Icon 512x512
└── js/
    ├── audio.js               # Sanfte Web Audio Töne & deutsche Sprachausgabe (TTS)
    ├── gestures-data.js       # Katalog aller 10 Handzeichen & 5 Armbewegungen
    ├── detector.js            # MediaPipe Echtzeit-Gesten- und Winkelanalyse
    ├── adaptive.js            # Adaptive Schwierigkeits-Engine & Reha-Tagebuch
    ├── confetti.js            # Belohnungs-Partikelsystem
    └── app.js                 # Hauptsteuerung, Kamera-Lifecycle & Event-Handling
```

---

## 🚀 App auf dem Windows-PC starten

1. Öffnen Sie den Ordner `gestik-fit`.
2. Doppelklicken Sie auf die Datei:
   ```cmd
   Starte_GestikFit.bat
   ```
3. Die App startet automatisch einen lokalen Webserver auf Port 8000 (über Python oder Node.js) und öffnet Ihren Standardbrowser unter `http://localhost:8000`.
   *(Dadurch werden Webcam-Zugriff und Service Worker sofort ohne Sicherheitswarnungen aktiviert).*

### Nutzung ohne Webcam (Simulator-Modus)
Falls Sie an einem PC ohne Webcam arbeiten oder die Kamera nicht einschalten möchten, verfügt GestikFit über einen voll funktionsfähigen **Simulator-Modus**:
- Klicken Sie im Training auf den Button **"🤖 Simulator-Klick: Geste bestanden"**
- Sie können alle 15 Gesten, den Haltekreis, das Lob-System und die adaptive Stufenanpassung ohne Webcam testen!

---

## 🔒 Datenschutz & Sicherheit
- Sämtliche Bildverarbeitung erfolgt **ausschließlich lokal auf dem Endgerät** im Arbeitsspeicher des Browsers.
- Es werden keinerlei Kamerabilder gespeichert oder über das Netzwerk übertragen.
- Alle Trainingsstatistiken verbleiben im lokalen Speicher (`localStorage`) des Nutzers.
