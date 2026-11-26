// Writes the skill's catalogue of layouts, skills/lintje-slides/layouts.md, from src/layouts.js:
// the skill never lists a field the check does not know.
import { writeFile } from 'node:fs/promises'
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
  const extra = [
    layout.titleWords && `titel ≤ ${layout.titleWords} woorden`,
    layout.logo && 'met embleem',
    layout.footer === false && 'zonder voet',
  ]
    .filter(Boolean)
    .join(', ')
  return `| \`${id}\` | ${layout.use}${extra ? ` (${extra})` : ''} | ${fields.join('<br>')} |`
})

const intro = `# De indelingen

Elke indeling met waar hij voor is en zijn velden naast de \`<h1>\`. Een veld is een element met
\`data-field="<naam>"\` direct in de \`<section>\`; de grenzen zijn een maximum, en de controle
meldt wat erboven gaat. Dit bestand komt uit \`src/layouts.js\`.
`
const table = ['| indeling | wanneer | velden naast de `<h1>` |', '|---|---|---|', ...rows].join('\n')
const file = new URL('../skills/lintje-slides/layouts.md', import.meta.url)
await writeFile(file, `${intro}\n${table}\n`)
console.log(`skills/lintje-slides/layouts.md: ${rows.length} indelingen`)
