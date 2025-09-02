## Cel i zarys
Zaprojektować prosty, ale kompletny łańcuch: zmiana tokenów w Figmie → automatyczny fetch Variables → aktualizacja repo design-tokens → build i publikacja paczek → frontend wykrywa nową wersję → rebuild + odświeżony Storybook. Poniżej przepływ krok po kroku, role, narzędzia oraz punkty krytyczne.

---

## Architektura na wysokim poziomie
- Źródło prawdy: Figma Variables (zarządzane przez design → Tokens Studio jako UI/warstwa operacyjna).
- Repo A: design-tokens (przechowuje raw variables + build artefakty + publikacja paczek).
- Repo B: frontend (konsumuje paczkę z tokenami; buduje Storybook).
- Rejestr pakietów: npm (public) lub GitHub Packages (prywatny).
- CI/CD: GitHub Actions/GitLab CI (analogiczne kroki).
- Podgląd wizualny: Storybook + Chromatic (lub inny CI preview).

---

## Krok 1: Trigger (zmiana w Figmie)
Cel: wystartować łańcuch automatyzacji jak tylko zmienią się Figma Variables.

Dwie praktyczne opcje (można zacząć od prostszej A):

- Opcja A (najprostsza): Tokens Studio Git Sync
  - Projektant robi zmiany w Figmie (Variables), w Tokens Studio naciska “Sync/Push”.
  - Tokens Studio (oficjalna integracja) commit/push do repo A (design-tokens) do plików źródłowych (np. tokens/raw/*.json).
  - Plusy: brak własnego serwera; szybkie wdrożenie. Minus: trigger zależny od ręcznego “Sync”.

- Opcja B (w pełni automatyczna): Figma Webhook → CI
  - Webhook Figma (np. file update / library publish / variables updated) → serverless endpoint (AWS Lambda/Cloudflare Worker/Google Cloud Function).
  - Endpoint wywołuje repository_dispatch/workflow_dispatch w CI repo A (GitHub Actions) i przekazuje: fileKey, wersję, kto zmienił, timestamp.
  - CI fetchuje Variables z Figma API i zapisuje do repo.
  - Plusy: zero klików od designu; Minus: wymaga utrzymania endpointu.

Rekomendacja: Zacząć od A (szybkość), docelowo B (bezklikalne).

Narzędzia:
- Figma Webhooks + Figma REST Variables API
- Tokens Studio (Git Sync)
- Serverless (opcjonalnie)
- GitHub Actions/GitLab CI (repository_dispatch/workflow_dispatch)

Rola:
- Projektant: wprowadza zmiany w Figmie; opcjonalnie klika “Sync” w Tokens Studio (jeśli A).

---

## Krok 2: Fetch i zapis do repo design-tokens
Cel: pozyskać i utrwalić najnowsze Variables w repo A w formacie surowym + ewentualną normalizację.

- Wejście: event z Kroku 1.
- Działania:
  - Jeśli A: zmiany są już w repo (commit od Tokens Studio) – skrypt CI tylko waliduje i przechodzi dalej.
  - Jeśli B: job CI odpala skrypt “fetch-variables”, który:
    - Używa Figma API (z tokenem z Secrets) do pobrania Variables z określonych plików/collection/modes.
    - Opcjonalnie filtruje/normalizuje (np. nazewnictwo, flattening ścieżek).
    - Zapisuje wynik jako raw JSON/YAML (np. tokens/raw/figma-variables.json).
    - Tworzy commit/PR w repo A (preferowany PR, by mieć review i changelog diff).
- Walidacje:
  - Schemat (JSON Schema) i reguły nazewnictwa.
  - Braki referencji, duplikaty, cykle, nieobsługiwane typy.
  - Reguły “breaking change” (np. usunięcie kluczowego tokena).

Narzędzia:
- Figma REST API (Variables)
- JSON Schema/ajv, style-dictionary-validators (lub własne).

Rola:
- Tech Lead/DesignOps (opcjonalnie): review PR jeśli wprowadzamy bramkę jakości.

---

## Krok 3: Build paczek w repo design-tokens
Cel: z raw Variables zbudować artefakty do konsumpcji w różnych targetach i przygotować wersję pakietu.

- Transformacje (np. Style Dictionary/Theo):
  - CSS custom properties (design-tokens.css).
  - TS/JS exports (np. consts dla theme, scales).
  - SCSS/LESS zmienne (jeśli potrzebne).
  - Mapy dla platform (iOS/Android/web – opcjonalnie).
- Testy i walidacje:
  - Unit testy reguł transformacji.
  - Snapshoty krytycznych tokenów.
  - Kontrola “no breaking change” (np. zmiana typu/mode).
- Versioning:
  - Automatyczny bump przez semantic-release lub Changesets.
  - Reguły bumpu na podstawie diffu tokenów (np. usunięcie/rename → major, nowy semantyczny token → minor, korekta wartości → patch).
- Artefakty:
  - dist/ zawiera paczki gotowe do publikacji.

Narzędzia:
- Style Dictionary/Theo/Custom build.
- semantic-release lub Changesets.
- GitHub Actions/GitLab CI (jobs: install → validate → build → test).

Rola:
- Developer/DesignOps: definiuje reguły builda i testów, dba o stabilność.

---

## Krok 4: Publikacja paczek do rejestru
Cel: udostępnić paczki konsumentom (frontend).

- Publikacja:
  - npm publish (public) lub GitHub Packages (prywatny).
  - Dodanie odpowiedniego dist-tag (np. next/beta dla prerelease z brancha; latest dla main).
  - Release notes + tag w repo (automatycznie przez semantic-release/Changesets).
- Notyfikacje:
  - Slack/Teams: informacja o nowym wydaniu, link do changeloga i diffu tokenów.

Narzędzia:
- npm registry / GitHub Packages.
- semantic-release/Changesets (publikacja, changelog).
- Slack/Teams (webhook).

Rola:
- Developer/DesignOps: ustala politykę tagów i uprawnień (secrets).

---

## Krok 5: Konsumpcja w frontendzie i Storybook
Cel: frontend automatycznie wykrywa i wdraża nową wersję, aktualizuje podgląd.

- Detekcja nowej wersji:
  - Renovate lub Dependabot otwiera PR z bumpem wersji @org/design-tokens.
  - Alternatywa (bardziej automatyczna): repository_dispatch z repo A do repo B uruchamia workflow, który robi “npm i @org/design-tokens@latest” i otwiera PR (lub bez-PR tylko dla branchy preview).
- Build i podgląd:
  - CI w repo B: install → build → Storybook build → publikacja podglądu (Chromatic/Vercel/Netlify).
  - Testy wizualne (Chromatic) porównują przed/po; jeśli różnice tylko w tokenach i testy przechodzą, PR może być auto-merge (zasady do uzgodnienia).
- Deploy:
  - Po merge PR, Storybook na main jest rebuildowany i redeployowany.

Narzędzia:
- Renovate/Dependabot (update paczek).
- Storybook + Chromatic (visual regression).
- GitHub Actions/GitLab CI (build + deploy Storybook).
- Vercel/Netlify/Chromatic hosting.

Rola:
- Developer: review PR z aktualizacją tokenów; akceptacja zmian wizualnych w Chromatic (lub auto-approve według reguł).
- PM/Design Lead: szybki przegląd zmian wizualnych (łatwe do sprawdzenia w Chromatic).

---

## Punkty krytyczne i jak je zaadresować
- Konflikty/nazewnictwo tokenów:
  - Wymuś konwencję (np. namespace.scale.intent.state).
  - Waliduj i blokuj PR przy wykryciu kolizji lub nieobsługiwanych znaków.
- Breaking changes:
  - Zasady bumpu semantycznego powiązane z typem zmiany tokena (delete/rename → major).
  - Pre-release kanały (next) zanim trafi na latest.
- Tryb/mode/tematy (light/dark/brand):
  - Jasne mapowanie Variables → build (prefiksy, scopy).
  - Testy snapshotów per mode.
- Debounce/timing:
  - Łącz szybkie, seryjne zmiany w jeden release (okno 2–5 minut).
  - Kolejkowanie jobów CI (concurrency groups).
- Pętle zwrotne:
  - Upewnij się, że build/publish nie dotyka plików raw, by nie generować kolejnych commitów i pętli.
- Uprawnienia i sekrety:
  - Figma Personal Access Token, NPM_TOKEN w Secrets CI.
  - Ograniczenia do wybranych repo/gałęzi.
- Audyt/śledzenie pochodzenia:
  - Każda wersja paczki zawiera metadane: fileKey, wersję Figma, autora, timestamp.
  - Changelog z listą zmienionych tokenów (nazwy i wartości).
- Stabilność wizualna:
  - Chromatic/regresje wizualne jako bramka.
  - Wydzielony kanał “next” i środowisko podglądu dla designu/PM.

---

## Minimalny przepływ (MVP)
1) Designer zmienia Variables w Figmie i klika “Sync” w Tokens Studio (A).
2) Commit do repo A trafia na branch main/tokens → CI: validate → build → test → semantic-release/Changesets → publish do registry → release notes.
3) Renovate w repo B otwiera PR z bumpem wersji → CI: build + Storybook + Chromatic → review/auto-merge.
4) Po merge, main w repo B rebuilduje i redeployuje Storybook.

---

## Wersja w pełni automatyczna (bez klikania)
1) Figma Webhook (variables/library publish) → serverless → repository_dispatch w repo A.
2) CI w repo A: fetch Variables z Figma API → commit/PR → po merge: build + publish.
3) Repo B: auto PR od Renovate/Dependabot lub automatyczny bump via dispatch → build + Storybook + Chromatic → auto-merge zgodnie z regułami.
4) Deploy Storybook na main.

---

## Role i odpowiedzialności
- Projektant:
  - Utrzymuje Variables (struktura, nazwy, modes).
  - (MVP) Wyzwala Sync w Tokens Studio po zestawie zmian.
  - Ogląda podgląd w Storybook/Chromatic (wspólnie z PM).
- Developer/DesignOps:
  - Utrzymuje build/transformacje i walidacje.
  - Konfiguruje CI/CD, secrets, versioning.
  - Ustala reguły auto-merge i bramki testowe.
- PM/Design Lead:
  - Akceptuje zmiany wizualne (Chromatic/Storybook).
  - Priorytetyzuje release cadence (np. jak często “latest”).

---

## Co przygotować do wdrożenia (bez wchodzenia w kod)
- Repo A (design-tokens): struktura katalogów (raw, transforms, dist), zasady semver, walidacje, CI pipelines.
- Repo B (frontend): integracja z paczką, workflow Storybook + Chromatic, Renovate/Dependabot.
- Sekrety: Figma token, NPM_TOKEN/GITHUB_TOKEN, webhook secrets.
- Reguły:
  - Konwencja nazewnicza tokens, polityka bumpów, kryteria auto-merge.
  - Debounce (okno agregacji), brak pętli commitów.
- Observability:
  - Slack/Teams powiadomienia o wydaniach, linki do changelog/preview.
  - Dashboard minimalny: “ostatnie 5 wydań tokenów”.

Jeśli chcesz, w kolejnej iteracji podam przykładowe konfiguracje CI (GitHub Actions/GitLab CI), schematy walidacji, i wzorcowe kroki builda (Style Dictionary) oraz przykładowe reguły semantic-release/Changesets dopasowane do powyższego.


---

## Research: Figma Webhooks v2 (pod workflow Variables)

### Najważniejsze fakty z dokumentacji
- Poziom i zakres: webhooki konfigurowane na poziomie Team/Workspace; działają dla plików Figma i FigJam.
- Typy eventów istotne dla nas:
  - FILE_UPDATE — ogólny sygnał, że plik się zmienił; może być “głośny”.
  - LIBRARY_PUBLISH — publikacja biblioteki; w Webhooks v2 zawiera wsparcie dla variables (zalecany trigger do synchronizacji tokens).
- Subskrypcje: tworzone przez REST API (teams/:team_id/webhooks) z parametrami: event_type, endpoint_url, secret.
- Bezpieczeństwo: Figma podpisuje webhook HMAC (nagłówek w stylu X-Figma-Signature). Weryfikuj HMAC-SHA256 na pełnym, surowym body + sprawdzaj ID dostawy i timestamp (anty‑replay).
- Payload: zawiera event_type, file_key, triggered_by, timestamp; dla LIBRARY_PUBLISH uwzględnia opublikowane zasoby (komponenty, style, variables) w ramach biblioteki.
- Limity/retries: możliwe łączenie częstych zmian w mniej wywołań; Figma ponawia dostawę przy błędach — implementuj idempotencję (deduplikacja po delivery ID i oknie czasu).
- Plany: webhooki nie są dostępne na darmowym Starter (wg źródeł wtórnych jak n8n docs) — potwierdź plan zespołu.

### Rekomendacje wdrożeniowe
- Preferuj LIBRARY_PUBLISH jako wyzwalacz synchronizacji Variables → mniejszy szum, zmiany są “zatwierdzone” przez design.
- Jeśli nie publikujecie biblioteki, użyj FILE_UPDATE + filtruj po file_key/autor/czas i wymuszaj walidację Variables przed buildem.
- Endpoint webhook (Worker/Lambda):
  - Weryfikuj HMAC i odrzucaj niepoprawne żądania.
  - Deduplikuj dostawy (X-Figma-Delivery) i stosuj timeouty na replay.
  - Po pozytywnej walidacji: wywołaj repository_dispatch do repo design-tokens z payloadem (team_id, file_key, event_type, user, timestamp, ewentualnie lib version).
- CI w repo design-tokens:
  - fetch Variables z Figma REST → walidacja (schema, nazewnictwo, breaking rules) → commit/PR → build → publish.
  - Zaimplementuj debounce okna (np. 2–5 min), aby agregować szybkie serie publishy.

### Źródła i przykłady
- Oficjalna dokumentacja API (Webhooks v2 + wzmianka o variables w LIBRARY_PUBLISH): https://www.figma.com/developers/api
- Artykuł: An automation journey with Figma webhooks — przegląd praktyk: https://medium.com/@nour_99023/an-automation-journey-with-figma-webhooks-f4df82be21b3
- n8n Figma Trigger (uwagi o planach i eventach): https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.figmatrigger/
- Repo przykład: Library Publish → integracja (Discord): https://github.com/bryanberger/figma-discord-webhook
- Klient REST: https://github.com/didoo/figma-api
- Artykuł o automatyzacji Variables REST API: https://medium.com/@agshinrajabov/automating-the-synchronization-of-design-systems-using-the-figma-variables-rest-api-6c54deffbb75


---

## Wariant: Tokens Studio Git Sync jako trigger (bez webhooks)

### Dlaczego
- Upraszcza przepływ: commit/PR w repo design-tokens staje się jednoznacznym wyzwalaczem.
- Nie wymaga hostowania endpointu ani zarządzania subskrypcjami webhooków.
- Lepsza kontrola jakości (PR review, bramki, changelog z Gita).

### Przepływ end‑to‑end
1) Designer zmienia Variables w Figmie → w Tokens Studio klika Sync/Push.
2) Tokens Studio commit/push do Repo A (design-tokens) – najlepiej na dedykowany branch (np. tokens-sync), nie bezpośrednio na main.
3) CI w Repo A na tokens-sync: walidacja schematu/nazewnictwa, raport diffu, ewentualne reguły breaking → wynik widoczny w PR.
4) Merge PR do main w Repo A → CI: build artefaktów (CSS vars, TS exports, itp.) → wersjonowanie (semantic-release/Changesets) → publikacja paczki do rejestru.
5) Repo B (frontend) wykrywa nową wersję:
   - Renovate/Dependabot otwiera PR z bumpem wersji @org/design-tokens,
   - CI w Repo B: install → build → Storybook build → testy wizualne (Chromatic) → review/auto-merge wg reguł.
6) Po merge PR → Storybook na main jest rebuildowany i redeployowany.

### Zasady techniczne (Repo A: design-tokens)
- Branching:
  - tokens-sync: docelowy branch dla commitów z Tokens Studio.
  - main: tylko po PR review i zielonych checkach.
- Walidacje na PR (tokens-sync → main):
  - JSON Schema + naming convention (blokuj kolizje/cykle/referencje),
  - detekcja breaking changes (rename/delete kluczowych tokenów),
  - snapshoty krytycznych tokenów/mode.
- Build i publikacja na main:
  - Transformacje (Style Dictionary / własne),
  - semantic-release/Changesets do ustalenia bumpu (na podstawie diffu tokenów lub konwencji commitów),
  - publikacja do npm/GitHub Packages z odpowiednim dist-tag (latest/next).
- Higiena repo:
  - Nie commituj dist/ – generuj w CI, publikuj tylko do rejestru,
  - Uważaj na pętle: job publikujący nie może modyfikować plików źródłowych.
- Sekrety:
  - NPM_TOKEN (publikacja), GITHUB_TOKEN (wydania/PR automatyczne), ew. Slack webhook.
- Kadencja wydań:
  - Debounce/okno agregacji (2–5 min) przy serii pushy z Tokens Studio,
  - Możliwe prerelease (tag next) z branchy feature.

### Zasady techniczne (Repo B: frontend)
- Aktualizacje paczek:
  - Renovate/Dependabot monitoruje @org/design-tokens i tworzy PR z bumpem,
  - Alternatywnie: dispatch z Repo A uruchamia job w Repo B, który sam robi PR.
- CI na PR:
  - instalacja zależności → build aplikacji → Storybook build → Chromatic (wizualne regresje),
  - reguły auto-merge (np. jeśli tylko tokeny i testy OK, brak krytycznych zmian).
- Po merge:
  - Deploy/hostowanie Storybook (Chromatic/Vercel/Netlify) – odbudowa na main.
- Higiena:
  - Lockfile commitowany w PR od bota (reproducibility),
  - Testy e2e/vis diff jako bramki (opcjonalnie).

### Rola projektanta i dewelopera w tym wariancie
- Projektant: kontroluje moment Sync (grupowanie zmian), przegląda podgląd w Storybook/Chromatic.
- Developer/DesignOps: utrzymuje walidacje i build, decyduje o bump rules i auto-merge, reaguje na alerty CI.

### Punkty krytyczne i jak je adresować (dla Git Sync)
- Seria szybkich Synców → agregacja w jeden release (debounce) lub polityka “release cadence”.
- Brak konwencji commitów z Tokens Studio → Changesets lub skrypt do wyliczania bumpu na podstawie diffu tokenów.
- Konflikty nazw/ścieżek tokenów → twarde walidacje w CI i zasady nazewnicze.
- Przejrzystość zmian → generuj raport diffu tokenów jako artefakt CI + link w PR.

### Minimalne workflowy CI (opis, bez kodu)
- Repo A (design-tokens):
  - On: pull_request z branchy tokens-sync → main, paths: tokens/raw/**
    - Jobs: setup → validate (schema/naming) → test (snapshots) → diff report (artefakt)
  - On: push na main, paths: tokens/**
    - Jobs: setup → build (transforms) → test → version (semantic-release/Changesets) → publish → release notes → notify (Slack)
- Repo B (frontend):
  - On: pull_request, when dependency @org/design-tokens updated
    - Jobs: setup → install → build → storybook:build → chromatic (viz tests) → report
  - On: push na main
    - Jobs: rebuild + redeploy Storybook (prod kanał)

### Alternatywy
- “Pół‑auto”: PR z Tokens Studio trafia od razu na main, ale publikacja paczki wymaga manualnego approvalu (manual job) — prostsze na start.
- “Auto‑bump do preview”: każde wydanie z main paczki publikuje też tag next i odpala preview Storybook (oddzielny kanał dla designu), zanim wyląduje w produkcji.


---

## Zmienione założenia: automerge PR z Tokens Studio → main

- Wymóg: PR generowany przez Tokens Studio ma być automatycznie mergowany do main, bez ręcznego zatwierdzania.
- Rekomendacja bezpieczeństwa:
  - Użyj GitHub “Allow auto-merge” + ochrony gałęzi (wymagane status checks). PR łączy się automatycznie, gdy przejdą checki (walidacja, testy transformacji). Brak ręcznej aprobaty.
  - Alternatywnie: Mergify lub GitHub Actions bot, który automerge’uje PR oznaczone etykietą (np. tokens:automerge) po zielonych checkach.
- Checki blokujące (muszą przejść, inaczej PR nie zmerguje się):
  - Walidacja schematu/nazewnictwa + reguły breaking.
  - Snapshoty krytycznych tokenów/mode.
  - Anty‑pętla: job publikujący nie modyfikuje plików źródłowych (żadnych commitów w pipeline publikacji).
- Po automerge na main: uruchamia się pipeline build → version → publish paczki → notify.

Uwaga: jeśli seria pushy z Tokens Studio tworzy wiele PR, włącz kolejkę i/lub debounce (concurrency + okno 2–5 min), by ograniczyć liczbę wydań.

---

## Research: Konsumpcja w IDE (VS Code) przez MCP server – komponenty Figma + te same Variables

### Kontekst
- Figma udostępnia Dev Mode MCP server (oficjalny) umożliwiający IDE (np. VS Code) komunikację z Figmą w standardzie Model Context Protocol.
- Cel: w IDE konsumować komponenty z Figmy, które używają tych samych Variables, co nasze tokeny synchronizowane przez Tokens Studio; generować szkielety komponentów spójne z paczką @org/design-tokens.

### Możliwości (stan na 2025)
- Przeglądanie/odpytywanie komponentów i właściwości z Dev Mode; dostęp do identyfikatorów plików/warstw; wgląd w użyte style/variables (pośrednio przez nazwy, kolekcje, tryby).
- Integracja MCP w IDE pozwala uruchamiać komendy (tools) typu: “wygeneruj komponent”, “pokaż mapping variables → token exports”, “wstaw importy do kodu”.

### Rekomendowana architektura integracji
- Jedno źródło prawdy tokenów: paczka @org/design-tokens (TS exports + CSS vars). Nazwy tokenów = nazwy Figma Variables (lub deterministyczne mapowanie 1:1).
- MCP tool “scaffold-component”:
  - Wejście: link do komponentu w Figmie (file_key + node_id), docelowy framework (React/Vue), preferencje styli (CSS vars/TS imports).
  - Działania: pobiera metadane komponentu (rozmiary, warianty), mapuje użyte Variables na importy z @org/design-tokens, generuje plik komponentu + test + story.
- Plik mapowania (opcjonalnie): registry.json utrzymujący trudniejsze mapowania (np. aliasy, tryby light/dark → data-theme).
- Walidacja w IDE: komenda “validate-component-tokens” sprawdza, czy użyte zmienne w kodzie odpowiadają istniejącym tokenom (lint MCP + ESLint rule).

### Praktyczne wskazówki
- Zachowaj identyczne nazewnictwo Variables i eksportów w paczce — minimalizujesz potrzebę mapowania.
- Eksporuj zarówno CSS vars (dla styli), jak i TS constants (dla logiki i typowania). IDE może proponować jedno lub drugie.
- Dodaj snippet’y/templatki do IDE: importy tokens, patterny themingu (data-theme, prefers-color-scheme), użycie spacing/typography scales.
- Ustal wersjonowanie: MCP może wyświetlać wersję paczki tokenów i ostrzegać, gdy komponent w projekcie używa starszej wersji (pomocne przy refaktorach).

### Ograniczenia
- Nie wszystkie relacje “node → variable” są jawnie dostępne w REST; Dev Mode MCP ułatwia, ale w części przypadków trzeba oprzeć się na konwencjach/nazwach.
- MCP to młody ekosystem — zaplanuj fallback: nawet bez MCP, workflow działa przez paczkę @org/design-tokens + manualne importy.

---

## Research: Figma Make a wspólne Tokens/Variables

### Co wiemy o Figma Make (stan 2025)
- Make to nowy produkt Figma, skupiony na generowaniu/komponowaniu frontów/stron z asystą AI.
- Figma Make operuje na projektach Figmy (komponenty, styles, variables). Spodziewane jest dziedziczenie semantyki Variables z projektu.
- Publiczne szczegóły integracji z zewnętrznymi paczkami są ograniczone; brak stabilnych publicznych API specyficznych dla “Make”.

### Możliwe ścieżki integracji z tymi samymi tokenami
1) Wspólne CSS custom properties (zalecane):
   - Publikuj design-tokens.css z @org/design-tokens (host na CDN/Static hosting).
   - W Make (jeśli umożliwia własny CSS/head) dołącz URL do arkusza z CSS vars. Wygenerowane komponenty/sekcje będą używać tych samych var(--token).
2) TS/JS exports (gdy Make generuje kod możliwy do edycji):
   - Jeżeli workflow przewiduje eksport projektu/kodu z Make, dodaj zależność @org/design-tokens i importuj TS exports w warstwie themingu/styli.
3) Pre‑/post‑processing builda:
   - Jeśli Make nie pozwala na bezpośrednie podpięcie CSS/TS, zastosuj pipeline post‑build: skrypt, który wstrzykuje link do tokens.css lub podmienia stałe na var(--token‑name).
4) Prompty/Guidelines dla AI w Make:
   - Udostępnij “Design/System Guidelines” zawierające nazewnictwo tokenów i link do tokens.css — zwiększa szansę, że wygenerowany kod użyje właściwych zmiennych.

### Rekomendacje
- Traktuj CSS vars jako uniwersalny interfejs konsumpcji tokenów (działa w przeglądarce, Make/Sites, Storybook, appkach).
- Zapewnij stabilny CDN URL do tokens.css (wersjonowany lub alias latest) + dokumentację jak włączyć w Make/Sites.
- Utrzymuj zgodność nazw Variables ↔ CSS var ↔ TS exports (jeden słownik nazw).
- Dla trybów (light/dark/brand) dostarcz gotowe “theme scopes” (np. :root[data-theme="dark"]) i krótką instrukcję przełączania.
- Jeśli zespół używa Make do prototypowania, rozważ kanał prerelease (dist-tag next) paczki tokenów i powiązany tokens.css@next — szybkie testy bez wpływu na prod.

### Ograniczenia/ryzyka
- Brak gwarancji pełnej kontroli nad pipeline’em Make — planuj integrację defensywnie (link do CSS, post‑processing).
- Rozjazd wartości, jeśli Make nadpisze style lokalnie — rekomenduj użycie klas/tematów i unikanie “twardych” wartości.

---

## Podsumowanie rozszerzeń
- Automerge z Tokens Studio: tak, ale wyłącznie po zielonych checkach. To utrzymuje szybkość bez utraty jakości.
- IDE (MCP): wykorzystaj oficjalny Dev Mode MCP server do scaffoldu komponentów, walidacji tokenów i automatycznych importów z @org/design-tokens.
- Figma Make: stawiaj na konsumowanie tokens przez CSS vars (tokens.css) i/lub TS exports, z fallbackiem post‑processing. Zapewnij spójne nazewnictwo i kanał prerelease.
