# Kanban: Design System E2E (Tokens Studio → Auto-merge → Publish → Frontend + Storybook → MCP)

Wariant realizacji: ręczny push z pluginu Tokens Studio w Figmie → automerge PR z Tokens Studio → build/publish paczki design-tokens → rebuild frontu i Storybooka → dostęp do komponentów Figmy w IDE (VS Code) przez MCP.

---

## Blok -1: Boilerplate frontendu
Cel namacalny: czysty Storybook buduje się lokalnie i w CI; bazowy stack gotowy (React + Vite + TS + pnpm + ESLint/Prettier + Vitest + Storybook 8)

- [ ] Zadanie -1.1: Wybór stacku i narzędzi (spis decyzji)
  - Metryki: README uzupełnione o stack; wersja Node zdefiniowana (.nvmrc/volta)
  - Walidacja: node -v zgodny; pnpm -v działa
- [ ] Zadanie -1.2: Inicjalizacja repo (package.json, skrypty dev/build/test/lint)
  - Metryki: skrypty obecne i działają
  - Walidacja: pnpm build kończy się exit 0
- [ ] Zadanie -1.3: Integracja Vite + React + TS + ESLint/Prettier
  - Metryki: lint przechodzi; typy bez błędów
  - Walidacja: pnpm lint i pnpm type-check → exit 0
- [ ] Zadanie -1.4: Instalacja i konfiguracja Storybook 8 (builder Vite) + przykładowe stories
  - Metryki: static Storybook build artefakt generuje się
  - Walidacja: pnpm storybook:build → exit 0; folder storybook-static istnieje
- [ ] Zadanie -1.5: Szkielet CI (GitHub Actions): install cache → build → storybook:build
  - Metryki: workflow przechodzi na PR
  - Walidacja: green check w PR; czas jobu < 10 min
- [ ] Zadanie -1.6: Konfiguracja Chromatic (opcjonalnie)
  - Metryki: build pojawia się w Chromatic; link w logach
  - Walidacja: CHROMATIC_PROJECT_TOKEN w secrets; run zakończony sukcesem
- [ ] Zadanie -1.7: Konfiguracja Renovate/Dependabot
  - Metryki: pierwszy PR z aktualizacją zależności
  - Walidacja: PR utworzony w ciągu 24h od włączenia

Definition of Done (blok): czysty Storybook buduje się lokalnie i w CI na PR.


## Blok 0: Prerekwizyty i bezpieczeństwo
Cel namacalny: środowisko gotowe do bezpiecznego uruchomienia całego łańcucha

- [ ] Zadanie 0.1: Zdefiniuj i zapisz sekrety w CI (NPM_TOKEN, GITHUB_TOKEN)
  - Metryki sukcesu: sekrety widoczne w CI; testowy job ma do nich dostęp
  - Walidacja: uruchomić dry-run job w CI, sprawdzić echo maskowania secretów i exit code=0
- [ ] Zadanie 0.2: Konfiguracja branch protection dla main (wymagane status checks)
  - Metryki sukcesu: reguły aktywne; PR bez zielonych checków nie może się zmergować
  - Walidacja: próbny PR z celowym fail check → merge zablokowany
- [ ] Zadanie 0.3: Ustal nazwę i ścieżkę źródeł tokenów (np. tokens/raw/**) syncowanych przez Tokens Studio
  - Metryki sukcesu: wyraźna ścieżka; diff PR ogranicza się do katalogu
  - Walidacja: testowy commit dotyka tylko tokens/raw/** → check path filter łapie zmiany
- [ ] Zadanie 0.4: Włącz kolejkę PR i debounce (concurrency + okno 2–5 min) w CI
  - Metryki sukcesu: przy 3 szybkich commitach wygenerowany max 1 release
  - Walidacja: seria symulowanych commitów → logi CI pokazują łączenie w jeden przebieg

Definition of Done (blok): wszystkie powyższe zadania zakończone; symulowany PR blokuje się bez checków i przechodzi po ich włączeniu

---

## Blok 1: Tokens Studio → automerge do main (bez ręcznej aprobaty)
Cel namacalny: PR z Tokens Studio automatycznie merguje się do main po zielonych checkach

- [ ] Zadanie 1.1: Skonfiguruj Tokens Studio, by pushował na dedykowaną gałąź (np. tokens-sync)
  - Metryki: push z TS trafia na właściwy branch; autor/commit message oznaczone bot/label
  - Walidacja: testowy Sync → PR z tokens-sync → main utworzony
- [ ] Zadanie 1.2: CI PR checks – walidacja schematu i konwencji nazw tokenów
  - Metryki: 100% zmian w tokens/raw/** przechodzi walidator; błędne nazwy failują job
  - Walidacja: celowo błędny token → check czerwony; poprawa → check zielony
- [ ] Zadanie 1.3: CI PR checks – testy snapshotów krytycznych tokenów i trybów (light/dark)
  - Metryki: snapshoty deterministyczne; brak flaky; czas jobu < 3 min
  - Walidacja: kontrolowana zmiana wartości → snapshot diff wykryty
- [ ] Zadanie 1.4: Włącz automerge (GitHub auto-merge lub Mergify) po zielonych checkach
  - Metryki: PR zmergowany bez ręcznej aprobaty w < 2 min od zielonych checków
  - Walidacja: testowy PR przechodzi i auto-merge następuje
- [ ] Zadanie 1.5: Anti-loop: upewnij się, że pipeline publikacji nie generuje commitów na branchu
  - Metryki: brak kolejnych PR po publikacji; brak zmian w tokens/raw/** z CI
  - Walidacja: obserwacja logów/commitów po 2 cyklach

Definition of Done (blok): testowy PR z TS automatycznie łączy się do main po zielonych checkach; brak pętli commitów

---

## Blok 2: Build i publikacja paczki design-tokens
Cel namacalny: po merge na main publikowana jest nowa wersja @org/design-tokens w rejestrze

- [ ] Zadanie 2.1: Zdefiniuj transformacje build (CSS vars, TS exports, opcjonalnie SCSS)
  - Metryki: dist/ generuje oczekiwane pliki; liczba i rozmiar artefaktów zgodne ze specyfikacją
  - Walidacja: lokalny/CI build → artefakty dostępne i poprawne (lint/format)
- [ ] Zadanie 2.2: Ustal zasady wersjonowania (Changesets lub semantic-release) oparte na diffie tokenów
  - Metryki: rename/delete → major; add semantycznego tokena → minor; korekta wartości → patch
  - Walidacja: trzy scenariusze zmian → trzy różne bumpy semver
- [ ] Zadanie 2.3: CI na push main – sekwencja build → test → version → publish → release notes
  - Metryki: czas całego jobu < 10 min; exit code=0; release/tag utworzony
  - Walidacja: faktyczna publikacja do registry; changelog zawiera listę zmienionych tokenów
- [ ] Zadanie 2.4: Notyfikacja o wydaniu (Slack/Teams) z linkiem do changeloga
  - Metryki: wiadomość dostarczona < 1 min od publikacji
  - Walidacja: webhook test i realny release wysyłają powiadomienie

Definition of Done (blok): nowa wersja paczki dostępna w registry; changelog i notyfikacja opublikowane

---

## Blok 3: Frontend – wykrycie nowej wersji i rebuild Storybooka
Cel namacalny: automatyczny PR w frontend z bumpem wersji; zbudowany Storybook i dostępny preview

- [ ] Zadanie 3.1: Włącz Renovate/Dependabot dla @org/design-tokens (z autolabelem i harmonogramem)
  - Metryki: PR pojawia się < 15 min po publikacji paczki
  - Walidacja: publikacja patch/minor/major → każdy scenariusz generuje PR
- [ ] Zadanie 3.2: CI na PR – install → build app → build storybook (statyczny)
  - Metryki: build Storybooka < 8 min; bez błędów; artefakt statyczny gotowy
  - Walidacja: logi CI; artefakt do pobrania
- [ ] Zadanie 3.3: Integracja Chromatic (lub hosting preview) – automatyczny run na PR
  - Metryki: run utworzony; różnice wizualne zmapowane do zmian tokenów; brak flaky
  - Walidacja: link do Chromatic z PR; przegląd diffów
- [ ] Zadanie 3.4: Reguły auto-merge PR (opcjonalnie): auto-approve jeśli tylko tokeny i testy OK
  - Metryki: PR merge bez ręcznej interwencji w “niski ryzyko” (patch/minor zgodnie z polityką)
  - Walidacja: kontrolny PR patch → auto-merge; major → wymaga review
- [ ] Zadanie 3.5: Po merge – automatyczny deploy/host Storybook na main
  - Metryki: deploy < 10 min; URL publiczny/chroniony dostępny
  - Walidacja: wejście na URL; wersja commit SHA i data last build widoczne

Definition of Done (blok): PR z bumpem wersji powstaje i przechodzi CI; Storybook preview dostępny; po merge main – Storybook zdeployowany

---

## Blok 4: IDE (VS Code) – dostęp do komponentów Figmy przez MCP i te same tokens
Cel namacalny: w VS Code można pobrać/obejrzeć komponent z Figmy i wygenerować szkielety kodu używające @org/design-tokens

- [ ] Zadanie 4.1: Skonfiguruj Dev Mode MCP server (oficjalny) w VS Code
  - Metryki: VS Code widzi serwer; polecenia MCP dostępne w palecie
  - Walidacja: testowe polecenie “list components” zwraca wyniki dla file_key
- [ ] Zadanie 4.2: Zdefiniuj naming alignment Variables ↔ CSS vars ↔ TS exports (1:1 lub mapowanie)
  - Metryki: 100% variables ma odpowiednik w paczce; brak konfliktów nazw
  - Walidacja: skrypt walidujący mapowanie przechodzi
- [ ] Zadanie 4.3: Narzędzie MCP “scaffold-component” (high-level, bez kodu): scenariusz operacyjny
  - Metryki: opis kroków (wejścia/wyjścia), format plików wynikowych, konwencje importów
  - Walidacja: suchy run (manualny): developer odtwarza kroki i tworzy “Button” + story z importami tokenów
- [ ] Zadanie 4.4: Narzędzie MCP “validate-component-tokens” (high-level): scenariusz walidacji
  - Metryki: raport niezgodności (brak tokenu, zły scope trybu) wykrywany na sample komponencie
  - Walidacja: wstaw złą nazwę tokenu → raport błędu
- [ ] Zadanie 4.5: Dokumentacja “How-to”: od linku do komponentu w Figmie do gotowego komponentu w repo
  - Metryki: instrukcja < 1 str.; nowy dev tworzy komponent w < 20 min
  - Walidacja: test z nową osobą w zespole – sukces w pierwszym podejściu

Definition of Done (blok): developer w VS Code potrafi pobrać info o komponencie i wygenerować szkielet używający @org/design-tokens; walidacja tokenów działa

---

## Blok 5: Obserwowalność i SLO przepływu
Cel namacalny: mamy wskaźniki czasu i niezawodności całego pipeline’u

- [ ] Zadanie 5.1: Zbierz metryki E2E (czas od Sync TS → release paczki → PR we frontend → Storybook preview)
  - Metryki: TTE (time-to-effect) < 30 min dla patch/minor
  - Walidacja: trzy przebiegi; średnia < 30 min; odchylenie standardowe akceptowalne
- [ ] Zadanie 5.2: Alerty przy awariach (failed publish, brak PR renovate, failed storybook build)
  - Metryki: alert w Slack w < 2 min od awarii; link do run/PR
  - Walidacja: symulacja failów → alerty przychodzą
- [ ] Zadanie 5.3: Miesięczny raport zmian tokenów i wersji paczki
  - Metryki: raport generuje listę wydań, zakres zmian, autorów
  - Walidacja: raport zawiera dane z ostatnich 30 dni; porównanie z changelogiem

Definition of Done (blok): dashboard/raport (nawet markdown) pokazuje czas i stabilność; alerty są włączone i przetestowane

---

## KPI całego programu (ciągłe monitorowanie)
- Czas od Sync w Tokens Studio do Storybook preview (P50/P90): target P50 ≤ 20 min, P90 ≤ 35 min
- Odsetek automatycznie scalanych PR bumpujących tokens w frontendzie: target ≥ 70% (patch/minor)
- Odsetek failów CI w buildzie tokenów: target ≤ 2%/miesiąc
- Flaky wizualne w Chromatic: target ≤ 1% runów

