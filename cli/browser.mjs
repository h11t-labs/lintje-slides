// Opens each deck in Chromium, for the check and the PDF. Playwright loads only here, so serve
// works without it.
import { basename } from 'node:path'
import { serve, urlOf } from './server.mjs'

export async function eachDeck(decks, { dark }, visit) {
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch {
    console.error('Playwright ontbreekt: npm install --save-dev playwright && npx playwright install chromium')
    process.exit(1)
  }
  const server = await serve(0)
  const { port } = server.address()
  const browser = await chromium.launch().catch((error) => {
    server.close()
    console.error(`Chromium start niet (${error.message.split('\n')[0]}); eenmalig: npx playwright install chromium`)
    process.exit(1)
  })
  let failed = false
  try {
    for (const deck of decks) {
      const name = basename(deck).replace(/\.html$/, '')
      // Reduced motion: slides and charts stand at once, as the check and the PDF want them.
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' })
      page.on('pageerror', (error) => {
        failed = true
        console.error(`${deck}: ${error.message}`)
      })
      await page.goto(`http://127.0.0.1:${port}${urlOf(deck)}?mode=${dark ? 'dark' : 'light'}`, { waitUntil: 'networkidle' })
      const ready = await page.waitForSelector('html[data-slides-ready]', { timeout: 15000 }).catch(() => null)
      if (!ready) {
        failed = true
        console.error(`${deck}: laadt niet als deck; staan de twee regels van @lintje/slides in de <head>?`)
      } else {
        const findings = await page.evaluate(() => window.slidesCheck())
        if ((await visit({ deck, name, page, findings })) === false) failed = true
      }
      await page.close()
    }
  } finally {
    await browser.close()
    server.close()
  }
  return !failed
}

export function printFindings(deck, findings) {
  for (const { slide, layout, message } of findings) console.log(`  dia ${slide} (${layout}): ${message}`)
}
