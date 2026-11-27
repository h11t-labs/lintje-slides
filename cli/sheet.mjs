// Writes every slide of a deck small in one PNG, out/<deck>-overzicht.png, each with its number:
// the deck's own overview, photographed in full. The order and the alternation of grounds show
// only side by side.
import { mkdir } from 'node:fs/promises'

// At four columns a slide is some 280 px wide: twice the pixels keep its title legible.
const SCALE = 2

export async function sheet(page, name, { dark = false } = {}) {
  const file = `out/${name}${dark ? '-dark' : ''}-overzicht.png`
  await mkdir('out', { recursive: true })
  // A page of its own, for the scale, and so the deck stands as it loads, whatever --images did.
  const shot = await page.context().browser().newPage({ viewport: page.viewportSize(), deviceScaleFactor: SCALE, reducedMotion: 'reduce' })
  try {
    await shot.goto(page.url().replace(/#.*$/, ''), { waitUntil: 'networkidle' })
    await shot.waitForSelector('html[data-slides-ready]', { timeout: 15000 })
    // The slides only: no bar, no focus ring and no slide marked as the current one. Every slide
    // stands before the overview opens: a chart measures its box as drawn, so it measures at full
    // size first, and the overview's scale does not change that box.
    await shot.addStyleTag({
      content: `.slide { display: grid }
        .slides-nav { display: none }
        .slides-overview .slide:focus-visible { outline: none }
        .slides-overview .slide.is-current { box-shadow: none }
        .slides-overview .slide.is-current .slide__number { color: var(--color-text-secondary); background: none }`,
    })
    await shot.waitForTimeout(500)
    await shot.keyboard.press('o')
    await shot.waitForSelector('html.slides-overview')
    await shot.waitForTimeout(500)
    await shot.screenshot({ path: file, fullPage: true })
  } finally {
    await shot.close()
  }
  return file
}
