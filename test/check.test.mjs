// The check on its wrong path: each slide here breaks one rule, and gives exactly the findings
// listed with it. All slides stand in one deck, so a finding also has to name the right slide.
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { PHOTO, deck, findings, slide, stage, words } from './helpers.mjs'

const long = (count) => Array.from({ length: count }, () => 'verantwoordelijkheid').join(' ')
const list = ({ intro = '<p data-field="intro">Een zin.</p>', points = ['Een', 'Twee', 'Drie'] } = {}) =>
  `${intro}<div data-field="points"><ul>${points.map((point) => `<li>${point}</li>`).join('\n')}</ul></div>`
const panel = (photo) => `${photo}<p data-field="text">Een zin.</p>`
const img = (attributes) => `<img data-field="photo" ${attributes} />`
const wall = (count) =>
  `<div data-field="photos">${`<figure><img src="${PHOTO}" alt="Een foto" /><figcaption>Een plek</figcaption></figure>`.repeat(count)}</div>`
const table = (rows, caption = '<caption>Een tabel</caption>') =>
  `<div data-field="table"><table>${caption}<tbody>${Array.from({ length: rows }, (_, row) => `<tr><th scope="row">Rij ${row + 1}</th><td>${row}</td></tr>`).join('')}</tbody></table></div>`
const cards = (texts) => `<div data-field="cards"><ul>${texts.map((text) => `<li><h3>Kop</h3> <p>${text}</p></li>`).join('\n')}</ul></div>`

/** @type {[what: string, slide: string, findings: string[]][]} */
const CASES = [
  ['a slide that follows its layout', slide('band-list', list()), []],
  ['no layout', '<section class="slide"><h1>Titel</h1></section>', ['de dia heeft geen data-layout']],
  ['a layout that does not exist', slide('band-lijst', list()), ['onbekende indeling "band-lijst"']],

  ['no title', `<section class="slide" data-layout="band-list">${list()}</section>`, ['de dia heeft precies één <h1> als titel']],
  ['two titles', slide('band-list', `<h1>Een</h1><h1>Twee</h1>${list()}`), ['de dia heeft precies één <h1> als titel']],
  ['an empty title', slide('band-list', `<h1> </h1>${list()}`), ['de titel is leeg']],
  ['a title of the most words', slide('band-list', `<h1>${words(16)}</h1>${list()}`), []],
  ['a title past its words', slide('band-list', `<h1>${words(17)}</h1>${list()}`), ['de titel heeft hoogstens 16 woorden, nu 17']],
  ['a title past the words of its layout', slide('plain-quote-portrait', `<h1>${words(31)}</h1><div data-field="source"><h3>Naam</h3></div>`), ['de titel heeft hoogstens 30 woorden, nu 31']],

  ['a required field missing', slide('band-list', list({ intro: '' })), ['veld "intro" ontbreekt']],
  ['an optional field missing', slide('band-chart', '<div data-field="chart"><lintje-chart></lintje-chart></div>'), []],
  ['a field of another layout', slide('band-list', `${list()}<p data-field="source">Bron</p>`), ['"source" is geen veld van band-list; wel: intro, points']],
  ['content outside a field', slide('band-list', `${list()}<p>Los</p>`), ['<p> zonder data-field: alles op een dia staat in een veld']],
  ['a field twice', slide('band-list', `${list()}<p data-field="intro">Nog een zin.</p>`), ['veld "intro" staat er twee keer']],
  ['notes, with anything in them', slide('band-list', `${list()}<aside data-notes><div class="x" style="color: red"><table></table></div></aside>`), []],

  ['a photo', slide('photo-panel', panel(img(`src="${PHOTO}" alt="Een foto"`))), []],
  ['a photo with a focus', slide('photo-panel', panel(img(`src="${PHOTO}" alt="Een foto" data-focus="30 40"`))), []],
  ['a photo that is no <img>', slide('photo-panel', panel('<div data-field="photo"></div>')), ['veld "photo" is een <img>']],
  ['a photo without alt', slide('photo-panel', panel(img(`src="${PHOTO}"`))), ['veld "photo": de foto heeft een alt-tekst']],
  ['a photo with an empty alt', slide('photo-panel', panel(img(`src="${PHOTO}" alt=" "`))), ['veld "photo": de foto heeft een alt-tekst']],
  ['a photo that does not load', slide('photo-panel', panel(img('src="/bestaat-niet.jpg" alt="Een foto"'))), ['veld "photo": de foto /bestaat-niet.jpg laadt niet']],
  ['the photos of a wall', slide('photo-wall', wall(4)), []],
  ['a photo too few', slide('photo-wall', wall(3)), [`veld "photos" heeft 4 foto's, nu 3`]],
  ['a title slide without a photo', slide('blue-title', '<h1>Een titel</h1><p data-field="subtitle">Een ondertitel</p>'), []],
  ['a chapter on blue, without a photo', slide('blue-divider', '<span data-field="number">1</span><h1>Een hoofdstuk</h1>'), []],
  ['a closing without a photo', slide('blue-closing', '<h1>Bedankt</h1><p data-field="text">Een zin.</p><div data-field="contact"><p>Een naam</p></div>'), []],

  ['a chart field without a chart', slide('band-chart', '<div data-field="chart"><p>Een zin.</p></div>'), ['veld "chart" is een <lintje-chart>']],
  ['a table of the most rows', slide('band-table', table(6)), []],
  ['a table field without a table', slide('band-table', '<div data-field="table"><p>Een zin.</p></div>'), ['veld "table" is een <table>']],
  ['a table without a caption', slide('band-table', table(3, '')), ['veld "table": de tabel heeft een <caption>']],
  ['a table past its rows', slide('band-table', table(7)), ['veld "table": hoogstens 6 rijen, nu 7']],

  ['a tag that is no text', slide('band-list', list({ intro: '<p data-field="intro">Een <u>zin</u>.</p>' })), ['veld "intro": <u> hoort niet in tekst']],
  ['a point too few', slide('band-list', list({ points: ['Een', 'Twee'] })), ['veld "points" heeft 3 tot 5 punten, nu 2']],
  ['a point too many', slide('band-list', list({ points: ['Een', 'Twee', 'Drie', 'Vier', 'Vijf', 'Zes'] })), ['veld "points" heeft 3 tot 5 punten, nu 6']],
  ['a card too few', slide('plain-three-cards', cards(['Een zin.', 'Een zin.'])), ['veld "cards" heeft 3 punten, nu 2']],
  ['a card too many', slide('plain-three-cards', cards(['Een zin.', 'Een zin.', 'Een zin.', 'Een zin.'])), ['veld "cards" heeft 3 punten, nu 4']],
  ['a card too many, past its words', slide('plain-three-cards', cards([words(20), words(20), words(20), words(20)])), ['veld "cards" heeft 3 punten, nu 4', 'veld "cards": hoogstens 60 woorden, nu 84']],
  ['a class in the content', slide('band-list', list({ intro: '<p data-field="intro" class="groot">Een zin.</p>' })), ['<p class>: de opmaak komt uit de indeling']],
  ['a style in the content', slide('band-list', list({ intro: '<p data-field="intro" style="color: red">Een zin.</p>' })), ['<p style>: de opmaak komt uit de indeling']],

  ['a field of the most words', slide('band-list', list({ intro: `<p data-field="intro">${words(24)}</p>` })), []],
  // Two blocks that stand against each other in the markup are still two words.
  ['a field past its words, without white space between its points', slide('band-list', `<p data-field="intro">Een zin.</p><ul data-field="points"><li>${words(17)}</li><li>${words(17)}</li><li>${words(17)}</li></ul>`), ['veld "points": hoogstens 50 woorden, nu 51']],
  ['a word in two parts', slide('band-list', list({ intro: `<p data-field="intro">${words(23)} on<strong>geveer</strong></p>` })), []],
  ['a field past its words that still fits', slide('band-list', list({ intro: `<p data-field="intro">${words(25)}</p>` })), ['veld "intro": hoogstens 24 woorden, nu 25']],
  // One cause, one finding: the words and the box of a field come together.
  ['a field past its words that does not fit', slide('band-list', list({ intro: `<p data-field="intro">${words(300)}</p>` })), ['veld "intro" past niet (300 woorden, hoogstens 24): maak de tekst korter']],
  ['a field within its words that does not fit', slide('band-list', list({ points: ['Een', 'w'.repeat(300), 'Drie'] })), ['veld "points" past niet: maak de tekst korter']],
  ['a point past the words of its field', slide('band-list', list({ points: ['Een', words(200), 'Drie'] })), ['veld "points" past niet (202 woorden, hoogstens 50): maak de tekst korter']],
  ['a point that does not fit', slide('plain-three-cards', cards([words(50), 'Een zin.', 'Een zin.'])), ['een punt in "cards" past niet: maak de tekst korter']],
  ['a point that does not fit in a field past its words', slide('plain-three-cards', cards([words(70), 'Een zin.', 'Een zin.'])), ['veld "cards" past niet (77 woorden, hoogstens 60): maak de tekst korter']],
  ['two points that do not fit', slide('plain-three-cards', cards([words(27), words(27), 'Een zin.'])), ['2 punten in "cards" passen niet: maak de tekst korter']],
  ['a title that does not fit', slide('plain-three-cards', `<h1>${long(10)}</h1>${cards(['Een zin.', 'Een zin.', 'Een zin.'])}`), ['de titel past niet: maak de tekst korter']],
  ['a title that runs off the top of the band', slide('band-list', `<h1>${long(16)}</h1>${list()}`), ['de titel past niet: maak de tekst korter']],
  ['a title past its words that does not fit', slide('plain-three-cards', `<h1>${words(40)}</h1>${cards(['Een zin.', 'Een zin.', 'Een zin.'])}`), ['de titel past niet (40 woorden, hoogstens 16): maak de tekst korter']],
  // Everything a long title pushes off the slide stands in one finding.
  ['a title past its words that pushes the rest off the slide', slide('photo-title', `<img data-field="photo" src="${PHOTO}" alt="Een foto" /><h1>${long(16)}</h1><p data-field="subtitle">Een ondertitel</p>`), ['de titel heeft hoogstens 4 woorden, nu 16: veld "photo" en veld "subtitle" vallen van de dia']],
  ['a title past its words that pushes the rest off a title slide without a photo', slide('blue-title', `<h1>${long(16)}</h1><p data-field="subtitle">Een ondertitel</p>`), ['de titel heeft hoogstens 4 woorden, nu 16: veld "subtitle" valt van de dia']],
  ['a title that pushes the rest off the slide', slide('blue-statement', `<h1>${long(12)}</h1><p data-field="question">Een vraag.</p>`), ['de titel en veld "question" vallen van de dia: de titel of de tekst erboven is te lang']],
]

describe('the check of a slide', () => {
  let theatre
  /** @type {Map<number, string[]>} */
  const perSlide = new Map()

  before(async () => {
    theatre = await stage()
    const page = await theatre.open(deck(CASES.map(([, html]) => html)))
    for (const { slide: number, message } of await page.evaluate(() => window.slidesCheck())) {
      perSlide.set(number, [...(perSlide.get(number) ?? []), message])
    }
    await page.close()
  })
  after(() => theatre.close())

  for (const [index, [what, , expected]] of CASES.entries()) {
    it(what, () => assert.deepEqual(perSlide.get(index + 1) ?? [], expected))
  }
})

describe('the findings on the slide', () => {
  let theatre
  before(async () => (theatre = await stage()))
  after(() => theatre.close())

  const faulty = deck([slide('band-list', list()), slide('band-list', list({ intro: `<p data-field="intro">${words(25)}</p>` }))])

  it('stay off the slide without ?check', async () => {
    const page = await theatre.open(faulty)
    assert.equal(await page.locator('.slide__findings, .is-error').count(), 0)
  })

  it('show as a notice on their slide, with the field marked', async () => {
    const page = await theatre.open(faulty, { query: '?check' })
    assert.equal(await page.locator('.slide:nth-of-type(1) .slide__findings').count(), 0)
    const notices = page.locator('.slide:nth-of-type(2) .slide__findings lintje-announcement')
    assert.equal(await notices.count(), 1)
    assert.deepEqual(await notices.first().evaluate((notice) => notice.data), { kind: 'error', text: 'veld "intro": hoogstens 24 woorden, nu 25', dismissible: false })
    assert.deepEqual(await page.locator('.is-error').evaluateAll((marked) => marked.map((element) => element.dataset.field)), ['intro'])
  })

  // The mark of a finding is a class, and no styling in the content.
  it('do not change what the check finds next', async () => {
    const page = await theatre.open(faulty, { query: '?check' })
    assert.deepEqual(await findings(page), ['dia 2: veld "intro": hoogstens 24 woorden, nu 25'])
  })
})
