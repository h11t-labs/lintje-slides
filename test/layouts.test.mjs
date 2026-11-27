// What a layout has to have besides its entry in src/layouts.js: its look, its slide in the example
// deck and its row in the catalogue of the skill.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import { LAYOUTS } from '../src/layouts.js'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const names = Object.keys(LAYOUTS)
const KINDS = ['text', 'label', 'photo', 'photos', 'chart', 'table']

describe('every layout', () => {
  it('has fields of a kind the check knows, with the limits of that kind', () => {
    for (const [name, layout] of Object.entries(LAYOUTS)) {
      for (const [field, spec] of Object.entries(layout.fields)) {
        const where = `${name}, ${field}`
        assert.ok(KINDS.includes(spec.kind), where)
        assert.equal(Number.isInteger(spec.count), spec.kind === 'photos', where)
        if (spec.items) assert.ok(spec.items.length === 2 && spec.items[0] <= spec.items[1], where)
      }
    }
  })

  it('has its look in slides.css', async () => {
    const css = await read('src/slides.css')
    const grounds = [...css.matchAll(/\[data-layout\^='([a-z-]+)'\]/g)].map(([, ground]) => ground)
    const missing = names.filter((name) => !css.includes(`[data-layout='${name}']`) && !grounds.some((ground) => name.startsWith(ground)))
    assert.deepEqual(missing, [])
  })

  it('stands once in the example deck, which has no other', async () => {
    const example = await read('examples/begrijpelijke-brieven.html')
    const used = [...example.matchAll(/<section class="slide" data-layout="([^"]*)"/g)].map(([, name]) => name)
    assert.deepEqual(used.toSorted(), names.toSorted())
  })

  it('has its row in the catalogue of the skill', async () => {
    const catalogue = await read('skills/lintje-slides/layouts.md')
    const rows = [...catalogue.matchAll(/^\| `([a-z-]+)` \|/gm)].map(([, name]) => name)
    assert.deepEqual(rows, names)
  })
})
