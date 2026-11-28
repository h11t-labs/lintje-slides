# Changelog

Wat er veranderde, per versie, de nieuwste bovenaan. Elke pull request, ook een kleine, schrijft
zijn regel in een eigen bestand in [`changes/`](changes/), `<nummer>-<titel>.md`, met zijn nummer
erachter: `(#12)`; `npm run release` zet ze hier bij elkaar. De opzet volgt
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) en de versies
[Semantic Versioning](https://semver.org/lang/nl/): de kopjes zijn de zes soorten van Keep a
Changelog in het Nederlands (Toegevoegd, Gewijzigd, Verouderd, Verwijderd, Opgelost, Beveiliging).
De markup is het contract: een indeling, een veld, een attribuut of een URL-parameter hernoemen
of verwijderen is een brekende wijziging en begint hier met **Brekend:**.

## [Unreleased]

## [0.4.0] - 2026-11-28

### Toegevoegd

- De skill noemt zes grafieksoorten erbij die op een dia passen: `target-progress`, `dumbbell`, `stacked-area`, `histogram`, `heatmap` en `scatter`, met wanneer en de vorm, en noemt de soorten die niet op een dia passen. Een tweede voorbeeld, `examples/sneller-beslissen.html`, toont ze gevuld. (#29)
- Drie indelingen voor een deck zonder foto's: `blue-divider`, een tussenpagina met het grote nummer en de titel wit op blauw, en `blue-title` en `blue-closing`, de titeldia en de afsluiting op het blauwe vlak zonder fotoplek. (#28)
- `check --sheet` zet alle dia's van een deck genummerd in één png, `out/<deck>-overzicht.png` (in donker `out/<deck>-dark-overzicht.png`), om de volgorde en de afwisseling van de ondergronden in één blik te zien. (#27)
- Het voorbeelddeck staat online op <https://h11t-labs.github.io/lintje-slides/>: een workflow zet bij elke push naar `main` de bundel op GitHub Pages, en de README linkt ernaar. (#26)

### Gewijzigd

- Een grafiek met een verkeerde vorm (ongeldige JSON, een onbekende soort, een ontbrekende lijst of een ontbrekend getal) is een melding bij zijn dia in plaats van "fout in de pagina", en de pagina loopt niet meer vast. (#29)

## [0.3.0] - 2026-11-27

### Toegevoegd

- De balk met knoppen kan ook boven, links of rechts staan: `data-controls="top"`, `"left"` of `"right"` op `<body>` voor het hele deck, of `?controls=left` achter de URL voor één keer. Links en rechts staan de knoppen onder elkaar. De controle meldt een waarde die geen plek is. (#23)
- Tests voor de controle, het deck, de opdracht en de releasescripts; `npm test` draait ze, ook in CI. (#19)

### Gewijzigd

- De balk met knoppen staat in de marge onder de dia als het scherm die heeft, en anders in de band van de voet: hij ligt niet meer over de bronregel of de voet. De knoppen hebben geen eigen rand meer en staan samen in één kader; de sprekersweergave heeft een eigen icoon. (#22)
- De meldingen van `?check` staan net boven de voet, zodat de voet en de balk leesbaar blijven. (#22)
- Het overzicht dimt de andere dia's niet meer: de rand en het gevulde nummer wijzen de dia aan waar je bent. (#22)
- De sprekersweergave is opnieuw ingedeeld. De kop toont de naam van het deck, de dia waar je bent en de duur als groot cijfer; Vorige, Volgende en Sluiten zijn knoppen met een woord, en Reset is een link boven de duur, die hem op nul zet. De volgende dia staat klein onder de huidige, met zijn titel ernaast, en de notities hebben de hele rechterkolom. (#22)
- Vier indelingen blijven niet meer half leeg bij korte tekst: de opsomming in de band staat als groep in het midden, de tijdlijn van de planning staat in het midden van het vlak met grotere tekst, en het vak van de agenda en de twee vakken van voor-en-na zijn zo hoog als hun inhoud. (#21)
- In donker is het gekleurde vlak het gedempte blok van Lintje, in plaats van de primaire kleur zelf. Elk thema haalt daarmee het contrast; in het thema Defensie stond kleine witte tekst op oranje. (#21)
- Op de slotdia met fotostrook begint het blauwe vlak onder het logo, zodat het lint vrij staat. (#21)
- De momenten van de planning nemen samen hoogstens 48 woorden in plaats van 60: met de grotere tekst past er minder. Een deck dat daar meer woorden had, krijgt nu een melding. (#21)
- De meldingen van de controle op de dia (`?check`) zijn mededelingen van Lintje, naast elkaar; het veld met de fout heeft een dunne foutlijn (#13)
- Eén oorzaak geeft één melding in de controle: te veel woorden en tekst die niet past in hetzelfde veld, dezelfde melding voor meerdere punten, en alles wat een te lange titel of tekst van de dia duwt, staan elk in één regel (#13)

### Opgelost

- De sprekersweergave heeft een knop om te sluiten. (#22)
- Een titel van meer regels duwt in de halve indelingen en bij de stappen de tekst omlaag, in plaats van eroverheen te lopen. (#21)
- Bij de stappen en de planning tekent de verbindingslijn mee met de onderdelen, in plaats van er in één keer te staan terwijl de nummers nog binnenkomen. (#21)
- De controle meldt een titel die boven uit de blauwe band loopt: `de titel past niet`. (#19)
- De controle telt de woorden van twee elementen die in de markup tegen elkaar staan (`</h3><p>`) niet meer als één woord. Een veld dat net binnen zijn grens leek te blijven, kan nu een melding geven. (#19)
- Met `?check` geeft `window.slidesCheck()` dezelfde meldingen als zonder: de markering van een eerdere melding telt niet als opmaak in de inhoud. (#19)
- Een veld met een ander aantal punten dan de indeling geeft alleen die melding, niet ook `passen niet: maak de tekst korter`. Of de punten passen, meet de controle als het aantal klopt. (#19)

## [0.2.0] - 2026-11-27

### Toegevoegd

- `lintje-slides bundle`: een deck als één los HTML-bestand dat zonder server of internet opent, met alleen de onderdelen van Lintje die het deck tekent. (#11)
- Notities bij een dia (`<aside data-notes>`) en een sprekersweergave in een tweede venster (`S`): de huidige en de volgende dia, de notities, de tijd en de duur, synchroon met het deck. Een knop en de toets `?` tonen de sneltoetsen. (#10)

## [0.1.0] - 2026-11-26

### Toegevoegd

- De eerste versie: presentaties in HTML in de nieuwe Rijkshuisstijl, met dertig indelingen in vijf ondergronden, een controle van elke dia, en een pdf in licht en donker.
- De opdracht `lintje-slides` met `serve`, `check` (met `--images` een png per dia) en `pdf`, met `--dark` voor de donkere versie. Hij werkt op elk deck in een project en levert de versie van Lintje die bij het pakket hoort.
- Presenteren in de browser: bladeren met toetsen en een clicker, knoppen die infaden als de muis beweegt, een overzicht van alle dia's (toets O), licht of donker (toets D, `?mode=dark`) en volledig scherm. Elke dia komt rustig in beeld, behalve bij minder beweging.
- Een skill voor een AI-assistent, `skills/lintje-slides/`: de werkwijze van verhaallijn tot pdf, welke indeling bij welke boodschap past, goed gebruik van tekst, cijfers, grafieken en foto's, de vorm van een grafiek per soort en de velden van elke indeling. (#1)

[unreleased]: https://github.com/h11t-labs/lintje-slides/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/h11t-labs/lintje-slides/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/h11t-labs/lintje-slides/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/h11t-labs/lintje-slides/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/h11t-labs/lintje-slides/releases/tag/v0.1.0
