// Turns a page of <section class="slide" data-layout="…"> into a deck. Only the Lintje tags a
// deck draws load, each from its own file, so a bundle carries no more than that.
import { setIconSource } from '/node_modules/lintje/dist-elements/core.js'
import '/node_modules/lintje/dist-elements/tag/announcement.js'
import '/node_modules/lintje/dist-elements/tag/dialog.js'
import '/node_modules/lintje/dist-elements/tag/icon-button.js'
import '/node_modules/lintje/dist-elements/tag/key.js'
import '/node_modules/lintje/dist-elements/tag/logo.js'
import { LAYOUTS } from './layouts.js'

setIconSource({ base: new URL('/node_modules/lintje/dist-icons/', location.href).href })
// A chart is the one Lintje tag a slide holds itself, and the largest: it loads only when there is one.
if (document.querySelector('lintje-chart')) await import('/node_modules/lintje/dist-elements/tag/chart.js')

const params = new URLSearchParams(location.search)
if (params.get('mode') === 'dark' || params.get('mode') === 'light') document.documentElement.dataset.mode = params.get('mode')
if (params.has('theme')) document.documentElement.dataset.theme = params.get('theme')

const slides = [...document.querySelectorAll('.slide')]
const deck = document.title
// The chapter each slide stands in, as its footer says it; the speaker's view names it too.
const chapters = []
const organisations = {
  rijksoverheid: 'Rijksoverheid',
  marechaussee: 'Koninklijke Marechaussee',
  defensie: 'Ministerie van Defensie',
  landmacht: 'Koninklijke Landmacht',
  marine: 'Koninklijke Marine',
  luchtmacht: 'Koninklijke Luchtmacht',
}

// --- Building ----------------------------------------------------------------------------------

function build() {
  const theme = document.documentElement.dataset.theme ?? 'rijksoverheid'
  const emblem = document.body.dataset.emblem ?? `embleem-${theme}`
  const organisation = document.body.dataset.organisation ?? organisations[theme] ?? ''
  const date = document.body.dataset.date ?? ''
  let chapter = ''
  slides.forEach((slide, index) => {
    const layout = LAYOUTS[slide.dataset.layout]
    if (slide.dataset.chapter !== undefined) chapter = slide.dataset.chapter
    chapters[index] = chapter
    for (const img of slide.querySelectorAll('img[data-focus]')) {
      const [x, y] = img.dataset.focus.split(/\s+/)
      img.style.objectPosition = `${x}% ${y ?? 50}%`
    }
    // A table's column of figures aligns right: every body cell in it is a number.
    for (const table of slide.querySelectorAll('[data-field] table')) markFigures(table)
    // The slide's number, shown only in the overview; the tile's label already says it aloud.
    const number = document.createElement('span')
    number.className = 'slide__number'
    number.setAttribute('aria-hidden', 'true')
    number.textContent = String(index + 1)
    slide.append(number)
    if (!layout) return
    if (layout.logo) {
      const logo = document.createElement('lintje-logo')
      logo.className = 'slide__logo'
      logo.setAttribute('name', emblem)
      logo.setAttribute('alt', organisation)
      logo.setAttribute('width', '48')
      logo.toggleAttribute('open', true)
      slide.append(logo)
    }
    if (layout.footer !== false) {
      const foot = document.createElement('footer')
      foot.className = 'slide__footer'
      const left = document.createElement('span')
      left.textContent = [deck, chapter].filter(Boolean).join(' · ')
      const right = document.createElement('span')
      right.textContent = [date, String(index + 1)].filter(Boolean).join(' · ')
      foot.append(left, right)
      slide.append(foot)
    }
  })
}

function markFigures(table) {
  const rows = [...table.rows]
  const body = [...table.tBodies].flatMap((tbody) => [...tbody.rows])
  const columns = Math.max(...rows.map((row) => row.cells.length))
  for (let column = 0; column < columns; column++) {
    const cells = body.map((row) => row.cells[column]).filter(Boolean)
    if (!cells.length || !cells.every((cell) => /^[−\-+€$%\d.,\s]+$/.test(cell.textContent.trim()))) continue
    for (const row of rows) row.cells[column]?.setAttribute('data-numeric', '')
  }
}

// --- Checking ----------------------------------------------------------------------------------

const TEXT_TAGS = new Set(['P', 'UL', 'OL', 'LI', 'H3', 'H4', 'STRONG', 'EM', 'B', 'I', 'BR', 'A', 'MARK', 'SPAN', 'BLOCKQUOTE'])

function words(element) {
  return element.textContent.trim().split(/\s+/).filter(Boolean).length
}

function checkField(name, field, element, report) {
  const where = `veld "${name}"`
  const lists = element.matches('ul, ol') ? [element] : [...element.querySelectorAll(':scope > ul, :scope > ol')]
  if (field.kind === 'photo') {
    if (!element.matches('img')) report(`${where} is een <img>`)
    else checkImage(element, where, report)
  } else if (field.kind === 'photos') {
    const images = [...element.querySelectorAll('img')]
    if (images.length !== field.count) report(`${where} heeft ${field.count} foto's, nu ${images.length}`)
    images.forEach((img) => checkImage(img, where, report))
  } else if (field.kind === 'chart') {
    if (!element.querySelector('lintje-chart') && !element.matches('lintje-chart')) report(`${where} is een <lintje-chart>`)
  } else if (field.kind === 'table') {
    const table = element.matches('table') ? element : element.querySelector('table')
    if (!table) report(`${where} is een <table>`)
    else {
      if (!table.querySelector('caption')?.textContent.trim()) report(`${where}: de tabel heeft een <caption>`)
      const rows = table.querySelectorAll('tbody tr').length
      if (field.items && rows > field.items[1]) report(`${where}: hoogstens ${field.items[1]} rijen, nu ${rows}`)
    }
  } else {
    for (const node of element.querySelectorAll('*')) {
      if (!TEXT_TAGS.has(node.tagName)) report(`${where}: <${node.tagName.toLowerCase()}> hoort niet in tekst`)
    }
    if (field.items) {
      const count = lists.reduce((sum, list) => sum + list.children.length, 0)
      const [min, max] = field.items
      if (count < min || count > max) {
        report(min === max ? `${where} heeft ${min} punten, nu ${count}` : `${where} heeft ${min} tot ${max} punten, nu ${count}`)
      }
    }
  }
}

function checkImage(img, where, report) {
  if (!img.getAttribute('alt')?.trim()) report(`${where}: de foto heeft een alt-tekst`)
  if (img.complete && img.naturalWidth === 0) report(`${where}: de foto ${img.getAttribute('src')} laadt niet`)
}

// An element that holds more than its box shows it in its scroll size. A tight line height lets
// the glyphs stand a little outside their lines, so a part of the font size is allowed.
function overflows(element) {
  const style = getComputedStyle(element)
  if (style.clipPath !== 'none') return false
  const slack = Math.max(2, Number.parseFloat(style.fontSize) * 0.15)
  return element.scrollHeight > element.clientHeight + slack || element.scrollWidth > element.clientWidth + slack
}

function checkSlide(slide) {
  const findings = []
  const report = (message, ...elements) => findings.push({ message, elements: elements.filter(Boolean) })
  const name = slide.dataset.layout
  const layout = LAYOUTS[name]
  if (!layout) {
    report(name ? `onbekende indeling "${name}"` : 'de dia heeft geen data-layout')
    return findings
  }
  const titles = slide.querySelectorAll(':scope > h1')
  if (titles.length !== 1) report('de dia heeft precies één <h1> als titel')
  else if (!titles[0].textContent.trim()) report('de titel is leeg')

  // One cause, one finding: what the words, the box and the points of a field say comes together.
  const fits = new Map()
  const fit = (owner) => {
    if (!fits.has(owner)) fits.set(owner, { tight: false, tightPoints: [], off: false, offPoints: [] })
    return fits.get(owner)
  }
  const limit = (owner, max) => {
    if (max && words(owner) > max) fit(owner).words = [words(owner), max]
  }
  if (titles.length === 1) limit(titles[0], layout.titleWords ?? 16)

  const seen = new Set()
  for (const child of slide.children) {
    if (child.matches('h1, aside[data-notes], .slide__footer, .slide__logo, .slide__findings, .slide__number')) continue
    const field = child.dataset.field
    if (field === undefined) report(`<${child.tagName.toLowerCase()}> zonder data-field: alles op een dia staat in een veld`, child)
    else if (!layout.fields[field]) report(`"${field}" is geen veld van ${name}; wel: ${Object.keys(layout.fields).join(', ')}`, child)
    else if (seen.has(field)) report(`veld "${field}" staat er twee keer`, child)
    else seen.add(field)
  }
  for (const [field, spec] of Object.entries(layout.fields)) {
    const element = slide.querySelector(`:scope > [data-field="${field}"]`)
    if (!element) {
      if (spec.required) report(`veld "${field}" ontbreekt`)
      continue
    }
    checkField(field, spec, element, (message) => report(message, element))
    limit(element, spec.words)
  }
  // Styling belongs to the layout: a style or class in the content is a way around it.
  for (const node of slide.querySelectorAll('[style], [class]')) {
    if (node.closest('lintje-chart, aside[data-notes], .slide__footer, .slide__logo, .slide__findings, .slide__number') || node === slide) continue
    if (node.hasAttribute('class')) report(`<${node.tagName.toLowerCase()} class>: de opmaak komt uit de indeling`, node)
    if (node.hasAttribute('style') && !node.matches('img[data-focus]')) report(`<${node.tagName.toLowerCase()} style>: de opmaak komt uit de indeling`, node)
  }
  // What does not fit: a box that overflows, or a field past the frame.
  const wasCurrent = slide.classList.contains('is-current')
  slide.classList.add('is-current')
  const frame = slide.getBoundingClientRect()
  const scale = frame.width / 1280
  const bottom = frame.top + (layout.footer === false ? 720 : 672) * scale
  for (const element of slide.querySelectorAll(':scope > h1, :scope > [data-field], [data-field] li, [data-field] figure')) {
    const field = element.closest('[data-field]')?.dataset.field
    if (field && !layout.fields[field]) continue
    const box = element.getBoundingClientRect()
    const owner = element.matches('h1, [data-field]') ? element : element.closest('[data-field]')
    const state = fit(owner)
    if (overflows(element) || box.right > frame.right - 24 * scale + 1) {
      if (element === owner) state.tight = true
      else state.tightPoints.push(element)
    }
    // A field that fits its own box but stands past the frame was pushed there by the text above it.
    else if (box.bottom > bottom + 1) {
      if (element === owner) state.off = true
      else state.offPoints.push(element)
    }
  }
  const pushed = []
  let long = null
  for (const [owner, state] of fits) {
    const title = owner.matches('h1')
    const label = title ? 'de titel' : `veld "${owner.dataset.field}"`
    const points = (list, one, more) =>
      list.length === 1 ? `een punt in "${owner.dataset.field}" ${one}` : `${list.length} punten in "${owner.dataset.field}" ${more}`
    const count = state.words ? `${state.words[0]} woorden, hoogstens ${state.words[1]}` : ''
    if (state.tight || (state.words && state.tightPoints.length)) {
      report(`${label} past niet${count && ` (${count})`}: maak de tekst korter`, owner, ...state.tightPoints)
    } else if (state.tightPoints.length) {
      report(`${points(state.tightPoints, 'past', 'passen')} niet: maak de tekst korter`, ...state.tightPoints)
    } else {
      if (state.words && title) long = { message: `de titel heeft hoogstens ${state.words[1]} woorden, nu ${state.words[0]}`, owner }
      else if (state.words) report(`${label}: hoogstens ${state.words[1]} woorden, nu ${state.words[0]}`, owner)
      if (state.off && owner === long?.owner) continue
      if (state.off) pushed.push({ name: label, elements: [owner] })
      else if (state.offPoints.length) pushed.push({ name: points(state.offPoints, '', '').trim(), elements: state.offPoints, many: state.offPoints.length > 1 })
    }
  }
  // Everything past the frame was pushed there by the same text above it: a title past its words
  // is that text.
  const tail = long ? '' : ': de titel of de tekst erboven is te lang'
  if (long && !pushed.length) report(long.message, long.owner)
  if (pushed.length) {
    const names = pushed.map(({ name }) => name)
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} en ${names.at(-1)}` : names[0]
    const verb = pushed.length > 1 || pushed[0].many ? 'vallen' : 'valt'
    report(`${long ? `${long.message}: ` : ''}${list} ${verb} van de dia${tail}`, long?.owner, ...pushed.flatMap(({ elements }) => elements))
  }
  if (!wasCurrent) slide.classList.remove('is-current')
  return findings
}

/** Every finding in the deck, for scripts/check.mjs and the console. */
export function check() {
  return slides.flatMap((slide, index) =>
    checkSlide(slide).map(({ message, elements }) => ({ slide: index + 1, layout: slide.dataset.layout ?? '', message, elements })),
  )
}

function showFindings(findings) {
  for (const old of document.querySelectorAll('.slide__findings')) old.remove()
  for (const old of document.querySelectorAll('.is-error')) old.classList.remove('is-error')
  for (const { slide, message, elements } of findings) {
    for (const element of elements) element.classList.add('is-error')
    const host = slides[slide - 1]
    let list = host.querySelector('.slide__findings')
    if (!list) {
      list = document.createElement('div')
      list.className = 'slide__findings'
      host.append(list)
    }
    const note = document.createElement('lintje-announcement')
    note.data = { kind: 'error', text: message, dismissible: false }
    list.append(note)
  }
}

// --- Presenting --------------------------------------------------------------------------------

const width = 1280
const height = 720

// The slide number lives in the URL (#3), so a reload or a link lands on the same slide.
function current() {
  const number = Number.parseInt(location.hash.slice(1), 10)
  return Number.isInteger(number) ? Math.min(Math.max(number, 1), slides.length) : 1
}

const nav = document.createElement('nav')
nav.className = 'slides-nav'
nav.setAttribute('aria-label', "Dia's")
nav.innerHTML = `
  <lintje-icon-button variant="flat" class="slides-nav__previous" icon="functioneel-delta-naar-links" label="Vorige dia"></lintje-icon-button>
  <span class="slides-nav__count" aria-live="polite"></span>
  <lintje-icon-button variant="flat" class="slides-nav__next" icon="functioneel-delta-naar-rechts" label="Volgende dia"></lintje-icon-button>
  <lintje-icon-button variant="flat" class="slides-nav__mode" icon="functioneel-darkmode" label="Donker"></lintje-icon-button>
  <lintje-icon-button variant="flat" class="slides-nav__overview" icon="functioneel-tegelweergave" label="Alle dia's"></lintje-icon-button>
  <lintje-icon-button variant="flat" class="slides-nav__speaker" icon="activiteiten-presentatie-voor-groep" label="Sprekersweergave"></lintje-icon-button>
  <lintje-icon-button variant="flat" class="slides-nav__fullscreen" icon="multimedia-player-full-screen" label="Volledig scherm"></lintje-icon-button>
  <lintje-icon-button variant="flat" class="slides-nav__help" icon="functioneel-vraagteken" label="Sneltoetsen"></lintje-icon-button>`
document.body.append(nav)

// The keys, for the help window; the keydown handler below does what they say.
const shortcuts = [
  [['→', '↓', 'PgDn', 'Spatie'], 'Volgende dia'],
  [['←', '↑', 'PgUp', 'Shift Spatie'], 'Vorige dia'],
  [['Home', 'End'], 'Eerste of laatste dia'],
  [['O'], "Alle dia's; Escape sluit het overzicht"],
  [['F'], 'Volledig scherm'],
  [['D'], 'Licht of donker'],
  [['S'], 'Sprekersweergave in een tweede venster'],
  [['?'], 'Deze sneltoetsen'],
]
const helpDialog = document.createElement('lintje-dialog')
helpDialog.setAttribute('heading', 'Sneltoetsen')
helpDialog.toggleAttribute('wide', true)
helpDialog.innerHTML = `<dl class="slides-keys">${shortcuts
  .map(([keys, what]) => `<div class="slides-keys__row"><dt class="slides-keys__keys">${keys.map((key) => `<lintje-key>${key}</lintje-key>`).join(' ')}</dt><dd class="slides-keys__what">${what}</dd></div>`)
  .join('')}</dl>`
helpDialog.addEventListener('lintje-close', () => (helpDialog.open = false))
document.body.append(helpDialog)

const blockedDialog = document.createElement('lintje-dialog')
blockedDialog.setAttribute('heading', 'Tweede venster tegengehouden')
blockedDialog.innerHTML = '<p>De browser hield de sprekersweergave tegen. Sta pop-ups toe voor deze pagina en druk weer op S.</p>'
blockedDialog.addEventListener('lintje-close', () => (blockedDialog.open = false))
document.body.append(blockedDialog)

function help() {
  helpDialog.open = true
}

const count = nav.querySelector('.slides-nav__count')
const previous = nav.querySelector('.slides-nav__previous')
const next = nav.querySelector('.slides-nav__next')
const overviewButton = nav.querySelector('.slides-nav__overview')
const fullscreenButton = nav.querySelector('.slides-nav__fullscreen')
const modeButton = nav.querySelector('.slides-nav__mode')
const speakerButton = nav.querySelector('.slides-nav__speaker')
const helpButton = nav.querySelector('.slides-nav__help')
const root = document.documentElement

function show(number) {
  slides.forEach((slide, index) => {
    slide.classList.toggle('is-current', index === number - 1)
    slide.classList.toggle('is-next', index === number)
  })
  count.textContent = `${number} / ${slides.length}`
  previous.disabled = number === 1
  next.disabled = number === slides.length
  const title = slides[number - 1]?.querySelector(':scope > h1')?.textContent.trim()
  document.title = `${presenting ? 'Spreker: ' : ''}${title ?? deck} (${number}/${slides.length})`
  if (presenting) speak(number)
}

function go(number) {
  const target = Math.min(Math.max(number, 1), slides.length)
  if (target !== current()) location.hash = String(target)
}

function scale() {
  const factor = Math.min(innerWidth / width, innerHeight / height)
  const style = document.documentElement.style
  style.setProperty('--slide-scale', String(factor))
  // The controls stand in the margin under the slide when it holds them, else in the footer's band.
  const margin = (innerHeight - height * factor) / 2
  style.setProperty('--slides-nav-bottom', `${margin >= 44 ? (margin - 42) / 2 : margin + 3 * factor}px`)
}

function fullscreen() {
  return document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen()
}

// Light or dark lives in the URL (?mode=dark) like the slide number, so a link keeps it.
function mode(dark = root.dataset.mode !== 'dark', { quiet = false } = {}) {
  root.dataset.mode = dark ? 'dark' : 'light'
  modeButton.pressed = dark
  const url = new URL(location.href)
  url.searchParams.set('mode', dark ? 'dark' : 'light')
  history.replaceState(null, '', url)
  if (!quiet) tell()
}

// --- The speaker's view ------------------------------------------------------------------------

// `?presenter` is the same deck in a second window: the slide now, the next one, the notes and the
// time. The two windows keep each other on the same slide and mode. A BroadcastChannel reaches the
// other window after either reloads; postMessage between opener and popup also works over file://,
// where a channel may not.
const presenting = params.has('presenter')
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(`lintje-slides ${location.pathname}`) : null
let speakerWindow = null

function peers() {
  return [window.opener, speakerWindow].filter((peer) => peer && !peer.closed)
}

// Each message comes twice, by channel and by postMessage, and two quick steps can cross: a window
// follows only a message newer than the last it sent or followed, and does not pass it on.
let latest = 0
let following = null

function tell() {
  latest = Math.max(Date.now(), latest + 1)
  const message = { lintjeSlides: 1, at: latest, slide: current(), dark: root.dataset.mode === 'dark' }
  channel?.postMessage(message)
  for (const peer of peers()) peer.postMessage(message, '*')
}

function heard(message) {
  if (message?.lintjeSlides !== 1 || !(message.at > latest)) return
  latest = message.at
  if (message.dark !== (root.dataset.mode === 'dark')) mode(message.dark, { quiet: true })
  if (message.slide !== current()) following = message.slide
  go(message.slide)
}

channel?.addEventListener('message', (event) => heard(event.data))
addEventListener('message', (event) => {
  if (!event.source || event.source === window || event.data?.lintjeSlides !== 1) return
  // Over file:// a reloaded deck has lost its speaker window; the window that writes to it is that.
  if (!presenting && event.source !== window.opener) speakerWindow = event.source
  heard(event.data)
})

function openSpeaker() {
  if (presenting) return
  const url = new URL(location.href)
  url.searchParams.set('presenter', '')
  // Find the speaker window by name first: opening its URL again would reload it and reset the time.
  speakerWindow = open('', `lintje-slides ${location.pathname}`, 'popup,width=1280,height=800')
  if (!speakerWindow) {
    blockedDialog.open = true
    return
  }
  try {
    if (speakerWindow.location.href === 'about:blank') speakerWindow.location.href = url.href
  } catch {
    // An existing window over file:// is another origin; it is already the speaker's view.
  }
  speakerWindow.focus()
}

let speaker
if (presenting) {
  root.classList.add('slides-speaking')
  speaker = document.createElement('div')
  speaker.className = 'slides-presenter'
  speaker.innerHTML = `
    <div class="slides-presenter__bar">
      <div class="slides-presenter__deck">
        <h1 class="slides-presenter__title"></h1>
        <p class="slides-presenter__position" aria-live="polite"></p>
      </div>
      <div class="slides-presenter__times">
        <p class="slides-presenter__label slides-presenter__label--duration">
          Duur
          <button class="slides-presenter__reset" type="button" aria-label="Reset: de duur opnieuw laten beginnen">Reset</button>
        </p>
        <p class="slides-presenter__elapsed"></p>
        <p class="slides-presenter__label">Tijd</p>
        <p class="slides-presenter__clock"></p>
      </div>
      <div class="slides-presenter__controls">
        <lintje-button class="slides-presenter__previous" variant="secondary" icon="functioneel-delta-naar-links">Vorige</lintje-button>
        <lintje-button class="slides-presenter__forward" variant="primary" icon-right="functioneel-delta-naar-rechts">Volgende</lintje-button>
        <lintje-button class="slides-presenter__close" variant="secondary" size="compact" icon="functioneel-kruis">Sluiten</lintje-button>
      </div>
    </div>
    <section class="slides-presenter__now" aria-label="Huidige dia">
      <p class="slides-presenter__label">Nu</p>
      <div class="slides-presenter__frame"></div>
    </section>
    <section class="slides-presenter__next" aria-label="Volgende dia">
      <div class="slides-presenter__frame"><p class="slides-presenter__end">Einde van de presentatie</p></div>
      <div class="slides-presenter__upcoming">
        <p class="slides-presenter__label">Volgende</p>
        <p class="slides-presenter__upcoming-title"></p>
      </div>
    </section>
    <section class="slides-presenter__notes" aria-label="Notities">
      <p class="slides-presenter__label">Notities</p>
      <div class="slides-presenter__text"></div>
    </section>`
  speaker.querySelector('.slides-presenter__title').textContent = deck
  document.body.prepend(speaker)
  // The view's own buttons page and close; the icons for the rest stand between them.
  speaker.querySelector('.slides-presenter__close').before(nav)
  speaker.querySelector('.slides-presenter__previous').addEventListener('click', () => go(current() - 1))
  speaker.querySelector('.slides-presenter__forward').addEventListener('click', () => go(current() + 1))
  speaker.querySelector('.slides-presenter__close').addEventListener('click', () => {
    close()
    // A window the speaker opened by its address cannot close itself: it becomes the deck again.
    const url = new URL(location.href)
    url.searchParams.delete('presenter')
    setTimeout(() => location.replace(url), 150)
  })
  let start = Date.now()
  const clock = speaker.querySelector('.slides-presenter__clock')
  const elapsed = speaker.querySelector('.slides-presenter__elapsed')
  const tick = () => {
    const seconds = Math.floor((Date.now() - start) / 1000)
    const pad = (n) => String(n).padStart(2, '0')
    clock.textContent = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    elapsed.textContent = `${Math.floor(seconds / 3600)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`
  }
  speaker.querySelector('.slides-presenter__reset').addEventListener('click', () => {
    start = Date.now()
    tick()
  })
  tick()
  setInterval(tick, 1000)
  new ResizeObserver(() => place()).observe(speaker)
}

// Each slide stands at the top of its frame, scaled to fit it; the next one is a preview, out of
// reach.
function place() {
  if (overviewOpen()) return
  const [nowFrame, nextFrame] = speaker.querySelectorAll('.slides-presenter__frame')
  slides.forEach((slide, index) => {
    const frame = slide.classList.contains('is-current') ? nowFrame : slide.classList.contains('is-next') ? nextFrame : null
    slide.inert = frame === nextFrame
    if (!frame) return slide.style.removeProperty('transform')
    const box = frame.getBoundingClientRect()
    const factor = Math.min(box.width / width, box.height / height)
    const x = box.left + (box.width - width * factor) / 2
    const y = box.top
    slide.style.transform = `translate(${x}px, ${y}px) scale(${factor})`
  })
  // The slide stands over its frame but elsewhere in the page; a screen reader finds it in the frame.
  const now = slides.find((slide) => slide.classList.contains('is-current'))
  now.id ||= `slide-${slides.indexOf(now) + 1}`
  nowFrame.setAttribute('aria-owns', now.id)
  const nextTitle = slides.find((slide) => slide.classList.contains('is-next'))?.querySelector(':scope > h1')?.textContent.trim()
  nextFrame.closest('section').setAttribute('aria-label', nextTitle ? `Volgende dia: ${nextTitle}` : 'Volgende dia')
  speaker.querySelector('.slides-presenter__upcoming-title').textContent = nextTitle ?? ''
}

function speak(number) {
  const notes = slides[number - 1]?.querySelector(':scope > aside[data-notes]')
  const box = speaker.querySelector('.slides-presenter__text')
  if (notes?.textContent.trim()) box.replaceChildren(...notes.cloneNode(true).childNodes)
  else box.innerHTML = '<p class="slides-presenter__empty">Geen notities bij deze dia.</p>'
  speaker.querySelector('.slides-presenter__end').hidden = number < slides.length
  speaker.querySelector('.slides-presenter__upcoming').hidden = number === slides.length
  speaker.querySelector('.slides-presenter__position').textContent = [`Dia ${number} van ${slides.length}`, chapters[number - 1]].filter(Boolean).join(' · ')
  speaker.querySelector('.slides-presenter__previous').disabled = number === 1
  speaker.querySelector('.slides-presenter__forward').disabled = number === slides.length
  place()
}

function fullscreenChanged() {
  const on = Boolean(document.fullscreenElement)
  fullscreenButton.icon = on ? 'multimedia-player-full-screen-uitgaan' : 'multimedia-player-full-screen'
  fullscreenButton.label = on ? 'Volledig scherm verlaten' : 'Volledig scherm'
}

// The overview lays every slide out small, in a grid: pick one to go there. The slides are the
// same elements, zoomed, so a chart or a photo looks as it does on the slide.
function overviewOpen() {
  return root.classList.contains('slides-overview')
}

function overviewSize() {
  const columns = innerWidth >= 1100 ? 4 : innerWidth >= 700 ? 3 : 2
  const room = root.clientWidth - 2 * 40 - (columns - 1) * 32
  root.style.setProperty('--slide-overview-columns', String(columns))
  root.style.setProperty('--slide-overview-zoom', String(room / columns / width))
  return columns
}

function overview(open = !overviewOpen()) {
  root.classList.toggle('slides-overview', open)
  // In the speaker's view the overview takes the window, with the controls at the bottom as usual.
  if (presenting) {
    speaker.hidden = open
    if (open) document.body.append(nav)
    else speaker.querySelector('.slides-presenter__close').before(nav)
    for (const slide of slides) {
      slide.inert = false
      slide.style.removeProperty('transform')
    }
    for (const frame of speaker.querySelectorAll('.slides-presenter__frame')) frame.removeAttribute('aria-owns')
  }
  overviewButton.icon = open ? 'functioneel-kruis' : 'functioneel-tegelweergave'
  overviewButton.label = open ? 'Overzicht sluiten' : "Alle dia's"
  slides.forEach((slide, index) => {
    const title = slide.querySelector(':scope > h1')?.textContent.trim()
    for (const child of slide.children) child.inert = open
    if (open) {
      slide.tabIndex = 0
      slide.setAttribute('role', 'button')
      slide.setAttribute('aria-label', `Dia ${index + 1}${title ? `: ${title}` : ''}`)
    } else {
      for (const name of ['tabindex', 'role', 'aria-label']) slide.removeAttribute(name)
    }
  })
  if (open) {
    overviewSize()
    wake()
    const slide = slides[current() - 1]
    slide.focus({ preventScroll: true })
    slide.scrollIntoView({ block: 'center' })
  } else {
    scrollTo(0, 0)
    if (presenting) {
      place()
      // The focused slide is no longer a button and the controls moved back into the bar.
      // lintje-icon-button does not pass focus() on to its button.
      overviewButton.shadowRoot?.querySelector('button')?.focus()
    }
  }
}

function choose(slide) {
  overview(false)
  go(slides.indexOf(slide) + 1)
}

for (const slide of slides) {
  slide.addEventListener('click', () => overviewOpen() && choose(slide))
}

// Only a change tells the other window: a window that just loaded must not pull the others back.
addEventListener('hashchange', () => {
  show(current())
  if (following === current()) following = null
  else tell()
})
addEventListener('resize', () => {
  scale()
  if (overviewOpen()) overviewSize()
})
addEventListener('fullscreenchange', fullscreenChanged)
overviewButton.addEventListener('click', () => overview())
modeButton.addEventListener('click', () => mode())
modeButton.pressed = root.dataset.mode === 'dark'
previous.addEventListener('click', () => go(current() - 1))
next.addEventListener('click', () => go(current() + 1))
fullscreenButton.addEventListener('click', fullscreen)
speakerButton.addEventListener('click', openSpeaker)
helpButton.addEventListener('click', help)

addEventListener('keydown', (event) => {
  // A key a Lintje element already handled (a chart's marks) or one typed into a field stays there.
  const target = event.composedPath()[0]
  const typing = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  // The dialog has already closed itself on Escape by now, so the key must not reach the overview too.
  const dialogs = [helpDialog, blockedDialog]
  const inDialog = dialogs.some((dialog) => dialog.open || event.composedPath().includes(dialog))
  if (event.defaultPrevented || typing || event.metaKey || event.ctrlKey || event.altKey || inDialog) return
  // Space on a focused button presses that button.
  if (event.key === ' ' && target instanceof HTMLButtonElement) return
  if (overviewOpen()) return overviewKey(event)
  const keys = {
    ArrowRight: () => go(current() + 1),
    ArrowDown: () => go(current() + 1),
    PageDown: () => go(current() + 1),
    ' ': () => go(current() + (event.shiftKey ? -1 : 1)),
    ArrowLeft: () => go(current() - 1),
    ArrowUp: () => go(current() - 1),
    PageUp: () => go(current() - 1),
    Home: () => go(1),
    End: () => go(slides.length),
    f: fullscreen,
    o: () => overview(true),
    d: () => mode(),
    s: openSpeaker,
    '?': help,
  }
  const action = keys[event.key]
  if (!action) return
  event.preventDefault()
  action()
  // Presenting with the keys or a clicker: the controls step aside at once.
  rest()
})

// In the overview the keys move between the slides; Enter goes to one, Escape or o goes back.
function overviewKey(event) {
  const index = Math.max(slides.indexOf(document.activeElement), 0)
  const columns = overviewSize()
  const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }
  let target
  if (event.key in moves) target = index + moves[event.key]
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = slides.length - 1
  else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    return choose(slides[index])
  } else if (event.key === 'Escape' || event.key === 'o') {
    event.preventDefault()
    return overview(false)
  } else if (event.key === '?') {
    return help()
  } else return
  event.preventDefault()
  const slide = slides[Math.min(Math.max(target, 0), slides.length - 1)]
  slide.focus({ preventScroll: true })
  slide.scrollIntoView({ block: 'nearest' })
}

// The controls show when the mouse moves, and go after a short rest, also right after the deck
// opens.
let idle
function rest() {
  clearTimeout(idle)
  nav.classList.add('is-idle')
}
function wake() {
  nav.classList.remove('is-idle')
  clearTimeout(idle)
  idle = setTimeout(rest, 2500)
}
addEventListener('pointermove', wake)

build()
scale()
show(current())
wake()

// The check runs once the fonts and photos are in, since both change what fits.
await Promise.all([document.fonts.ready, ...[...document.images].map((img) => img.decode().catch(() => {}))])
const findings = check()
for (const { slide, layout, message } of findings) console.warn(`Dia ${slide} (${layout}): ${message}`)
if (params.has('check')) showFindings(findings)
window.slidesCheck = () => check().map(({ slide, layout, message }) => ({ slide, layout, message }))
document.documentElement.dataset.slidesReady = ''
