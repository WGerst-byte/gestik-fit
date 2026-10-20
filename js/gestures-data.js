/**
 * GestikFit - Gesten- und Bewegungsdatenbank
 * Speziell entwickelt für die neurologische Reha (Schlaganfall, Hemiparese, Handmotorik)
 * 10 Handzeichen + 5 Armbewegungen
 */

const GESTURES_DATA = [
  // =========================================================================
  // 10 HANDZEICHEN
  // =========================================================================
  {
    id: 'daumen-hoch',
    category: 'hand',
    emoji: '👍',
    name: 'Daumen hoch',
    kurzbeschreibung: 'Daumen nach oben, Finger geschlossen',
    erkennung: 'Daumen nach oben gestreckt, restliche vier Finger gebeugt',
    rehaNutzen: 'Kräftigt die Daumenabduktion (Abspreizung) und fördert die selektive Daumenansteuerung getrennt von den Langfingern.',
    tippFuerAngehoerige: 'Achten Sie darauf, dass das Handgelenk stabil bleibt und nicht nach unten wegknickt.',
    schwierigkeit: 1,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M40 85 H65 C72 85 75 78 75 72 L75 48 C75 44 70 42 66 42 L52 42 L54 22 C55 14 48 10 43 14 L36 32 L36 85" fill="#ccfbf1" />
        <rect x="20" y="42" width="16" height="43" rx="4" fill="#99f6e4" />
      </svg>
    `
  },
  {
    id: 'daumen-runter',
    category: 'hand',
    emoji: '👎',
    name: 'Daumen runter',
    kurzbeschreibung: 'Daumen nach unten, Finger geschlossen',
    erkennung: 'Daumen zeigt aktiv nach unten, Finger geschlossen',
    rehaNutzen: 'Trainiert die Pronation (Einwärtsdrehung des Unterarms) und die Beugekontrolle der Hand.',
    tippFuerAngehoerige: 'Patienten mit Beugespastik neigen dazu, die Schulter mitzudrehen. Schulter tief und locker halten.',
    schwierigkeit: 1,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M40 15 H65 C72 15 75 22 75 28 L75 52 C75 56 70 58 66 58 L52 58 L54 78 C55 86 48 90 43 86 L36 68 L36 15" fill="#ccfbf1" />
        <rect x="20" y="15" width="16" height="43" rx="4" fill="#99f6e4" />
      </svg>
    `
  },
  {
    id: 'peace',
    category: 'hand',
    emoji: '✌️',
    name: 'Peace / Victory',
    kurzbeschreibung: 'Zeige- und Mittelfinger gestreckt',
    erkennung: 'Zeige- und Mittelfinger V-förmig gestreckt, Ring- und kleiner Finger gebeugt',
    rehaNutzen: 'Schult die isolierte Streckung der radialen Finger. Sehr anspruchsvoll und wirksam gegen Massensynergien.',
    tippFuerAngehoerige: 'Wenn sich Ring- und kleiner Finger anfangs mitstrecken, darf die gesunde Hand sie leicht anhalten.',
    schwierigkeit: 2,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M38 85 L38 52 L36 18 C36 12 44 12 44 18 L46 48 L56 16 C58 10 66 12 64 20 L58 50 L68 50 C74 50 74 60 74 66 L68 85 Z" fill="#ccfbf1" />
        <rect x="24" y="55" width="14" height="30" rx="4" fill="#99f6e4" />
      </svg>
    `
  },
  {
    id: 'hang-loose',
    category: 'hand',
    emoji: '🤙',
    name: 'Hang Loose (Shaka)',
    kurzbeschreibung: 'Daumen und kleiner Finger gestreckt',
    erkennung: 'Daumen und kleiner Finger weit abgespreizt, innere 3 Finger gebeugt',
    rehaNutzen: 'Fördert die Weite des Hohlhandbogens und aktiviert den Musculus opponens pollicis sowie den Kleinfingerballen.',
    tippFuerAngehoerige: 'Die Übung hilft hervorragend gegen das Einrollen der Handfläche.',
    schwierigkeit: 2,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M40 85 L40 55 L22 45 C16 42 18 32 26 36 L42 46 C42 46 62 46 65 48 L78 28 C82 22 90 26 86 34 L74 60 L70 85 Z" fill="#ccfbf1" />
      </svg>
    `
  },
  {
    id: 'faust',
    category: 'hand',
    emoji: '👊',
    name: 'Faust machen',
    kurzbeschreibung: 'Alle Finger geschlossen',
    erkennung: 'Alle 5 Finger gebeugt zur kräftigen Faust, Handrücken zur Kamera',
    rehaNutzen: 'Aktiviert den Faustschluss (Kraftgriff) und stärkt die tiefen Fingerbeugemuskeln.',
    tippFuerAngehoerige: 'Nur so fest zudrücken, dass keine Schmerzen entstehen. Danach bewusst wieder lösen.',
    schwierigkeit: 1,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <rect x="25" y="35" width="50" height="45" rx="12" fill="#ccfbf1" />
        <line x1="25" y1="52" x2="75" y2="52" stroke="#0d9488" stroke-width="3" />
        <line x1="38" y1="35" x2="38" y2="52" stroke="#0d9488" stroke-width="3" />
        <line x1="50" y1="35" x2="50" y2="52" stroke="#0d9488" stroke-width="3" />
        <line x1="62" y1="35" x2="62" y2="52" stroke="#0d9488" stroke-width="3" />
        <path d="M22 60 C15 50 25 40 32 45 L32 75 Z" fill="#99f6e4" />
      </svg>
    `
  },
  {
    id: 'offene-hand',
    category: 'hand',
    emoji: '✋',
    name: 'Offene Hand',
    kurzbeschreibung: 'Alle Finger aufrecht gestreckt',
    erkennung: 'Alle 5 Finger locker aufrecht gestreckt, Handfläche nach vorn',
    rehaNutzen: 'Klassische Entspannung gegen Beugemuster. Dehnt die Fingersehnen und aktiviert die Strecker (Extensoren).',
    tippFuerAngehoerige: 'Geduld haben. Jeder Zentimeter Streckung ist ein wertvoller Erfolg für das Gehirn.',
    schwierigkeit: 1,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M30 85 L30 60 L18 48 C14 44 20 38 25 42 L32 50 L34 20 C34 14 42 14 42 20 L44 48 L46 14 C46 8 54 8 54 14 L55 48 L58 18 C58 12 66 12 66 18 L67 52 L72 32 C74 26 82 28 80 36 L72 65 L68 85 Z" fill="#ccfbf1" />
      </svg>
    `
  },
  {
    id: 'zeigefinger',
    category: 'hand',
    emoji: '☝️',
    name: 'Zeigefinger nach oben',
    kurzbeschreibung: 'Nur Zeigefinger gestreckt',
    erkennung: 'Zeigefinger zeigt aufrecht nach oben, andere Finger eingerollt',
    rehaNutzen: 'Unabdingbar für Alltagstätigkeiten wie Tippen, Knöpfe drücken und Zeigen. Trainiert den Musculus extensor indicis.',
    tippFuerAngehoerige: 'Loben Sie auch ein leichtes Anheben des Zeigefingers – der Impuls zählt!',
    schwierigkeit: 2,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M38 85 L38 55 L38 18 C38 10 48 10 48 18 L48 50 L68 50 C74 50 74 60 74 66 L68 85 Z" fill="#ccfbf1" />
        <rect x="24" y="55" width="14" height="30" rx="4" fill="#99f6e4" />
      </svg>
    `
  },
  {
    id: 'gekreuzte-finger',
    category: 'hand',
    emoji: '🤞',
    name: 'Gekreuzte Finger',
    kurzbeschreibung: 'Zeige- und Mittelfinger gekreuzt',
    erkennung: 'Mittelfinger über den Zeigefinger gelegt oder eng überkreuzt',
    rehaNutzen: 'Höchste Schule der Feinmotorik: Trainiert die Zwischenknochenmuskeln (Interossei) und laterale Fingerbeweglichkeit.',
    tippFuerAngehoerige: 'Sehr fordernde Geste. Bei Ermüdung sofort Pause einlegen.',
    schwierigkeit: 3,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M38 85 L38 55 C38 45 42 35 48 20 C50 14 58 16 54 24 C50 32 44 42 44 55 Z" fill="#ccfbf1" />
        <path d="M54 85 L54 55 C54 45 48 35 42 22 C40 16 32 18 36 26 C40 34 48 44 48 55 Z" fill="#99f6e4" opacity="0.8" />
        <rect x="26" y="55" width="14" height="30" rx="4" fill="#5eead4" />
      </svg>
    `
  },
  {
    id: 'ok-zeichen',
    category: 'hand',
    emoji: '👌',
    name: 'OK-Zeichen (Präzisionskreis)',
    kurzbeschreibung: 'Daumen und Zeigefinger bilden Kreis',
    erkennung: 'Daumen- und Zeigefingerspitze berühren sich, restliche Finger aufrecht',
    rehaNutzen: 'Grundlage des Spitzgriffs (z.B. Nadel, Schlüssel, Stift halten). Wichtigste Reha-Geste für die Wiedererlangung der Selbstständigkeit.',
    tippFuerAngehoerige: 'Achten Sie auf einen runden Kreis („O“), kein flaches Zusammenquetschen.',
    schwierigkeit: 2,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <!-- Kreis aus Daumen und Zeigefinger -->
        <circle cx="42" cy="48" r="16" fill="#ccfbf1" stroke="#0d9488" stroke-width="4" />
        <!-- Aufrechte Langfinger -->
        <path d="M54 46 L58 18 C59 12 66 12 66 18 L66 48 L70 24 C71 18 78 18 78 24 L76 52 L82 34 C84 28 90 30 88 38 L80 65 L72 85 L45 85" fill="#99f6e4" />
      </svg>
    `
  },
  {
    id: 'gespreizte-hand',
    category: 'hand',
    emoji: '🖐️',
    name: 'Gespreizte Hand (Stern)',
    kurzbeschreibung: 'Alle Finger gestreckt & weit gespreizt',
    erkennung: 'Alle 5 Finger mit maximalem Abstand aufgefächert wie ein Seestern',
    rehaNutzen: 'Aktiviert die dorsalen Interossei-Muskeln. Wirkt Kontrakturen und dem Zusammenziehen der Finger gezielt entgegen.',
    tippFuerAngehoerige: 'Stellen Sie sich vor, Sonnenstrahlen aus den Fingerspitzen zu schicken.',
    schwierigkeit: 2,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M30 85 L32 58 L12 44 C6 40 12 32 18 36 L34 46 L30 14 C30 7 40 7 40 14 L42 44 L50 8 C51 1 60 2 60 9 L58 44 L70 14 C72 7 81 10 79 17 L70 48 L88 30 C94 26 98 34 92 40 L76 64 L68 85 Z" fill="#ccfbf1" />
      </svg>
    `
  },

  // =========================================================================
  // 5 ARMBEWEGUNGEN
  // =========================================================================
  {
    id: 'haende-hoch',
    category: 'arm',
    emoji: '🙌',
    name: 'Hände hoch (Überkopf)',
    kurzbeschreibung: 'Beide Hände über Schulterhöhe heben',
    erkennung: 'Beide Hände gleichzeitig im oberen Drittel des Kamerabildes sichtbar',
    rehaNutzen: 'Schultermobilisation, Verhinderung einer Schultersteife (Frozen Shoulder) und Streckung der Brustwirbelsäule.',
    tippFuerAngehoerige: 'Bei schmerzhafter oder schlaffer Schulter nur so weit heben, wie es absolut schmerzfrei bleibt. Nicht am Arm ziehen!',
    schwierigkeit: 1,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <!-- Kopf & Rumpf -->
        <circle cx="50" cy="55" r="14" fill="#ccfbf1" />
        <path d="M32 90 C32 75 68 75 68 90" stroke="#0d9488" stroke-width="4" />
        <!-- Arme hoch -->
        <path d="M30 75 L18 45 L22 20" stroke="#0d9488" stroke-width="5" />
        <path d="M70 75 L82 45 L78 20" stroke="#0d9488" stroke-width="5" />
        <circle cx="22" cy="18" r="6" fill="#f59e0b" />
        <circle cx="78" cy="18" r="6" fill="#f59e0b" />
      </svg>
    `
  },
  {
    id: 'haende-offen',
    category: 'arm',
    emoji: '👐',
    name: 'Hände offen zeigen',
    kurzbeschreibung: 'Beide Hände offen zur Kamera halten',
    erkennung: 'Beide Hände nebeneinander mit geöffneten Handflächen im Blickfeld',
    rehaNutzen: 'Beidseitige Öffnung der Handflächen bei gleichzeitiger Armstreckung. Schult die bilaterale Koordination beider Gehirnhälften.',
    tippFuerAngehoerige: 'Die gesunde Seite dient der betroffenen Seite als visueller Spiegel und Bewegungsvorbild.',
    schwierigkeit: 1,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 75 L22 50 L12 42 C8 38 14 32 18 36 L24 42 L26 22 C26 16 34 16 34 22 L36 44 L44 26 C46 20 54 22 52 28 L46 62 L42 75 Z" fill="#ccfbf1" />
        <path d="M78 75 L78 50 L88 42 C92 38 86 32 82 36 L76 42 L74 22 C74 16 66 16 66 22 L64 44 L56 26 C54 20 46 22 48 28 L54 62 L58 75 Z" fill="#ccfbf1" />
      </svg>
    `
  },
  {
    id: 'haende-zusammen',
    category: 'arm',
    emoji: '🙏',
    name: 'Hände zusammen (Mitte)',
    kurzbeschreibung: 'Handflächen vor der Brust aneinander',
    erkennung: 'Beide Hände mittig zusammengeführt, Handflächen berühren sich oder sind nah beieinander',
    rehaNutzen: 'Klassische Übung zur Überquerung der Körpermitte. Verbindet beide Hemisphären und harmonisiert den Muskeltonus.',
    tippFuerAngehoerige: 'Die stärkere Hand darf die schwächere Hand sanft in die Mitte führen und halten.',
    schwierigkeit: 1,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M46 85 L46 35 C46 25 50 18 50 18 C50 18 54 25 54 35 L54 85 Z" fill="#ccfbf1" stroke="#0d9488" stroke-width="4" />
        <path d="M36 85 C36 60 46 50 46 50" stroke="#0d9488" stroke-width="4" />
        <path d="M64 85 C64 60 54 50 54 50" stroke="#0d9488" stroke-width="4" />
      </svg>
    `
  },
  {
    id: 'winken',
    category: 'arm',
    emoji: '👋',
    name: 'Winken (Seitlich schwingen)',
    kurzbeschreibung: 'Hand seitlich hin- und herbewegen',
    erkennung: 'Rhythmische horizontale Oszillation der Hand im Raum',
    rehaNutzen: 'Aktiviert das Handgelenk in der Radio-Ulnar-Abduktion und lockert Spasmen durch dynamische Wechselbewegung.',
    tippFuerAngehoerige: 'Winken regt auch die Mimik an – ein Lächeln beim Winken motiviert doppelt!',
    schwierigkeit: 2,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M42 85 L42 55 L30 42 C26 38 32 32 36 36 L44 42 L46 20 C46 14 54 14 54 20 L56 42 L64 24 C66 18 74 20 72 26 L66 60 L62 85 Z" fill="#ccfbf1" />
        <!-- Bewegungsschwunglinien -->
        <path d="M20 30 C12 40 12 60 20 70" stroke="#0d9488" stroke-width="3" stroke-dasharray="4 4" />
        <path d="M80 30 C88 40 88 60 80 70" stroke="#0d9488" stroke-width="3" stroke-dasharray="4 4" />
      </svg>
    `
  },
  {
    id: 'muskel-zeigen',
    category: 'arm',
    emoji: '💪',
    name: 'Muskel zeigen (Arm anwinkeln)',
    kurzbeschreibung: 'Faust machen, Arm kräftig anwinkeln',
    erkennung: 'Hand zur Faust geballt, auf Schulterhöhe angehoben mit gebeugtem Ellbogen',
    rehaNutzen: 'Kräftigt den Bizeps und schult die willkürliche Kontrolle der Armbeugung ohne spastisches Ausweichen.',
    tippFuerAngehoerige: 'Achten Sie darauf, dass der Nacken frei bleibt und der Kopf nicht zur Seite kippt.',
    schwierigkeit: 2,
    svgIcon: `
      <svg class="w-16 h-16 text-teal-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <!-- Angewinkelter muskulöser Arm -->
        <path d="M25 80 L35 48 C40 35 55 35 60 48 L75 80" stroke="#0d9488" stroke-width="8" stroke-linecap="round" />
        <!-- Faust oben -->
        <rect x="52" y="22" width="26" height="24" rx="8" fill="#ccfbf1" stroke="#0d9488" stroke-width="3" />
        <circle cx="58" cy="46" r="14" fill="#99f6e4" />
      </svg>
    `
  }
];

// Schnelle Lookup-Maps
const GESTURES_MAP = {};
GESTURES_DATA.forEach(g => {
  GESTURES_MAP[g.id] = g;
});
