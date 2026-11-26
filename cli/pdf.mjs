// Writes each deck to out/<deck>.pdf, one page per slide, after the check: a deck with findings
// gets no PDF. Dark writes the dark deck to out/<deck>-dark.pdf.
import { mkdir } from 'node:fs/promises'
import { eachDeck, printFindings } from './browser.mjs'

export async function pdf(decks, { dark = false } = {}) {
  await mkdir('out', { recursive: true })
  return eachDeck(decks, { dark }, async ({ deck, name, page, findings }) => {
    if (findings.length) {
      console.log(`${deck}: geen pdf, eerst ${findings.length === 1 ? 'deze melding' : `deze ${findings.length} meldingen`} oplossen`)
      printFindings(deck, findings)
      return false
    }
    // Lintje keeps paper light; this PDF is the slides as the screen shows them, dark included.
    await page.emulateMedia({ media: 'screen' })
    await page.evaluate(() => document.documentElement.classList.add('slides-pdf'))
    // Every slide is shown now: a chart measures its new box before it is printed.
    await page.waitForTimeout(500)
    const file = `out/${name}${dark ? '-dark' : ''}.pdf`
    await page.pdf({ path: file, preferCSSPageSize: true, printBackground: true })
    console.log(file)
    return true
  })
}
