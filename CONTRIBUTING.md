# Meewerken aan @lintje/slides

Lees eerst [`README.md`](README.md) en de skill
[`skills/lintje-slides/SKILL.md`](skills/lintje-slides/SKILL.md): de handleiding die bij het
pakket hoort, voor wie een presentatie maakt.

## De regels

- **Wat generiek is, hoort in Lintje.** Een kleur, een maat of een element dat ook een pagina zou
  gebruiken, wordt een issue bij [Lintje](https://github.com/h11t-labs/lintje), geen regel in
  `src/slides.css`. Wat hier blijft: het vaste vlak, de dertig rasters, de voet, het embleem, de
  controle, de pdf en de handleiding.
- **Alleen tokens van Lintje** voor kleur, ruimte en hoeken. Wat daarvan afwijkt, staat met reden
  in de README onder "Wat afwijkt van Lintje".
- **Code in het Engels**: namen, commentaar, bestanden, attributen, indelingen, velden en
  URL-parameters. Wat iemand op een dia of in een melding leest, en elk `.md`-bestand, is
  Nederlands. Ook commitberichten, pull requests en issues zijn Nederlands.
- **Een nieuwe indeling** komt in `src/layouts.js` en `src/slides.css`, en één keer gevuld in
  `examples/begrijpelijke-brieven.html`. `npm run catalog` zet hem in de catalogus van
  de skill, en de skill zegt wanneer je hem kiest.
- **De markup is het contract.** Een indeling, een veld, een attribuut of een URL-parameter
  hernoemen of weghalen is een brekende wijziging.

## Controleren

```bash
npm install
npx playwright install chromium
npm run dev                          # de server op poort 5190
npm run check                        # elk deck in de repo, in licht
npm run check -- --dark --images     # in donker, met een png per dia in out/
npm run catalog                      # de catalogus van de skill uit src/layouts.js
```

Een wijziging aan de opmaak bekijk je in licht **en** donker, en in het overzicht (toets O). De
check in CI (`.github/workflows/check.yml`) draait de controle in licht en donker, kijkt of de
catalogus bij `src/layouts.js` past en of het pakket de goede bestanden bevat.

## Uitbrengen

Een release is een tag. Elke pull request schrijft tijdens het werk zijn changelogregel in een
eigen bestand, `changes/<nummer>-<titel>.md`: het nummer en de titel van de pull request, de
titel in kleine letters met streepjes (`changes/12-indeling-met-tijdlijn.md`). Erin staat wat ook
in [`CHANGELOG.md`](CHANGELOG.md) zou staan, een kop en de regel eronder, met het nummer erachter
en een brekende wijziging met **Brekend:** ervoor:

```md
### Toegevoegd

- Een indeling met een tijdlijn. (#12)
```

De kop is een van de zes van Keep a Changelog; meer koppen in één bestand mag. Uitbrengen is dan:

```bash
npm run release 0.2.0            # changes/ en [Unreleased] worden [0.2.0] - datum, package.json neemt de versie, één commit
```

Die commit gaat als pull request naar `main`. Staat hij daar, dan is de tag de release:

```bash
git fetch origin && git tag v0.2.0 origin/main && git push origin v0.2.0
```

De workflow (`.github/workflows/release.yml`) weigert een tag die niet gelijk is aan de versie in
`package.json` of geen sectie in de changelog heeft, draait dezelfde checks als `check.yml`, zet
`@lintje/slides` klaar op npm en maakt de GitHub-release met de tarball en die sectie als tekst.
De versie op npm wordt pas zichtbaar als een maintainer hem goedkeurt met
tweestapsverificatie, op npmjs.com onder *Staged Packages* of met `npm stage approve <id>`. De
workflow heeft de secret `NPM_TOKEN` nodig, een granular token met alleen het recht om klaar te
zetten, voor de scope `@lintje`. Een versie is [Semantic Versioning](https://semver.org/lang/nl/):
vóór 1.0 verhoogt een brekende wijziging het tweede getal.
