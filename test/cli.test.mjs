// The command in a project of its own, as someone who installed the package runs it: which decks it
// finds, what check, pdf and bundle print and write, and when they refuse.
import assert from 'node:assert/strict'
import { cp, readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { request } from 'node:http'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { serve } from '../cli/server.mjs'
import { deck, project, repo, run, slide, words } from './helpers.mjs'

const list = (intro = 'Een zin.') => `<p data-field="intro">${intro}</p><ul data-field="points"><li>Een</li><li>Twee</li><li>Drie</li></ul>`
const GOOD = deck([slide('band-list', list()), slide('band-list', list())])
const FAULTY = deck([slide('band-list', list()), slide('band-list', list(words(25))), slide('band-lijst', '')])
const FINDINGS = ['  dia 2 (band-list): veld "intro": hoogstens 24 woorden, nu 25', '  dia 3 (band-lijst): onbekende indeling "band-lijst"']

// A chart of the wrong shape is a finding on its slide, and the only message: Lintje never throws.
describe('a chart of the wrong shape', () => {
  it('is a finding on its slide, without an error in the page', async () => {
    const chart = '<div data-field="chart"><lintje-chart><script type="application/json">{ "chart": { "kind": "grouped-bar", "labels": ["A"] } }</script></lintje-chart></div>'
    const folder = await project({ 'grafiek.html': deck([slide('band-list', list()), slide('band-chart', chart)]) })
    const { code, stdout, stderr } = await run(folder.dir, 'check')
    await folder.remove()
    assert.deepEqual([code, stdout.trimEnd().split('\n'), stderr], [1, ['grafiek.html: 1 melding', '  dia 2 (band-chart): veld "chart": grouped-bar heeft een lijst in "series"'], ''])
  })
})

describe('lintje-slides', () => {
  let folder
  before(async () => {
    folder = await project({
      'goed.html': GOOD,
      'map/ook goed.html': GOOD,
      'fout.html': FAULTY,
      // None of these is a deck of the project.
      'pagina.html': '<!doctype html><title>Een pagina</title><p>Geen dia.</p>',
      'out/oud.html': FAULTY,
      'node_modules/pakket/deck.html': FAULTY,
      '.verborgen/deck.html': FAULTY,
    })
  })
  after(() => folder.remove())

  const lines = (text) => text.trimEnd().split('\n')
  const cli = (...args) => run(folder.dir, ...args)

  describe('without a deck', () => {
    it('takes every deck of the project', async () => {
      const { code, stdout } = await cli('check')
      assert.deepEqual(lines(stdout), ['fout.html: 2 meldingen', ...FINDINGS, "goed.html: 2 dia's, in orde", "map/ook goed.html: 2 dia's, in orde"])
      assert.equal(code, 1)
    })
  })

  describe('with a deck', () => {
    it('takes a path', async () => {
      const { code, stdout } = await cli('check', 'map/ook goed.html')
      assert.deepEqual([code, lines(stdout)], [0, ["map/ook goed.html: 2 dia's, in orde"]])
    })

    it('takes the name of a deck in the project', async () => {
      const { code, stdout } = await cli('check', 'ook goed')
      assert.deepEqual([code, lines(stdout)], [0, ["map/ook goed.html: 2 dia's, in orde"]])
    })

    it('says so when there is none of that name', async () => {
      const { code, stderr } = await cli('check', 'weg')
      assert.deepEqual([code, lines(stderr)], [1, ['weg bestaat niet, en geen deck in deze map heet weg.html']])
    })

    it('says so when it stands outside the project', async () => {
      const { code, stderr } = await cli('check', join(repo, 'examples/begrijpelijke-brieven.html'))
      assert.equal(code, 1)
      assert.match(stderr, /staat buiten deze map; start lintje-slides in de map van het project/)
    })
  })

  describe('with a command it does not know', () => {
    it('shows how it works', async () => {
      const { code, stdout } = await cli('help')
      assert.equal(code, 0)
      assert.match(stdout, /^lintje-slides <opdracht> \[deck\.html …\]/)
    })

    it('fails on an unknown command', async () => {
      assert.equal((await cli('controleer')).code, 2)
    })

    it('fails on an option of another command', async () => {
      const { code, stderr } = await cli('pdf', '--images', 'goed')
      assert.equal(code, 2)
      assert.match(stderr, /^--images hoort niet bij pdf/)
    })
  })

  describe('check', () => {
    it('lists what does not fit and fails', async () => {
      const { code, stdout } = await cli('check', 'fout')
      assert.deepEqual([code, lines(stdout)], [1, ['fout.html: 2 meldingen', ...FINDINGS]])
    })

    it('writes an image per slide with --images', async () => {
      const { code, stdout } = await cli('check', '--images', 'goed')
      assert.deepEqual([code, lines(stdout)], [0, ["goed.html: 2 dia's, in orde", '  beelden in out/goed/']])
      assert.deepEqual((await readdir(join(folder.dir, 'out/goed'))).sort(), ['01.png', '02.png'])
    })

    it('keeps the dark images apart', async () => {
      await cli('check', '--images', '--dark', 'goed')
      assert.deepEqual((await readdir(join(folder.dir, 'out/goed-dark'))).sort(), ['01.png', '02.png'])
    })

    // A PNG says its width in bytes 16 to 20.
    const width = async (file) => (await readFile(join(folder.dir, file))).readUInt32BE(16)

    it('writes all slides in one image with --sheet, at twice the pixels', async () => {
      const { code, stdout } = await cli('check', '--sheet', 'goed')
      assert.deepEqual([code, lines(stdout)], [0, ["goed.html: 2 dia's, in orde", '  overzicht in out/goed-overzicht.png']])
      assert.equal(await width('out/goed-overzicht.png'), 2 * 1280)
    })

    it('keeps the dark sheet apart', async () => {
      const { code, stdout } = await cli('check', '--sheet', '--dark', 'goed')
      assert.deepEqual([code, lines(stdout)], [0, ["goed.html: 2 dia's, in orde", '  overzicht in out/goed-dark-overzicht.png']])
      assert.equal(await width('out/goed-dark-overzicht.png'), 2 * 1280)
    })

    it('writes the sheet next to the images, for a deck with findings too', async () => {
      const { code, stdout } = await cli('check', '--images', '--sheet', 'fout')
      assert.deepEqual([code, lines(stdout)], [1, ['fout.html: 2 meldingen', ...FINDINGS, '  beelden in out/fout/', '  overzicht in out/fout-overzicht.png']])
      assert.equal(existsSync(join(folder.dir, 'out/fout-overzicht.png')), true)
    })

    it('says so when a page does not load as a deck', { timeout: 30000 }, async () => {
      const page = await project({ 'los.html': '<!doctype html><title>Los</title><section class="slide"><h1>Titel</h1></section>' })
      const { code, stderr } = await run(page.dir, 'check')
      await page.remove()
      assert.deepEqual([code, lines(stderr)], [1, ['los.html: laadt niet als deck; staan de twee regels van @lintje/slides in de <head>?']])
    })
  })

  describe('pdf', () => {
    const pdf = (file) => readFile(join(folder.dir, file), 'latin1')
    const pages = async (file) => (await pdf(file)).match(/\/Type\s*\/Page\b(?!s)/g).length

    it('writes a page per slide', async () => {
      const { code, stdout } = await cli('pdf', 'goed')
      assert.deepEqual([code, lines(stdout)], [0, ['out/goed.pdf']])
      assert.equal(await pages('out/goed.pdf'), 2)
    })

    it('with pages of the size of a slide', async () => {
      const boxes = (await pdf('out/goed.pdf')).match(/\/MediaBox\s*\[[^\]]*\]/g)
      assert.deepEqual(boxes, ['/MediaBox [0 0 960 540]', '/MediaBox [0 0 960 540]'])
    })

    it('keeps the dark one apart', async () => {
      const { code, stdout } = await cli('pdf', '--dark', 'goed')
      assert.deepEqual([code, lines(stdout)], [0, ['out/goed-dark.pdf']])
      assert.equal(await pages('out/goed-dark.pdf'), 2)
    })

    it('writes nothing for a deck with findings', async () => {
      const { code, stdout } = await cli('pdf', 'fout')
      assert.deepEqual([code, lines(stdout)], [1, ['fout.html: geen pdf, eerst deze 2 meldingen oplossen', ...FINDINGS]])
      assert.equal(existsSync(join(folder.dir, 'out/fout.pdf')), false)
    })
  })

  describe('bundle', () => {
    it('writes nothing for a deck with findings', async () => {
      const { code, stdout } = await cli('bundle', 'fout')
      assert.deepEqual([code, lines(stdout)], [1, ['fout.html: geen bundel, eerst deze 2 meldingen oplossen', ...FINDINGS]])
      assert.equal(existsSync(join(folder.dir, 'out/fout.html')), false)
    })

    it('says which file of the deck it misses', async () => {
      await writeFile(join(folder.dir, 'mist.html'), GOOD.replace('</head>', '<link rel="stylesheet" href="eigen.css" /></head>'))
      const { code, stdout } = await cli('bundle', 'mist')
      assert.deepEqual([code, lines(stdout)], [1, ['mist.html: geen bundel, eigen.css bestaat niet']])
    })
  })
})

// The example holds every layout, the photos and a chart: the most a bundle has to carry.
describe('the bundle of the example deck', () => {
  let folder, browser, page
  const outside = []

  before(async () => {
    folder = await project({})
    await cp(join(repo, 'examples'), folder.dir, { recursive: true })
    const { code, stdout } = await run(folder.dir, 'bundle', 'begrijpelijke-brieven.html')
    assert.deepEqual([code, stdout], [0, 'out/begrijpelijke-brieven.html\n'])
    browser = await chromium.launch()
    const context = await browser.newContext({ offline: true, viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' })
    page = await context.newPage()
    page.on('request', (request) => /^(data|blob):/.test(request.url()) || outside.push(request.url()))
    await page.goto(pathToFileURL(join(folder.dir, 'out/begrijpelijke-brieven.html')).href)
    await page.waitForSelector('html[data-slides-ready]', { state: 'attached', timeout: 15000 })
  })
  after(async () => {
    await browser?.close()
    await folder.remove()
  })

  it('opens from the disk, without a server or a network', () => {
    assert.deepEqual(outside, [pathToFileURL(join(folder.dir, 'out/begrijpelijke-brieven.html')).href])
  })

  it('is the same deck, with nothing the check finds', async () => {
    assert.equal(await page.locator('.slide').count(), 33)
    assert.deepEqual(await page.evaluate(() => window.slidesCheck()), [])
  })

  it('shows its photos', async () => {
    const photos = await page.locator('img').evaluateAll((images) => images.map((img) => img.complete && img.naturalWidth > 0))
    assert.equal(photos.length > 0 && photos.every(Boolean), true)
  })

  it('draws its chart', async () => {
    const drawn = await page.locator('lintje-chart').evaluateAll((charts) => charts.map((chart) => Boolean(chart.shadowRoot?.querySelector('svg'))))
    assert.deepEqual(drawn, [true])
  })

  it('draws its icons and emblems', async () => {
    const svg = (host) => Boolean(host.shadowRoot?.querySelector('svg') ?? [...(host.shadowRoot?.querySelectorAll('*') ?? [])].some((child) => child.shadowRoot?.querySelector('svg')))
    await page.waitForFunction(`(${svg})(document.querySelector('.slides-nav__next'))`)
    await page.waitForFunction(`(${svg})(document.querySelector('.slide__logo'))`)
  })

  it('steps with the keys', async () => {
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(() => document.querySelectorAll('.slide')[1].classList.contains('is-current'))
  })
})

describe('the server', () => {
  let server
  before(async () => (server = await serve(0)))
  after(() => new Promise((done) => server.close(done)))

  // fetch tidies a path before it sends it; this sends it as written.
  const status = (path) =>
    new Promise((done, fail) => {
      request({ host: '127.0.0.1', port: server.address().port, path }, (response) => done(response.resume().statusCode)).on('error', fail).end()
    })

  it('serves the project, the package and its Lintje', async () => {
    assert.deepEqual(
      await Promise.all(['/package.json', '/node_modules/@lintje/slides/src/slides.js', '/node_modules/lintje/package.json'].map(status)),
      [200, 200, 200],
    )
  })

  // A slash written as %2f is no step in the URL, and becomes one once the path is decoded.
  it('serves nothing outside them', async () => {
    const up = '/..%2f'.repeat(repo.split('/').length)
    assert.equal(existsSync('/etc/hosts'), true)
    assert.deepEqual(await Promise.all([`${up}etc/hosts`, `/node_modules/lintje${up}etc/hosts`, '/weg.html'].map(status)), [404, 404, 404])
  })
})
