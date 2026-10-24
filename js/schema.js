// Struktur der Baubeschreibung. Jede Gruppe enthält Felder; "chips" sind
// Schnellauswahl-Begriffe, die beim Antippen in das Feld übernommen werden.

export const STAMMDATEN = [
  { key: 'bezeichnung', label: 'Objektbezeichnung', placeholder: 'z. B. Einfamilienhaus Müller' },
  { key: 'strasse', label: 'Straße, Hausnummer' },
  { key: 'plz', label: 'PLZ', inputmode: 'numeric', half: true },
  { key: 'ort', label: 'Ort', half: true },
  { key: 'aktenzeichen', label: 'Aktenzeichen / Gutachten-Nr.' },
  { key: 'auftraggeber', label: 'Auftraggeber' },
  { key: 'datum', label: 'Besichtigungsdatum', type: 'date', half: true },
  { key: 'uhrzeit', label: 'Uhrzeit', type: 'time', half: true },
  { key: 'stichtag', label: 'Wertermittlungsstichtag', type: 'date', half: true },
  { key: 'teilnehmer', label: 'Teilnehmer der Besichtigung', multiline: true },
  { key: 'wetter', label: 'Witterung', chips: ['sonnig', 'bewölkt', 'Regen', 'Schnee', 'trocken'] },
  { key: 'umfang', label: 'Umfang der Besichtigung', multiline: true,
    chips: ['Innen- und Außenbesichtigung', 'nur Außenbesichtigung', 'nicht alle Räume zugänglich', 'Dachboden nicht zugänglich'] },
];

export const BAUBESCHREIBUNG = [
  {
    key: 'allgemein', title: 'Allgemeine Angaben',
    fields: [
      { key: 'gebaeudeart', label: 'Gebäudeart',
        chips: ['freistehendes Einfamilienhaus', 'Doppelhaushälfte', 'Reihenmittelhaus', 'Reihenendhaus', 'Zweifamilienhaus', 'Mehrfamilienhaus', 'Eigentumswohnung', 'Wohn- und Geschäftshaus'] },
      { key: 'baujahr', label: 'Baujahr', inputmode: 'numeric', half: true },
      { key: 'modernisierung', label: 'Modernisierungen (Freitext)', multiline: true,
        placeholder: 'Punkte nach ImmoWertV im Tab „Bewertung“' },
      { key: 'geschosse', label: 'Geschosse',
        chips: ['KG', 'EG', 'OG', '1. OG', '2. OG', 'DG', 'Spitzboden'] },
      { key: 'unterkellerung', label: 'Unterkellerung',
        chips: ['voll unterkellert', 'teilunterkellert', 'nicht unterkellert'] },
      { key: 'dachgeschoss', label: 'Dachgeschoss',
        chips: ['ausgebaut', 'teilweise ausgebaut', 'nicht ausgebaut', 'Flachdach'] },
      { key: 'flaeche', label: 'Wohn-/Nutzfläche (ca.)', placeholder: 'z. B. ca. 145 m² Wohnfläche' },
      { key: 'raumaufteilung', label: 'Raumaufteilung', multiline: true },
    ],
  },
  {
    key: 'rohbau', title: 'Rohbau / Konstruktion',
    fields: [
      { key: 'bauweise', label: 'Bauweise',
        chips: ['Massivbauweise', 'Fertigteilbauweise', 'Holzständerbauweise', 'Fachwerk', 'Skelettbauweise'] },
      { key: 'fundamente', label: 'Fundamente',
        chips: ['Streifenfundamente', 'Bodenplatte', 'Beton', 'Stahlbeton'] },
      { key: 'kellerwaende', label: 'Kellerwände',
        chips: ['Beton', 'Stahlbeton', 'Kalksandstein', 'Bruchstein', 'Mauerwerk'] },
      { key: 'aussenwaende', label: 'Außenwände',
        chips: ['Mauerwerk', 'Hohlblockstein', 'Gitterziegel', 'Leichtziegel', 'Kalksandstein', 'Porenbeton', 'Holzfachwerk', 'Sichtbeton'] },
      { key: 'innenwaende', label: 'Innenwände',
        chips: ['Mauerwerk', 'Kalksandstein', 'Gipskarton-Ständerwände', 'gedämmte Ständerwände', 'Porenbeton', 'Fachwerkwände', 'Sichtmauerwerk'] },
      { key: 'decken', label: 'Geschossdecken',
        chips: ['Stahlbetondecke', 'Holzbalkendecke', 'Filigrandecke', 'Kappendecke', 'schwimmender Estrich', 'große Spannweiten'] },
      { key: 'treppen', label: 'Treppen',
        chips: ['Stahlbetontreppe', 'Holztreppe', 'Hartholztreppe', 'Stahltreppe', 'gewendelt', 'mit Fliesenbelag', 'mit Naturstein', 'mit Teppich'] },
    ],
  },
  {
    key: 'dach', title: 'Dach',
    fields: [
      { key: 'dachform', label: 'Dachform',
        chips: ['Satteldach', 'Walmdach', 'Krüppelwalmdach', 'Pultdach', 'Flachdach', 'Mansarddach', 'Zeltdach'] },
      { key: 'dachkonstruktion', label: 'Dachkonstruktion',
        chips: ['Holzsparrendach', 'Pfettendach', 'Kehlbalkendach', 'Brettschichtholz', 'Stahlbeton'] },
      { key: 'dacheindeckung', label: 'Dacheindeckung',
        chips: ['Betondachsteine', 'beschichtete Betondachsteine', 'Tondachziegel', 'glasierte Tondachziegel', 'Schiefer', 'Kupfer', 'Bitumenschindeln', 'Bitumenbahnen', 'Dachpappe', 'Faserzement-Wellplatten', 'Folienabdichtung', 'begrünt'] },
      { key: 'dachentwaesserung', label: 'Dachentwässerung',
        chips: ['Zinkblech', 'Kupfer', 'Kunststoff', 'innenliegend'] },
      { key: 'dachdaemmung', label: 'Dämmung',
        chips: ['Zwischensparrendämmung', 'Aufsparrendämmung', 'oberste Geschossdecke gedämmt', 'keine Dämmung erkennbar'] },
    ],
  },
  {
    key: 'fassade', title: 'Fassade',
    fields: [
      { key: 'fassade', label: 'Fassade',
        chips: ['Putz', 'Edelputz', 'gestrichen', 'Klinker', 'Verblendmauerwerk', 'Holzverkleidung', 'Faserzementplatten', 'Naturschiefer', 'Natursteinfassade', 'vorgehängt, hinterlüftet'] },
      { key: 'waermedaemmung', label: 'Wärmedämmung',
        chips: ['Wärmedämmverbundsystem', 'Wärmedämmputz', 'Kerndämmung', 'Passivhausstandard', 'keine Dämmung erkennbar'] },
      { key: 'sockel', label: 'Sockel',
        chips: ['Putz', 'Klinker', 'Naturstein', 'gestrichen'] },
    ],
  },
  {
    key: 'fenster', title: 'Fenster und Türen',
    fields: [
      { key: 'fenster', label: 'Fenster',
        chips: ['Kunststoff', 'Holz', 'Holz-Alu', 'Aluminium', 'große feststehende Fensterflächen'] },
      { key: 'verglasung', label: 'Verglasung',
        chips: ['Einfachverglasung', 'Isolierverglasung', 'Zweifach-Wärmeschutzverglasung', 'Dreifachverglasung', 'Sonnenschutzglas', 'Schallschutzglas'] },
      { key: 'rolllaeden', label: 'Sonnenschutz',
        chips: ['Rollläden manuell', 'Rollläden elektrisch', 'Raffstores', 'keine'] },
      { key: 'haustuer', label: 'Hauseingangstür',
        chips: ['einfache Holztür', 'Kunststoff', 'Holz', 'Aluminium', 'mit Glaseinsatz', 'mit Seitenteil', 'einbruchhemmend'] },
      { key: 'innentueren', label: 'Innentüren',
        chips: ['Füllungstüren', 'Röhrenspantüren', 'furniert', 'weiß beschichtet', 'Massivholztüren', 'Glastüren', 'Schiebetüren', 'Holzzargen', 'Stahlzargen'] },
    ],
  },
  {
    key: 'ausbau', title: 'Innenausbau',
    fields: [
      { key: 'boeden', label: 'Bodenbeläge',
        chips: ['Fliesen', 'Laminat', 'Vinyl', 'PVC', 'Linoleum', 'Teppich', 'Fertigparkett', 'Massivholzdielen', 'hochwertiges Parkett', 'Naturstein', 'ohne Belag'] },
      { key: 'waende', label: 'Wandbekleidung',
        chips: ['Putz', 'Tapete', 'Raufaser', 'gestrichen', 'Fliesenspiegel', 'Holzverkleidung'] },
      { key: 'deckenbekleidung', label: 'Deckenbekleidung',
        chips: ['Putz', 'gestrichen', 'Raufaser', 'Gipskarton', 'Holzpaneele', 'abgehängt'] },
      { key: 'sanitaer', label: 'Sanitäre Einrichtungen', multiline: true,
        chips: ['Bad mit Wanne', 'Bad mit Dusche', 'Bad mit Wanne und Dusche', 'Gäste-WC', 'zwei Bäder', 'mehrere hochwertige Bäder', 'bodengleiche Dusche', 'Doppelwaschbecken', 'wandhängendes WC', 'teilweise gefliest', 'raumhoch gefliest', 'Installation auf Putz'] },
      { key: 'kueche', label: 'Küche',
        chips: ['Einbauküche vorhanden', 'keine Einbauküche', 'offene Küche', 'separate Küche'] },
    ],
  },
  {
    key: 'technik', title: 'Technische Gebäudeausstattung',
    fields: [
      { key: 'heizung', label: 'Heizung',
        chips: ['Einzelöfen', 'Nachtspeicher', 'Öl-Zentralheizung', 'Gas-Zentralheizung', 'Gas-Brennwerttherme', 'Niedertemperaturkessel', 'Fernwärme', 'Pelletheizung', 'Wärmepumpe', 'Blockheizkraftwerk', 'Fußbodenheizung', 'Heizkörper'] },
      { key: 'warmwasser', label: 'Warmwasser',
        chips: ['zentral über Heizung', 'Durchlauferhitzer', 'Boiler', 'Solarthermie'] },
      { key: 'elektro', label: 'Elektroinstallation',
        chips: ['sehr wenige Steckdosen', 'wenige Steckdosen', 'zeitgemäße Anzahl Steckdosen', 'zahlreiche Steckdosen', 'kein FI-Schalter', 'Unterverteilung mit FI', 'Leitungen teilweise auf Putz', 'LAN-Verkabelung', 'Bussystem / Smart Home'] },
      { key: 'lueftung', label: 'Lüftung / Klima',
        chips: ['Fensterlüftung', 'dezentrale Lüftung mit WRG', 'zentrale Lüftung mit WRG', 'Klimaanlage'] },
      { key: 'erneuerbare', label: 'Erneuerbare Energien',
        chips: ['Photovoltaikanlage', 'Solarthermie', 'Batteriespeicher', 'Wallbox', 'keine'] },
    ],
  },
  {
    key: 'besondere', title: 'Besondere Bauteile und Einrichtungen',
    fields: [
      { key: 'bauteile', label: 'Besondere Bauteile', multiline: true,
        chips: ['Balkon', 'Loggia', 'Terrasse', 'Dachgauben', 'Wintergarten', 'Kelleraußentreppe', 'Vordach'] },
      { key: 'einrichtungen', label: 'Besondere Einrichtungen', multiline: true,
        chips: ['Kaminofen', 'offener Kamin', 'Sauna', 'Schwimmbad', 'Aufzug', 'Alarmanlage', 'Videoanlage'] },
    ],
  },
  {
    key: 'aussen', title: 'Außenanlagen und Nebengebäude',
    fields: [
      { key: 'stellplaetze', label: 'Garage / Stellplätze',
        chips: ['Einzelgarage', 'Doppelgarage', 'Fertiggarage', 'Carport', 'Stellplatz', 'Tiefgaragenstellplatz'] },
      { key: 'befestigung', label: 'Befestigte Flächen',
        chips: ['Betonsteinpflaster', 'Naturstein', 'Asphalt', 'Kies'] },
      { key: 'einfriedung', label: 'Einfriedung',
        chips: ['Zaun', 'Hecke', 'Mauer', 'Stabmattenzaun', 'keine'] },
      { key: 'garten', label: 'Garten / Grünflächen',
        chips: ['gepflegt', 'Rasen', 'Beete', 'Baumbestand', 'Gartenhaus'] },
      { key: 'anschluesse', label: 'Ver- und Entsorgung',
        chips: ['Wasser', 'Abwasser (Kanal)', 'Strom', 'Gas', 'Telefon', 'Glasfaser', 'Fernwärme', 'Kleinkläranlage'] },
    ],
  },
  {
    key: 'zustand', title: 'Zustand',
    fields: [
      { key: 'allgemeinzustand', label: 'Allgemeiner Zustand', multiline: true,
        chips: ['gut', 'befriedigend', 'ausreichend', 'mangelhaft', 'altersentsprechend', 'gepflegt', 'renovierungsbedürftig', 'sanierungsbedürftig'] },
      { key: 'maengel', label: 'Baumängel / Bauschäden', multiline: true,
        chips: ['Feuchtigkeit im Keller', 'Risse im Putz', 'Schimmel', 'Dach undicht', 'Fenster verschlissen', 'keine wesentlichen erkennbar'] },
      { key: 'instandhaltung', label: 'Instandhaltungsstau', multiline: true },
      { key: 'energieausweis', label: 'Energieausweis',
        chips: ['Verbrauchsausweis', 'Bedarfsausweis', 'liegt nicht vor', 'Klasse A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] },
    ],
  },
  {
    key: 'sonstiges', title: 'Sonstiges',
    fields: [
      { key: 'bemerkungen', label: 'Bemerkungen', multiline: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// Ausstattungsstandard nach Anlage 4 ImmoWertV (Wohngebäude), sinngemäß.
// "stufen" beschreibt die Standardstufen 1–5, "map" ordnet Begriffe der
// Baubeschreibung (Feldpfad → Begriff → Stufe) für den automatischen Vorschlag zu.
// ---------------------------------------------------------------------------
export const STANDARD_MERKMALE = [
  {
    key: 'aussenwaende', label: 'Außenwände', weight: 23,
    stufen: [
      'Holzfachwerk, Ziegelmauerwerk; Fugenglattstrich, Putz, Verkleidung mit Faserzementplatten, Bitumenschindeln oder einfachen Kunststoffplatten; kein oder deutlich nicht zeitgemäßer Wärmeschutz (vor ca. 1980)',
      'ein-/zweischaliges Mauerwerk, z. B. Gitterziegel oder Hohlblocksteine; verputzt und gestrichen oder Holzverkleidung; nicht zeitgemäßer Wärmeschutz (vor ca. 1995)',
      'ein-/zweischaliges Mauerwerk, z. B. aus Leichtziegeln, Kalksandsteinen, Porenbetonsteinen; Edelputz; Wärmedämmverbundsystem oder Wärmedämmputz (nach ca. 1995)',
      'Verblendmauerwerk, zweischalig, hinterlüftet, Vorhangfassade (z. B. Naturschiefer); Wärmedämmung (nach ca. 2005)',
      'Sichtbeton-Fertigteile, Natursteinfassade, Elemente aus Kupfer-/Eloxalblech, mehrgeschossige Glasfassaden; Dämmung im Passivhausstandard',
    ],
    map: {
      'rohbau.aussenwaende': { 'Holzfachwerk': 1, 'Hohlblockstein': 2, 'Gitterziegel': 2, 'Leichtziegel': 3, 'Kalksandstein': 3, 'Porenbeton': 3, 'Sichtbeton': 5 },
      'rohbau.bauweise': { 'Fachwerk': 1 },
      'fassade.fassade': { 'Faserzementplatten': 1, 'Holzverkleidung': 2, 'Edelputz': 3, 'Klinker': 4, 'Verblendmauerwerk': 4, 'Naturschiefer': 4, 'vorgehängt, hinterlüftet': 4, 'Natursteinfassade': 5 },
      'fassade.waermedaemmung': { 'keine Dämmung erkennbar': 1, 'Wärmedämmverbundsystem': 3, 'Wärmedämmputz': 3, 'Kerndämmung': 4, 'Passivhausstandard': 5 },
    },
  },
  {
    key: 'dach', label: 'Dach', weight: 15,
    stufen: [
      'Dachpappe, Faserzementplatten/Wellplatten; keine bis geringe Dachdämmung',
      'einfache Betondachsteine oder Tondachziegel, Bitumenschindeln; nicht zeitgemäße Dachdämmung (vor ca. 1995)',
      'Faserzement-Schindeln, beschichtete Betondachsteine und Tondachziegel, Folienabdichtung; Rinnen und Fallrohre aus Zinkblech; Dachdämmung (nach ca. 1995)',
      'glasierte Tondachziegel, Flachdachausbildung tlw. als Dachterrasse; Konstruktion in Brettschichtholz, schweres Massivflachdach; besondere Dachformen, z. B. Mansarden-, Walmdach; Aufsparrendämmung, überdurchschnittliche Dämmung (nach ca. 2005)',
      'hochwertige Eindeckung, z. B. aus Schiefer oder Kupfer, Dachbegrünung, befahrbares Flachdach; aufwendig gegliederte Dachlandschaft; Rinnen und Fallrohre aus Kupfer; Dämmung im Passivhausstandard',
    ],
    map: {
      'dach.dacheindeckung': { 'Dachpappe': 1, 'Faserzement-Wellplatten': 1, 'Bitumenbahnen': 1, 'Betondachsteine': 2, 'Tondachziegel': 2, 'Bitumenschindeln': 2, 'beschichtete Betondachsteine': 3, 'Folienabdichtung': 3, 'glasierte Tondachziegel': 4, 'Schiefer': 5, 'Kupfer': 5, 'begrünt': 5 },
      'dach.dachentwaesserung': { 'Zinkblech': 3, 'Kupfer': 5 },
      'dach.dachdaemmung': { 'keine Dämmung erkennbar': 1, 'Zwischensparrendämmung': 3, 'Aufsparrendämmung': 4 },
      'dach.dachform': { 'Walmdach': 4, 'Mansarddach': 4 },
      'dach.dachkonstruktion': { 'Brettschichtholz': 4 },
    },
  },
  {
    key: 'fenster', label: 'Fenster und Außentüren', weight: 11,
    stufen: [
      'Einfachverglasung; einfache Holztüren',
      'Zweifachverglasung (vor ca. 1995); Haustür mit nicht zeitgemäßem Wärmeschutz (vor ca. 1995)',
      'Zweifachverglasung (nach ca. 1995), Rollläden (manuell); Haustür mit zeitgemäßem Wärmeschutz (nach ca. 1995)',
      'Dreifachverglasung, Sonnenschutzglas, aufwendigere Rahmen, Rollläden (elektrisch); höherwertige Türanlage, z. B. mit Seitenteil, besonderer Einbruchschutz',
      'große, feststehende Fensterflächen, Spezialverglasung (Schall- und Sonnenschutz); Außentüren in hochwertigen Materialien',
    ],
    map: {
      'fenster.verglasung': { 'Einfachverglasung': 1, 'Isolierverglasung': 2, 'Zweifach-Wärmeschutzverglasung': 3, 'Dreifachverglasung': 4, 'Sonnenschutzglas': 4, 'Schallschutzglas': 5 },
      'fenster.rolllaeden': { 'Rollläden manuell': 3, 'Rollläden elektrisch': 4, 'Raffstores': 4 },
      'fenster.haustuer': { 'einfache Holztür': 1, 'mit Seitenteil': 4, 'einbruchhemmend': 4 },
      'fenster.fenster': { 'Holz-Alu': 4, 'große feststehende Fensterflächen': 5 },
    },
  },
  {
    key: 'innenwaende', label: 'Innenwände und -türen', weight: 11,
    stufen: [
      'Fachwerkwände, einfache Putze/Lehmputze, einfache Kalkanstriche; Füllungstüren, gestrichen, mit einfachen Beschlägen ohne Dichtungen',
      'massive tragende Innenwände, nicht tragende Wände in Leichtbauweise (z. B. Holzständerwände mit Gipskarton), Gipsdielen; leichte Türen, Stahlzargen',
      'nicht tragende Innenwände in massiver Ausführung bzw. mit Dämmmaterial gefüllte Ständerkonstruktionen; schwere Türen, Holzzargen',
      'Sichtmauerwerk, Wandvertäfelungen (Holzpaneele); Massivholztüren, Schiebetürelemente, Glastüren, strukturierte Türblätter',
      'gestaltete Wandabläufe (z. B. Pfeilervorlagen, geschwungene Wandpartien); Vertäfelungen (Edelholz, Metall), Akustikputz; raumhohe aufwendige Türelemente',
    ],
    map: {
      'rohbau.innenwaende': { 'Fachwerkwände': 1, 'Gipskarton-Ständerwände': 2, 'Mauerwerk': 3, 'Kalksandstein': 3, 'Porenbeton': 3, 'gedämmte Ständerwände': 3, 'Sichtmauerwerk': 4 },
      'fenster.innentueren': { 'Füllungstüren': 1, 'Röhrenspantüren': 2, 'Stahlzargen': 2, 'Holzzargen': 3, 'Massivholztüren': 4, 'Glastüren': 4, 'Schiebetüren': 4 },
      'ausbau.waende': { 'Holzverkleidung': 4 },
    },
  },
  {
    key: 'decken', label: 'Deckenkonstruktion und Treppen', weight: 11,
    stufen: [
      'Holzbalkendecken ohne Füllung, Spalierputz; Weichholztreppen in einfacher Art und Ausführung; kein Trittschallschutz',
      'Holzbalkendecken mit Füllung, Kappendecken; Stahl- oder Hartholztreppen in einfacher Art und Ausführung',
      'Beton- und Holzbalkendecken mit Tritt- und Luftschallschutz (z. B. schwimmender Estrich); geradläufige Treppen aus Stahlbeton oder Stahl, Harfentreppe, Trittschallschutz',
      'Decken mit größerer Spannweite, Deckenverkleidung (Holzpaneele/Kassetten); gewendelte Treppen aus Stahlbeton oder Stahl, Hartholztreppenanlage in besserer Art und Ausführung',
      'Decken mit großen Spannweiten, gegliedert, Deckenvertäfelungen (Edelholz, Metall); breite Stahlbeton-, Metall- oder Hartholztreppenanlage mit hochwertigem Geländer',
    ],
    map: {
      'rohbau.decken': { 'Holzbalkendecke': 2, 'Kappendecke': 2, 'Stahlbetondecke': 3, 'Filigrandecke': 3, 'schwimmender Estrich': 3, 'große Spannweiten': 4 },
      'rohbau.treppen': { 'Holztreppe': 2, 'Stahlbetontreppe': 3, 'Stahltreppe': 3, 'gewendelt': 4, 'Hartholztreppe': 4 },
      'ausbau.deckenbekleidung': { 'Holzpaneele': 4 },
    },
  },
  {
    key: 'fussboeden', label: 'Fußböden', weight: 5,
    stufen: [
      'ohne Belag',
      'Linoleum-, Teppich-, Laminat- und PVC-Böden einfacher Art und Ausführung',
      'Linoleum-, Teppich-, Laminat- und PVC-Böden besserer Art und Ausführung, Fliesen, Kunststeinplatten',
      'Natursteinplatten, Fertigparkett, hochwertige Fliesen, Terrazzobelag, hochwertige Massivholzböden auf gedämmter Unterkonstruktion',
      'hochwertiges Parkett, hochwertige Natursteinplatten, hochwertige Edelholzböden auf gedämmter Unterkonstruktion',
    ],
    map: {
      'ausbau.boeden': { 'ohne Belag': 1, 'Teppich': 2, 'Laminat': 2, 'PVC': 2, 'Linoleum': 2, 'Vinyl': 3, 'Fliesen': 3, 'Fertigparkett': 4, 'Naturstein': 4, 'Massivholzdielen': 4, 'hochwertiges Parkett': 5 },
    },
  },
  {
    key: 'sanitaer', label: 'Sanitäreinrichtungen', weight: 9,
    stufen: [
      'einfaches Bad mit Stand-WC; Installation auf Putz; Ölfarbenanstrich, einfache PVC-Bodenbeläge',
      '1 Bad mit WC, Dusche oder Badewanne; einfache Wand- und Bodenfliesen, teilweise gefliest',
      '1 Bad mit WC, Dusche und Badewanne, Gäste-WC; Wand- und Bodenfliesen, raumhoch gefliest',
      '1–2 Bäder mit tlw. zwei Waschbecken, tlw. Bidet/Urinal, Gäste-WC, bodengleiche Dusche; Wand- und Bodenfliesen in gehobener Qualität',
      'mehrere großzügige, hochwertige Bäder, Gäste-WC; hochwertige Wand- und Bodenplatten (oberflächenstrukturiert, Einzel- und Flächendekors)',
    ],
    map: {
      'ausbau.sanitaer': { 'Installation auf Putz': 1, 'Bad mit Wanne': 2, 'Bad mit Dusche': 2, 'teilweise gefliest': 2, 'Bad mit Wanne und Dusche': 3, 'Gäste-WC': 3, 'raumhoch gefliest': 3, 'wandhängendes WC': 3, 'zwei Bäder': 4, 'bodengleiche Dusche': 4, 'Doppelwaschbecken': 4, 'mehrere hochwertige Bäder': 5 },
    },
  },
  {
    key: 'heizung', label: 'Heizung', weight: 9,
    stufen: [
      'Einzelöfen, Schwerkraftheizung',
      'Fern- oder Zentralheizung, einfache Warmluftheizung, einzelne Gasaußenwandthermen, Nachtstromspeicher-, Fußbodenheizung (vor ca. 1995)',
      'elektronisch gesteuerte Fern- oder Zentralheizung, Niedertemperatur- oder Brennwertkessel',
      'Fußbodenheizung, Solarkollektoren für Warmwassererzeugung, zusätzlicher Kaminanschluss',
      'Solarkollektoren für Warmwassererzeugung und Heizung, Blockheizkraftwerk, Wärmepumpe, Hybrid-Systeme; aufwendige zusätzliche Kaminanlage',
    ],
    map: {
      'technik.heizung': { 'Einzelöfen': 1, 'Nachtspeicher': 2, 'Öl-Zentralheizung': 2, 'Gas-Zentralheizung': 2, 'Gas-Brennwerttherme': 3, 'Niedertemperaturkessel': 3, 'Fernwärme': 3, 'Pelletheizung': 4, 'Fußbodenheizung': 4, 'Wärmepumpe': 5, 'Blockheizkraftwerk': 5 },
      'technik.warmwasser': { 'Solarthermie': 4 },
      'besondere.einrichtungen': { 'Kaminofen': 4, 'offener Kamin': 4 },
    },
  },
  {
    key: 'technik', label: 'Sonstige technische Ausstattung', weight: 6,
    stufen: [
      'sehr wenige Steckdosen, Schalter und Sicherungen, kein Fehlerstromschutzschalter (FI), Leitungen teilweise auf Putz',
      'wenige Steckdosen, Schalter und Sicherungen',
      'zeitgemäße Anzahl an Steckdosen und Lichtauslässen, Zählerschrank (ab ca. 1985) mit Unterverteilung und Kippsicherungen',
      'zahlreiche Steckdosen und Lichtauslässe, hochwertige Abdeckungen, dezentrale Lüftung mit Wärmetauscher, mehrere LAN- und Fernsehanschlüsse',
      'Video- und zentrale Alarmanlage, zentrale Lüftung mit Wärmetauscher, Klimaanlage, Bussystem',
    ],
    map: {
      'technik.elektro': { 'sehr wenige Steckdosen': 1, 'kein FI-Schalter': 1, 'Leitungen teilweise auf Putz': 1, 'wenige Steckdosen': 2, 'zeitgemäße Anzahl Steckdosen': 3, 'Unterverteilung mit FI': 3, 'zahlreiche Steckdosen': 4, 'LAN-Verkabelung': 4, 'Bussystem / Smart Home': 5 },
      'technik.lueftung': { 'dezentrale Lüftung mit WRG': 4, 'zentrale Lüftung mit WRG': 5, 'Klimaanlage': 5 },
      'besondere.einrichtungen': { 'Alarmanlage': 5, 'Videoanlage': 5 },
    },
  },
];

function terms(text) {
  return String(text || '').split(/\s*,\s*/).map(s => s.trim().toLowerCase()).filter(Boolean);
}

// Automatischer Vorschlag je Merkmal: Mittelwert der Stufen aller erkannten Begriffe.
export function standardVorschlag(objekt, merkmal) {
  const bb = objekt.baubeschreibung || {};
  const gruende = [];
  for (const [path, table] of Object.entries(merkmal.map)) {
    const [g, f] = path.split('.');
    const found = terms(bb[g]?.[f]);
    for (const [term, stufe] of Object.entries(table)) {
      if (found.includes(term.toLowerCase())) gruende.push({ term, stufe });
    }
  }
  if (!gruende.length) return null;
  const wert = Math.round(gruende.reduce((s, x) => s + x.stufe, 0) / gruende.length * 10) / 10;
  return { wert, gruende };
}

// Liefert je Merkmal den wirksamen Wert (manuell vor automatisch) und die gewichtete Gesamtstufe.
export function ausstattungsstandard(objekt) {
  const manuell = objekt.standard || {};
  const zeilen = STANDARD_MERKMALE.map(m => {
    const vorschlag = standardVorschlag(objekt, m);
    const man = manuell[m.key];
    const wert = man != null && man !== '' ? Number(man) : vorschlag?.wert ?? null;
    return { merkmal: m, vorschlag, manuell: man != null && man !== '', wert };
  });
  let sum = 0, w = 0;
  for (const z of zeilen) if (z.wert != null) { sum += z.wert * z.merkmal.weight; w += z.merkmal.weight; }
  return { zeilen, gesamt: w ? sum / w : null, vollstaendig: w === 100 };
}

// ---------------------------------------------------------------------------
// Modernisierung nach Anlage 2 ImmoWertV
// ---------------------------------------------------------------------------
export const MODERNISIERUNG = [
  { key: 'dach', label: 'Dacherneuerung inkl. Verbesserung der Wärmedämmung', max: 4 },
  { key: 'fenster', label: 'Modernisierung der Fenster und Außentüren', max: 2 },
  { key: 'leitungen', label: 'Modernisierung der Leitungssysteme (Strom, Gas, Wasser, Abwasser)', max: 2 },
  { key: 'heizung', label: 'Modernisierung der Heizungsanlage', max: 2 },
  { key: 'daemmung', label: 'Wärmedämmung der Außenwände', max: 4 },
  { key: 'baeder', label: 'Modernisierung von Bädern', max: 2 },
  { key: 'innenausbau', label: 'Modernisierung des Innenausbaus, z. B. Decken, Fußböden, Treppen', max: 2 },
  { key: 'grundriss', label: 'Wesentliche Verbesserung der Grundrissgestaltung', max: 2 },
];

// Tabelle 2: Modernisierungsgrad mit Punktspanne [von, bis]
export const MODERNISIERUNGSGRAD = [
  { key: 'nicht', label: 'nicht modernisiert', von: 0, bis: 1 },
  { key: 'klein', label: 'kleine Modernisierungen im Rahmen der Instandhaltung', von: 2, bis: 5 },
  { key: 'mittel', label: 'mittlerer Modernisierungsgrad', von: 6, bis: 10 },
  { key: 'ueberwiegend', label: 'überwiegend modernisiert', von: 11, bis: 17 },
  { key: 'umfassend', label: 'umfassend modernisiert', von: 18, bis: 20 },
];
const GRAD_STANDARD = { nicht: 0, klein: 3, mittel: 8, ueberwiegend: 14, umfassend: 19 };

export function gradZuPunkten(punkte) {
  const p = Math.round(punkte);
  return MODERNISIERUNGSGRAD.find(g => p <= g.bis) || MODERNISIERUNGSGRAD.at(-1);
}

// Koeffizienten für die modifizierte Restnutzungsdauer (Anlage 2 ImmoWertV, Tabelle 3):
// Punkte → [a, b, c, relatives Alter ab dem die Formel gilt]
const RND_KOEFF = [
  [1.2500, 2.6250, 1.5250, 0.60], [1.2500, 2.6250, 1.5250, 0.60], [1.0767, 2.2757, 1.3878, 0.55],
  [0.9033, 1.9263, 1.2505, 0.55], [0.7300, 1.5770, 1.1133, 0.40], [0.6725, 1.4578, 1.0850, 0.35],
  [0.6150, 1.3385, 1.0567, 0.30], [0.5575, 1.2193, 1.0283, 0.25], [0.5000, 1.1000, 1.0000, 0.20],
  [0.4660, 1.0270, 0.9906, 0.19], [0.4320, 0.9540, 0.9811, 0.18], [0.3980, 0.8810, 0.9717, 0.17],
  [0.3640, 0.8080, 0.9622, 0.16], [0.3300, 0.7350, 0.9528, 0.15], [0.3040, 0.6760, 0.9506, 0.14],
  [0.2780, 0.6170, 0.9485, 0.13], [0.2520, 0.5580, 0.9463, 0.12], [0.2260, 0.4990, 0.9442, 0.11],
  [0.2000, 0.4400, 0.9420, 0.10], [0.2000, 0.4400, 0.9420, 0.10], [0.2000, 0.4400, 0.9420, 0.10],
];

export function stichtagJahr(objekt) {
  const sd = objekt.stammdaten || {};
  const d = sd.stichtag || sd.datum;
  return d ? Number(d.slice(0, 4)) : new Date().getFullYear();
}

// Punktvorschlag je Element: Maßnahme (Jahr) oder zeitgemäßes, nicht modernisiertes
// Bauteil ergibt die Höchstpunkte. Optional werden ältere Maßnahmen gemindert
// (eigene Annahme, nicht ImmoWertV): bis 10 Jahre voll, 11–20 Jahre halb, älter 0.
// "teilweise" halbiert den Wert.
export function modernisierungsPunkteVorschlag(el, eintrag, jahrStichtag, mindern) {
  const jahr = Number(eintrag?.jahr);
  let p = 0;
  if (eintrag?.zeitgemaess) p = el.max;
  else if (jahr) {
    const alter = jahrStichtag - jahr;
    p = !mindern || alter <= 10 ? el.max : alter <= 20 ? el.max / 2 : 0;
  }
  if (eintrag?.umfang === 'teil') p /= 2;
  return Math.round(p * 2) / 2;
}

export function modernisierung(objekt) {
  const m = objekt.modernisierung || {};
  const el = m.elemente || {};
  const sj = stichtagJahr(objekt);
  const methode = m.methode === 'grad' ? 'grad' : 'elemente';
  const mindern = !!m.mindern;
  const zeilen = MODERNISIERUNG.map(e => {
    const eintrag = el[e.key] || {};
    const vorschlag = modernisierungsPunkteVorschlag(e, eintrag, sj, mindern);
    const manuell = eintrag.punkte != null && eintrag.punkte !== '';
    return { element: e, eintrag, vorschlag, manuell, punkte: manuell ? Number(eintrag.punkte) : vorschlag };
  });
  const summeAuto = zeilen.reduce((s, z) => s + z.punkte, 0);
  let summeManuell = false, punkte, gradInfo;
  if (methode === 'grad') {
    gradInfo = MODERNISIERUNGSGRAD.find(g => g.key === m.grad) || MODERNISIERUNGSGRAD[0];
    const gp = Number(m.gradPunkte);
    punkte = m.gradPunkte != null && m.gradPunkte !== '' && gp >= gradInfo.von && gp <= gradInfo.bis ? gp : GRAD_STANDARD[gradInfo.key];
  } else {
    summeManuell = m.punkte != null && m.punkte !== '';
    punkte = Math.min(20, summeManuell ? Number(m.punkte) : summeAuto);
    gradInfo = gradZuPunkten(punkte);
  }
  const grad = gradInfo.label;

  const baujahr = Number(objekt.baubeschreibung?.allgemein?.baujahr) || null;
  const gnd = Number(m.gnd) || 80;
  const alter = baujahr ? sj - baujahr : null;
  let rndAuto = null;
  if (alter != null) {
    const [a, b, c, ab] = RND_KOEFF[Math.max(0, Math.min(20, Math.round(punkte)))];
    rndAuto = alter / gnd >= ab ? a * alter * alter / gnd - b * alter + c * gnd : gnd - alter;
    rndAuto = Math.max(0, Math.round(rndAuto));
  }
  const rndManuell = m.rnd != null && m.rnd !== '';
  const rnd = rndManuell ? Number(m.rnd) : rndAuto;
  const fiktivesBaujahr = rnd != null ? sj + rnd - gnd : null;
  return { methode, mindern, gradInfo, zeilen, summeAuto, summeManuell, punkte, grad, baujahr, stichtagJahr: sj, gnd, alter, rndAuto, rndManuell, rnd, fiktivesBaujahr };
}

// ---------------------------------------------------------------------------
// Fotos: Kategorien, Geschosse und Raumvorschläge
// ---------------------------------------------------------------------------
export const FOTO_KATEGORIEN = [
  { key: 'aussen', label: 'Außenansichten',
    raeume: ['Straßenansicht', 'Ansicht von Norden', 'Ansicht von Osten', 'Ansicht von Süden', 'Ansicht von Westen', 'Gartenansicht', 'Eingangsbereich', 'Fassade', 'Dach', 'Sockel'] },
  { key: 'innen', label: 'Innenräume',
    raeume: ['Diele', 'Flur', 'Wohnzimmer', 'Esszimmer', 'Küche', 'Schlafzimmer', 'Kinderzimmer', 'Arbeitszimmer', 'Badezimmer', 'Duschbad', 'Gäste-WC', 'Abstellraum', 'Hauswirtschaftsraum', 'Treppenhaus', 'Kellerraum', 'Dachboden', 'Spitzboden', 'Dachstuhl'] },
  { key: 'technik', label: 'Haustechnik',
    raeume: ['Heizungsanlage', 'Warmwasserspeicher', 'Hausanschlüsse', 'Zählerschrank', 'Elektroverteilung', 'Lüftungsanlage', 'Photovoltaikanlage', 'Wechselrichter'] },
  { key: 'aussenanlagen', label: 'Außenanlagen und Nebengebäude',
    raeume: ['Garage', 'Carport', 'Stellplatz', 'Zufahrt', 'Terrasse', 'Balkon', 'Garten', 'Gartenhaus', 'Einfriedung'] },
  { key: 'maengel', label: 'Baumängel und Bauschäden',
    raeume: ['Feuchtigkeit', 'Schimmel', 'Riss', 'Putzschaden', 'Ausblühungen', 'Undichtigkeit', 'Holzschaden', 'Abplatzung', 'Korrosion'] },
  { key: 'sonstiges', label: 'Sonstiges', raeume: [] },
];

export const GESCHOSSE = ['KG', 'EG', 'OG', '1. OG', '2. OG', 'DG', 'Spitzboden'];

export function fotoKategorie(f) {
  return FOTO_KATEGORIEN.find(k => k.key === f.kategorie) || FOTO_KATEGORIEN.at(-1);
}

// Reihenfolge für die Nummerierung: nach Kategorie, innerhalb nach eigener Sortierung.
export function sortiereFotos(fotos) {
  const idx = f => FOTO_KATEGORIEN.indexOf(fotoKategorie(f));
  return [...fotos].sort((a, b) => idx(a) - idx(b) || a.order - b.order);
}

// Beschriftung, wie sie im Dokument erscheint, z. B. „EG, Küche: Einbauküche“.
export function fotoText(f) {
  const kopf = [f.geschoss, f.raum].filter(Boolean).join(', ');
  const text = (f.caption || '').trim();
  return kopf && text ? `${kopf}: ${text}` : kopf || text;
}
