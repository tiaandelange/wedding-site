# Cursor-prompt — Saterdag 26 September skedule + "Naweek Program" uitleg

> **Hoe om dit te gebruik:** Redigeer Deel 1 (velde) en Deel 2 (die skedule-teks) totdat dit reg lyk.
> Plak dan Deel 3 t/m 6 as die prompt in Cursor (Agent / Composer mode) — dit verwys terug na wat jy hierbo ingevul het.
> Deel 7 is die interne draaiboek vir die seremoniemeester en is **nie** vir die webwerf nie.

---

## DEEL 1 — Redigeerbare velde

Verander net die regterkant. Alles in die prompt verwys hierna.

```yaml
# Mense
SEREMONIEMEESTER:      TBC
TAFELGEBED_DEUR:       TBC
TOESPRAAK_1:           Vader van die bruid
TOESPRAAK_2:           Vader van die bruidegom
TOESPRAAK_3:           Beste man
TOESPRAAK_4:           Strooimeisie
TOESPRAAK_5:           Bruidegom en bruid (dankie)
FOTOGRAAF:             TBC
DJ_MUSIEK:             TBC

# Tye (24-uur, sonder kolon soos die res van die webwerf: 15h30)
GASTE_ARRIVEER:        14h15 – 15h00
SITPLEKKE:             15h15
SEREMONIE:             15h30 – 16h00
KONFETTI:              16h15 – 16h30
CANAPES_EN_FOTOS:      16h30 – 18h00
GROEP & FAMILIEFOTOS:  16h45 – 17h15
BRUIDSPAAR_FOTOS:      17h15 – 18h00
BEWEEG_IN:             17h50
INTRAPSE:              18h00
TOESPRAKE_DEEL_1:      18h15 – 18h45
SPELETJIES:            18h45 – 19h15
HOOFMAALTYD:           19h15 – 20h15
TOESPRAKE_DEEL_2:      20h15 – 20h35
KOEK_EN_NAGEREG:       20h35 – 20h50
EERSTE_DANS:           20h50 – 21h00
DANSVLOER_OOP:         21h00
LAASTE_LIEDJIE:        23h15
AFSLUITING:            23h30

# Inhoud
SPELETJIE_NAAM:        Musical chairs met ’n twist
SPELETJIE_BESKRYWING:  Gryp iets en sit — die musiek stop, jy moet eers ’n item gaan haal voor jy kan sit
KOS_CANAPES:           Ligte canapés en happies
KOS_HOOFMAALTYD:       Hoofmaaltyd word bedien
KROEG:                 Kontant- en kaartkroeg (geen eie drank)
SONSONDERGANG:         ±18h02  # Beestekraal, 26 Sep — bevestig asb met die fotograaf
```

---



## DEEL 2 — Die gaste-skedule (dit gaan op die webwerf)

Dit vervang die ses bestaande blokke onder **Saterdag 26 September · Die Troue**. Vyf fases:

### Fase 1 — Oggend & middag


| Tyd           | Teks                                                  |
| ------------- | ----------------------------------------------------- |
| 09h00 – 10h00 | Koffie en beskuit saam die familie                    |
| 10h00 – 13h00 | Ontspan, gesels en help met die laaste dekor          |
| 14h00 – 14h45 | Gaste arriveer, welkomsdrankie en teken die gasteboek |




### Fase 2 — Die seremonie


| Tyd               | Teks                                     |
| ----------------- | ---------------------------------------- |
| 14h45 – 15h00     | Beweeg na die seremonie-area             |
| 15h00             | Almal neem hul sitplekke in              |
| **15h30 – 16h00** | **Diens en Seremonie — begin stiptelik** |




### Fase 3 — Canapés & fotos


| Tyd           | Teks                                                               |
| ------------- | ------------------------------------------------------------------ |
| 16h15 – 16h30 | Gelukwensinge en konfetti-uitstap                                  |
| 16h30 – 18h00 | Canapés en die kroeg maak oop                                      |
| 16h45 – 17h15 | Familie- en groepfotos — ons roep julle wanneer dit julle beurt is |
| 17h15 – 18h00 | Fotos met die bruidspaar, strooijonkers en strooimeisies           |




### Fase 4 — Die ontvangs


| Tyd           | Teks                              |
| ------------- | --------------------------------- |
| 17h50         | Gaste beweeg in en neem sitplekke |
| **18h00**     | **Die bruidspaar**                |
| 18h05         | Welkom en tafelgebed              |
| 18h15 – 18h45 | Toesprake                         |
| 18h45 – 19h15 | Speletjies                        |
| 19h15 – 20h15 | Hoofmaaltyd word bedien           |
|               |                                   |
| 20h15 – 20h50 | Sny van die koek en nagereg       |




### Fase 5 — Dans & kuier


| Tyd           | Teks                                                          |
| ------------- | ------------------------------------------------------------- |
| 20h50 – 21h00 | Eerste dans, gevolg deur die vader-dogter en moeder-seun dans |
| **21h00**     | **Die dansvloer maak oop**                                    |
| 23h15         | Laaste liedjie                                                |
| 23h30         | Kuier sonder DJ                                               |


**Waarom dit werk:** die 75 minute canapés dek presies die fotosessie, en die laaste 45 minute daarvan val in die goue lig voor sonsondergang (±18h02). Gaste is nooit sonder kos of drank nie. Geen enkele praat-blok is langer as 30 minute nie, en die maaltyd kom voor 20h00 sodat die dansvloer teen 21h00 vol is.

**Een risiko:** as die seremonie of fotos oorloop, skuif alles. Bou 10 minute buffer in by die intrapse (18h00) en hou toesprake tot **4 minute elk** — die seremoniemeester moet dit vooraf afdwing.

---



## DEEL 3 — Prompt vir Cursor: konteks

```
Jy werk in ’n statiese HTML/CSS/JS-webwerf (geen raamwerk, geen bundler).

Lêers wat saak maak:
  index.html   — al die bladsy-inhoud
  styles.css   — al die styl (2580 reëls)
  main.js      — reveal-animasies, nav scroll-spy
  public/      — GEGENEREER. Moenie dit direk redigeer nie. Dit word gebou met
                 `npm run build` (scripts/build-public.mjs kopieer die wortel-lêers oor).

Reëls:
- Alle sigbare teks is in Afrikaans. Behou Afrikaanse tipografie: ’n (regte apostroof),
  en-strepie – vir reekse, en die tydformaat 15h30 (nie 15:30 nie).
- Gebruik slegs bestaande CSS-veranderlikes en die bestaande palet
  (--serif, --fs-heading, --fs-body, --fs-subtext, rgba(42,38,35,…), aksent rgba(142,110,90,…)).
  Moenie nuwe kleure, nuwe fonts of enige biblioteek byvoeg nie.
- Behou die bestaande `reveal` / `data-reveal` / `data-stagger` animasie-hakies.
- Respekteer `prefers-reduced-motion`.
- Moenie enige ander afdeling breek nie (#overview, #story, #palette, #accommodation, #gifts, #info, #rsvp).
```

---



## DEEL 4 — Prompt vir Cursor: opruiming eerste

```
TAAK 1 — Verwyder dooie kode in styles.css.

Die `.it-player*` blok (ongeveer reëls 1137–1240) is ’n desktop-"speler" wat nooit in die
markup bestaan het nie. Dit word aan die einde van die lêer (reëls 2580–2581) weer
doodgemaak met:

    .it-player{ display: none !important; }
    .itinerary__days{ display: grid !important; }

Verwyder:
- elke `.it-player*` reël
- die @media (min-width: 721px) blok wat `.itinerary__days{ display: none }` stel
- die twee !important-oorskryf reëls aan die einde
- die @media (min-width: 721px) blok wat `all: unset` op .it-day__wrap/.it-day__sticky/.it-track/.it-rail toepas

TAAK 2 — Platmaak van die oorblyfsels in index.html.

Elke dag het tans vier geneste omhulsels wat niks meer doen nie:
  .it-day__wrap > .it-day__sticky > .it-track[data-itinerary-track] > .it-rail[data-itinerary-rail]
Die `--slots` inline-styl, `data-itinerary`, `data-itinerary-track` en `data-itinerary-rail`
word nêrens in main.js gelees nie. Verwyder al vier lae en die dooie data-attribute.
```

---



## DEEL 5 — Prompt vir Cursor: die nuwe uitleg

```
TAAK 3 — Herbou #itinerary as ’n vertikale, gefaseerde tydlyn.

Huidige probleem: elke dag is ’n `repeat(auto-fit, minmax(220px, 1fr))` kaart-rooster.
Met 6 stops lyk dit al ongelyk (weeskaarte in die laaste ry) en met die nuwe 20-stop
Saterdag word dit onleesbaar — daar is geen visuele volgorde in ’n rooster nie, en die
oog weet nie of dit links-na-regs of bo-na-onder moet lees nie. ’n Tydlyn los albei op.

Nuwe struktuur per dag:

  <section class="it-day reveal" data-reveal>
    <header class="it-day__head">
      <h3 class="it-day__title">Saterdag <span class="it-day__title-muted">26 September · Die Troue</span></h3>
      <p class="it-day__note">…bestaande nota behou…</p>
    </header>

    <div class="it-day__body">
      <section class="it-phase">
        <h4 class="it-phase__title">Die seremonie</h4>
        <ol class="it-line">
          <li class="it-item" data-key="true">
            <time class="it-time" datetime="2026-09-26T15:30">15h30 – 16h30</time>
            <p class="it-text">Diens en troue — begin stiptelik</p>
          </li>
          …
        </ol>
      </section>
      …herhaal per fase…
    </div>
  </section>

Styl:
- .it-line: `position: relative;` met ’n 1px vertikale lyn as ::before by left: 7px,
  kleur rgba(54,45,38,0.14). list-style: none, padding-left: 26px.
- .it-item: `position: relative;` met ’n 9px ronde kolletjie as ::before op die lyn
  (background rgba(142,110,90,0.55), 2px wit ring sodat dit oor die lyn sit).
  Ruimte tussen items: 18px.
- .it-item[data-key="true"]: kolletjie word 11px en volgekleur rgba(142,110,90,0.9);
  .it-text word --fw-heading. Gebruik dit vir presies drie Saterdag-oomblikke:
  die seremonie (15h30), die intrapse (18h00), en die dansvloer (21h00).
- .it-time: hou die bestaande styl (uppercase, letter-spacing 0.18em, --fs-subtext).
- .it-phase__title: klein, uppercase, letter-spacing 0.16em, kleur rgba(42,38,35,0.45),
  met 22px marge bo en 10px onder. Die eerste fase van ’n dag kry geen boonste marge nie.
- Vrydag en Sondag het te min stops om fases te regverdig — laat hulle `.it-phase__title`
  weg en wys net een `.it-line`.

Desktop (min-width: 900px) — .it-day__body word ’n twee-kolom rooster:
  grid-template-columns: minmax(200px, 260px) 1fr;
  Skuif .it-day__head in die linkerkolom en maak dit `position: sticky; top: 96px;`
  sodat die dag se naam bly staan terwyl die tydlyn verbyskuif. Onder 900px val dit
  terug na een kolom met die kop bo-aan.

Toeganklikheid:
- <ol> nie <div> nie — die volgorde is betekenisvol.
- Gebruik <time datetime="…"> met die ISO-begintyd van elke stop.
- Die fase-titels is <h4> onder die dag se <h3>. Moenie koptekstvlakke oorslaan nie.
- Die kolletjies en die lyn is suiwer dekoratief (::before) en dus onsigbaar vir skermlesers.

Druk-styl — voeg ’n klein @media print blok by: verberg die nav, kroeg-skakels en
knoppies; wys die volle tydlyn in swart op wit; vermy bladsy-breuke binne ’n .it-phase.
```

---



## DEEL 6 — Prompt vir Cursor: inhoud

```
TAAK 4 — Vervang die Saterdag-inhoud.

Verwyder die ses bestaande Saterdag-stops (9h00-10h00 t/m "16h30 - 23h30 Ligte etes
terwyl fotos geneem word, Hoofmaaltyd en Kuier") en gebruik die vyf fases hieronder.

[PLAK HIER DIE TABELLE UIT DEEL 2 — of laat Cursor die lêer lees en verwys na
 "DEEL 2 van CURSOR-PROMPT-saterdag-skedule.md"]

TAAK 5 — Hou die res van die bladsy in sinchronisasie.

a) #overview, die Saterdag-kaart: verander
     .overview__time van "Arriveer 14h00–14h45 · Seremonie 15h30"
     na              "Arriveer 14h00–14h45 · Seremonie 15h30 · Ontvangs 18h00"

b) Voeg by die Saterdag .it-day__note ná die dragkode-sin:
     "Canapés en die kroeg vanaf 16h45 terwyl fotos geneem word. Die ontvangs begin 18h00."

c) FAQ — voeg een nuwe vraag by, direk ná "Wat is die aanbevole dragkode?":
     V: Wanneer eet ons?
     A: Canapés word vanaf 16h45 bedien terwyl die fotos geneem word, en die
        hoofmaaltyd word 19h15 bedien. Die kroeg is oop vanaf 16h45.

d) Kontroleer dat nêrens meer "16h30 - 23h30" of "Ligte etes terwyl fotos geneem word"
   op die bladsy staan nie.

TAAK 6 — Verifieer.
- Laat `npm run build` loop sodat public/ die nuwe weergawe kry.
- Maak die bladsy oop by 375px, 768px, 1280px en 1600px en bevestig: geen horisontale
  scroll, die tydlyn-lyn loop deur, die sticky dag-kop plak net op ≥900px, en die
  drie data-key stops staan uit.
- Bevestig die drie ankerskakels na #itinerary werk nog (nav, hero-knoppie, #overview-knoppie).
```

---



## DEEL 7 — Interne draaiboek (NIE vir die webwerf nie)

Vir die seremoniemeester, fotograaf en venue. Druk dit en gee dit vir julle koördineerder.


| Tyd       | Wat                                                                   | Wie                   |
| --------- | --------------------------------------------------------------------- | --------------------- |
| 07h30     | Hare en grimering begin                                               | Bruid + strooimeisies |
| 09h00     | Koffie en beskuit                                                     | Almal                 |
| 10h00     | Venue-span: stoele, tafels, klank getoets                             | Venue                 |
| 11h00     | Dekor finaal, naamkaartjies uit                                       | Familie + helpers     |
| 12h00     | Ligte middagete vir die bruidspartytjie — **moenie dit oorslaan nie** | Bruidspartytjie       |
| 13h00     | Fotograaf arriveer, detail-skote (ringe, rokke, blomme)               | Fotograaf             |
| 13h30     | Bruidegom en strooijonkers aantrek                                    | Bruidegom             |
| 14h00     | Gaste arriveer, welkomsdrankie, musiek speel                          | Gasheer               |
| 14h30     | Bruid aantrek klaar; bruidegom uit sig                                | Almal                 |
| 14h45     | Gaste beweeg na seremonie-area                                        | Seremoniemeester      |
| 15h00     | Almal gesit; bruidegom en predikant in posisie                        | —                     |
| 15h20     | Bruid arriveer agter die seremonie-area                               | Bruid + pa            |
| **15h30** | **Seremonie begin — stiptelik**                                       | Predikant             |
| ±16h10    | Ringe en gelofte                                                      | —                     |
| ±16h20    | Teken van die register                                                | Bruidspaar + getuies  |
| 16h30     | Uitstap, konfetti, gelukwensinge                                      | Almal                 |
| 16h45     | Kroeg oop, canapés uit                                                | Venue                 |
| 16h45     | Familiefotos — **lys vooraf, roep by naam, 3 min per groep**          | Fotograaf             |
| 17h15     | Bruidspartytjie-fotos                                                 | Fotograaf             |
| 17h30     | Bruidspaar alleen — goue lig (sonsondergang ±18h02)                   | Fotograaf             |
| 17h50     | Seremoniemeester nooi gaste in; kaarte klaar                          | Seremoniemeester      |
| **18h00** | **Intrapse van die bruidspaar**                                       | DJ + Seremoniemeester |
| 18h05     | Welkom en tafelgebed                                                  | Seremoniemeester      |
| 18h15     | Toespraak 1 — vader van die bruid (4 min)                             | —                     |
| 18h22     | Toespraak 2 — vader van die bruidegom (4 min)                         | —                     |
| 18h30     | Toespraak 3 — beste man (5 min)                                       | —                     |
| 18h45     | Speletjie: musical chairs met ’n twist (5–6 rondtes × 4 min)          | Seremoniemeester      |
| 19h10     | Wenner aangekondig, gaste terug na tafels                             | —                     |
| **19h15** | **Hoofmaaltyd bedien**                                                | Venue                 |
| 20h15     | Toespraak 4 — strooimeisie (4 min)                                    | —                     |
| 20h22     | Toespraak 5 — bruidegom en bruid se dankie (8 min)                    | Bruidspaar            |
| 20h35     | Sny van die koek (fotograaf gereed)                                   | Bruidspaar            |
| 20h40     | Nagereg uit                                                           | Venue                 |
| **20h50** | **Eerste dans**                                                       | Bruidspaar            |
| 20h54     | Vader-dogter dans                                                     | —                     |
| 20h57     | Moeder-seun dans                                                      | —                     |
| **21h00** | **Dansvloer oop vir almal**                                           | DJ                    |
| 22h00     | Opsioneel: gooi van die ruiker                                        | Bruid                 |
| 23h30     | Laaste liedjie                                                        | DJ                    |
| 23h30     | Kroeg toe, afsluiting                                                 | Venue                 |




### Musical chairs met ’n twist — hoe om dit te laat werk

Musiek speel, almal stap om die stoele. Musiek stop → jy moet eers ’n **item gaan haal** wat die seremoniemeester uitroep, en dán eers gaan sit. Wie laaste sit of sonder stoel is, is uit.

Voorstelle vir die items, van maklik na moeilik: ’n servet · ’n skoen wat nie joune is nie · iets goud · ’n selfoon van iemand aan ’n ander tafel · ’n handtekening van die bruidegom op jou hand · ’n das om jou kop.

- Begin met 12–16 deelnemers en 11–15 stoele. Meer as dit en dit sleep.
- Hou dit by 5–6 rondtes, hoogstens 25 minute. Die seremoniemeester moet die klok dophou.
- Prys gereed hou (’n bottel wyn of ’n geskenkbewys).
- Vra die DJ vooraf vir ’n snit-lys — die stop moet skerp wees, nie wegvervaag nie.



### Waarop om te let

- **Toesprake is die enigste ding wat regtig oorloop.** Gee elke spreker ’n tydperk skriftelik en laat die seremoniemeester ná die 4de minuut opstaan.
- **Familiefotos is die tweede.** Skryf die groeplys vooraf neer en gee dit vir die fotograaf én vir iemand wat mense kan gaan soek — anders verloor julle 20 minute.
- **Canapés moet stewig genoeg wees.** Gaste eet eers 19h15 en drink van 16h45 af. Praat met die venue oor porsiegroottes.
- **As die seremonie laat begin,** sny die fotos af (nie die canapés nie) en hou 18h00 as die intrapse-tyd. Dit is die anker wat die res van die aand reguit hou.

---

*Alle tye is voorstelle. Bevestig sonsondergang, kombuis-tye en die kroeg se sluitingstyd met Doringrant voordat dit op die webwerf gaan.*