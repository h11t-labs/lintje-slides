// Writes each deck to out/<deck>.html: one file that opens without a server or a network. Modules
// go in an import map as data URLs under bare names (bundle/node_modules/…), because a data URL
// has no folder to resolve a path in. Like the PDF, a deck with findings gets no bundle.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { eachDeck, printFindings } from './browser.mjs'
import { fileFor, root, types, urlFor } from './server.mjs'

export async function bundle(decks) {
  await mkdir('out', { recursive: true })
  return eachDeck(decks, { dark: false }, async ({ deck, name, page, findings }) => {
    if (findings.length) {
      console.log(`${deck}: geen bundel, eerst ${findings.length === 1 ? 'deze melding' : `deze ${findings.length} meldingen`} oplossen`)
      printFindings(deck, findings)
      return false
    }
    // The icons the deck asked for, and below the ones its script names for later: a button that
    // changes its icon, the speaker's view.
    const loaded = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name))
    const file = `out/${name}.html`
    let html
    try {
      html = await inline(resolve(root, deck), loaded)
    } catch (error) {
      const reason = error.code === 'ENOENT' ? `${relative(root, error.path)} bestaat niet` : error.message
      console.log(`${deck}: geen bundel, ${reason}`)
      return false
    }
    await writeFile(file, html)
    console.log(file)
    return true
  })
}

async function inline(deckFile, loaded) {
  let html = await readFile(deckFile, 'utf8')
  const icons = new Set(loaded.map((url) => /\/dist-icons\/([^/?]+)\.svg/.exec(url)?.[1]).filter(Boolean).map(decodeURIComponent))
  // Every theme's emblem: ?theme= on the bundle asks for another one than the build loaded.
  const iconFolder = fileFor('/node_modules/lintje/dist-icons/')
  for (const file of await readdir(iconFolder)) if (file.startsWith('embleem-')) icons.add(file.replace(/\.svg$/, ''))

  html = await replace(html, /<link\b[^>]*\srel=["']?stylesheet\b[^>]*>/g, async (tag) => {
    const href = attribute(tag, 'href')
    return href ? `<style>\n${await css(locate(href, deckFile))}\n</style>` : tag
  })

  // One import map for every module script, before the first: a page takes only one everywhere.
  const imports = {}
  const chart = loaded.some((url) => url.includes('/dist-elements/tag/chart.js'))
  let first = true
  html = await replace(html, /<script\b[^>]*>\s*<\/script>/g, async (tag) => {
    const src = attribute(tag, 'src')
    if (!src || attribute(tag, 'type') !== 'module') return tag
    const scriptFile = locate(src, deckFile)
    const source = await readFile(scriptFile, 'utf8')
    // Icons the script may show later (a button that changes, the speaker's view): any name in it
    // that is an icon file.
    for (const [, name] of source.matchAll(/['"`=]([a-z]+(?:-[a-z0-9]+)+)['"`]/g)) {
      if (existsSync(resolve(iconFolder, `${name}.svg`))) icons.add(name)
    }
    const entry = await modules(source, scriptFile, imports, { dynamic: chart })
    const map = first ? '<script type="importmap">@@IMPORTMAP@@</script>\n' : ''
    first = false
    return `${map}<script type="module">\n${script(entry)}\n</script>`
  })
  html = html.replace('@@IMPORTMAP@@', () => script(JSON.stringify({ imports })))

  // A photo goes in once, however often the deck shows it: a script sets each <img> from the
  // list before the deck's module runs. Only its src goes in: srcset and <source> would point
  // outside, and the src is the photo the deck checks.
  html = html.replace(/<source\b[^>]*>/g, (tag) => (/\ssrcset=/.test(tag) ? '' : tag))
  const photos = []
  html = html.replace(/<img\b[^>]*>/g, (tag) => {
    tag = tag.replace(/\s(srcset|sizes)=(["'])[^"']*\2/g, '')
    const src = attribute(tag, 'src')
    if (!src || src.startsWith('data:')) return tag
    const photo = /^(https?:)?\/\//.test(src) ? (src.startsWith('//') ? `https:${src}` : src) : locate(src, deckFile)
    if (!photos.includes(photo)) photos.push(photo)
    return tag.replace(/\ssrc=(["'])[^"']*\1/, ` data-bundle-photo="${photos.indexOf(photo)}"`)
  })
  const photoUrls = await Promise.all(photos.map((photo) => (photo.startsWith('https:') || photo.startsWith('http:') ? download(photo) : dataUrl(photo))))
  const setPhotos = `<script>
{
  const photos = ${JSON.stringify(photoUrls)}
  for (const img of document.querySelectorAll('img[data-bundle-photo]')) img.src = photos[img.dataset.bundlePhoto]
}
</script>`
  html = html.replace(/<\/body>/, (end) => `${setPhotos}\n${end}`)

  // Lintje fetches each icon by its file name; here the fetch is answered from the bundle.
  const svgs = {}
  for (const icon of [...icons].sort()) {
    const file = fileFor(`/node_modules/lintje/dist-icons/${icon}.svg`)
    svgs[icon] = await readFile(file, 'utf8').catch(() => undefined)
  }
  const shim = `<script>
{
  const icons = ${script(JSON.stringify(svgs))}
  const fetchFile = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const name = /\\/dist-icons\\/([^/?]+)\\.svg/.exec(input instanceof Request ? input.url : String(input))?.[1]
    const svg = name && icons[decodeURIComponent(name)]
    return svg ? Promise.resolve(new Response(svg, { headers: { 'content-type': 'image/svg+xml' } })) : fetchFile(input, init)
  }
}
</script>`
  html = html.replace(/<head[^>]*>/, (head) => `${head}\n${shim}`)

  // What the bundle could not take in would fail over file:// without a word, so it is an error.
  const outside = [...html.matchAll(/<(?:link|script|img|source)\b[^>]*>/g)]
    .map(([tag]) => attribute(tag, 'href') ?? attribute(tag, 'src'))
    .filter((url) => url && !/^(data:|#)/.test(url))
  if (outside.length) throw new Error(`verwijst nog naar ${[...new Set(outside)].join(', ')}`)
  return html
}

// A module's imports, static and dynamic, as minified code writes them too: from"./x.js".
const IMPORT = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'])([./][^"'\s]*)\2/g

/**
 * The module's text with each import pointed at the bare name of its file, after putting
 * every module it reaches in `imports`. The entry's dynamic imports are followed only when
 * `dynamic` says the deck needs them (the chart).
 */
async function modules(source, file, imports, { dynamic = true } = {}) {
  const targets = new Map()
  for (const [, keyword, , specifier] of source.matchAll(IMPORT)) {
    if (!dynamic && keyword.includes('(')) continue
    const target = specifier.startsWith('/') ? fileFor(specifier) : resolve(dirname(file), specifier)
    const path = target && existsSync(target) ? urlFor(target) : null
    if (!path) continue
    const key = `bundle${path}`
    targets.set(specifier, key)
    if (key in imports) continue
    imports[key] = ''
    const text = await modules(await readFile(target, 'utf8'), target, imports)
    imports[key] = `data:text/javascript;base64,${Buffer.from(text).toString('base64')}`
  }
  return source.replace(IMPORT, (match, keyword, quote, specifier) =>
    targets.has(specifier) ? `${keyword}${quote}${targets.get(specifier)}${quote}` : match,
  )
}

// A stylesheet with its @imports in it and every url() as a data URL.
async function css(file) {
  let text = await readFile(file, 'utf8')
  text = await replace(text, /@import\s+url\((['"]?)([^'")]+)\1\)\s*;/g, (_, __, href) => css(locate(href, file)))
  return replace(text, /url\((['"]?)([^'")]+)\1\)/g, async (match, _, href) =>
    /^(data:|#|https?:)/.test(href) ? match : `url("${await dataUrl(locate(href, file))}")`,
  )
}

// A path from the root of the project (/…), served as lintje-slides serves it, or one beside the file.
function locate(href, from) {
  const path = href.split(/[?#]/)[0]
  const file = path.startsWith('/') ? fileFor(decodeURIComponent(path)) : resolve(dirname(from), decodeURIComponent(path))
  if (!file) throw new Error(`${href} staat buiten het project`)
  return file
}

async function dataUrl(file) {
  const type = types[extname(file)] ?? 'application/octet-stream'
  return `data:${type.split(';')[0]};base64,${(await readFile(file)).toString('base64')}`
}

// A photo from the web goes in too: the bundle opens without a network.
async function download(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} geeft ${response.status}`)
  const type = response.headers.get('content-type')?.split(';')[0] ?? 'application/octet-stream'
  return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`
}

// Script text inside the page: a closing tag in it would end the element early. In code it can
// only stand in a string, a template or a regular expression, where \\/ means /.
function script(source) {
  return source.replace(/<\/(script)/gi, '<\\/$1')
}

function attribute(tag, name) {
  return new RegExp(`\\s${name}=(["'])(.*?)\\1`).exec(tag)?.[2]
}

async function replace(text, pattern, replacer) {
  const parts = await Promise.all([...text.matchAll(pattern)].map((match) => replacer(...match)))
  let index = 0
  return text.replace(pattern, () => parts[index++])
}
