# Milton Winroth — Portfolio 2026
### Strategi, struktur, grafisk manual och produktionsplan

> Detta dokument är sanningskällan för projektet. Allt Milton skickat är strukturerat här, plus research från mwstudio.se, soscalemedia.se och referenssidorna.

---

## 1. Positionering

**Motto:** *A creative problem solver.*

Det är inte en tagline — det är hela sajtens tes. Allt på sidan ska bevisa den meningen.

| | |
|---|---|
| **Vem** | Milton Winroth — designer med design i blodet (pappan drev reklambyråer) |
| **Vad han kallas** | Grafisk designer |
| **Vad han faktiskt är** | Problemlösare som råkar lösa problem med design, kod och system |
| **Nisch, i rätt ordning** | **Content** (statisk grafisk design + video, byggt på riktig data för att konvertera) · **AI-system & workflows** · Brand & identitet · UX/UI · Webbdesign & utveckling · Fysisk design |
| **AI-positionering** | Expert på AI för kreativitet — både för att skapa content och för att bygga workflows som effektiviserar arbetet. Detta är inte en fotnot utan ett eget avsnitt på startsidan. |
| **Nu** | Grafisk designer på SoScale Media — performance-driven content-byrå. Kreativ som presterar, byggd på riktig data och riktiga insikter. |
| **Tidigare** | Webbson — UX-designer / AD / webbutvecklare, hela processen från idé till kod |
| **Mottagare** | Arbetsgivare, byråchefer, kreativa chefer, rekryterare. Sekundärt: potentiella kunder. |

### Tonläge — den svåraste balansen

Han **är** duktig, men får inte låta självgod. Lösningen är enkel och genomgående:

> **Beviset skryter. Rösten är lugn.**

- Adjektiven tas bort ur texten och läggs i arbetet. Inte *"prisbelönt kreativ visionär"* — utan *"50+ sidor, ny identitet, 4 personer, WordPress. Så här tänkte vi."*
- Första person, kort, rakt, aldrig byråsvammel.
- Siffror och process bär självförtroendet. Rösten får vara nyfiken och generös.
- Erkänn teamet. *"Tillsammans med teamet och kunden…"* — ödmjukhet som inte krymper insatsen.
- Humor får finnas i mikrodoser (menytexter, easter eggs, 404) — aldrig i själva casen.

**Rösttest före varje mening:** *Skulle jag säga det här högt till någon jag respekterar, utan att skruva på mig?*

---

## 2. Sitemap

```
/                     Startsidan — storyn (huvudleveransen)
/work                 Alla case, filtrerbara på kategori
/work/<slug>          Case-mall, adaptiv per kategori
/about                Längre story, bakgrund, verktyg, tidslinje
/lab                  Experiment, AI-system, motion-tester   ← differentiator
/contact              Egen sida + alltid närvarande i footern
/styleguide           Levande designsystem (dolt i nav, länkat i footern)
404                   Egen, med attityd
```

**Varför `/lab`:** Den skiljer honom från 90 % av alla designerportfolios. Den bevisar "bygger system, kodar smarta lösningar" utan att det behöver bli ett fullskaligt case. Låg tröskel att fylla på — och exakt det en arbetsgivare fastnar på.

**Varför `/styleguide`:** En utvecklare som blir nyfiken och gräver i koden hittar en riktig token-baserad designmanual. Det är ett bevis i sig.

---

## 3. Startsidan — storyn, scen för scen

Startsidan är en berättelse i fyra akter: **vem → vilka problem → beviset → inbjudan.**

| # | Sektion | Innehåll | Signaturrörelse |
|---|---|---|---|
| 00 | **Intro** | Kort maskerad wordmark-reveal, max 1,2 s, hoppbar, bara vid första besöket (sessionStorage) | Clip-path-svep |
| 01 | **Hero** | `A creative problem solver.` i display-skala. Underrad: vad det betyder. Meta: plats + var han jobbar nu | Radvis maskreveal vid load → rubriken skalar ner och dockar in i navet vid scroll |
| 02 | **Statement** | Ett stycke om vem han är. "Design i blodet", pappans byråer, varför han gör det här | Ord-för-ord opacitetsscrub |
| 03 | **Problem jag löser** | **Fyra akter, fyra rörelseriktningar.** Ned-höger → i sidled → ned-vänster → upp-höger. Sidan scrollar fortfarande bara vertikalt; det är innehållet som rör sig tvärs över den. Grafiken är scenografi: uppförstorad, beskuren av aktens kanter, och driver mot texten så de läser som två plan. Akt 2 är ett pinnat horisontellt spår där AI-pipelinen läses vänster till höger | Riktningsvektorer + horisontellt spår |
| 03b | **Statement-scen ×4** | Helskärm, nästan tomt, en enorm mening. Varje rad bär eget `--depth` så meningen dras isär när den korsar vyn och sluter sig när den lämnar. Hörnmarkörer ramar in den som en markerad frame i ett designverktyg | Radparallax + konstruktionsraster |
| 04 | **Utvalt arbete** | Content-caset mörkt, systemcaset ljust. Enorm media — rubriken står stilla medan bildkolumnen rullar förbi | Sticky caption + media-parallax |
| 05 | **Vad jag gör** | Split: en grafik håller vänsterspalten stilla medan sju kapabiliteter ligger som stor typ direkt på ytan, hårfina linjer emellan. Content och AI leder | Stagger + accentlinje på hover |
| 06 | **AI** | **Eget avsnitt, inverterat.** Två halvor: *creative output* (fler riktningar, testade mot riktig data) och *workflows* (den repetitiva halvan av veckan tillbaka). Plus en rad om vad han inte gör | Stagger + inverterad yta som bryter sidan |
| 07 | **Så jobbar jag** | 4 steg: Förstå → Utforska → Bygga → Bevisa | Horisontell pinnad sekvens (desktop) / vertikal stack (mobil) |
| 08 | **Siffror** | Bara sanna siffror, lågmält satta | Räknare som triggas i viewport |
| 09 | **Nu** | SoScale, data-driven kreativ, AI-workflows, verktygsmarquee | Oändlig marquee, riktning kopplad till scroll |
| 10 | **Footer-CTA** | Enorm rubrik som CTA. Mejl, socials, lokal tid i Stockholm, gigantisk wordmark som fyller vyn | Magnetisk knapp + wordmark som reser sig ur underkanten |

### Navigationen — tre delar, en uppgift var

En rad som försöker vara både sajtmeny och sidmeny är anledningen till att den gamla pillen hade wordmark, fyra ankare och en hamburgare som slogs om samma 400 px. Uppdelat blir varje del ärlig om sitt innehåll.

| | Var | Vad | När |
|---|---|---|---|
| `.topbar` | Överst i heron, i flödet, **ingen bakgrund** | Sajtmeny: namnet som logotyp, Case studies, About me, Contact | Bara högst upp. Scrollar bort och kommer aldrig tillbaka |
| `.dock` | Fast, **nederkant mitten**, glas | Sidmeny, bara ankare: What I solve · Work (med Content, Systems, Brand & web) · What I do · AI · About me | Kommer in vid 70 % av en skärmhöjd |
| `.menu-btn` | Fast, **övre högra hörnet**, glas | Öppnar samma gardin, nu med sajtmenyns val | Kommer in med docken |

Docken markerar den sektion som ligger under mitten av skärmen — en innehållsförteckning som inte säger var man är, är bara en lista. Scrollprogressen ritas på dockens egen kant, eftersom det är sidmenyn som äger "hur långt in är jag".

Under 48 rem får docken horisontell scroll istället för att radbrytas — en pill i två rader slutar läsa som en dock — och Work-undermenyn blir en del av raden, eftersom ett absolut positionerat element inuti en scrollcontainer skulle klippas av den.

### Menyn (gardinen)

Flytande pill, centrerad överst, glider undan vid scroll ner och tillbaka vid scroll upp. Pillen är samtidigt **scroll-progressindikator**.

Vid klick: helskärmsoverlay som expanderar ur knappen (clip-path), menyrader i stor display-typ med staggered maskreveal, hover på en rad visar ett projektbildförhandsvisning som följer musen. Sidokolumn med mejl, socials, lokal tid. Escape och klick utanför stänger. Fokusfälla när den är öppen.

---

## 4. Case-mallen — adaptiv per kategori

**Gemensam ryggrad** (alla case):

```
Hero        Titel · kund · år · roll · byrå · taggar · huvudbild
Kontext     2–3 meningar. Vem kunden är, var de stod.
Problem     Formulerat rakt. Gärna som citat från kunden.
Angreppssätt Vad vi gjorde för att förstå. Research, intervjuer, analys.
Process     Skisser, iterationer, vägval — inklusive de som skrotades.
Lösning     Den visuella huvudrätten. Stort, luftigt, fullbredd.
Resultat    Vad det ledde till. Siffror om de finns, annars konkret utfall.
Leverabler  Punktlista.
Nästa case  Alltid en väg vidare.
```

**Adaptiva moduler:**

| Kategori | Extra moduler |
|---|---|
| **Web / UX** | IA-diagram, wireframe→final-jämförelse (drag-slider), enhetsmockups, live-länk, CMS-vy |
| **Brand & identitet** | Logotypraster, färgpalett, typografispecimen, applikationer, före/efter |
| **Annons** | Videogrid som spelar i viewport, hook/variant-testning, resultatsiffror, plattformsformat |
| **Fysisk design** | Fotoledd, fullbredd, minimal text, detaljmakron |
| **AI-system** | Flödesdiagram, före/efter-tid, stack, kort skärminspelning |

### Case-portföljen — och den viktigaste korrigeringen

> **Problemet med nuvarande portfolio:** den läser som "webbdesigner och UX-designer". Det stämmer inte längre. Idag är huvuddelen av arbetet **content** — statisk grafisk design och video, byggt på riktig data och gjort för att konvertera — plus **system som sparar tid och pengar** åt företag. Nya sajten måste aktivt rätta det intrycket, inte bara lägga till en rad.

**Så här korrigeras det, konkret:**

- Startsidans `Selected work` visar **fyra** case, i ordningen content → system → brand & webb. Aldrig fler webbcase än content/system-case på startsidan.
- Varje case-kort har en **kategorietikett i accentfärg** som första element: `Content` · `Systems` · `Brand & web` · `Physical`.
- Bento-sektionen leder med Content (bred ruta) och AI-system (svart ruta). Webb ligger som djup, inte som rubrik.
- `/work` har filter på kategori, och landar default på *alla* — inte på webb.

**Case att bygga:**

| # | Case | Kategori | Status |
|---|---|---|---|
| 1 | **Performance creative** (SoScale) — statisk + motion + film, kundresearch, hypotestestade hooks, ombyggt månadsvis mot data | Content | **Måste produceras** |
| 2 | **AI-produktionssystem** — pipeline för generering, versionering och resizing. Tid och pengar sparade, dokumenterat och överlämnat | Systems | **Måste produceras** |
| 3 | **Aros Auto** (2025, Webbson) — bento-estetik, ny identitet, 50+ sidor, WordPress/Gutenberg, Blocket-integration | Brand & web | Underlag finns |
| 4 | **Logimark** (2025, Webbson) — "platt och anonymt" → ny identitet, markeringsgrafik som koncept, 9 designrevisioner | Brand & web | Underlag finns |
| 5 | **Friends Agenda** (2024, Webbson) — modemagasin som referens, seriff som seniorsignal | Brand & web | Underlag finns, ligger på `/work` |
| 6 | **Sveaviken PM** (2024, Webbson) — avslappnad ton i formell bransch, WCAG | Brand & web | Underlag finns, ligger på `/work` |
| 7 | **Print & fysiskt** — posters, förpackning, skyltar | Physical | **Behöver samlas ihop** |

> **Att lösa:** SoScale-arbetet är sannolikt sekretessbelagt per kund. Lösning: casea *metoden* istället för kunden — anonymiserade format, hook-tester, hur data blir kreativa beslut, och den AI-workflow som byggts internt. För systemcase: mät i **sparad tid och pengar**, det är språket en arbetsgivare räknar i.

### Extra modulkrav för de två nya kategorierna

| Kategori | Moduler som gör caset trovärdigt |
|---|---|
| **Content** | Videogrid som spelar i viewport · hook/variant-jämförelse sida vid sida · insikten bakom (research → hypotes → kreativt beslut) · resultatsiffror · plattformsformat |
| **Systems** | Flödesdiagram före/efter · **timmar och kronor sparade per månad** · vad som automatiserades och vad som medvetet lämnades manuellt · stacken · kort skärminspelning |

---

## 5. Grafisk manual (kort)

### 5.1 Typografi

**Rekommenderad riktning — "Quiet Confidence"**

| Roll | Typsnitt | Varför |
|---|---|---|
| Display & UI | **Satoshi** (Fontshare, gratis kommersiellt) | Inters renhet men med egen karaktär — lite mer geometrisk, öppnare, mindre "default". Variabel, 9 vikter. |
| Accent | **Instrument Serif Italic** (Google) | Används på **ett ord per rubrik**, aldrig mer. `A creative *problem* solver.` Ger sidan en signatur utan att bli tung. |
| Meta & etiketter | **JetBrains Mono** (Google) | Endast 11–13 px versaler för labels, år, siffror, taggar. Signalerar system och kod — vilket är sant om honom. |

Alternativ som är förberedda i `/styleguide`: **B — Editorial Edge** (Instrument Sans + Instrument Serif — samma superfamilj, tätare och mer redaktionellt) · **C — Technical Grotesk** (Space Grotesk + Archivo, mer grafiskt studio-uttryck).

**Skala (flytande, clamp):**

| Token | Storlek | Radavstånd | Tracking |
|---|---|---|---|
| `display-xl` | `clamp(3.5rem, 11vw, 11rem)` | 0.88 | −0.04em |
| `display-l` | `clamp(2.75rem, 7vw, 6rem)` | 0.92 | −0.03em |
| `h2` | `clamp(2rem, 4.5vw, 3.5rem)` | 1.0 | −0.02em |
| `h3` | `clamp(1.375rem, 2.4vw, 2rem)` | 1.15 | −0.01em |
| `body-l` | `clamp(1.125rem, 1.6vw, 1.5rem)` | 1.5 | 0 |
| `body` | `1rem` | 1.6 | 0 |
| `label` | `0.75rem` | 1.35 | 0.01em, gemener — **chip, inte versaler** |

**Om etiketterna.** Liten versaltext med brett teckenmellanrum är standardreflexen för en överrubrik, och den kostar mer än den ser ut att göra: versaler tar bort de ordformer ögat läser efter, och spärrningen som gör versaler läsbara är det som får raden att läsa som *textur* istället för som ett ord. En ramad chip gör samma jobb — markera som meta, skilj från rubriken — och förblir ett läsbart ord. Monon är kvar; det var versalerna och spärrningen som var problemet, inte snittet.

Undantagen är utan ram: roterade kantetiketter, scroll-ledtråden, bildtexter i figurer, sifferkolumner, och bildtexter under statistik (en pill runt "Pages designed and shipped" läser som en kategori siffran tillhör, vilket är fel relation).

Radlängd: 60–72 tecken desktop, 38–55 mobil.

### 5.2 Färg

Nästan allt är svart och vitt. Sekundära ytor grupperar. Accenten är sällsynt — max ~2 % av ytan.

| Token | Värde | Användning |
|---|---|---|
| `--ink` | `#0B0B0C` | All text, inverterade sektioner. Inte ren svart — mjukare, dyrare. |
| `--paper` | `#F7F6F3` | Sidbakgrund. Varmvitt, som Friends Agenda. |
| `--white` | `#FFFFFF` | Kort ovanpå paper |
| `--sand` | `#EDE8E1` | Varm grupperingsyta |
| `--mist` | `#E4E7E9` | Sval grupperingsyta |
| `--grey-100…900` | härledd skala | Ramar, meta, disabled |
| `--accent` | *att välja* | Länkar, CTA, hover, aktiv nav, ett understruket ord |

Accentkandidater (växlingsbara live i `/styleguide`): **Cobalt `#1B2CFF`** (precision, system — rekommenderad mot varmt papper) · **Signal `#FF4A1C`** (energi, annons) · **Forest `#0F5132`** (lugn, premium).

Kontrastkrav: allt textbärande ≥ 4.5:1. Accenten används aldrig ensam som betydelsebärare.

### 5.3 Rum, radie, raster

- **Bas:** 4 px. Skala: `4 8 12 16 24 32 48 64 96 128 192 256`
- **Sektionsluft:** `clamp(96px, 12vw, 200px)` vertikalt
- **Radie:** `2 / 4 / 6 / 8 / 12` + `pill` för knappar och nav. Hörnet ska registreras som avsiktligt, inte som mjukt — över ~12 px börjar det läsa vänligt istället för precist.
- **Grid:** 12 kolumner, max 1440 px, gutter 24 px, marginal `clamp(20px, 4vw, 64px)`
- **Bento:** subgrid på samma 12 kolumner, rutor i 4/6/8-kolumnsbredder, aldrig fler än 3 storlekar per sektion
- **Brytpunkter:** 375 / 768 / 1024 / 1440

### 5.4 Rörelse

**Bibliotek:** [Motion](https://motion.dev) (`animate`, `scroll`, `inView`, `stagger`) + [Lenis](https://lenis.dev) för scroll. Pinning görs med CSS `position: sticky` — inte JS. Ingen GSAP behövs.

**Lenis:** `lerp: 0.09`, `wheelMultiplier: 1`, `smoothWheel: true`, `syncTouch: false` (mobilen behåller sitt native scroll — det är alltid rätt).

**Tider:** mikro 150–250 ms · reveal 600–900 ms · overlay 700 ms
**Easing:** reveal `cubic-bezier(0.16, 1, 0.3, 1)` · overlay `cubic-bezier(0.65, 0, 0.35, 1)` · exit ≈ 65 % av enter

**Signaturrörelser.** Disciplinen är fortfarande poängen — samma sex rörelser återanvänds, plus tre scenövergångar som binder ihop sektionerna.

*Rörelser i sektionerna:*

1. **Radmask** — **varje rubrik på sidan**, inte bara heron. Raderna svänger upp ur en clip-mask, en efter en, 75 ms stagger, triggat när sektionen kommer in i vyn.

   Två saker gör det möjligt. `split.js` mäter de faktiskt renderade radboxarna och bygger `.line`-strukturen själv — radbrytningarna beror på skärmbredden, så de kan inte skrivas för hand. Eftersom uppdelningen sker *efter* layout ärver den vad `text-wrap: balance` redan bestämt: animationen bryter exakt där typografin bröt. Den delar om vid resize och när typsnitten landar, bevarar inline-markup (`<em>` behåller sitt element genom att förfaderskedjan klonas per rad) och sätter `aria-label` så skärmläsare får en mening, inte en ordlista.

   Och rörelsen ligger i **Motion, på en spring** — inte i CSS. Det är den enda plats på sidan där en spring bär sin kostnad: en cubic-bezier når sitt slutvärde och tvärstannar, en spring lägger sig till ro. På en rad display-typ är det skillnaden mellan typ som *har tyngd* och typ som *har flyttats*. CSS har ingen spring, så den kan inte vara en token.

   Utgångsläget skrivs av skriptet, aldrig av stilmallen. En rubrik vars script inte kommer fram är därmed bara en rubrik — ingenting göms i väntan på JavaScript som kanske aldrig laddar.
2. **Ordscrub** — statement-stycken tänds ord för ord kopplat till scrollposition
3. **Stagger-up** — grid och listor, 60 ms per objekt, `y: 24px`, `opacity: 0→1`
4. **Mediaparallax** — bilder driver långsammare än sidan, `data-parallax="0.1–0.22"`
5. **Sticky-stack / sticky-caption** — problemkort som lägger sig på varandra, och case-rubriker som står stilla medan bildkolumnen rullar förbi
6. **Magnetisk CTA** — primärknappar dras mot muspekaren, inverterad cursor

*Scenövergångar mellan sektionerna:*

7. **Zoom** — sidan faller rakt in i en bild. Ett litet ramat fönster mitt på skärmen öppnas till fullbredd medan bilden inuti lugnar sig från en översatt beskärning. Byter samtidigt sidan från ljus till mörk.
8. **Slide** — en fullbredds panel kommer in från sidan och lämnar över till nästa sektion. Lagret under driver åt andra hållet, så de läser som två plan.
9. **Curtain** — sektionen under krymper och mörknar när nästa lyfter över den.

**Så är det byggt.** Allt scrolldrivet går genom `scene.js`, som skriver **en enda** custom property — `--progress` (0→1) — på varje `[data-scene]`. Ingen övergång har eget JavaScript; koreografin ligger i CSS och läser den siffran. Det betyder en mätning per scen och per frame istället för en per effekt, och att en ny övergång aldrig kräver mer script.

**Glas — etsat, inte blankt.** En gradient över ytan läser som en *målad* yta. Frostat glas läser som fyra separata saker: hård blur, en **platt** ton utan ramp, en sprayad grain ovanpå ytan som *är* frosten, och hårfina kanter — ljus längst upp, mörk längst ner. Djupet kommer från kanterna och skuggan, aldrig från en gradient. Alla ligger som `--glass-*`-tokens som `[data-ground]` byter, så en panel aldrig behöver veta vilken botten den landade på.

Två gränsvärden som hittades genom att testa: tonen får inte över ~0.4 alpha (då slutar panelen släppa igenom det som ligger bakom, och det är bara ett kort med en blur den aldrig använder), och grainen inte över ~0.3 (då börjar den äta brödtexten och panelen läser som sandpapper). Navet är undantaget — det flyter utanför alla `[data-ground]` och kan inte tona om sig per sektion, så det får en tjockare ton eftersom läsbarheten i wordmarken väger tyngre än genomsläppet.

**Canvas-budget — den viktigaste prestandaregeln på sidan.**

En canvas i viewport-storlek är ~16 MB vid DPR 1.5, och det finns tretton av dem. Allokerade alla på en gång blir det en femtedels gigabyte GPU-yta för sektioner besökaren kanske aldrig når — och kostnaden betalas inte vid load, den *ackumuleras* i takt med att var och en rasteriseras första gången. Det är precis vad "sidan blir seg efter att man scrollat ett tag" känns som.

Två regler följer:

1. **Allokera bara det som är nära.** `render()` ger en canvas sin buffer först när den är inom en viewport från skärmen och frigör den (`width = 0`) när den lämnar. Stationärt läge blir 2–3 canvasar i stället för tretton: **166 MB → 43 MB**, och siffran skalar med vad som syns i stället för med hur långt man scrollat.
2. **Inget `will-change` på dem.** Det skulle befordra alla tretton till permanenta kompositörslager, och en viewport-stor canvas är ett dyrt lager att hålla. Elementet får ett lager ändå medan dess transform animeras, vilket är den enda gången det behövs.

**Seghet är sällan bildfrekvens.** Sidan låg på låst 60 fps och kändes ändå trög. Orsaken var Lenis `lerp: 0.09` — varje frame stänger 9 % av återstående sträcka, så en enda scroll-knuff tog **1 228 ms** att lägga sig. Det man känner är inte frame-budgeten utan input-latensen. `0.16` halverar svansen till ~680 ms och läser fortfarande tydligt som mjukad scroll. Mät det med "hur lång tid tar det innan sidan står still efter en knuff", inte med fps.

**Läs aldrig layout i en loop över element.** `split.js` delade en rubrik i taget: skriv, läs, skriv, läs — och varje läsning efter en skrivning tvingar fram en ny layout av hela sidan. Över trettio rubriker mätte det som **en enda task på 92 ms**, alltså sex tappade frames på raken. Uppdelat i tre faser — förbered alla, mät alla, bygg alla — blir det en layout för hela mängden. Samma mönster gäller överallt i projektet: `masonry.js` och `scene.js` är byggda på samma regel.

**Mät rätt sak.** `requestAnimationFrame`-intervall ser bra ut även när huvudtråden är blockerad, eftersom kompositören sköter scrollen — den mätningen missade det här helt. Använd `PerformanceObserver` på `longtask`; det är det måttet som motsvarar upplevd hackighet. Nuvarande läge: **noll långa tasks** genom hela sidan på både 375 och 1440.

**Partikel-canvas.** Inte dekorativ dimma — det här ritar insidan av en designfil: ett konstruktionsraster, några streckade accentguider, och handtagsstora fyrkanter på tre djup som var och en rör sig i sin egen takt mot scrollen. Det är därifrån större delen av sidans rumskänsla kommer. Färg och vikt läses från CSS (`--particle-ink`, `--particle-grid-alpha`…), så en canvas i en mörk sektion ritar sig själv ljus utan att veta något om sektionen — och märkena kan finjusteras i stilmallen som allt annat. Allt ritas i ett svep på scroll-loopen: ingen DOM per partikel, inga timers, ingenting animeras när sidan står still.

**Ljus/mörk — mörkt är sällsynt, och därför betyder det något.**

Sidan är papper. Exakt **två** block är mörka: `#ai`, som är argumentet sajten gör, och footern, som är slutet. 13 % av höjden. Allt annat ljust.

Vägen hit är värd att komma ihåg, för båda felen är lätta att göra om:

1. Först växlade sektionerna ljust/mörkt varannan. Det *lät* som rytm men blev dekorativt — när bytet sker hela tiden slutar det bära information och läses som brus.
2. Sedan mättes balansen i antal sektioner, inte i pixlar. Det såg jämnt ut på papperet medan sidan i själva verket låg på 69 % mörkt, eftersom de mörka sektionerna råkade vara de höga. **Mät alltid i höjd.**

Fullbleed-bildsömmarna (zoom och slide) ger den svärta rytmen fortfarande behöver, utan att någon sektion behöver deklarera den. Övergången är dessutom starkare nu: ljus bild → hård kant → svart AI-sektion.

En regel som följer av det: allt som ligger *ovanpå* ett foto måste vara mörktonat oavsett sektionens botten, eftersom fotot kan vara vad som helst. `.media__chip` lärde sig det den hårda vägen — ljust glas fungerar bara över bilder man själv kontrollerar.

**Sömmar mellan sektioner.** Fyra scenövergångar bär de tyngsta bytena: två *zoom* (sidan faller in i en bild) och två *slide* (en panel kommer in från sidan). De sitter där berättelsen byter läge — in i beviset, in i volymen, in i AI — inte jämnt utspridda.

### Layoutprinciper — varför nästan inga kort

Ett kort är en behållare man tar till när layouten inte gör jobbet. Sidan bär nu innehållet med rastret och hårfina linjer istället, vilket läser tystare och rymmer mycket mer luft vid samma mängd innehåll. Fyra mönster gör hela jobbet, alla i `components/editorial.css`:

| Mönster | Vad det gör | Var |
|---|---|---|
| `.split` | Asymmetrisk tvåspalt, 4/7 eller 7/4, där ena sidan är sticky | Kapabiliteter, AI |
| `.problem-row` | Citatet hänger av rastret på 7 kolumner, grafiken sitter mitt emot på 4, svaret skjuts ner i en smal spalt som medvetet *inte* ligger bredvid citatet. Varannan rad speglas | Problem jag löser |
| `.rows` | Stor typ som lista med hårfina linjer. Ersätter en ruta-grid när innehållet är korta etiketter. Accentlinjen ritar in sig på hover | Kapabiliteter |
| `.rail` | Roterad etikett som löper uppför sektionens vänsterkant. Kostar ingen vertikal höjd och ger ögat något att hitta där inget annat bor | Problem, AI |

Case-korten i *Brand & web* ligger inte längre i spalter: det första hänger från vänsterkanten och slutar tidigt, det andra börjar sent och faller långt ner. Förskjutningen *är* kompositionen.

**Glaset har fått ett tydligare jobb.** Från 18 paneler ner till fyra användningar: det flytande navet, mejlknappen i footern, och frostade etiketter som ligger *ovanpå* bilder. Det är där blur har riktigt innehåll att arbeta med — en glaspanel mot en nästan tom yta är bara ett kort med en oskärpa den aldrig använder.

**Copy-passet.** Alla brödtexter i de här sektionerna kortades till en eller två meningar. Det som föll bort var förklaringar av det som redan syns i rubriken.

**Tillgänglighet:** `prefers-reduced-motion: reduce` → Lenis av, all parallax av, alla reveals blir omedelbar opacitet. Detta byggs in från början, inte i efterhand.

**Mobil:** reveals och lätt parallax behålls (det är där känslan sitter). Pinnade horisontella sektioner blir vertikala stackar. Magnetisk cursor och wordmark-preview stängs av. Ingen sektion får kosta mer än 16 ms per frame.

---

## 6. Teknik

### Stack

Ren **HTML + CSS + JavaScript**, ES-moduler, **inget byggsteg**. Bibliotek via pinnad ESM-CDN.

```
motion   ~12.x   animate / scroll / inView / stagger
lenis     ~1.x   smooth scroll
```

Att inte ha ett byggsteg är ett medvetet val: sajten är statisk, den laddar snabbt, den går att hosta var som helst, och en utvecklare kan öppna `index.html` och direkt läsa vad som händer. `node` på maskinen är v16 — för gammalt för Vite/Next ändå.

### Filstruktur

```
portfolio/
├── index.html
├── work/index.html
├── work/aros-auto/index.html
├── about/index.html
├── lab/index.html
├── contact/index.html
├── styleguide.html
├── 404.html
├── assets/
│   ├── css/
│   │   ├── tokens.css        alla custom properties — enda stället med råa värden
│   │   ├── reset.css
│   │   ├── base.css          typografi, element
│   │   ├── layout.css        grid, container, sektioner
│   │   ├── components/       nav.css, hero.css, bento.css, case-card.css …
│   │   └── main.css          @layer-ordning + imports
│   ├── js/
│   │   ├── main.js           orkestrerar, inget annat
│   │   └── modules/
│   │       ├── smooth-scroll.js
│   │       ├── reveal.js     läser data-reveal
│   │       ├── parallax.js   läser data-parallax
│   │       ├── menu.js
│   │       ├── cursor.js
│   │       ├── marquee.js
│   │       ├── counter.js
│   │       └── motion-prefs.js  central reduced-motion-vakt
│   ├── fonts/                self-hostade woff2
│   └── media/                avif + webp + fallback
└── data/
    └── projects.json         allt innehåll, så nya case är en JSON-post
```

### Kodprinciper (det en nyfiken utvecklare ska se)

- `@layer reset, tokens, base, layout, components, utilities` — kaskaden är designad, inte tillfällig
- **Inga råa hex- eller px-värden utanför `tokens.css`.** Allt går via custom properties.
- Animation är **deklarativ i markup**: `data-reveal="lines"`, `data-parallax="0.2"`, `data-stagger="60"`. JS läser attribut, HTML beskriver intention.
- Varje JS-modul exporterar `init()` och `destroy()`. Ingen global state.
- Semantisk HTML, korrekt rubrikhierarki, `skip-link`, synlig `:focus-visible`.
- Bilder: `AVIF → WebP → JPG` via `<picture>`, `srcset`, `width`/`height` satta, `loading="lazy"` under folden.
- Typsnitt self-hostas som woff2 med `font-display: swap` och `preload` på de två kritiska.
- Mål: LCP < 2,0 s, CLS < 0,05, 100/100/100 på Lighthouse a11y och best practices.

### Om motionsites.ai och 21st.dev

Båda levererar **React + Tailwind + Framer Motion**. De går inte att klistra in i en vanilla-sajt.

**Rekommendation:** använd dem som *effektreferens* — jag portar rörelsen till Motion + CSS. Det ger renare kod, mindre vikt, och en sajt som är hans egen istället för hopsatt.

**Alternativet** vore React + Vite för direkt copy-paste, men då krävs Node 18+ (uppgradering) och sajten blir tyngre och mindre läsbar för den som gräver i koden. *Vi går på vanilla om inget annat sägs.*

---

## 7. Copy — riktning och utkast

Språk: **engelska** (hans befintliga material, LinkedIn och portfolio är engelska, och det är standard i kreativa branschen — även mot svenska arbetsgivare).

### Hero
```
Milton Winroth — Designer, Sweden

A creative
problem solver.

I design brands, interfaces and advertising —
and build the systems that make them work harder.

Currently at SoScale Media · Available for the right thing
```

### Statement
> Design has been around me my whole life. My dad ran advertising agencies, and I grew up watching ideas turn into things people could actually see. I do the same thing now, mostly on screens. Someone brings me something messy — a brand that doesn't land, a site nobody can navigate, a process eating the team's week — and I find the shape of the problem before I start making things. The making is the fun part. The finding is the job.

### Problem jag löser
| Problemet, med kundens ord | Svaret |
|---|---|
| "Our brand doesn't look like anyone." | Identity systems built to be used, not admired. Type, colour, components — handed over so the team can keep building. |
| "People can't find what they came for." | Research, information architecture and interfaces that get out of the way. Tested, accessible, and defensible. |
| "Our ads get seen, not remembered." | Creative grounded in real data and real insight. Hooks tested, formats built for the platform they live on. |
| "The team spends its day doing this by hand." | Workflows, component libraries and AI systems that give hours back — without flattening the craft. |

### Process
```
Understand   Interviews, data, competitors. I want the real problem, not the stated one.
Explore      Wide and fast. Directions on the table before anything gets precious.
Build        Figma libraries, components, code. Made to be handed over and lived with.
Prove        Ship, measure, adjust. Design that performs is the only kind worth defending.
```

### Footer-CTA
```
Got something
worth solving?

hello@mwstudio.se
```

### Att bekräfta innan copy låses
- Riktiga siffror till sektion 07 (år i yrket, antal projekt, sidor levererade, assets testade)
- Om SoScale-siffror (19 % lägre CPA, 10 000+ assets, €12M+) får refereras i hans egna case
- Titel som ska stå i heron: *Designer* eller *Graphic Designer* eller *Designer & developer*

---

## 8. Produktionsplan

| Fas | Innehåll | Status |
|---|---|---|
| **0** | Beslut: typsnitt, accentfärg, språk, avsändare | ✅ Klar |
| **1** | `tokens.css` + `styleguide.html` — designsystemet levande i webbläsaren | ✅ Klar |
| **2** | Statisk stomme: CSS-arkitektur, nav, meny, alla hemsektioner, footer | ✅ Klar |
| **3** | Rörelselagret: Lenis, de sex signaturrörelserna, cursor, marquee | ✅ Klar — körs live på `localhost:5173` |
| **4** | Case-mall + `/work`, `/about`, `/lab`, `/contact`. Content- och systemcasen först | ⬜ Nästa — behöver ditt material |
| **5** | Copy-pass: alla texter genom rösttestet | ⬜ |
| **6** | Bildoptimering, self-hostade typsnitt, 404, favicon, OG-bilder, Lighthouse | ⬜ |
| **7** | Deploy | ⬜ |

### Köra sajten lokalt

```
node "Portfolio Milton/dev-server.js"
```

Öppnar på `http://localhost:5173`. Dependency-fri — sajten har inget byggsteg, så dev-servern har inga paket heller.

---

## 9. Beslut

**Låsta 2026-07-31:**

| Beslut | Val |
|---|---|
| Accentfärg | **Cobalt `#1B2CFF`** |
| Typsnitt | **Riktning A** — Satoshi + Instrument Serif Italic + JetBrains Mono |
| Språk | **Engelska** |
| Avsändare | **Milton Winroth** (wordmark), **MW** (monogram, favicon) |
| Stack | Vanilla HTML/CSS/JS, inget byggsteg, Motion + Lenis |

**Kvar att lösa — blockerar fas 4–5, inte fas 2–3:**

1. **Content-caset** — vilka annonser (statiskt + video) får visas? Anonymiserat eller med kund? Finns det före/efter-siffror?
2. **Systemcaset** — vilket system? Vad automatiserades, och hur många timmar/kronor sparar det per månad? Det är den siffran hela caset ska hänga på.
3. **Bildmaterial** — vilka case finns det highres-material till? Vad behöver produceras eller mockas upp? Video behöver `.mp4` + `.webm` + poster.
4. **Print & fysiskt** — finns foton på posters, förpackningar, skyltar?
5. **Riktiga siffror** till sektion 08 — markerade med `data-tbc` i koden. Endast "70+ sidor" är belagt i dagsläget.
6. **Titel i heron** — *Designer*, *Graphic Designer* eller *Designer & developer*
7. **Mejladress** — `hello@mwstudio.se` eller annan
