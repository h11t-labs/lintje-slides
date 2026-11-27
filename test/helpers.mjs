// What the tests share: a deck written as a string, a browser that opens it from the server of the
// command, and a project in a temporary folder to run the command in, as a user's project does.
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { serve } from '../cli/server.mjs'

export const repo = fileURLToPath(new URL('..', import.meta.url))
const bin = join(repo, 'bin/lintje-slides.mjs')

/** A 1 × 1 PNG: a photo that loads without a file. */
export const PHOTO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

/** The page of a deck around its slides. */
export function deck(slides, { title = 'Proefdeck', body = '' } = {}) {
  return `<!doctype html>
<html lang="nl" data-theme="rijksoverheid" data-style-version="new" data-mode="light">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <link rel="stylesheet" href="/node_modules/@lintje/slides/src/slides.css" />
    <script type="module" src="/node_modules/@lintje/slides/src/slides.js"></script>
  </head>
  <body ${body}>
    ${[slides].flat().join('\n')}
  </body>
</html>`
}

/** A slide of one layout; without a title of its own it gets a short one. */
export function slide(layout, content, attributes = '') {
  const title = /<h1[\s>]/.test(content) ? '' : '<h1>Titel</h1>'
  return `<section class="slide" data-layout="${layout}" ${attributes}>${title}${content}</section>`
}

/** `count` words, for a text of a known length. */
export function words(count) {
  return Array.from({ length: count }, () => 'woord').join(' ')
}

/**
 * A browser and the server, for decks that exist only as a string: `open(html)` gives the page once
 * the deck has checked itself. `close()` ends both, or the test run never ends.
 */
export async function stage() {
  const server = await serve(0)
  const browser = await chromium.launch()
  const origin = `http://127.0.0.1:${server.address().port}`
  let number = 0
  return {
    origin,
    browser,
    async open(html, { query = '', hash = '', context, path = `/proef-${++number}.html` } = {}) {
      const page = await (context ?? browser).newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' })
      await (context ?? page).route(`${origin}${path}*`, (route) => route.fulfill({ contentType: 'text/html; charset=utf-8', body: html }))
      page.setDefaultTimeout(5000)
      await page.goto(`${origin}${path}${query}${hash}`)
      await page.waitForSelector('html[data-slides-ready]', { state: 'attached' })
      return page
    },
    async close() {
      await browser.close()
      await new Promise((done) => server.close(done))
    },
  }
}

/** The messages of the check, as the command prints them: one line per finding. */
export async function findings(page) {
  return (await page.evaluate(() => window.slidesCheck())).map(({ slide, message }) => `dia ${slide}: ${message}`)
}

/** A project in a temporary folder with these files; `remove()` takes it away. */
export async function project(files) {
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'lintje-slides-')))
  for (const [name, content] of Object.entries(files)) {
    await mkdir(dirname(join(dir, name)), { recursive: true })
    await writeFile(join(dir, name), content)
  }
  return { dir, remove: () => rm(dir, { recursive: true, force: true }) }
}

/** Runs `lintje-slides <args>` in a folder: the exit code and what it printed. */
export function run(cwd, ...args) {
  return node(cwd, bin, ...args)
}

/** Runs a script with Node in a folder. */
export function node(cwd, script, ...args) {
  return new Promise((done) => {
    execFile(process.execPath, [script, ...args], { cwd, env: { ...process.env, ...IDENTITY } }, (error, stdout, stderr) =>
      done({ code: error ? (error.code ?? 1) : 0, stdout, stderr }),
    )
  })
}

// A commit needs a name, and a runner has none.
export const IDENTITY = {
  GIT_AUTHOR_NAME: 'lintje-slides test',
  GIT_AUTHOR_EMAIL: 'test@example.invalid',
  GIT_COMMITTER_NAME: 'lintje-slides test',
  GIT_COMMITTER_EMAIL: 'test@example.invalid',
  // Nor the settings of whoever runs the tests: signing, hooks, a template.
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
}
