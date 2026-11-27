#!/usr/bin/env node
import { findDecks, serve, urlOf } from '../cli/server.mjs'

const usage = `lintje-slides <opdracht> [deck.html …]

  serve                  start de server op poort 5190 (PORT=… voor een andere)
  check [--images] [--sheet]
                         meldt wat niet past; --images zet een png per dia in out/<deck>/,
                         --sheet alle dia's klein in één png, out/<deck>-overzicht.png
  pdf                    zet elk deck zonder meldingen in out/<deck>.pdf
  bundle                 zet elk deck zonder meldingen in één bestand, out/<deck>.html, dat
                         zonder server en zonder internet opent

  --dark                 bij check en pdf: de donkere versie
  Zonder deck: elk .html-bestand met <section class="slide"> in deze map en eronder.`

const [command, ...rest] = process.argv.slice(2)
const flags = new Set(rest.filter((arg) => arg.startsWith('--')))
const names = rest.filter((arg) => !arg.startsWith('--'))
const known = { serve: [], check: ['--images', '--sheet', '--dark'], pdf: ['--dark'], bundle: [] }

if (!(command in known)) {
  console.log(usage)
  process.exit(command && !['help', '--help', '-h'].includes(command) ? 2 : 0)
}
for (const flag of flags) {
  if (!known[command].includes(flag)) {
    console.error(`${flag} hoort niet bij ${command}\n\n${usage}`)
    process.exit(2)
  }
}

const decks = await findDecks(names)
if (command === 'serve') {
  const server = await serve()
  const { port } = server.address()
  for (const deck of decks) console.log(`http://127.0.0.1:${port}${urlOf(deck)}`)
} else if (command === 'check') {
  const { check } = await import('../cli/check.mjs')
  const ok = await check(decks, { images: flags.has('--images'), sheet: flags.has('--sheet'), dark: flags.has('--dark') })
  process.exit(ok ? 0 : 1)
} else if (command === 'bundle') {
  const { bundle } = await import('../cli/bundle.mjs')
  process.exit((await bundle(decks)) ? 0 : 1)
} else {
  const { pdf } = await import('../cli/pdf.mjs')
  const ok = await pdf(decks, { dark: flags.has('--dark') })
  process.exit(ok ? 0 : 1)
}
