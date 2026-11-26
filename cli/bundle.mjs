// Writes each deck to out/<deck>.html: one file that opens with a double click, without a server
// or a network. The stylesheet, the fonts, the photos and the icons go in as text or data URLs;
// the deck's module script stays inline, and an import map hands it Lintje and the layouts as
// data URLs, so its imports stay as they are. Like the PDF, a deck with findings gets no bundle.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { eachDeck, printFindings } from './browser.mjs'
import { fileFor, root, types } from './server.mjs'

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
    await writeFile(file, await inline(resolve(root, deck), loaded))
    console.log(file)
    return true
  })
}

async function inline(deckFile, loaded) {
  let html = await readFile(deckFile, 'utf8')
  const icons = new Set(loaded.map((url) => /\/dist-icons\/([^/?]+)\.svg/.exec(url)?.[1]).filter(Boolean).map(decodeURIComponent))

  html = await replace(html, /<link\b[^>]*rel="stylesheet"[^>]*>/g, async (tag) => {
    const href = attribute(tag, 'href')
    return href ? `<style>\n${await css(locate(href, deckFile))}\n</style>` : tag
  })

  html = await replace(html, /<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, async (_, src) => {
    const scriptFile = locate(src, deckFile)
    const source = await readFile(scriptFile, 'utf8')
    for (const [, icon] of source.matchAll(/['"`]((?:functioneel|multimedia)-[a-z0-9-]+)['"`]/g)) icons.add(icon)
    for (const [, icon] of source.matchAll(/icon="((?:functioneel|multimedia)-[a-z0-9-]+)"/g)) icons.add(icon)
    const imports = {}
    for (const [, specifier] of source.matchAll(/^import\s[^'"]*['"]([^'"]+)['"]/gm)) {
      imports[specifier] = await dataUrl(locate(specifier, scriptFile))
    }
    return `<script type="importmap">${JSON.stringify({ imports })}</script>\n<script type="module">\n${script(source)}\n</script>`
  })

  // A photo goes in once, however often the deck shows it: a script sets each <img> from the
  // list before the deck's module runs.
  const photos = []
  html = html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = attribute(tag, 'src')
    if (!src || /^(data:|https?:)/.test(src)) return tag
    const file = locate(src, deckFile)
    if (!photos.includes(file)) photos.push(file)
    return tag.replace(/\bsrc="[^"]*"/, `data-bundle-photo="${photos.indexOf(file)}"`)
  })
  const photoUrls = await Promise.all(photos.map(dataUrl))
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
  const icons = ${JSON.stringify(svgs)}
  const fetchFile = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const name = /\\/dist-icons\\/([^/?]+)\\.svg/.exec(input instanceof Request ? input.url : String(input))?.[1]
    const svg = name && icons[decodeURIComponent(name)]
    return svg ? Promise.resolve(new Response(svg, { headers: { 'content-type': 'image/svg+xml' } })) : fetchFile(input, init)
  }
}
</script>`
  return html.replace(/<head[^>]*>/, (head) => `${head}\n${script(shim, false)}`)
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

// Script text inside the page: a closing tag in it would end the element early.
function script(source, escape = true) {
  return escape ? source.replaceAll('</script', '<\\/script') : source
}

function attribute(tag, name) {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1]
}

async function replace(text, pattern, replacer) {
  const parts = await Promise.all([...text.matchAll(pattern)].map((match) => replacer(...match)))
  let index = 0
  return text.replace(pattern, () => parts[index++])
}
