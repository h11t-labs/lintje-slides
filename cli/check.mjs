// Checks each deck against its layouts and lists what does not fit. With images, it also writes
// a PNG per slide to out/<deck>/, to look at.
import { mkdir } from 'node:fs/promises'
import { eachDeck, printFindings } from './browser.mjs'
import { sheet as writeSheet } from './sheet.mjs'

export function check(decks, { images = false, sheet = false, dark = false } = {}) {
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
    if (sheet) console.log(`  overzicht in ${await writeSheet(page, name, { dark })}`)
    return findings.length === 0
  })
}
