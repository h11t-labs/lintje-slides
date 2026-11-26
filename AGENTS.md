# Een presentatie maken met @lintje/slides

Je schrijft een presentatie als één HTML-bestand in je project. Een dia is een `<section>` met de
naam van een indeling en de inhoud in benoemde velden. Hoe de dia eruitziet, komt uit de
indeling: jij schrijft alleen tekst, foto's en data. `npx lintje-slides check` vertelt wat niet
past. Start de opdrachten in de map van het project, waar `node_modules/` staat.

## Werkwijze

1. Lees de vraag en bepaal per dia **één boodschap**. Die boodschap is de titel, als bewering:
   "Na het herschrijven bellen minder mensen", niet "Telefoontjes".
2. Kies per dia een indeling uit de catalogus hieronder.
3. Kopieer het voorbeeld uit het pakket,
   `node_modules/@lintje/slides/examples/begrijpelijke-brieven.html`, naar bijvoorbeeld
   `decks/<naam>.html`. Daarin staat elke indeling één keer, gevuld. Houd van elke dia die je
   nodig hebt de sectie en vervang de inhoud, ook de foto's.
4. Draai `npx lintje-slides check decks/<naam>.html --images` en los elke melding op. De beelden
   `out/<naam>/01.png`, `02.png`, … laten elke dia zien zoals hij op het scherm staat. Bekijk
   ze: de controle ziet niet of een dia half leeg is.
5. Draai `npx lintje-slides pdf decks/<naam>.html`, en met `--dark` erbij voor de donkere versie.
   Een deck met meldingen krijgt geen pdf.

## Het bestand

```html
<!doctype html>
<html lang="nl" data-theme="rijksoverheid" data-style-version="new" data-mode="light">
  <head>
    <meta charset="UTF-8" />
    <title>Naam van de presentatie</title>
    <link rel="stylesheet" href="/node_modules/@lintje/slides/src/slides.css" />
    <script type="module" src="/node_modules/@lintje/slides/src/slides.js"></script>
  </head>
  <body data-date="21 oktober 2026">
    <section class="slide" data-layout="plain-three-cards" data-chapter="1 Waarom">
      <h1>Een brief die niet begrepen wordt, kost twee keer</h1>
      <div data-field="cards">
        <ul>
          <li><h3>Kop</h3><p>Eén zin.</p></li>
          …
        </ul>
      </div>
    </section>
  </body>
</html>
```

- **`<title>`** is de naam van de presentatie. Hij staat links in de voet van elke dia.
- **`data-date`** op `<body>` staat rechts in de voet, vóór het dianummer.
- **`data-theme`** kiest het thema: `rijksoverheid`, `marechaussee`, `defensie`, `landmacht`,
  `marine` of `luchtmacht`. Het embleem op de eerste en laatste dia volgt het thema.
- **`data-chapter`** op een dia zet het hoofdstuk in de voet, voor die dia en de volgende,
  tot een dia een ander zet. Zet het op de eerste dia van elk hoofdstuk. Met
  `data-chapter=""` staat er geen hoofdstuk meer, zoals op de agenda en de samenvatting.
- **De titeldia** toont de datum niet vanzelf: zet hem in het veld `speaker`. Houd de titel daar
  op één regel en de ondertitel op hoogstens twee; anders duwen ze de rest van de dia af.
- De voet, het embleem, de nummers in kaarten en stappen en de opsommingstekens komen vanzelf.
  Schrijf ze niet zelf.

## Regels

- **Elke dia heeft één `<h1>`**, hoogstens 16 woorden. Alles wat er verder op de dia staat, staat
  in een element met `data-field`.
- **Geen `style` en geen `class`** in de inhoud. De controle meldt ze. De enige uitzondering is
  `data-focus="x y"` op een foto: welk deel in beeld blijft, in procenten (`data-focus="60 30"`).
- **In een tekstveld** staan `<p>`, `<ul>`/`<ol>` met `<li>`, `<h3>`, `<h4>`, `<strong>`, `<em>`,
  `<a>`, `<br>` en `<mark>`. De catalogus zegt per veld welke. Een `<ul>` krijgt kussentjes, een
  `<ol>` genummerde blokjes; een lijst één niveau dieper mag, in een `<li>`.
- **Een foto** heeft een alt-tekst die zegt wat erop staat. Zet de foto's naast het deck, in
  `photos/`, en verwijs er relatief naar (`src="photos/plein.jpg"`). De foto's van het voorbeeld
  komen niet mee: de controle meldt elke foto die niet laadt. Is er nog geen foto, zet dan het
  grijze vlak `/node_modules/@lintje/slides/examples/photos/placeholder.svg` op zijn plek.
- **Een grafiek** is een `<lintje-chart>` met zijn data als JSON erin, met `"expandable": false`
  en `"download": false`. Geef altijd een `description` mee die de cijfers in woorden zegt.
  `chart.kind` is onder meer `line` (een verloop in de tijd), `bar` (één reeks per categorie),
  `grouped-bar` (twee of drie reeksen naast elkaar), `stacked-bar`, `horizontal-bar` (lange
  labels) of `pie`; de vormen staan in
  `node_modules/lintje/dist-elements/types/components/shared/charts/shared/types.d.ts`.
  Grijs voor vergelijking is `"color": "var(--color-chart-secondary)"`. Een variabele krijgt
  een kleur bij naam (`"sky-blue"`, `"dark-yellow"`, …), nooit een kleurcode.
- **Een tabel** heeft een `<caption>`, kopcellen met `scope` en hoogstens zes rijen. Een kolom
  met alleen getallen lijnt vanzelf rechts uit.
- **Ontbrekende cijfers** laat je weg of noem je, maar je toont ze nooit als 0.
- **Begin met `photo-title` en eindig met een afsluiting.** Dat zijn de enige dia's met het
  embleem, zoals de Rijkshuisstijl het voorschrijft.
- **Kies een indeling die vol raakt.** Elke indeling is gemaakt voor een hoeveelheid tekst: de
  voorbeelddia laat zien hoeveel. Heb je minder te zeggen, kies dan een indeling met minder vakken
  (een stelling, een kerncijfer, een paneel op een foto) in plaats van een halflege.
- **Wissel van ondergrond.** Zet niet drie dia's op dezelfde grond achter elkaar. Kies blauw
  voor wat de zaal moet onthouden, een foto om te rusten, de band voor data.

## De ondergronden

- **Foto** (`photo-…`): een foto die het verhaal draagt, met een blok of paneel erop. Voor de opening, een
  hoofdstuk, een citaat of een stelling.
- **Vlak** (`plain-…`): het lichte vlak met witte kaarten. Het werkpaard voor tekst: kaarten, stappen,
  kolommen, een planning.
- **Band** (`band-…`): een blauwe band met de titel. Voor data: een grafiek, een tabel, een kern met
  punten.
- **Blauw** (`blue-…`): het hele vlak blauw. Voor een stelling, een samenvatting of drie punten die blijven
  hangen.
- **Half** (`half-…`): tekst op de ene helft, een foto op de andere.

## Catalogus

Dit overzicht komt uit `src/layouts.js`; in de repo van het pakket werkt `npm run catalog` het bij.

<!-- catalog:begin -->
| indeling | wanneer | velden naast de `<h1>` |
|---|---|---|
| `photo-title` | De eerste dia: de titel in het blauwe blok op een foto. (met embleem, zonder voet) | `photo`: `<img>` met alt<br>`subtitle`: tekst; ≤ 20 woorden<br>`speaker` (mag weg): tekst; spreker en datum, elk een `<p>`, ≤ 16 woorden<br>`payoff` (mag weg): label, één regel; de pay-off van de organisatie, ≤ 12 woorden |
| `photo-closing-block` | De laatste dia, als spiegel van de titeldia. (met embleem, zonder voet) | `photo`: `<img>` met alt<br>`text`: tekst; ≤ 20 woorden<br>`contact`: tekst; naam en e-mailadres, elk een `<p>`, ≤ 16 woorden<br>`payoff` (mag weg): label, één regel; de pay-off van de organisatie, ≤ 12 woorden |
| `photo-closing-panel` | De laatste dia, rustiger: een wit paneel op de foto. (met embleem, zonder voet) | `photo`: `<img>` met alt<br>`text`: tekst; ≤ 20 woorden<br>`contact`: tekst; naam en e-mailadres, elk een `<p>`, ≤ 16 woorden<br>`payoff` (mag weg): label, één regel; de pay-off van de organisatie, ≤ 12 woorden |
| `blue-closing-photo-strip` | De laatste dia met drie foto’s uit de presentatie. (met embleem, zonder voet) | `contact`: tekst; naam en e-mailadres, elk een `<p>`, ≤ 16 woorden<br>`text`: tekst; ≤ 24 woorden<br>`photos`: 3 foto’s (`<figure>`)<br>`payoff` (mag weg): label, één regel; de pay-off van de organisatie, ≤ 12 woorden |
| `photo-divider` | Het begin van een hoofdstuk, met een foto. | `photo`: `<img>` met alt<br>`number`: label, één regel; één woord<br>`label` (mag weg): label, één regel; ≤ 2 woorden<br>`text` (mag weg): tekst; ≤ 24 woorden |
| `photo-panel` | Eén boodschap op een foto die het verhaal draagt. | `photo`: `<img>` met alt<br>`text` (mag weg): tekst; ≤ 24 woorden |
| `photo-quote` | Een citaat op een foto. De titel is onzichtbaar en telt voor het overzicht en de schermlezer. | `photo`: `<img>` met alt<br>`quote`: tekst; ≤ 40 woorden<br>`source`: label, één regel; ≤ 12 woorden |
| `photo-statement` | Een stelling op een foto, om de zaal te laten reageren. | `photo`: `<img>` met alt<br>`label` (mag weg): label, één regel; ≤ 2 woorden |
| `photo-wall` | Vier foto’s die samen een plek of een werkveld laten zien. | `photos`: 4 foto’s (`<figure>`) |
| `plain-agenda` | De agenda: drie tot vijf onderdelen, met wat de zaal na afloop weet. | `topics`: tekst; `<ol>`, elk onderdeel een `<li>` met `<h3>` en `<p>`, ≤ 60 woorden<br>`aside` (mag weg): tekst; `<h3>` en `<p>`, ≤ 16 woorden |
| `plain-divider` | Het begin van een hoofdstuk, zonder foto: een groot nummer. | `number`: label, één regel; één woord<br>`label` (mag weg): label, één regel; ≤ 3 woorden<br>`text` (mag weg): tekst; ≤ 24 woorden |
| `plain-three-cards` | Drie gelijkwaardige punten, elk met een kop en een zin. | `cards`: tekst; `<ul>`, elk een `<li>` met `<h3>` en `<p>`, ≤ 60 woorden |
| `plain-key-card` | Een opsomming met de kern in één zin ernaast. | `points`: tekst; `<ul>` met `<li>`, ≤ 60 woorden<br>`key`: tekst; `<h3>` en `<p>`, ≤ 20 woorden |
| `plain-quote-portrait` | Een citaat als titel, met het portret en de naam van wie het zei. | `portrait` (mag weg): `<img>` met alt<br>`source`: tekst; `<h3>` met de naam en `<p>` met functie of datum, ≤ 16 woorden |
| `plain-three-figures` | Drie getallen die samen het verhaal vertellen. | `figures`: tekst; `<ul>`, elk een `<li>` met `<strong>` (het getal), `<h3>` en `<p>`, ≤ 60 woorden |
| `plain-two-columns` | Twee keuzes of kanten naast elkaar; de rechter, blauwe kolom is het voorstel. | `left`: tekst; `<h3>`, `<p>` en een `<ul>`, ≤ 50 woorden<br>`right`: tekst; `<h3>`, `<p>` en een `<ul>`; `<mark>` voor een label in de kop, ≤ 50 woorden |
| `plain-before-after` | Hoe iets was en hoe het nu is. | `before`: tekst; `<h3>` (het label) en `<p>`, ≤ 60 woorden<br>`after`: tekst; `<h3>` (het label), `<h4>` en `<p>`, ≤ 60 woorden |
| `plain-schedule` | Vier momenten op een tijdlijn, met waar het eindigt. | `intro` (mag weg): tekst; ≤ 24 woorden<br>`moments`: tekst; `<ol>`, elk een `<li>` met `<strong>` (het moment), `<h3>` en `<p>`, ≤ 60 woorden<br>`end` (mag weg): label, één regel; ≤ 2 woorden |
| `plain-three-pillars` | Eén kern met drie pijlers eronder. De titel is klein, de kern is de boodschap. | `key`: label, één regel; ≤ 8 woorden<br>`pillars`: tekst; `<ul>`, elk een `<li>` met `<h3>` en `<p>`, ≤ 60 woorden |
| `plain-steps` | Vier stappen achter elkaar, met wat ze opleveren. | `steps`: tekst; `<ol>`, elk een `<li>` met `<h3>` en `<p>`, ≤ 60 woorden<br>`result` (mag weg): tekst; `<h3>` en `<p>`, ≤ 16 woorden |
| `band-list` | De kern in één zin, met de punten die hem dragen. | `intro`: tekst; ≤ 24 woorden<br>`points`: tekst; `<ul>` met `<li>`, ≤ 50 woorden |
| `band-chart` | Eén grafiek; de titel zegt wat hij laat zien. | `chart`: `<lintje-chart>`<br>`source` (mag weg): label, één regel; ≤ 16 woorden |
| `band-table` | Een kleine tabel, tot zes rijen. | `table`: `<table>` met `<caption>` |
| `blue-three-points` | Een stelling als titel, met drie punten die hem onderbouwen. | `points`: tekst; `<ul>`, elk een `<li>` met `<h3>` en `<p>`, ≤ 60 woorden |
| `blue-statement` | Een stelling om over te stemmen of te praten. | `label` (mag weg): label, één regel; ≤ 2 woorden<br>`question` (mag weg): tekst; ≤ 16 woorden |
| `blue-summary` | Wat de zaal onthoudt: drie zinnen, aan het eind. | `points`: tekst; `<ol>` met drie `<li>`, ≤ 45 woorden |
| `half-photo-right` | Tekst met een foto ernaast, op het lichte vlak. | `photo`: `<img>` met alt<br>`text`: tekst; een `<p>` en een `<ul>`, ≤ 60 woorden |
| `half-photo-left` | Tekst met een foto ervoor, op de witte pagina. | `photo`: `<img>` met alt<br>`text`: tekst; een `<p>` en een `<ul>`, ≤ 60 woorden |
| `half-two-photos` | Tekst met twee foto’s, elk met een bijschrift. | `photos`: 2 foto’s (`<figure>`)<br>`text`: tekst; een `<p>` en een `<ul>`, ≤ 60 woorden |
| `half-key-figure` | Eén getal dat telt, met een foto. | `photo`: `<img>` met alt<br>`figure`: tekst; `<strong>` (het getal), `<h3>` en `<p>`, ≤ 30 woorden |
<!-- catalog:end -->

## Meldingen van de controle

| melding | wat je doet |
|---|---|
| `… past niet: maak de tekst korter` | Schrap woorden, of kies een indeling met meer ruimte. Een kleinere letter bestaat niet. |
| `veld "…" ontbreekt` | Voeg het veld toe; de catalogus zegt wat erin hoort. |
| `"…" is geen veld van …` | De melding noemt de velden die wel bestaan. |
| `heeft 3 punten, nu 4` | Neem het aantal punten dat de indeling heeft, of kies een andere. |
| `<… style>` of `<… class>` | Haal de opmaak weg. Wat de dia anders moet laten zien, is een andere indeling. |
| `de foto heeft een alt-tekst` | Beschrijf wat er op de foto staat. |

Met `?check` achter de URL in de browser staan de meldingen op de dia zelf.
