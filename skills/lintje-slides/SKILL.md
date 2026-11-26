---
name: lintje-slides
description: Presentatie maken, aanpassen of controleren met @lintje/slides — dia's in HTML in de Rijkshuisstijl, met een indeling per dia, een controle (`lintje-slides check`) en een pdf. Ook voor een verhaallijn, een indeling kiezen of meldingen van de controle oplossen.
---

# Een presentatie met @lintje/slides

Een presentatie is één HTML-bestand. Elke dia is een `<section>` met de naam van een **indeling**
en de inhoud in benoemde velden. Hoe de dia eruitziet, komt uit de indeling: jij schrijft alleen
tekst, foto's en data, en kiest per dia de indeling die bij de **boodschap** past. Start elke
opdracht in de map van het project, waar `node_modules/@lintje/slides` staat: `lintje-slides`
serveert die map als `/`, dus een pad dat met `/` begint, telt vanaf daar en een ander pad vanaf
het deck.

## Werkwijze

1. **Schrijf de verhaallijn.** Bepaal per dia één boodschap en schrijf die als titel: een
   bewering die de zaal kan onthouden ("Na het herschrijven bellen minder mensen"), niet een
   onderwerp ("Telefoontjes"). Klaar als de titels achter elkaar gelezen het hele verhaal
   vertellen, zonder de dia's.
2. **Kies per dia een indeling** met [Een indeling kiezen](#een-indeling-kiezen), en zoek de velden
   ervan op in [`layouts.md`](layouts.md). Klaar als elke dia een indeling heeft waarvan de
   velden vol raken met wat je te zeggen hebt.
3. **Schrijf het deck.** Kopieer `node_modules/@lintje/slides/examples/begrijpelijke-brieven.html`
   naar bijvoorbeeld `decks/<naam>.html`: daarin staat elke indeling één keer, gevuld, in een
   hoeveelheid tekst die past. Houd per dia de sectie van zijn indeling, in jouw volgorde, en
   vervang de inhoud. De foto's van het voorbeeld komen niet mee: geef elke `<img>` meteen een
   eigen foto of het grijze vlak (zie [Goed gebruik](#goed-gebruik), zonder foto's).
4. **Controleer.** Draai `npx lintje-slides check decks/<naam>.html --images` en los elke melding
   op ([Meldingen](#meldingen)). Bekijk daarna elke png in `out/<naam>/`: de controle ziet niet
   of een dia half leeg is, een titel op één woord breekt of een foto het verkeerde deel toont.
   Klaar als de controle `in orde` zegt **en** je elke png hebt bekeken en goedgekeurd.
5. **Exporteer** met `npx lintje-slides pdf decks/<naam>.html`, en met `--dark` voor de donkere
   versie. Bekijken in de browser kan met `npx lintje-slides serve`.

## Het bestand

```html
<!doctype html>
<html lang="nl" data-theme="rijksoverheid" data-style-version="new" data-mode="light">
  <head>
    <meta charset="UTF-8" />
    <title>Begrijpelijke brieven</title>
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

- **`<title>`** is de naam van de presentatie; hij staat links in de voet van elke dia. Hij mag
  langer zijn dan de titel op de titeldia, die op één regel moet passen: hoogstens ongeveer
  twintig tekens. De rest gaat in de ondertitel, die zelf hoogstens twee regels is.
- **`data-date`** op `<body>` staat rechts in de voet, vóór het dianummer. De titeldia toont hem
  niet vanzelf: zet hem daar in het veld `speaker`.
- **`data-theme`** is de organisatie: `rijksoverheid`, `marechaussee`, `defensie`, `landmacht`,
  `marine` of `luchtmacht`. Het embleem op de eerste en de laatste dia volgt het thema.
- **`data-chapter`** op de eerste dia van een hoofdstuk zet het hoofdstuk in de voet, tot een dia
  een ander zet; `data-chapter=""` zet het uit, zoals op de agenda en de samenvatting. De tekst
  staat letterlijk in de voet: een nummer en één of twee woorden (`data-chapter="2 Aanpak"`). Zet
  het op de tussenpagina die het hoofdstuk opent.
- De voet, het embleem, de nummers in kaarten en stappen en de opsommingstekens zet het pakket
  erbij.

## Een indeling kiezen

Kies op wat de dia moet doen. De velden en de grenzen staan in [`layouts.md`](layouts.md).

| de dia moet… | indeling |
|---|---|
| openen | `photo-title`, altijd de eerste |
| zeggen wat er komt (vanaf een deck van een stuk of tien dia's) | `plain-agenda` |
| een hoofdstuk openen | `photo-divider`, of `plain-divider` zonder passende foto |
| drie gelijkwaardige punten geven | `plain-three-cards`; `blue-three-points` als de titel een stelling is die moet blijven hangen |
| een kern met de punten die hem dragen | `band-list`; met de kern als kaart ernaast `plain-key-card` |
| een kern met drie pijlers eronder | `plain-three-pillars` |
| één getal laten tellen | `half-key-figure` |
| drie getallen samen | `plain-three-figures` |
| een verloop of een vergelijking in cijfers tonen | `band-chart` |
| precieze waarden laten opzoeken, tot zes rijen | `band-table` |
| een werkwijze in stappen | `plain-steps` (vier) |
| momenten in de tijd | `plain-schedule` (vier, met een eindpunt) |
| twee keuzes naast elkaar, met een voorstel | `plain-two-columns` (rechts is het voorstel) |
| oud tegenover nieuw | `plain-before-after` |
| iemand citeren | `plain-quote-portrait` met portret, `photo-quote` op een foto |
| de zaal laten reageren | `blue-statement`, of `photo-statement` op een foto |
| tekst met een foto | `half-photo-right`, `half-photo-left`; met twee foto's `half-two-photos` |
| één zin op een beeld dat het verhaal draagt | `photo-panel` |
| een plek of werkveld laten zien | `photo-wall` |
| samenvatten wat de zaal onthoudt | `blue-summary`, aan het eind |
| afsluiten | `photo-closing-block`, `photo-closing-panel` of `blue-closing-photo-strip`, altijd de laatste |

## Goed gebruik

- **Een verhaallijn heeft een vaste vorm**: titeldia, agenda, per hoofdstuk een tussenpagina met
  daarachter de inhoud, de samenvatting, de afsluiting. Reken op ongeveer één inhoudsdia per
  minuut spreektijd; de titeldia, de agenda, de tussenpagina's en de afsluiting tellen niet mee.
- **De titel draagt de boodschap; de velden bewijzen hem.** Een kaart, punt of stap is één
  gedachte. Laat de punten van een lijst op dezelfde manier beginnen, en houd elk punt op één of
  twee regels.
- **Kies de indeling die vol raakt.** De grenzen in `layouts.md` zijn een maximum, het voorbeeld
  laat de goede hoeveelheid zien: schrijf rond die lengte. Staat een vak in de png minder dan half
  vol, kies dan een indeling met minder vakken (een stelling, een kerncijfer, een paneel op een
  foto) of zeg meer.
- **Wissel van ondergrond**: foto (`photo-…`), vlak (`plain-…`), band (`band-…`), blauw
  (`blue-…`) en half (`half-…`); elk is een eigen ondergrond, ook de band met zijn blauwe kop.
  Drie inhoudsdia's achter elkaar op dezelfde ondergrond lezen als één lange dia; een
  tussenpagina breekt de reeks al. Bewaar blauw voor wat
  de zaal moet onthouden (hooguit één per hoofdstuk en de samenvatting), een foto om te rusten,
  de band voor data.
- **Een getal heeft een eenheid en een vergelijking**: "120 telefoontjes per 1.000 brieven, was
  210". Het grote getal in `<strong>` is hoogstens vijf tekens (`87%`, `1,4`, `120`); de eenheid
  ("miljoen euro") staat in de `<h3>` eronder. Noem de bron in het veld `source` of in het bijschrift. Ontbrekende cijfers laat je weg
  of noem je; een 0 betekent nul.
- **Een grafiek zegt één ding, en de titel zegt wat.** Geef de reeks die het zegt een kleur en de
  vergelijking grijs (`"color": "var(--color-chart-secondary)"`): oud tegenover nieuw is een
  `grouped-bar` met twee reeksen, de oude grijs. Een lijn toont een verloop in de tijd, staven
  vergelijken categorieën, liggende staven passen bij lange labels. De vorm per soort staat onder
  [Grafieken](#grafieken).
- **Een foto draagt iets**: de plek, de mensen, het werk waar het over gaat, uit de beeldbank van
  de organisatie. Kies er een met ruimte rond het onderwerp; `data-focus="x y"` houdt een ander
  deel in beeld dan het midden, in procenten (`data-focus="60 30"`).
- **Zonder foto's** kies je voor de inhoud indelingen zonder foto: `plain-divider` in plaats van
  `photo-divider`, `blue-statement` in plaats van `photo-statement`, `plain-three-figures` in
  plaats van `half-key-figure`. De titeldia en de afsluiting hebben altijd een foto: zet daar het
  grijze vlak `/node_modules/@lintje/slides/examples/photos/placeholder.svg`, met de alt-tekst
  "Plaats voor een foto", en meld wie het deck krijgt dat er nog een foto moet komen.
- **Licht of donker**: licht voor een zaal met daglicht en voor de pdf om te delen, donker voor een
  donkere zaal of een groot scherm. Beide komen uit hetzelfde deck (`?mode=dark`, `--dark`).

## Regels voor de inhoud

- **Elke dia heeft één `<h1>`**, hoogstens 16 woorden. Al het andere staat in een element met
  `data-field`, met een veldnaam van de indeling.
- **De opmaak komt uit de indeling.** Schrijf geen `style` en geen `class` in de inhoud; de enige
  uitzondering is `data-focus` op een foto. Een andere opmaak is een andere indeling.
- **In een tekstveld** staan `<p>`, `<ul>`/`<ol>` met `<li>`, `<h3>`, `<h4>`, `<strong>`, `<em>`,
  `<a>`, `<br>` en `<mark>`; `layouts.md` zegt per veld welke. Een `<ul>` krijgt kussentjes, een
  `<ol>` genummerde blokjes; een lijst één niveau dieper mag, in een `<li>`.
- **Een foto** is een `<img>` met een alt-tekst die zegt wat erop staat. Zet de bestanden naast
  het deck (`decks/photos/`) en verwijs er relatief naar (`src="photos/plein.jpg"`).
- **Een grafiek** is een `<lintje-chart>` met zijn data als JSON erin, met `"expandable": false`,
  `"download": false` en een `description` die de cijfers in woorden zegt. Een variabele krijgt
  een kleur bij naam (`"sky-blue"`, `"dark-yellow"`, …), nooit een kleurcode. `chart.kind` is
  een van de soorten onder [Grafieken](#grafieken).
- **Een tabel** heeft een `<caption>`, kopcellen met `scope` en hoogstens zes rijen. Een kolom met
  alleen getallen lijnt vanzelf rechts uit.
- **Notities voor de spreker** staan in een `<aside data-notes>` als laatste in de dia, met
  `<p>`, `<ul>`/`<ol>` en `<strong>`. Ze zijn geen veld: de zaal ziet ze nooit, alleen de
  sprekersweergave. Schrijf er wat je wilt zeggen, niet wat al op de dia staat.
- **Schrijf Nederlands**, in de taal van de zaal: B1 als het publiek breed is.

## Grafieken

De grafiek staat in het veld `chart` van `band-chart`, als JSON in een `<script>`:

```html
<div data-field="chart">
  <lintje-chart>
    <script type="application/json">
      {
        "expandable": false,
        "download": false,
        "description": "Telefoontjes per maand, oud en nieuw formulier: januari 4.300 en 2.900, …",
        "chart": { "kind": "grouped-bar", "labels": ["Jan", "Feb"], "series": [ … ] }
      }
    </script>
  </lintje-chart>
</div>
```

De vorm van `chart` hangt af van de soort; een verkeerde vorm laat de pagina vastlopen.

| soort | wanneer | vorm |
|---|---|---|
| `bar` | één reeks per categorie | `"labels": [...]`, `"values": [...]`, `"color"` |
| `grouped-bar` | twee of drie reeksen naast elkaar, zoals oud en nieuw | `"labels": [...]`, `"series": [{ "label", "values": [...], "color" }]` |
| `stacked-bar` | delen van een geheel per categorie | als `grouped-bar` |
| `line` | een verloop in de tijd | `"labels": [...]`, `"series": [{ "label", "values": [...], "color" }]`; `null` voor een ontbrekend punt |
| `horizontal-bar` | categorieën met lange namen, gerangschikt | `"rows": [{ "label", "value" }]`, `"color"` |
| `pie` | twee tot vier delen van één geheel | `"segments": [{ "label", "value", "color" }]` |

Eén reeks mag, met een eigen kleur; grijs is alleen voor een vergelijking ernaast. `"axisTitle"`
noemt de eenheid langs de as. Meer soorten en velden staan in Lintje, dat het pakket meebrengt:
`node_modules/lintje/dist-elements/types/components/shared/charts/shared/types.d.ts`.

## Meldingen

| melding | wat je doet |
|---|---|
| `… past niet: maak de tekst korter` | Schrap woorden, of kies een indeling met meer ruimte. Een kleinere letter bestaat niet. |
| `… valt van de dia: de titel of de tekst erboven is te lang` | De genoemde velden zijn weggeduwd, ook een foto: maak de titel of het tekstveld erboven korter. Op de titeldia is het bijna altijd de titel. |
| `de titel heeft hoogstens … woorden` | Kort de titel in; op de titeldia gaat de rest in de ondertitel. |
| `veld "…" ontbreekt` | Voeg het veld toe; `layouts.md` zegt wat erin hoort. |
| `"…" is geen veld van …` | De melding noemt de velden die wel bestaan. |
| `heeft 3 punten, nu 4` | Neem het aantal punten dat de indeling heeft, of kies een andere. |
| `<… style>` of `<… class>` | Haal de opmaak weg; wat de dia anders moet laten zien, is een andere indeling. |
| `de foto heeft een alt-tekst` | Beschrijf wat er op de foto staat. |
| `de foto … laadt niet` | Zet het bestand op het pad uit `src`, of zet het grijze vlak op zijn plek. |
| `fout in de pagina, vaak de data van een grafiek …` | Vergelijk de JSON van elke grafiek met [Grafieken](#grafieken); de melding noemt geen dia. |

In de browser zet `?check` achter de URL de meldingen op de dia zelf.

## Presenteren

`npx lintje-slides serve` geeft de link naar elk deck. Bladeren gaat met de pijltjes, spatie of
een clicker; F is volledig scherm, O het overzicht van alle dia's, D licht of donker en S de
sprekersweergave: een tweede venster met de huidige en de volgende dia, de notities en de tijd, dat
gelijk loopt met het deck. Het nummer van de dia staat in de URL (`#3`), dus een link opent op die
dia.
