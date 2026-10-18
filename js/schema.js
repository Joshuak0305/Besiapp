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
      { key: 'modernisierung', label: 'Modernisierungen', multiline: true,
        chips: ['Dach erneuert', 'Fenster erneuert', 'Heizung erneuert', 'Bäder modernisiert', 'Elektrik erneuert', 'Fassade gedämmt'] },
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
        chips: ['Mauerwerk', 'Kalksandstein', 'Porenbeton', 'Ziegel', 'Hohlblockstein', 'Holz'] },
      { key: 'innenwaende', label: 'Innenwände',
        chips: ['Mauerwerk', 'Kalksandstein', 'Gipskarton-Ständerwände', 'Porenbeton'] },
      { key: 'decken', label: 'Geschossdecken',
        chips: ['Stahlbetondecke', 'Holzbalkendecke', 'Filigrandecke', 'Kappendecke'] },
      { key: 'treppen', label: 'Treppen',
        chips: ['Stahlbetontreppe', 'Holztreppe', 'Stahltreppe', 'mit Fliesenbelag', 'mit Naturstein', 'mit Teppich'] },
    ],
  },
  {
    key: 'dach', title: 'Dach',
    fields: [
      { key: 'dachform', label: 'Dachform',
        chips: ['Satteldach', 'Walmdach', 'Krüppelwalmdach', 'Pultdach', 'Flachdach', 'Mansarddach', 'Zeltdach'] },
      { key: 'dachkonstruktion', label: 'Dachkonstruktion',
        chips: ['Holzsparrendach', 'Pfettendach', 'Kehlbalkendach', 'Stahlbeton'] },
      { key: 'dacheindeckung', label: 'Dacheindeckung',
        chips: ['Betondachsteine', 'Tondachziegel', 'Schiefer', 'Bitumenbahnen', 'Blech', 'Faserzement', 'begrünt'] },
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
        chips: ['Putz', 'gestrichen', 'Klinker', 'Verblendmauerwerk', 'Holzverkleidung', 'Faserzementplatten', 'Naturstein'] },
      { key: 'waermedaemmung', label: 'Wärmedämmung',
        chips: ['Wärmedämmverbundsystem', 'Kerndämmung', 'keine Dämmung erkennbar'] },
      { key: 'sockel', label: 'Sockel',
        chips: ['Putz', 'Klinker', 'Naturstein', 'gestrichen'] },
    ],
  },
  {
    key: 'fenster', title: 'Fenster und Türen',
    fields: [
      { key: 'fenster', label: 'Fenster',
        chips: ['Kunststoff', 'Holz', 'Holz-Alu', 'Aluminium'] },
      { key: 'verglasung', label: 'Verglasung',
        chips: ['Isolierverglasung', 'Zweifach-Wärmeschutzverglasung', 'Dreifachverglasung', 'Einfachverglasung'] },
      { key: 'rolllaeden', label: 'Sonnenschutz',
        chips: ['Kunststoffrollläden', 'Alurollläden', 'elektrisch', 'manuell', 'Raffstores', 'keine'] },
      { key: 'haustuer', label: 'Hauseingangstür',
        chips: ['Kunststoff', 'Holz', 'Aluminium', 'mit Glaseinsatz', 'mit Seitenteil'] },
      { key: 'innentueren', label: 'Innentüren',
        chips: ['Röhrenspantüren', 'Holztüren', 'furniert', 'weiß beschichtet', 'Glastüren', 'Holzzargen', 'Stahlzargen'] },
    ],
  },
  {
    key: 'ausbau', title: 'Innenausbau',
    fields: [
      { key: 'boeden', label: 'Bodenbeläge',
        chips: ['Fliesen', 'Parkett', 'Laminat', 'Vinyl', 'Teppich', 'Naturstein', 'Estrich'] },
      { key: 'waende', label: 'Wandbekleidung',
        chips: ['Putz', 'Tapete', 'Raufaser', 'gestrichen', 'Fliesenspiegel', 'Holzverkleidung'] },
      { key: 'deckenbekleidung', label: 'Deckenbekleidung',
        chips: ['Putz', 'gestrichen', 'Raufaser', 'Gipskarton', 'Holzpaneele', 'abgehängt'] },
      { key: 'sanitaer', label: 'Sanitäre Einrichtungen', multiline: true,
        chips: ['Bad mit Wanne', 'Bad mit Dusche', 'Gäste-WC', 'bodengleiche Dusche', 'Doppelwaschbecken', 'wandhängendes WC', 'raumhoch gefliest'] },
      { key: 'kueche', label: 'Küche',
        chips: ['Einbauküche vorhanden', 'keine Einbauküche', 'offene Küche', 'separate Küche'] },
    ],
  },
  {
    key: 'technik', title: 'Technische Gebäudeausstattung',
    fields: [
      { key: 'heizung', label: 'Heizung',
        chips: ['Gas-Brennwerttherme', 'Öl-Zentralheizung', 'Wärmepumpe', 'Fernwärme', 'Pelletheizung', 'Nachtspeicher', 'Fußbodenheizung', 'Heizkörper'] },
      { key: 'warmwasser', label: 'Warmwasser',
        chips: ['zentral über Heizung', 'Durchlauferhitzer', 'Boiler', 'Solarthermie'] },
      { key: 'elektro', label: 'Elektroinstallation',
        chips: ['zeitgemäß', 'einfacher Standard', 'erneuert', 'Unterverteilung mit FI'] },
      { key: 'lueftung', label: 'Lüftung',
        chips: ['Fensterlüftung', 'kontrollierte Wohnraumlüftung', 'Abluftanlage Bad'] },
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
        chips: ['Kaminofen', 'offener Kamin', 'Sauna', 'Schwimmbad', 'Aufzug', 'Alarmanlage'] },
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

// Standardstufen nach NHK 2010 (Ein- und Zweifamilienhäuser), Wägungsanteile in %.
export const STANDARD_MERKMALE = [
  { key: 'aussenwaende', label: 'Außenwände', weight: 23 },
  { key: 'dach', label: 'Dach', weight: 15 },
  { key: 'fenster', label: 'Fenster und Außentüren', weight: 11 },
  { key: 'innenwaende', label: 'Innenwände und -türen', weight: 11 },
  { key: 'decken', label: 'Deckenkonstruktion und Treppen', weight: 11 },
  { key: 'fussboeden', label: 'Fußböden', weight: 5 },
  { key: 'sanitaer', label: 'Sanitäreinrichtungen', weight: 9 },
  { key: 'heizung', label: 'Heizung', weight: 9 },
  { key: 'technik', label: 'Sonstige technische Ausstattung', weight: 6 },
];

export const FOTO_CHIPS = [
  'Straßenansicht', 'Ansicht von Norden', 'Ansicht von Osten', 'Ansicht von Süden', 'Ansicht von Westen',
  'Gartenansicht', 'Eingangsbereich', 'Flur', 'Wohnzimmer', 'Esszimmer', 'Küche', 'Schlafzimmer',
  'Kinderzimmer', 'Arbeitszimmer', 'Badezimmer', 'Gäste-WC', 'Treppenhaus', 'Keller', 'Heizungsanlage',
  'Hausanschlüsse', 'Elektroverteilung', 'Dachboden', 'Dachstuhl', 'Garage', 'Carport', 'Terrasse', 'Balkon',
  'Außenanlagen', 'Mangel:', 'Schaden:', 'Feuchtigkeit', 'Riss',
  'EG', 'OG', 'DG', 'KG',
];

export function standardStufe(werte) {
  let sum = 0, weightSum = 0;
  for (const m of STANDARD_MERKMALE) {
    const v = parseFloat(werte?.[m.key]);
    if (!isNaN(v)) { sum += v * m.weight; weightSum += m.weight; }
  }
  return weightSum ? { stufe: sum / weightSum, vollstaendig: weightSum === 100 } : null;
}
