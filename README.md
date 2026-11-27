# @lintje/slides

Presentaties in HTML met [Lintje](https://github.com/h11t-labs/lintje), in de nieuwe
Rijkshuisstijl. Een presentatie is één HTML-bestand. Elke dia kiest een van dertig indelingen en
vult die met tekst, foto's en data. De opmaak komt uit de indeling, dus een mens en een agent
maken dezelfde dia's. Je presenteert in de browser en exporteert naar pdf, in licht en donker.

De dertig indelingen staan in vijf ondergronden: foto, licht vlak, blauwe band, vol blauw en half
beeld. De skill in [`skills/lintje-slides/`](skills/lintje-slides/SKILL.md) beschrijft ze
allemaal, met hun velden en wanneer je welke kiest.
[`examples/begrijpelijke-brieven.html`](examples/begrijpelijke-brieven.html) gebruikt elke
indeling één keer.

## Installeren

```bash
npm install --save-dev @lintje/slides
npx playwright install chromium   # eenmalig, voor de controle en de pdf
```

Het pakket brengt zijn eigen versie van Lintje mee. Start de opdrachten in de map van je project,
waar `node_modules/` staat.

## Een presentatie maken

Kopieer het voorbeeld, `node_modules/@lintje/slides/examples/begrijpelijke-brieven.html`, naar
je project, houd de dia's die je nodig hebt en vervang hun inhoud. Twee regels in de `<head>`
laden het pakket:

```html
<link rel="stylesheet" href="/node_modules/@lintje/slides/src/slides.css" />
<script type="module" src="/node_modules/@lintje/slides/src/slides.js"></script>
```

Een dia ziet er zo uit:

```html
<section class="slide" data-layout="band-list" data-chapter="1 Waarom">
  <h1>Een brief die niet begrepen wordt, kost twee keer</h1>
  <p data-field="intro">Elke vraag die binnenkomt, is werk dat de brief had kunnen voorkomen.</p>
  <div data-field="points">
    <ul>
      <li>Wie de brief niet snapt, belt, mailt of komt langs.</li>
      <li>Op taalniveau B1 lezen de meeste mensen een brief in één keer.</li>
    </ul>
  </div>
</section>
```

De voet, het embleem, de nummers en de opsommingstekens zet `slides.js` erbij.

## Met een AI-assistent

Het pakket brengt een skill mee, `skills/lintje-slides/`: de werkwijze van verhaallijn tot pdf,
welke indeling bij welke boodschap past, goed gebruik van tekst, cijfers, grafieken en foto's, en
de velden van elke indeling. Kopieer de map naar de skills-map van je assistent; bij Claude Code
is dat `.claude/skills/` van je project:

```bash
mkdir -p .claude/skills && cp -R node_modules/@lintje/slides/skills/lintje-slides .claude/skills/
```

Vraag daarna gewoon om een presentatie. Een assistent zonder skills wijs je de weg met een regel
in je eigen `AGENTS.md`: "Volg voor een presentatie
`node_modules/@lintje/slides/skills/lintje-slides/SKILL.md`."

## Bekijken, controleren en exporteren

```bash
npx lintje-slides serve                             # een server op poort 5190, met een link per deck
npx lintje-slides check decks/brieven.html          # meldt wat niet past
npx lintje-slides check decks/brieven.html --images # en zet een png per dia in out/brieven/
npx lintje-slides pdf decks/brieven.html            # out/brieven.pdf
npx lintje-slides pdf decks/brieven.html --dark     # out/brieven-dark.pdf
npx lintje-slides bundle decks/brieven.html         # out/brieven.html, één los bestand
```

Dubbelklik een deck niet: via `file://` laadt de browser de scripts niet. Wil je een deck
mailen of op een USB-stick zetten, maak dan een bundel: `out/<deck>.html` heeft de opmaak, de
scripts, Lintje, RijksSans, de iconen en de foto's in zich, opent met een dubbelklik zonder
server of internet, en doet alles wat het deck via de server doet, de sprekersweergave ook. Van
Lintje gaat alleen mee wat het deck tekent, de grafiek alleen als er een is; de rest van de
grootte zijn vooral de foto's. Een foto van het web gaat er ook in; van een foto gaat alleen de
`src` mee, niet `srcset`. Staat er nog iets buiten de bundel, of ontbreekt een bestand, dan meldt
de opdracht dat en schrijft hij geen bundel. Hebben twee decks dezelfde naam, dan krijgt hun
bestand in `out/` de map erbij. Zonder pad nemen de
opdrachten elk deck in de map en eronder: elk `.html`-bestand met `<section class="slide">`,
buiten `node_modules/` en `out/`. Een andere server die de map van het project serveert, werkt
ook; `lintje-slides serve` levert altijd de versie van Lintje die bij het pakket hoort.

De controle meldt een onbekende indeling of veld, een ontbrekend veld, te veel woorden of punten,
een foto zonder alt-tekst, opmaak in de inhoud, en tekst die niet in zijn vak past. Een deck met
meldingen krijgt geen pdf en geen bundel.

In de browser zet `?mode=dark` het deck donker, `?theme=defensie` probeert een ander thema dan het
deck zelf noemt (`data-theme`), en `?check` toont de meldingen van de controle op de dia's.

## Presenteren

Onderaan in het midden staat een balk met knoppen voor de vorige dia, de volgende dia, licht of
donker, het overzicht van alle dia's, de sprekersweergave, volledig scherm en de sneltoetsen. Is
het scherm hoger dan de dia, dan staat de balk in de marge eronder; anders in de band van de voet,
waar het midden vrij is. Ze faden in als je de muis beweegt en faden langzamer
uit als hij even stilstaat, als je bladert met de toetsen of een clicker, en kort nadat het deck
opent. In de pdf staan ze nooit. In het overzicht staan alle dia's klein naast elkaar, met hun
nummer; de dia waar je bent heeft een rand en een gevuld nummer: klik er een aan, of kies met de
pijltoetsen en Enter. Met het toetsenbord gaat het zo:

| toets | wat er gebeurt |
|---|---|
| → ↓ spatie PageDown | volgende dia |
| ← ↑ shift+spatie PageUp | vorige dia |
| Home / End | eerste / laatste dia |
| F | volledig scherm aan of uit |
| O | overzicht van alle dia's; Escape of O sluit het |
| D | licht of donker; de keuze komt in de URL (`?mode=dark`) |
| S | de sprekersweergave, in een tweede venster |
| ? | de sneltoetsen, in een venster; ook onder de knop met het vraagteken |

Het nummer van de dia staat in de URL (`#3`). Herlaad je de pagina of deel je de link, dan kom je
op dezelfde dia uit.

### Sprekersweergave

Een dia kan notities hebben, in een `<aside data-notes>` in de dia. De zaal ziet ze nooit: niet
op de dia, in het overzicht of in de pdf. S of de knop Sprekersweergave opent de
sprekersweergave in een tweede venster (`?presenter`). Bovenaan staan de naam van het deck, de dia
waar je bent, de duur als groot cijfer met de link Reset erboven, de tijd, en knoppen voor Vorige,
Volgende en Sluiten. Daaronder staat links de dia die de zaal ziet met de volgende dia klein
eronder, en rechts de notities. Het overzicht (O) werkt er ook. De twee vensters lopen gelijk, ook
licht of donker, wat je ook gebruikt om te bladeren. Zet de sprekersweergave op
je eigen scherm, sleep het zaalvenster naar de beamer en druk daar op F.

## Hoe het werkt

- `src/layouts.js` noemt de indelingen en hun velden. De controle en de catalogus van de skill
  lezen hem.
- `src/slides.css` tekent de indelingen. Elke indeling is een grid over het vlak van 1280 × 720:
  een langere titel duwt wat eronder staat omlaag. De kleuren zijn tokens van Lintje, dus het
  thema en de donkere modus komen uit Lintje.
- `src/slides.js` schaalt de dia naar het scherm, bladert, zet de voet en het embleem en
  controleert elke dia.
- `lintje-slides` (`bin/` en `cli/`) serveert het project, en opent elk deck in Chromium voor de
  controle en de pdf.

## Wat afwijkt van Lintje

`src/slides.css` noemt alleen tokens van Lintje voor kleur, ruimte tussen tekst en de hoeken. De
controle van Lintje (`node node_modules/lintje/dist-elements/skills/lintje/check.mjs
node_modules/lintje/dist-elements/tokens.json src/slides.css`) meldt toch achttien plekken. Die
staan er met reden:

- **Plaatsen op het vlak**: de voet op 684 px, de meldingen van de controle 52 px boven de onderkant, de witte rand van 24 en 48 px, de marge van 72 px,
  het vlak van de stappen vanaf 845 px, de kolommen van de planning. Een dia is een vast vlak van
  1280 × 720 en geen pagina; deze maten komen uit het ontwerpcanvas.
- **Uitlijning**: het grote aanhalingsteken staat waar het canvas het zet.
- **`--slide-scale`** is de schaal waarmee `slides.js` de dia op het scherm past, en
  **`--slides-nav-bottom`** de plek die het de balk met knoppen geeft: in de marge of in de voet.
- **Het overzicht**: `slides.js` zet het aantal kolommen en de verkleining
  (`--slide-overview-columns`, `--slide-overview-zoom`), en marges van 1280 en 720 px maal die
  verkleining trekken de kleine dia's tegen elkaar.
- **Letters in punten**: een dia heeft een eigen schaal (titel 32 pt, tekst 18 pt), want hij wordt
  van een afstand gelezen. Lintje's tekststappen zijn voor een scherm op armlengte.

De foto's in het voorbeeld zijn vrij te gebruiken (CC0, van Wikimedia Commons); de bronnen staan
in [`examples/photos/SOURCES.md`](examples/photos/SOURCES.md). Zet er voor echt gebruik foto's
uit de beeldbank van je organisatie in. De cijfers in het voorbeeld zijn fictief.

## Meewerken

Hoe je aan het pakket werkt en hoe een release gaat, staat in
[`CONTRIBUTING.md`](CONTRIBUTING.md). Wat er per versie veranderde, staat in
[`CHANGELOG.md`](CHANGELOG.md).

## Licentie

[EUPL-1.2](LICENSE).
