# De indelingen

Elke indeling met waar hij voor is en zijn velden naast de `<h1>`. Een veld is een element met
`data-field="<naam>"` direct in de `<section>`; de grenzen zijn een maximum, en de controle
meldt wat erboven gaat. Dit bestand komt uit `src/layouts.js`.

| indeling | wanneer | velden naast de `<h1>` |
|---|---|---|
| `photo-title` | De eerste dia: de titel in het blauwe blok op een foto. (titel ≤ 4 woorden, met embleem, zonder voet) | `photo`: `<img>` met alt<br>`subtitle`: tekst; ≤ 14 woorden<br>`speaker` (mag weg): tekst; spreker en datum, elk een `<p>`, ≤ 16 woorden<br>`payoff` (mag weg): label, één regel; de pay-off van de organisatie, ≤ 12 woorden |
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
| `plain-quote-portrait` | Een citaat als titel, met het portret en de naam van wie het zei. (titel ≤ 30 woorden) | `portrait` (mag weg): `<img>` met alt<br>`source`: tekst; `<h3>` met de naam en `<p>` met functie of datum, ≤ 16 woorden |
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
