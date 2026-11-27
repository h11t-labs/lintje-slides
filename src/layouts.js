// The 30 layouts of a deck: what each one is for and which fields it takes. slides.js reads it to
// check a slide, scripts/catalog.mjs to write the handbook's table. The look lives in slides.css.
//
// A field is `[data-field]` inside the slide; the title is always the slide's `<h1>`.
// kind: 'text' (p, ul, ol, h3, strong; a list needs `items`), 'photo' (one img with alt),
// 'photos' (`count` figures, each an img with alt and an optional figcaption), 'chart'
// (a lintje-chart), 'table' (a table with a caption), 'label' (a few words on one line).

/** @typedef {{ kind: string, required?: boolean, items?: [number, number], count?: number, words?: number, parts?: string }} Field */
/** @typedef {{ name: string, ground: string, use: string, footer?: boolean, logo?: boolean, title?: string, titleWords?: number, fields: Record<string, Field> }} Layout */

const photo = { kind: 'photo', required: true }
const payoff = { kind: 'label', words: 12, parts: 'de pay-off van de organisatie' }
const contact = { kind: 'text', required: true, words: 16, parts: 'naam en e-mailadres, elk een <p>' }
const cards = (n, parts = 'elk een <li> met <h3> en <p>') => ({ kind: 'text', required: true, items: [n, n], words: 60, parts })

/** @type {Record<string, Layout>} */
export const LAYOUTS = {
  'photo-title': {
    name: 'Foto · Titel', ground: 'Titel en slot', footer: false, logo: true, titleWords: 4,
    use: 'De eerste dia: de titel in het blauwe blok op een foto.',
    fields: {
      photo: photo,
      subtitle: { kind: 'text', required: true, words: 14 },
      speaker: { kind: 'text', words: 16, parts: 'spreker en datum, elk een <p>' },
      payoff,
    },
  },
  'photo-closing-block': {
    name: 'Foto · Afsluiting met blauw blok', ground: 'Titel en slot', footer: false, logo: true, title: 'Bedankt',
    use: 'De laatste dia, als spiegel van de titeldia.',
    fields: { photo: photo, text: { kind: 'text', required: true, words: 20 }, contact, payoff },
  },
  'photo-closing-panel': {
    name: 'Foto · Afsluiting met paneel', ground: 'Titel en slot', footer: false, logo: true, title: 'Bedankt',
    use: 'De laatste dia, rustiger: een wit paneel op de foto.',
    fields: { photo: photo, text: { kind: 'text', required: true, words: 20 }, contact, payoff },
  },
  'blue-closing-photo-strip': {
    name: 'Blauw · Afsluiting met fotostrook', ground: 'Titel en slot', footer: false, logo: true, title: 'Bedankt',
    use: 'De laatste dia met drie foto’s uit de presentatie.',
    fields: {
      contact, text: { kind: 'text', required: true, words: 24 },
      photos: { kind: 'photos', required: true, count: 3 }, payoff,
    },
  },
  'photo-divider': {
    name: 'Foto · Tussenpagina met kolom', ground: 'Foto',
    use: 'Het begin van een hoofdstuk, met een foto.',
    fields: {
      photo: photo, number: { kind: 'label', required: true, words: 1 }, label: { kind: 'label', words: 2 },
      text: { kind: 'text', words: 24 },
    },
  },
  'photo-panel': {
    name: 'Foto · Paneel', ground: 'Foto',
    use: 'Eén boodschap op een foto die het verhaal draagt.',
    fields: { photo: photo, text: { kind: 'text', words: 24 } },
  },
  'photo-quote': {
    name: 'Foto · Citaat', ground: 'Foto',
    use: 'Een citaat op een foto. De titel is onzichtbaar en telt voor het overzicht en de schermlezer.',
    fields: { photo: photo, quote: { kind: 'text', required: true, words: 40 }, source: { kind: 'label', required: true, words: 12 } },
  },
  'photo-statement': {
    name: 'Foto · Stelling', ground: 'Foto', title: 'De stelling',
    use: 'Een stelling op een foto, om de zaal te laten reageren.',
    fields: { photo: photo, label: { kind: 'label', words: 2 } },
  },
  'photo-wall': {
    name: 'Foto · Beeldwand', ground: 'Foto',
    use: 'Vier foto’s die samen een plek of een werkveld laten zien.',
    fields: { photos: { kind: 'photos', required: true, count: 4 } },
  },
  'plain-agenda': {
    name: 'Vlak · Agenda', ground: 'Vlak', title: 'Agenda',
    use: 'De agenda: drie tot vijf onderdelen, met wat de zaal na afloop weet.',
    fields: {
      topics: { kind: 'text', required: true, items: [3, 5], words: 60, parts: '<ol>, elk onderdeel een <li> met <h3> en <p>' },
      aside: { kind: 'text', words: 16, parts: '<h3> en <p>' },
    },
  },
  'plain-divider': {
    name: 'Vlak · Tussenpagina met nummer', ground: 'Vlak',
    use: 'Het begin van een hoofdstuk, zonder foto: een groot nummer.',
    fields: { number: { kind: 'label', required: true, words: 1 }, label: { kind: 'label', words: 3 }, text: { kind: 'text', words: 24 } },
  },
  'plain-three-cards': {
    name: 'Vlak · Drie kaarten', ground: 'Vlak',
    use: 'Drie gelijkwaardige punten, elk met een kop en een zin.',
    fields: { cards: cards(3, '<ul>, elk een <li> met <h3> en <p>') },
  },
  'plain-key-card': {
    name: 'Vlak · Tekst met kernkaart', ground: 'Vlak',
    use: 'Een opsomming met de kern in één zin ernaast.',
    fields: {
      points: { kind: 'text', required: true, items: [3, 5], words: 60, parts: '<ul> met <li>' },
      key: { kind: 'text', required: true, words: 20, parts: '<h3> en <p>' },
    },
  },
  'plain-quote-portrait': {
    name: 'Vlak · Citaat met portret', ground: 'Vlak', titleWords: 30,
    use: 'Een citaat als titel, met het portret en de naam van wie het zei.',
    fields: { portrait: { kind: 'photo' }, source: { kind: 'text', required: true, words: 16, parts: '<h3> met de naam en <p> met functie of datum' } },
  },
  'plain-three-figures': {
    name: 'Vlak · Drie kerncijfers', ground: 'Vlak',
    use: 'Drie getallen die samen het verhaal vertellen.',
    fields: { figures: cards(3, '<ul>, elk een <li> met <strong> (het getal), <h3> en <p>') },
  },
  'plain-two-columns': {
    name: 'Vlak · Twee kolommen', ground: 'Vlak',
    use: 'Twee keuzes of kanten naast elkaar; de rechter, blauwe kolom is het voorstel.',
    fields: {
      left: { kind: 'text', required: true, words: 50, parts: '<h3>, <p> en een <ul>' },
      right: { kind: 'text', required: true, words: 50, parts: '<h3>, <p> en een <ul>; <mark> voor een label in de kop' },
    },
  },
  'plain-before-after': {
    name: 'Vlak · Voor en na', ground: 'Vlak',
    use: 'Hoe iets was en hoe het nu is.',
    fields: {
      before: { kind: 'text', required: true, words: 60, parts: '<h3> (het label) en <p>' },
      after: { kind: 'text', required: true, words: 60, parts: '<h3> (het label), <h4> en <p>' },
    },
  },
  'plain-schedule': {
    name: 'Vlak · Planning', ground: 'Vlak',
    use: 'Vier momenten op een tijdlijn, met waar het eindigt.',
    fields: {
      intro: { kind: 'text', words: 24 },
      moments: { kind: 'text', required: true, items: [4, 4], words: 48, parts: '<ol>, elk een <li> met <strong> (het moment), <h3> en <p>' },
      end: { kind: 'label', words: 2 },
    },
  },
  'plain-three-pillars': {
    name: 'Vlak · Drie pijlers', ground: 'Vlak',
    use: 'Eén kern met drie pijlers eronder. De titel is klein, de kern is de boodschap.',
    fields: { key: { kind: 'label', required: true, words: 8 }, pillars: cards(3, '<ul>, elk een <li> met <h3> en <p>') },
  },
  'plain-steps': {
    name: 'Vlak · Stappen', ground: 'Vlak',
    use: 'Vier stappen achter elkaar, met wat ze opleveren.',
    fields: {
      steps: { kind: 'text', required: true, items: [3, 4], words: 60, parts: '<ol>, elk een <li> met <h3> en <p>' },
      result: { kind: 'text', words: 16, parts: '<h3> en <p>' },
    },
  },
  'band-list': {
    name: 'Band · Inleiding en opsomming', ground: 'Band',
    use: 'De kern in één zin, met de punten die hem dragen.',
    fields: {
      intro: { kind: 'text', required: true, words: 24 },
      points: { kind: 'text', required: true, items: [3, 5], words: 50, parts: '<ul> met <li>' },
    },
  },
  'band-chart': {
    name: 'Band · Grafiek', ground: 'Band',
    use: 'Eén grafiek; de titel zegt wat hij laat zien.',
    fields: { chart: { kind: 'chart', required: true }, source: { kind: 'label', words: 16 } },
  },
  'band-table': {
    name: 'Band · Tabel', ground: 'Band',
    use: 'Een kleine tabel, tot zes rijen.',
    fields: { table: { kind: 'table', required: true, items: [1, 6] } },
  },
  'blue-three-points': {
    name: 'Blauw · Drie punten', ground: 'Blauw',
    use: 'Een stelling als titel, met drie punten die hem onderbouwen.',
    fields: { points: cards(3, '<ul>, elk een <li> met <h3> en <p>') },
  },
  'blue-statement': {
    name: 'Blauw · Stelling', ground: 'Blauw', title: 'De stelling',
    use: 'Een stelling om over te stemmen of te praten.',
    fields: { label: { kind: 'label', words: 2 }, question: { kind: 'text', words: 16 } },
  },
  'blue-summary': {
    name: 'Blauw · Samenvatting', ground: 'Blauw',
    use: 'Wat de zaal onthoudt: drie zinnen, aan het eind.',
    fields: { points: { kind: 'text', required: true, items: [3, 3], words: 45, parts: '<ol> met drie <li>' } },
  },
  'half-photo-right': {
    name: 'Half · Foto rechts in vlak', ground: 'Half',
    use: 'Tekst met een foto ernaast, op het lichte vlak.',
    fields: { photo: photo, text: { kind: 'text', required: true, words: 60, parts: 'een <p> en een <ul>' } },
  },
  'half-photo-left': {
    name: 'Half · Foto links', ground: 'Half',
    use: 'Tekst met een foto ervoor, op de witte pagina.',
    fields: { photo: photo, text: { kind: 'text', required: true, words: 60, parts: 'een <p> en een <ul>' } },
  },
  'half-two-photos': {
    name: 'Half · Twee foto’s', ground: 'Half',
    use: 'Tekst met twee foto’s, elk met een bijschrift.',
    fields: { photos: { kind: 'photos', required: true, count: 2 }, text: { kind: 'text', required: true, words: 60, parts: 'een <p> en een <ul>' } },
  },
  'half-key-figure': {
    name: 'Half · Kerncijfer met foto', ground: 'Half',
    use: 'Eén getal dat telt, met een foto.',
    fields: { photo: photo, figure: { kind: 'text', required: true, words: 30, parts: '<strong> (het getal), <h3> en <p>' } },
  },
}
