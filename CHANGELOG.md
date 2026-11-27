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

[unreleased]: https://github.com/h11t-labs/lintje-slides/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/h11t-labs/lintje-slides/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/h11t-labs/lintje-slides/releases/tag/v0.1.0
