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

> **Riktning B — "Poster", låst 2026-10-04.** Ersätter v0.1 (Satoshi + Instrument Serif + Cobalt). Läst ur två referenser: en ljus poster på en konjaksfärgad läderfåtölj i ett mörkt rum med ett solstråk över, och en poster där rubriken är så stor att den beskärs av ramen. Hela systemet bygger på tre kontraster: **jättestor rubrik mot liten kompakt copy**, **hård, kantig typ mot en mjuk glasdroppe**, **mörkt rum mot ljus poster och varmt ljus**.

### 5.1 Typografi

| Roll | Typsnitt | Varför |
|---|---|---|
| Rubriker | **Bricolage Grotesque** ExtraBold 800 (Google, variabel) | Sätts på optisk storlek 12 även i jättestorlek — där skär snittet djupa **inktraps** i varje fog (W, k, r, m). Det är det som gör att en svart grotesk på 30vw läser som textur, inte som en klump. Bredd 100 för rubriker, 82 för utfallande ord. |
| Brödtext & kompakt copy | **Satoshi** (Fontshare) | Regular för läsning, Medium/Bold för postercopyn. Tyst bredvid rubrikerna — det är poängen. |
| Meta | **JetBrains Mono** (Google) | Bara för tekniska avläsningar i grafiken (nod-etiketter, räknare). Inte längre för etiketter. |

**Signaturordet** var en kursiv serif. Mot en ExtraBold med inktraps läste ett andra snitt som ett kostymbyte — postern byter aldrig snitt, den byter färg. Nu: **samma snitt, ett ord i accentfärgen**. Fortfarande max ett per rubrik.

**Heron är fotot av postern på fåtöljen** (`assets/media/hero-chair.jpg`) i helbild på mörk yta. Mottot är satt som tre jättar runt postern, aldrig över ansiktet: läst som ett Z: *A creative* uppe till vänster, *problem* till höger, *solver.* i gult nere till vänster (`data-fit` desktop, `data-fit-sm` mobil). Laddningsanimering i ren CSS: fotot öppnar sig ur en mindre, mörk, suddig ram, sedan reser sig bokstäverna en och en rad för rad, sist tonar den lilla texten upp. Fotot och orden glider i olika djup med pekaren (`modules/depth.js`).

**Varje sektion är en egen poster — som ett magasin.** Jätteordet är i meningsform (versal + gemener), ExtraBold. `modules/fit.js` storleksanpassar det till en andel av ramen per sektion (`data-fit`, 0,37–0,75) och placerar det: `data-bleed="right"` ställer ordet mot högermarginalen, `data-bleed="left"` mot vänstermarginalen. Inga ord går utanför skärmen — skalan kommer från storleken, inte från beskärning. Storlek och sida varierar sektion för sektion. Allt annat är litet. **Underrubriker är Satoshi Medium**, samma typsnitt som brödtexten — display-snittet används bara till jättarna. **Signaturordet** är Instrument Serif kursiv på gul överstrykning.

**Utfallande typ (`.t-bleed`)** — ett ord satt för stort för sin ram och beskuret av den. Bryts aldrig, krymper aldrig. Används i heron (*Problem* / *solver.*), footern (*Winroth*) och som **poster-head** överst i varje sektion (*Hello, Content, Output, Systems, Brand, Craft, Machine, Process, Now.*); *What I solve* sätts i stället stort över zoom-bilden före akterna (*What I* litet, *solve* jättestort i gult) med den riktiga rubriken och en förklarande rad i liten kompakt text under. Den lilla raden under (rubrik + förklaring + nummer) växlar sida nedför sidan. Paras alltid med **kompakt copy (`.t-compact`)** och inget däremellan.

**Skala (flytande, clamp):**

| Token | Storlek | Radavstånd | Tracking |
|---|---|---|---|
| `bleed` | `clamp(6.5rem, 31.5vw, 36rem)` | 0.8 | −0.055em · wdth 82 |
| `display-xl` | `clamp(2.75rem, 12.5vw, 11rem)` | 0.84 | −0.05em |
| `display-l` | `clamp(2.75rem, 7vw, 6rem)` | 0.88 | −0.042em |
| `h2` | `clamp(2rem, 4.5vw, 3.5rem)` | 1.0 | −0.03em |
| `h3` | `clamp(1.375rem, 2.4vw, 2rem)` | 1.0 | −0.03em |
| `compact` | `clamp(0.875rem, 1vw, 1rem)` | 1.16 | −0.012em · Medium · 28ch |
| `body-l` | `clamp(1.125rem, 1.6vw, 1.5rem)` | 1.5 | 0 |
| `body` | `1rem` | 1.6 | 0 |
| `label` | `0.875rem` | 1.3 | Satoshi Medium, ingen ram — `.accent` = svart text med en liten gul prick framför |

**Om etiketterna (ändrat 2026-10-05).** Inte chips längre. Glaspillret och monotypsnittet läste som gränssnittsdetaljer; bredvid jättetyp ska en etikett läsa som en magasinsöverrubrik. Etiketter är liten Satoshi Medium direkt på ytan, grå. Den etikett i en grupp som *namnger* saken (`.accent`) blir svart och får en liten gul prick framför; resten (år, format) förblir grå utan markör. Bara `.media__chip`, som ligger på foton, behåller glaset.

Radlängd: 60–72 tecken desktop, 38–55 mobil. Kompakt copy: max 28 tecken.

### 5.2 Färg — "Leather & lamplight"

Rummet är den mörka ytan, postern är den ljusa, läder och sol är de enda två färger som får vara högljudda. Varje neutral lutar varm — det finns ingen kall grå kvar.

| Token | Värde | Användning |
|---|---|---|
| `--c-ink` Espresso | `#17120E` | Text, mörk yta. Aldrig #000. |
| `--c-ink-soft` Walnut | `#241C15` | Upphöjt på mörkt |
| `--c-paper` Paper | `#FBFAF7` | Ljus yta — nästan vitt |
| `--c-white` White | `#FFFFFF` | Upphöjt på ljust |
| `--c-sand` | `#F1EEE8` | Grupperingsyta |
| `--c-leather` | `#B9732F` | Fyllnader och sken, aldrig text |
| `--c-sun` | `#FFD900` | **Accenten** — solen. Text på mörkt (11,5:1). På ljust: överstrykning bakom signaturordet och knappfyllnad, aldrig text (1,6:1) |
| `--grey-100…900` | varm härledd skala | Ramar, meta, disabled |

**Ingen brun accent.** Gult är den enda färgen. Två tokens: `--c-accent` (ytor, linjer, prickar — alltid gul; `#F2CE00` på vitt) och `--c-accent-text` (allt man läser — svart på ljust, gul på mörkt). Accenten byter själv via `[data-ground]`: på mörkt blir signaturordet gult, på ljust får det en gul överstrykning med svart text. Heron, AI-sektionerna och footern är mörka; resten är bone.

Kontrastkrav: allt textbärande ≥ 4.5:1. Accenten används aldrig ensam som betydelsebärare.

### 5.2b Linsen — glasdroppen (borttagen 2026-10-05)

**Borttagen överallt.** Glasdropparna är tagna bort från sidan och styleguiden; `lens.css` och `modules/lens.js` ligger kvar men är urkopplade (inte importerade/registrerade), om de skulle behövas igen. Texten nedan beskriver hur den fungerade.


Det enda mjuka i ett hårt system: en frostad glasdroppe som ligger över rubriktypen (`.lens`, `components/lens.css`, `modules/lens.js`). Fem lager på ett element — frost (backdrop-blur), highlight uppe till vänster, varm kaustik nere till höger, kantljus, varm skugga. Morfar långsamt mellan fyra konturer och lutar sig mot pekaren; båda stannar vid reduced motion.

**Formen är levande.** `modules/lens.js` bygger varje droppe av 14 punkter med fjädrar och en långsamt drivande grundform (övertoner per variant `.lens--a/b/c`, så ingen droppe är rund eller lik en annan). Pekaren drar i ytan: utanför sträcker sig kanten mot den, inuti trycks den in, och snabba drag skickar vågor runt kanten. Konturen skrivs varje bildruta som `clip-path: path()` på glaset och som SVG på kant och skugga. Statisk SVG-mask i `lens.css` är reserv utan JS.

**Kundlogor** (`#clients`, efter Craft/What I do — ordning: Hello → Wide skill set → Craft → case-karusell → kundlogor → Work; `components/logos.css`) + `modules/logos.js`) — två rader med jättestora logor, inga rutor. Sidan stannar inte här. Båda raderna åker åt samma håll (höger till vänster) och rullar av sig själva; scrollfart kastar dem snabbare (ner = vänster, upp = tillbaka) och de glider sedan tillbaka till sin takt. Andra raden startar förskjuten och följer scrollen med mer eftersläpning, så raderna glider isär vid snabb scroll och hittar tillbaka; varje rad lutar in i sin egen fart som de stora rubrikerna, så lutningen går som en våg genom blocket. Saktar nästan till stopp när man pekar på en rad. Platshållare tills riktiga logofiler finns: typografiska ordmärken för kunder som redan nämns på sajten (Aros Auto, Logimark, Friends Agenda, SoScale Media, Webbson). Byt `.logo__mark` mot `<img>`/`<svg>`.

**Projektspåret — parkerat 2026-10-05** (låg tidigare direkt efter Hello; markup i `docs/projects-track-snippet.html` med instruktioner, `modules/projects.js` + `components/projects.css`) — tidigare projekt som kort på insidan av en cylinder, på sidans vanliga prickrutnät (ingen egen bakgrund), byggt i WebGL med three.js (laddas från CDN först när sektionen närmar sig). Sektionen pinnas och scrollen driver korten i sidled i en loop; man kan också dra. Hastighet böjer korten mer. Korten målas från `<ol>`-listan i markupen (`data-image` eller `data-tone`), som också är det skärmläsare och tangentbord använder och det som visas om WebGL inte startar. Idé från jesperlandberg.com.

**What I solve — borttagen (2026-10-05).** De fyra meningarna/delarna är borttagna, liksom länken i docken och `solve.css`. Zoom-effekten som tidigare rubricerade sektionen ligger kvar men säger nu **"A wide skill set"** ("A wide" stort uppe till vänster, "skill set" enormt i gult längs nederkanten, högerjusterat; `#skills`) och sitter mellan Hello-sektionen och kundloggorna. Zoom-sömmen in i Work ("The proof") och mellanspelet "Design that works harder than it looks." är borttagna (2026-10-06); kundlogorna går nu direkt in i *Content*.

**Case-rubriken följer med (2026-10-06).** I Content och Systems ligger rubriken (`h2.feature__title`) och dess korta rad (`.feature__lede`) överst i `.feature__caption`, som redan är sticky medan bilderna scrollar förbi — rubriken åker alltså med texten och knappen. Poster-rubrikens rad behåller bara numret, längst till höger.

**Borttaget (2026-10-06):** mellanspelet "I'd rather prove it than claim it." och siffersektionen (70+ / 20+ / 5 / 6) — process-delen går nu direkt in i About.

**Verktygen i Now (2026-10-06)** rullar nu som kundlogorna: två rader åt samma håll, förskjutna, som scrollen kastar och som lutar med farten (`.clients--tools`, samma `modules/logos.js`, som nu kör alla `[data-clients]`-block). En röst för alla — Satoshi stort, var tredje i serif kursiv. Den gamla `.marquee` används inte längre.

**Process — sex steg, en tråd (2026-10-06, `sections.css`, `modules/thread.js`).** Byggd på vad rekryterare letar efter hos seniora: problem­inramning och framgångsmått före pixlar, förankring, gå brett/smalna av (Double Diamond), testa tidigt, bygga för överlämning, och mäta mot målet. Stegen: 01 Frame (problemformulering + mått), 02 Define (en-sides brief, insikt), 03 Explore (territorier, de flesta dödade med flit), 04 Test (prototyper, A/B), 05 Build (system + överlämning), 06 Prove (mäta mot målet från 01; lärdomen blir nästa brief). Varje steg är en stor, abstrakt linjeritning i bakgrunden (600×640) med texten ovanpå i foten, och en "Output"-rad; en gul tråd går in vid (0,300) och ut vid (600,300) i varje scen, så de sex binds ihop till en linje på det fastnålade horisontella spåret. `thread.js` ritar varje bit (`--d`) strax före där man tittar; scenen tänds när tråden kommer fram. Rubrik: "Six steps, one thread."

**Case-karusellen tillbaka (2026-10-06, `projects.js`, `projects.css`)** — mellan Craft/What I do och kundlogorna (bytt plats 2026-10-06). Omskriven: breda kort (~1,9:1, mittkortet ~40 % av bredden på desktop) på ett plant band — ingen cylinder. Allt räknas från punktens plats längs hela bandet: farten böjer hela bandet till en kurva (ändarna släpar), förstärker en våg som alltid går genom remsan, drar ihop korten lite och lutar bandet; bilderna glider inuti ramarna (parallax) medan typografin ligger still. Kortytan (omgjord): lätt rundade hörn, tätt mellan korten och en hårlinjeram; upptill etikett med gul punkt + taggar och index i mono; titeln stor och lätt (Satoshi Medium) nedtill; hover: bilden zoomar in en aning, kortet ljusnar lite och ett svagt, varmt gult sken tonas in tätt bakom kortet (planet är större än kortet så skenet har plats; det hovrade kortet ritas först så grannarna ligger över skenet); "View case ↗" som diskret textlänk med hårlinje nere till höger (ingen knapp). Pekaren går till sitt "Case"-läge över ett kort, som på länkar till case (duken får `data-cursor-hover` + `data-cursor-label="Case"` medan ett kort är under pekaren; uppdateras även när bandet glider under en stilla mus). Alla fem kort har bakgrundsbild och samma uppbyggnad (2026-10-08); Creative strategy hub och AI creation använder tills vidare `hero-chair.jpg` och `milton-portrait.jpg` som platshållare. I vila andas bandet. Ingen hover-effekt per kort längre: pekaren rör bandet — där den vilar ger bandet efter som tyg och en krusning sprider sig, och rör man den i sidled drar man hela bandet med sig lite. Bakgrundsprickarna i sektionen glider i sidled med bandet, i 60 % av kortens fart så de ligger bakom och står stilla vertikalt medan sektionen är fastnålad, så rörelsen är ren sidled (`host.particleShiftX` / `host.particleHoldY` i `particles.js`, satta från `projects.js`). Dämpas på smala skärmar. Fastnålad ~200vh.

**Prickarna i fastnålade scener (2026-10-06, `particles.js`).** `data-particles-hold[="selector"]` på en fastnålad scen håller bakgrundsprickarna stilla vertikalt medan scenen står still, och `data-particles-slide` låter dem glida i sidled i takt med scenen (andel av skärmbredden över hela fastnålningen); `data-particles-hold-media` begränsar det till när scenen faktiskt är fastnålad. Används på övergången "Creative work made by human" → "Then there's AI" (0.5) och på processdelen (1.4, bara ≥64rem). Case-karusellen gör samma sak från `projects.js`.

**AI-ytan (2026-10-06, `.ai-ground` i `ai.css`).** Hela AI-sträckan (panelen "Then there's AI", de tre delarna och "Not a threat") ligger på en djupare svart (#0C0A08 i stället för espresso #17120E) ; ritningarna visas nu i full styrka. Hero och footer behåller espresso.

**Gult uppdaterat överallt (2026-10-06).** `--c-sun` #FFD21A → #FFD900 (renare, mindre orange) och `--c-sun-deep` #F2C100 → #F2CE00 (samma nyans, mörkare för tunna linjer på papper); prickfältets accent följer med.

**TikTok i Now (2026-10-06, `.now-grid` / `.tt-card` i `sections.css`).** En liten TikTok-profil i högra kolumnen bredvid Now-texten: rund profilbild (`milton-bust.webp`), "Milton Winroth" + @notlimw i mono, gul "Follow"-knapp, en rads bio, fliken "Videos" med gul understrykning, tre videorutor 9:16 och "See all on TikTok ↗". Allt länkar till https://www.tiktok.com/@notlimw. Videorutorna tar en miniatyr som `style="--thumb: url(assets/media/tiktok/1.jpg)"` (och sin egen videolänk som href); utan visas en ritad platshållare. TODO: riktiga miniatyrer. Footerns TikTok-länk → @notlimw.

**Prestanda (2026-10-07).** Mätt med verklig scroll per sektion. Åtgärder: prickfältet ritas med ett färdigt mönster (en fill) i stället för ~1500 cirklar per duk och bildruta; scroll-hanterare läser alla positioner före skrivningar (`scene`, `parallax`, `thread`, `ai-flow`); loopar som körde varje bildruta i evighet vilar när inget rör sig (`giants`, `depth`, `preview`, `cursor`, `logos`, `projects`); kantoskärpan ett lager per kant i stället för tre; bildväggens ramar och bilder på egna kompositlager (`will-change`); AI-ritningarna har `contain: layout paint`, skriver variabler bara där de läses och bara vid ändring, och har inga tomgångsloopar i SVG (svävande prickar, puls, urtavla/ström i vila) — de rör sig med scrollen; processens ringar roterar inte i vila. Regel framåt: inga oändliga animationer inuti stora SVG:er, och läs layout före skrivningar.

**AI-delen (omskriven 2026-10-05, `components/ai.css`)** — mörk, i tre delar med jätteord som avdelare. *Context* (koncept & strategi: samla och spara info från dussintals källor, hålla allt samtidigt, bättre koncept som passar brandet) och *Visuals* (contentskapande: bild/video-modeller, VFX och animation) är abstrakta och går över hela bredden — grafiken är sektionen och texten sitter liten i ett hörn. Context: ett fält av källprickar som driver, prickarna flyger in i en ring och fortsätter kretsa, och ett koncept skrivs ut som rader i brandets färger. Visuals: en lutad filmremsa i två rader som rullar åt var sitt håll, en ruta vald. *Tools* (workflows & appar) är också en ritning över hela bredden: tolv skrafferade uppgifter → Trigger → Workflow → App (med en streckad ström i ledningarna) → en gul ram "Creative work" där en skiss ritas.  Avslutas med *Not a threat. An opportunity.* (Multitool-delen borttagen; Context bär nu ankaret `#ai`.) **All AI-grafik är ren wireframe** (ändrat 2026-10-05): tunna linjer, inga fyllningar, inga gradienter eller sken; gult bara som linje på det viktigaste. Samma konstruktionsspråk som trådgrafikerna i *What I solve*: urtavla med gradskala, hårkors, baslinjer, trådramar med skisser. **Grafiken är bakgrund och flödar med scrollen** (2026-10-05): varje ritning ligger i full bredd bakom texten, dämpad och uttonad mot kanterna; `modules/ai-flow.js` ger `--p` (0→1, mjukt eftersläpande) på varje `[data-ai-flow]`-scen och allt — prickarna som samlas, urtavlan som vrids, raderna som ritas, noderna som tänds, filmremsan som glider i sidled — styrs av det värdet, plus några långsamma tomgångsloopar. Utan JS eller med reducerad rörelse är ritningarna färdiga och stilla. På mobil ligger ritningen ännu svagare bakom texten (ingen sidledssvep längre). Utöver `--p` skriver modulen `--v` (utjämnad scrollhastighet, ritningarna lutar lätt med farten) och `--run`, en drivkraft som tickar långsamt av sig själv och ökar med varje scrollad pixel: strömmen i Tools, urtavlan i Context och filmremsan i Visuals går fortare när man scrollar. Ritningarna går kant i kant och tonas ut långt mot sidorna; etiketterna ligger inom den heltäckande delen. Inga hörnvinklar runt ritningarna. Linjerna är förstärkta inne i scenerna (tydligare men fortfarande bakgrund). Tools är förenklad till bara flödet: uppgifter → Trigger → Workflow → App → Creative work (veckostaplar, anteckningar och portar borttagna); texten ligger direkt ovanför flödet (`.ai-stage--stack`), på desktop i linje med Trigger och med de två styckena i två spalter, så ingen tom yta uppstår.

**Interaktion (idéer från 21st.dev, byggda i vanilla JS):** jättarnas bokstäver vidgas längs bredd-axeln nära pekaren och lutar med scrollhastigheten (`modules/giants.js`); listan i "What I do" visar en bild som följer pekaren (`modules/preview.js`).

**Regler:** en per scen · alltid över rubriktyp · aldrig över brödtext · aldrig som behållare. På bone ska ordet under fortfarande läsas som ett ord — blir droppen en vit skiva har den slutat vara glas.

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

**Låsta 2026-07-31, reviderade 2026-10-04:**

| Beslut | Val |
|---|---|
| Accentfärg | **Sol `#FFD900`** — enda färgen. Text på mörkt, överstrykning/fyllnad på ljust. Accenttext på ljust är svart (ersätter Cobalt 2026-10-04) |
| Typsnitt | **Riktning B "Poster"** — Bricolage Grotesque 800 (opsz 12) bara för jättarna, Satoshi för brödtext och underrubriker, Instrument Serif kursiv för signaturordet, JetBrains Mono bara i grafikens avläsningar |
| Signaturelement | ~~Linsen~~ (borttagen 2026-10-05) — jättetypen bär nu scenerna själv |
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

### Dock on mobile
- Work's sub-row is no longer forced open below 48rem. It opens as on desktop: by reaching Content / Systems / Brand, or with a first tap on "Work" (a second tap follows the link). Tapping anywhere else closes it.
- When the group opens, the sideways-scrolling dock slides so the sub-links are in view. When it closes, the dock slides back to the start.
- Touch is detected by the pointer type of the tap, not by `(hover: hover)`. The global anchor handler in main.js respects `defaultPrevented`.

### Giant words: the cursor swell no longer shakes
- giants.js aims the width swell at each letter's *rest* position, measured from the edge the word is pinned to. It is re-measured only when the size changes.
- Before, it measured live letter boxes. On right-pinned words ("Tools") a widening letter pushed the T away from the cursor, it shrank back, slid under it again, and jittered.

### Cursor: label pill instead of ring
- The ring and the ink "hot dot" are gone. Over a target with a label (Case, Go, Visit…), the yellow dot shrinks away and a small yellow pill with the word takes its place, up and to the right of the pointer.
- A target with no label keeps the dot. cursor.js writes `data-labelled`.

### Performance pass 3 (phones especially)
- **Particles:** each canvas is drawn once on whole lattice cells, with one cell of overhang inside a `.particles-clip` wrapper. Scrolling, parallax and the sideways slides only move it with a transform, solving the lattice phase. A canvas repaints only when the cursor bloom touches it, or has just left it. Before, 2–4 viewport-sized 2× canvases were cleared and refilled every scroll frame. Measured: 12 fills over 60 scroll frames, against roughly 3 per frame before.
- **Project carousel:**
  - Renders only while something moves (scroll catch-up, swell, pointer, hover fade).
  - Its own clock pauses at rest, so the wave resumes without a jump.
  - Pixel ratio is capped at 1.5 on coarse pointers.
- **Touch screens:** no edge blur, and the glass blur drops from 36px to 16px.

### No letter-spacing; glass cursor pill
- All positive tracking is removed: `--tr-label` and `--tr-micro` are now 0, as are the process numbers, graphic labels and AI step labels. The tight negative tracking on the big headings stays. The SOSCALE/MEDIA wordmark keeps its spacing because it copies their logo.
- Cursor label: a glass pill with a blurred background, a light tint, a 1px hairline outline in the text colour, and text in the cursor's ground colour.

### Performance pass 4: the real culprit
- Scroll-handler profiling showed that every scroll frame restyled the whole document, about 10 ms a frame and 12.6 s over one pass of the page. The cause was nav.js writing `--scroll-progress` on `<html>`: custom properties inherit, so each write invalidated every element. It is now written on the dock, its only reader, and only when it changes. Handler total went from 12.6 s to 0.6 s.
- **Projects (three.js):** loaded in idle time after `load` rather than on approach. Shaders are precompiled with `renderer.compile` and textures uploaded with `renderer.initTexture`, so nothing boots mid-scroll.
- **Measured, full-page scripted scroll (22 px a frame):**
  - Desktop 1280×800: 16.7 ms on average, one 29 ms frame.
  - Mobile 375×812: 16.7 ms on average, no frames over 24 ms.
  - Before: 15–23 long frames, up to 284 ms.
- **Rule:** never write a per-frame custom property on `<html>` or `<body>`. Set it on the element that reads it.

### Load smoothness
- The hero intro is held paused (`.reveal-ready:not([data-ready]) .hero *`) until main.js has booted, so the one heavy boot frame comes before the intro and not inside it. If main.js never boots, the head script drops `.reveal-ready` after 4s and the intro plays anyway.
- **Projects boot:**
  - Waits 2.6s after `load` for the intro to finish, then runs in steps, each in its own idle period behind a rAF: renderer, then cards, then size, then compile.
  - Each card's overlay and picture are painted and uploaded in their own idle period.
  - Before, all of this was one 80–100 ms frame inside the intro.
- fit.js and thread.js init now read every measurement before writing anything.
- After load, the only long frame is the first render of the page (~55 ms, before anything moves).

### Menu curtain cleanup
- Removed: the yellow corner brackets, the staircase indent (every row is now flush left), and the hover row numbers (`numberRows`/`.menu__index`).
- The close button sits exactly where the menu button is (top right).
- No focus ring after a mouse click: menu.js tracks whether the last input was keyboard or pointer and focuses with `{ focusVisible }` accordingly. Keyboard users still get the ring.

### Projects: corner captions in/out
- An IntersectionObserver (band at the viewport's middle 10%) sets `data-in` on `.projects__hud`.
- The top pair drops in from above and the bottom pair rises from below, staggered 80 ms apart. They leave the same way, quicker.
- No per-frame work. Without JS the attribute never appears and they simply show.
- Note: projects.js already has a module-level `hud` object, so don't shadow it in init (TDZ took the whole module down once).

### Spacing at narrower widths + mobile pass
- `.feature__caption` (Content / Systems / Brand) gets its flex column and gap at every width. Before, both were set only at ≥64rem, so below that everything stacked with no space. The headline and its lede keep a tight 8px pair.
- **Projects on phones:**
  - Cards are bigger (share 0.86).
  - The four captions gather just above and below the band (`--band-h` written by `size()`), instead of sitting in the far corners with a screen of empty paper between them and the cards.
- **Statement scenes** ("Not a threat", "Then there's AI", …): `min-height` is 64svh on phones instead of a full screen.
- **About:** more room above the tools ribbon.
- **Footer:**
  - The link groups are 2 columns even on phones.
  - "Else where" → "Elsewhere".
  - The dock steps aside when the closing "Milton Winroth" word comes into view (IntersectionObserver in nav.js).
- **Hero, 30–48rem:** the floor shade rises higher and darker, so the copy no longer runs across the poster's lettering.
- **Audit script** (gaps under 6px between stacked text blocks), run at 375 and 680: what remains is intentional (padding inside the element, line stacks, background drawings).
- Mobile full-page scroll: 16.7 ms average, no long frames.

### Hero headline on phones (<48rem)
- "A creative" alone at the top. "problem" drops onto "solver." as one left-set block on the floor: `bottom: 24.5vw`. Both are fit to the width, so their heights are fixed shares of vw.
- The copy sits above that block (`bottom: calc(45vw + sp-4)`). The floor shade rises to 62% and is darker, so the sentence reads clear of the poster. The separate tablet-only shade block is gone.
- The selector needs `.hero .hero__word--b[data-bleed]` to beat poster.css's `[data-fit][data-bleed="right"]`, which loads later.
- **Phone and tablet photo (<48rem):** `.hero__media` is `top: 4svh; height: 80svh`, only slightly zoomed out from full-bleed. It is masked to fade to the dark ground at the top and from 62% down, so the poster stops above the copy. (A 50svh band was tried and was too far out.)

### Copy pass: Milton's voice, no dashes, no orphans
- **Voice:** relaxed and laid back, but professional. First person, plain words ("ads", "stuff", "figure out"), short sentences. No AI tells: no em dashes, no "Not X — a Y", no aphorism pairs ("The making is the fun part. The finding is the job."), no tidy triads.
- All em dashes are out of the visible copy, including:
  - the meta title ("·"), the clock ("Stockholm · 09:12") and "Since 2025"
  - the SVG step labels ("01 Collect", "B · kept")
  - alt text ("Placeholder: …")
  - the card counter ("01 / 05")
- Design headlines kept as they were: "Advertising that has to earn its place.", "Not a threat. An opportunity.", "Got something worth solving?", "Giving a production team its week back.".
- **Orphans:**
  - base.css sets `text-wrap: pretty` on p/li/dd/dt and `balance` on h1–h6.
  - modules/typeset.js ties the last three words of every running paragraph or subhead with non-breaking spaces, so no last line holds fewer than three words, in any browser. It runs before split.js and statement.js.
  - Checked at 375, 680 and 1280: no orphans.
- Note: the case pages under work/ do not exist yet (they are only planned, see the sitemap). Every "Read the case" and card link on the home page currently leads to a missing page.

### Soft sideways motion
- **scene.js:**
  - `data-scene-ease="soft"`: linear through the middle, with a quadratic run-up over the first 15% and run-out over the last 15%.
  - `data-scene-smooth`: `--progress` glides toward its target (0.11 per frame) in a rAF loop that sleeps on arrival, and fires `scene:frame` on window while it moves.
- **Process pin:** soft + smooth. **Slide seam:** ease + smooth.
- **particles.js:** a pin that is a scene slides its dots by the scene's own `--progress`, so they move with the track, and redraws on `scene:frame`. thread.js also kicks on `scene:frame`.
- **Projects:** the band target uses `softEnds()` (edge 0.14), the inverse for keyboard focus, and EASE 0.058. Before, the cards started at full speed when the pin caught and stopped dead at the end.
- Measured: Process starts 0, −1, −3, −7, −12 px and coasts to a stop over ~0.5s after the scroll stops. The carousel ramps 0, 1, 4, 11, 23… and glides out.
- **Soft catch into and out of pins** (`data-scene-catch`, scene.js → `--catch`, applied as `translate` on `.projects__sticky` and on `.process-pin__viewport` at ≥64rem):
  - Across a zone of 2·D centred on the pin (D = 0.3·vh), the sticky child's speed falls linearly from the page's speed to 0. The visual offset is `(s+D)²/4D`, where s = rect.top, minus the natural sticky position.
  - The release mirrors it.
  - It is a function of position only, so there is no lag and no loop.
  - The first try used `g(u) = 2u² − u³` ending exactly at the pin. That surged to 1.33× speed before braking, so it was replaced.
  - Measured per 40px scroll step: 40 … 38 35 32 28 25 22 18 15 12 8 5 2 0, and the mirror on release.

### Phone round 2 (from testing on a real phone)
- **Touch lite** (`isTouch()` in motion-prefs.js, `pointer: coarse`):
  - Off on touch: ai-flow (drawings complete and still), parallax.js, the giants' scroll lean, and the masonry per-image depth pass (items pinned at --pass 0).
  - No backdrop-filter on `.glass` (denser tint instead).
  - WebGL: no MSAA, pixel ratio 1.25.
  - logos.js: push 10 (was 55), cap 420px/s (was 2400), lean max 4. Flick velocities had thrown the rows past.
- **All giants flush left below 48rem** (poster.css overrides `data-bleed="right"`).
- **"Creative work made by human."**: two `.nowrap` groups, so it can only break before "made".
- **Projects on phones:** the caption rows are absolutely placed at `50% ± (0.7·band + sp-6)`. They need `grid-row: auto`, or the % resolves against their grid row.
- **AI on phones:** stage `align-items: start`, padding sp-4/0, margin-top sp-6, stack gap sp-4; reel frames 6.5rem with sp-4 padding.
- **Process runs sideways on phones** (unless reduced motion):
  - 86vw columns (max 30rem), pin 340svh, text under each drawing.
  - track.js measures at every width; thread.js and the particle hold follow suit.
- **Slide seam fix:** the panel is fully in at 85% of the scene and held there (`min(1, p / 0.85)`). The seam no longer uses `data-scene-smooth`. Arriving on the last frame of the pin, plus the smoothing lag, left a white sliver on the left as "Then there's AI." scrolled away.
- **Dock on phones (≤48rem):** the Work group never opens. `syncGroup()` forces it closed, the first tap follows the link, and `.dock__sub` and the caret are hidden. The four links fit across the screen. "Work" still lights up while you are in any of its sections. Desktop is unchanged.
- **Portrait project cards on phones** (`PORTRAIT` = ≤47.99rem at load):
  - The card is 3.6 × 4.8 (3:4) with a 960px-wide texture and a share of 0.72.
  - Overlay type is sized from `u = min(h, 0.525·w)`, which matches the old sizes on wide cards. On portrait cards the labels are larger, and the title sits on its own wrapped lines above "View case".
  - Desktop is unchanged.
- **Case images on phones (Content, Systems):**
  - `.feature__media` is a 2-column grid. The nested `.grid` is `display: contents`, and every tile is `grid-column: auto` (to beat `.col-6`'s full span on phones).
  - All tiles are 4:5 with `--r-md` corners.
  - The chip is hidden.
- **Output on phones:** heading margin is sp-6. On touch, `--masonry-col-drift` is 0, since the wall holds still there and the 150px drift reserve was a gap under the heading.
- **Visuals on phones:** `.ai-stage--end` copy is `justify-self: start`.
- **Dock and menu button arrival** (nav.css keyframes, not transitions):
  - The dock springs up with a squash and settle (`dock-in`, 0.95s), and its links roll in with a 60ms stagger.
  - The menu button drops in with a turn and one bounce (`btn-in`, 0.12s after).
  - Exit uses quick plain keyframes. `[data-shown="false"]` is only ever written after a first arrival (guarded in the footer observer too), so nothing plays on load.
  - Reduced motion: no keyframes.
- **Slide seam ("Creative work…" → "Then there's AI.") gets the soft catch too:** `data-scene-catch` with `translate` on `.slide__viewport`. The section's last 30svh is painted #0C0A08, so the strip the early release uncovers is already the AI dark. Measured: 40 … 5 2 into the pin, 0 2 5 … 38 out.
- **Chapter covers on the slide seam** (`.chapter`, scenes.css), replacing the two centred statements:
  - **Light cover:** "Chapter 01 · Work", kicker "Creative work / made by", note, and a giant "human" with a sun full stop drawn by `::after`, so it survives giants.js letter-splitting.
  - **Dark cover:** "Chapter 02 · AI", kicker "Then there's", note, and a giant sun "AI.", set right on desktop.
  - On phones the giant follows straight under the kicker, and the note sits low above the dock.
- **Chapter covers, v2** (no labels, no notes, just the headings):
  - The kicker zigzags: first line left, second set right. Phones set both left.
  - **Light:** "Creative work" / "made by" over a giant "human" with a sun full stop.
  - **Dark:** "Then" / "there's" over a giant sun "AI." (fit 0.46). Behind it, `.chapter__echo` is the same word as a 1.5px sun outline: it trails the panel in by `(1 − progress)·0.5em` and lands slightly misregistered.
  - The echo is a `.line` holding a `.t-bleed`, so its box matches the solid word exactly. It needs the `.chapter__giant .chapter__echo` selector to beat `.chapter__giant .line { position: relative }`.
- **Chapter covers, v3** (v2 was too much). Set exactly like the hero and the zoom scene: one kicker line top left (zoom-kicker size) and one giant on the floor, nothing else.
  - **Light:** "Creative work / made by" + "human" (sun full stop), set right, fit 0.62.
  - **Dark:** "Then there's" + sun "AI.", set left, fit 0.4.
  - The zigzag and the outline echo are removed.
  - On phones the giant is lifted 5.5rem clear of the dock.
- **Chapter covers, final:** back to v1 without labels or notes.
  - **Light:** kicker "Creative work / made by" and a giant "human" (sun full stop), set left, fit 0.8.
  - **Dark:** kicker "Then there's" set right, and a giant sun "AI." set right, fit 0.5.
  - On phones everything is left and the giant follows straight under the kicker.
- "human." is now all sun yellow (the full stop is plain text again, no `::after`), fit 0.72. Both giants sit `clamp(4.5rem, 11vh, 7rem)` up from the floor instead of sunk, so the whole word and its full stop clear the dock.
- **Dark cover spread like the hero** (`.chapter--spread`, `.chapter__word--a/b/c`):
  - Desktop: "Then" top left (fit 0.3), "there's" set right at 38% (fit 0.44), and a sun "AI." bottom left (fit 0.24).
  - Phones: "Then" at the top, with "there's" and "AI." stacked on the floor above the dock.
- **Chapter covers reverted:** the slide seam is back to the two original centred statements ("Creative work made by human." / "Then there's AI."), restored from git HEAD. `.chapter*` CSS is removed. It keeps the soft catch, the dark foot, and the panel arriving at 85%.
- **Dock and menu-button arrival, v2** (v1 felt too playful):
  - The dock rises as a small circle at the bottom centre, then widens to both sides into the pill (`clip-path: inset(-12px calc(50% − 2.4rem) round 999px)` → `inset(-12px)`). The links fade up 0.62s in, 40ms apart.
  - Exit closes to the circle and sinks.
  - The menu button just scales and fades in.
  - One soft curve, no overshoot.
- **Arrival, v3:**
  - The dock starts as a true circle. nav.js writes `--dock-h` (the pill's height) and the clip is `inset(0 calc(50% − dock-h/2) round 999px)`. Before, a fixed 2.4rem made a short pill instead of a dot.
  - The rise and the opening overlap (28% / easeInOutQuint), 1.25s.
  - The menu button drops in from above as a 0.3-scale dot, then grows into place (`btn-in`, 1s). Exit reverses it.
- **Arrival, v4, matched to the Work row's feel:**
  - Dock: 0.8s. It rises on `--e-attitude`, then opens from the dot on a slightly bouncier curve, cubic-bezier(0.34, 1.5, 0.6, 1), with scale 0.9 → 1 (peaks at 1.008). Links follow at 0.42s on `--d-short --e-attitude`.
  - Button: 0.75s. It drops as a dot, then grows (peaks ~5% over).
  - Exits use `--e-anticipate`, like the Work row closing.
  - **Gotcha:** `var()` inside a keyframe's `animation-timing-function` is dropped and the step falls back to `ease`, so the curves are written out literally there. This is also why the earlier versions felt stiff.
- **Dock on phones:** 12px from the bottom (plus the safe area), was 24px.
- **Arrival, v5 (softer):**
  - Dock 1.05s, button 1s. Opacity rises across the whole entrance (0 → 0.55 at the dot stage → 1).
  - The rise uses cubic-bezier(0.22, 1, 0.36, 1), and the opening a gentler cubic-bezier(0.34, 1.3, 0.55, 1), peaking at scale ≈ 1.003. Links fade in over 0.6s from 0.5s.
  - Exit: the dock's labels fade out first (0.2s), and the pill starts closing 0.12s later.
