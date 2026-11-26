// Writes the table of layouts into AGENTS.md, between its two catalogue markers, from
// src/layouts.js: the handbook never lists a field the check does not know.
import { readFile, writeFile } from 'node:fs/promises'
import { LAYOUTS } from '../src/layouts.js'

const KINDS = {
  text: 'tekst',
  label: 'label, één regel',
  photo: '`<img>` met alt',
  photos: 'foto’s',
  chart: '`<lintje-chart>`',
  table: '`<table>` met `<caption>`',
}

function field(name, spec) {
  const kind = spec.kind === 'photos' ? `${spec.count} ${KINDS.photos} (\`<figure>\`)` : KINDS[spec.kind]
  const parts = spec.parts?.replace(/<[a-z0-9]+>/g, (tag) => `\`${tag}\``)
  const words = spec.words && (spec.words === 1 ? 'één woord' : `≤ ${spec.words} woorden`)
  const limits = [parts, words].filter(Boolean).join(', ')
  return `\`${name}\`${spec.required ? '' : ' (mag weg)'}: ${kind}${limits ? `; ${limits}` : ''}`
}

const rows = Object.entries(LAYOUTS).map(([id, layout]) => {
  const fields = Object.entries(layout.fields).map(([name, spec]) => field(name, spec))
  const extra = [layout.logo && 'met embleem', layout.footer === false && 'zonder voet'].filter(Boolean).join(', ')
  return `| \`${id}\` | ${layout.use}${extra ? ` (${extra})` : ''} | ${fields.join('<br>')} |`
})

const table = ['| indeling | wanneer | velden naast de `<h1>` |', '|---|---|---|', ...rows].join('\n')
const file = new URL('../AGENTS.md', import.meta.url)
const text = await readFile(file, 'utf8')
const start = '<!-- catalog:begin -->'
const end = '<!-- catalog:end -->'
const updated = text.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${table}\n${end}`)
await writeFile(file, updated)
console.log(`AGENTS.md: ${rows.length} indelingen`)
