// Checks each deck against its layouts and lists what does not fit. With images, it also writes
// a PNG per slide to out/<deck>/, to look at.
import { mkdir } from 'node:fs/promises'
import { eachDeck, printFindings } from './browser.mjs'

export function check(decks, { images = false, dark = false } = {}) {
  return eachDeck(decks, { dark }, async ({ deck, name, page, findings }) => {
    const count = await page.locator('.slide').count()
    if (findings.length) {
      console.log(`${deck}: ${findings.length} ${findings.length === 1 ? 'melding' : 'meldingen'}`)
      printFindings(deck, findings)
    } else {
      console.log(`${deck}: ${count} dia's, in orde`)
    }
    if (images) {
      const dir = `out/${name}${dark ? '-dark' : ''}`
      await mkdir(dir, { recursive: true })
      await page.addStyleTag({ content: '.slides-nav { display: none }' })
      for (let number = 1; number <= count; number++) {
        await page.evaluate((n) => (location.hash = String(n)), number)
        await page.waitForTimeout(150)
        await page.screenshot({ path: `${dir}/${String(number).padStart(2, '0')}.png` })
      }
      console.log(`  beelden in ${dir}/`)
    }
    return findings.length === 0
  })
}
