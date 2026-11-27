### Toegevoegd

- Tests voor de controle, het deck, de opdracht en de releasescripts; `npm test` draait ze, ook in CI. (#19)

### Opgelost

- De controle meldt een titel die boven uit de blauwe band loopt: `de titel past niet`. (#19)
- De controle telt de woorden van twee elementen die in de markup tegen elkaar staan (`</h3><p>`) niet meer als één woord. Een veld dat net binnen zijn grens leek te blijven, kan nu een melding geven. (#19)
- Met `?check` geeft `window.slidesCheck()` dezelfde meldingen als zonder: de markering van een eerdere melding telt niet als opmaak in de inhoud. (#19)
