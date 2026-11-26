// A static server over the project the command runs in: module scripts do not load over file://.
// /node_modules/@lintje/slides/ and /node_modules/lintje/ always serve the copies this command was
// installed with, wherever npm put them, so a deck and its scripts load one Lintje.
import { createServer } from 'node:http'
import { readdir, readFile, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = process.cwd()
const own = fileURLToPath(new URL('..', import.meta.url))
const lintje = dirname(createRequire(import.meta.url).resolve('lintje/package.json'))
const mounts = [
  ['/node_modules/@lintje/slides/', own],
  ['/node_modules/lintje/', lintje],
  ['/', root],
]
export const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

/** The file a URL path serves, or null outside the mounts. */
export function fileFor(pathname) {
  const [prefix, base] = mounts.find(([prefix]) => pathname.startsWith(prefix))
  const file = resolve(base, `.${pathname.slice(prefix.length - 1)}`)
  return file === base || file.startsWith(base.endsWith(sep) ? base : base + sep) ? file : null
}

export function serve(port = Number(process.env.PORT ?? 5190)) {
  const server = createServer(async (request, response) => {
    let pathname = decodeURIComponent(new URL(request.url, 'http://x').pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = fileFor(pathname)
    try {
      if (!file) throw new Error('outside')
      const body = await readFile(file)
      response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
      response.end(body)
    } catch {
      response.writeHead(404).end('Niet gevonden')
    }
  })
  return new Promise((done, fail) => {
    server.once('error', fail)
    server.listen(port, '127.0.0.1', () => done(server))
  })
}

/** The URL path of a deck, from its path relative to the project. */
export function urlOf(deck) {
  return `/${deck.split(sep).map(encodeURIComponent).join('/')}`
}

const skip = new Set(['node_modules', 'out'])

async function walk(dir, found) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || skip.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) await walk(path, found)
    else if (entry.name.endsWith('.html') && (await readFile(path, 'utf8')).includes('class="slide"')) found.push(path)
  }
  return found
}

// A deck is a path, or the name of a deck in the project. Without one, every deck in the
// project: each .html file with a <section class="slide">, outside node_modules/ and out/.
export async function findDecks(names = []) {
  const all = async () => (await walk(root, [])).map((path) => relative(root, path)).sort()
  if (!names.length) {
    const decks = await all()
    if (!decks.length) fail('geen deck gevonden: geef het pad van een .html-bestand')
    return decks
  }
  let known
  const decks = []
  for (const name of names) {
    const path = resolve(root, name)
    if (await stat(path).then((s) => s.isFile(), () => false)) {
      if (relative(root, path).startsWith('..')) fail(`${name} staat buiten deze map; start lintje-slides in de map van het project`)
      decks.push(relative(root, path))
      continue
    }
    known ??= await all()
    const file = basename(name).replace(/(\.html)?$/, '.html')
    const deck = known.find((path) => basename(path) === file)
    if (!deck) fail(`${name} bestaat niet, en geen deck in deze map heet ${file}`)
    decks.push(deck)
  }
  return decks
}

function fail(message) {
  console.error(message)
  process.exit(1)
}
