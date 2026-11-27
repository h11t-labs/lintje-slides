// The deck in the browser: what it builds around a slide, the keys and buttons, the overview and
// the speaker's view in a second window.
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { PHOTO, deck, slide, stage } from './helpers.mjs'

const list = '<p data-field="intro">Een zin.</p><ul data-field="points"><li>Een</li><li>Twee</li><li>Drie</li></ul>'
const SLIDES = [
  slide(
    'photo-title',
    `<img data-field="photo" src="${PHOTO}" alt="Een foto" data-focus="30 40" /><h1>Een</h1><p data-field="subtitle">Een ondertitel</p>`,
  ),
  slide('band-list', `<h1>Twee</h1>${list}<aside data-notes><p>Zeg dit <strong>eerst</strong>.</p></aside>`, 'data-chapter="Begin"'),
  slide('band-list', `<h1>Drie</h1>${list}`),
  slide(
    'band-table',
    `<h1>Vier</h1><div data-field="table"><table><caption>Een tabel</caption>
      <thead><tr><th scope="col">Brief</th><th scope="col">Per jaar</th><th scope="col">Start</th></tr></thead>
      <tbody><tr><th scope="row">Herinnering</th><td>1.200.000</td><td>jan 2027</td></tr>
      <tr><th scope="row">Beschikking</th><td>−12,5%</td><td>mrt 2027</td></tr></tbody></table></div>`,
    'data-chapter=""',
  ),
  slide('band-list', `<h1>Vijf</h1>${list}`),
]
const DECK = deck(SLIDES, { body: 'data-date="1 januari 2027"' })

describe('a deck', () => {
  let theatre
  before(async () => (theatre = await stage()))
  after(() => theatre.close())

  /** Waits until this slide is the one shown: a step goes by the URL, which tells the page a moment later. */
  const shows = (page, number) =>
    page.waitForFunction((n) => [...document.querySelectorAll('.slide')].findIndex((slide) => slide.classList.contains('is-current')) === n - 1, number)
  const count = (page) => page.locator('.slides-nav__count').textContent()
  const disabled = (page, name) => page.locator(`.slides-nav__${name}`).evaluate((button) => button.disabled)

  describe('builds around a slide', () => {
    let page
    before(async () => (page = await theatre.open(DECK)))

    it('the footer: the deck and the chapter, the date and the number', async () => {
      const footers = await page.locator('.slide').evaluateAll((slides) =>
        slides.map((slide) => [...(slide.querySelector('.slide__footer')?.children ?? [])].map((part) => part.textContent)),
      )
      assert.deepEqual(footers, [
        [],
        ['Proefdeck · Begin', '1 januari 2027 · 2'],
        ['Proefdeck · Begin', '1 januari 2027 · 3'],
        ['Proefdeck', '1 januari 2027 · 4'],
        ['Proefdeck', '1 januari 2027 · 5'],
      ])
    })

    it('the emblem of the theme, where the layout has one', async () => {
      const logos = await page.locator('.slide__logo').evaluateAll((logos) =>
        logos.map((logo) => [logo.closest('.slide').dataset.layout, logo.getAttribute('name'), logo.getAttribute('alt')]),
      )
      assert.deepEqual(logos, [['photo-title', 'embleem-rijksoverheid', 'Rijksoverheid']])
    })

    it('the focus of a photo', async () => {
      assert.equal(await page.locator('img[data-focus]').evaluate((img) => img.style.objectPosition), '30% 40%')
    })

    it('a column of figures, marked to align right', async () => {
      const marked = await page.locator('tr').evaluateAll((rows) => rows.map((row) => [...row.cells].map((cell) => cell.hasAttribute('data-numeric'))))
      assert.deepEqual(marked, [
        [false, true, false],
        [false, true, false],
        [false, true, false],
      ])
    })
  })

  describe('takes from its page and its URL', () => {
    it('the emblem and the organisation of the body', async () => {
      const page = await theatre.open(deck(SLIDES, { body: 'data-emblem="embleem-eigen" data-organisation="Een organisatie"' }))
      const logo = page.locator('.slide__logo')
      assert.deepEqual([await logo.getAttribute('name'), await logo.getAttribute('alt')], ['embleem-eigen', 'Een organisatie'])
    })

    it('the theme and the mode', async () => {
      const page = await theatre.open(DECK, { query: '?theme=defensie&mode=dark' })
      const { theme, mode } = await page.evaluate(() => ({ ...document.documentElement.dataset }))
      assert.deepEqual([theme, mode], ['defensie', 'dark'])
      const logo = page.locator('.slide__logo')
      assert.deepEqual([await logo.getAttribute('name'), await logo.getAttribute('alt')], ['embleem-defensie', 'Ministerie van Defensie'])
      assert.equal(await page.locator('.slides-nav__mode').evaluate((button) => button.pressed), true)
    })

    it('the slide', async () => {
      const page = await theatre.open(DECK, { hash: '#3' })
      await shows(page, 3)
      assert.equal(await count(page), '3 / 5')
      assert.equal(await page.title(), 'Drie (3/5)')
    })

    it('the last slide for a number past it', async () => {
      const page = await theatre.open(DECK, { hash: '#99' })
      await shows(page, 5)
    })
  })

  describe('steps', () => {
    it('opens on the first slide, with no way back', async () => {
      const page = await theatre.open(DECK)
      await shows(page, 1)
      assert.equal(await count(page), '1 / 5')
      assert.equal(await page.title(), 'Een (1/5)')
      assert.deepEqual([await disabled(page, 'previous'), await disabled(page, 'next')], [true, false])
    })

    it('with the keys', async () => {
      const page = await theatre.open(DECK)
      const steps = [
        ['ArrowRight', 2], ['ArrowDown', 3], ['PageDown', 4], ['Space', 5], ['Space', 5],
        ['ArrowLeft', 4], ['ArrowUp', 3], ['PageUp', 2], ['Shift+Space', 1], ['ArrowLeft', 1],
        ['End', 5], ['Home', 1],
      ] // prettier-ignore
      let from = 1
      for (const [key, number] of steps) {
        await page.keyboard.press(key)
        await shows(page, number)
        if (number !== from) assert.equal(new URL(page.url()).hash, `#${number}`, key)
        from = number
      }
    })

    it('with the buttons, until the last slide', async () => {
      const page = await theatre.open(DECK, { hash: '#4' })
      await page.locator('.slides-nav__next').click()
      await shows(page, 5)
      assert.deepEqual([await disabled(page, 'previous'), await disabled(page, 'next')], [false, true])
      await page.locator('.slides-nav__previous').click()
      await shows(page, 4)
    })

    it('not with a key that belongs to a shortcut of the browser', async () => {
      const page = await theatre.open(DECK)
      await page.keyboard.press('Control+ArrowRight')
      await page.keyboard.press('ArrowRight')
      await shows(page, 2)
    })
  })

  describe('switches', () => {
    it('between light and dark, and keeps it in the URL', async () => {
      const page = await theatre.open(DECK)
      await page.keyboard.press('d')
      assert.equal(await page.evaluate(() => document.documentElement.dataset.mode), 'dark')
      assert.equal(new URL(page.url()).searchParams.get('mode'), 'dark')
      await page.locator('.slides-nav__mode').click()
      assert.equal(await page.evaluate(() => document.documentElement.dataset.mode), 'light')
      assert.equal(new URL(page.url()).searchParams.get('mode'), 'light')
    })

    it('the shortcuts on, and keeps the keys from the deck while they show', async () => {
      const page = await theatre.open(DECK)
      const open = () => page.locator('lintje-dialog[heading="Sneltoetsen"]').evaluate((dialog) => dialog.open)
      await page.keyboard.press('?')
      assert.equal(await open(), true)
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => !document.querySelector('lintje-dialog[heading="Sneltoetsen"]').open)
      await shows(page, 1)
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('slides-overview')), false)
    })
  })

  describe('lays its slides out in the overview', () => {
    const open = (page) => page.evaluate(() => document.documentElement.classList.contains('slides-overview'))
    const focused = (page) => page.evaluate(() => [...document.querySelectorAll('.slide')].indexOf(document.activeElement) + 1)

    it('as buttons that say their slide, the current one focused', async () => {
      const page = await theatre.open(DECK, { hash: '#2' })
      await page.keyboard.press('o')
      assert.equal(await open(page), true)
      assert.equal(await focused(page), 2)
      const labels = await page.locator('.slide').evaluateAll((slides) => slides.map((slide) => `${slide.getAttribute('role')} ${slide.getAttribute('aria-label')}`))
      assert.deepEqual(labels, ['button Dia 1: Een', 'button Dia 2: Twee', 'button Dia 3: Drie', 'button Dia 4: Vier', 'button Dia 5: Vijf'])
    })

    it('where the keys move and Enter goes to a slide', async () => {
      const page = await theatre.open(DECK)
      await page.keyboard.press('o')
      for (const [key, number] of [['ArrowRight', 2], ['ArrowDown', 5], ['ArrowLeft', 4], ['Home', 1], ['End', 5], ['ArrowUp', 1], ['ArrowRight', 2], ['ArrowRight', 3]]) { // prettier-ignore
        await page.keyboard.press(key)
        assert.equal(await focused(page), number, key)
      }
      await page.keyboard.press('Enter')
      await shows(page, 3)
      assert.equal(await open(page), false)
      assert.equal(await page.locator('.slide[role], .slide[tabindex], .slide[aria-label]').count(), 0)
    })

    it('where a click goes to a slide', async () => {
      const page = await theatre.open(DECK)
      await page.locator('.slides-nav__overview').click()
      await page.locator('.slide').nth(3).click()
      await shows(page, 4)
      assert.equal(await open(page), false)
    })

    it('and Escape goes back to the slide it came from', async () => {
      const page = await theatre.open(DECK, { hash: '#2' })
      await page.keyboard.press('o')
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Escape')
      assert.equal(await open(page), false)
      await shows(page, 2)
    })
  })

  describe('with a speaker’s view', () => {
    let context, page, speaker
    before(async () => {
      context = await theatre.browser.newContext()
      page = await theatre.open(DECK, { context })
      ;[speaker] = await Promise.all([page.waitForEvent('popup'), page.keyboard.press('s')])
      speaker.setDefaultTimeout(5000)
      await speaker.waitForSelector('html[data-slides-ready]', { state: 'attached' })
    })
    after(() => context.close())

    const notes = () => speaker.locator('.slides-presenter__text').innerHTML()

    it('opens the same deck in a second window', async () => {
      assert.equal(new URL(speaker.url()).searchParams.has('presenter'), true)
      assert.equal(await speaker.title(), 'Spreker: Een (1/5)')
      assert.equal(await speaker.locator('.slides-presenter__title').textContent(), 'Proefdeck')
      assert.equal(await notes(), '<p class="slides-presenter__empty">Geen notities bij deze dia.</p>')
    })

    it('that follows the deck, with the notes of the slide', async () => {
      await page.keyboard.press('ArrowRight')
      await shows(speaker, 2)
      assert.equal(await notes(), '<p>Zeg dit <strong>eerst</strong>.</p>')
      assert.equal(await speaker.locator('.slides-presenter__next').getAttribute('aria-label'), 'Volgende dia: Drie')
    })

    it('that the deck follows', async () => {
      await speaker.keyboard.press('ArrowRight')
      await shows(page, 3)
    })

    it('in the same mode', async () => {
      await page.keyboard.press('d')
      await speaker.waitForFunction(() => document.documentElement.dataset.mode === 'dark')
    })

    it('and says where the deck ends', async () => {
      const end = speaker.locator('.slides-presenter__end')
      assert.equal(await end.isHidden(), true)
      await speaker.keyboard.press('End')
      await shows(page, 5)
      assert.equal(await end.isVisible(), true)
    })
  })
})
