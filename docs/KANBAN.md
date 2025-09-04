# Kanban — figma2front (2025-09-04)

- Cel: stabilny toolchain (Vite, Storybook), zielone checki (build + Chromatic), automatyzacja merge'ów i porządek w zależnościach.

## Todo
- Konfiguracja Renovate/Dependabot pod nowy toolchain (harmonogram, grupowanie bumpów)
- Weryfikacja e2e: uruchomić przykładowe stories i potwierdzić brak regresji UI (Chromatic baseline aktualny)

## In progress
- Monitorowanie CI na main po migracji SB9 + Vite7
- Stabilizacja baseline Chromatic po integracji tokenów (obserwacja kolejnych buildów)

## Done
- Włączone Allow auto-merge i delete branch on merge (repo settings)
- Włączone Allow update branch (repo settings)
- Skonfigurowany sekret CHROMATIC_PROJECT_TOKEN i naprawione checki Chromatic
- Porządki PR: zamknięte duplikaty/przestarzałe PR-y Dependabot (#3, #5, #6, #7)
- Zbiorczy PR aktualizacyjny (#16) — zmergowany
- Migracja Storybook 9 + Vite 7 (#17) — zmergowany
- Aktualizacja README statusu (#18) — zmergowany
- Utworzone i opublikowane osobne repo tokenów: `hretheum/tokenz` (v0.0.1) + dodany sekret NPM_TOKEN
- Integracja paczki `@hretheum/tokenz` we frontendzie (figma2front) + dokument `docs/tokens-usage.md`
- Dodany przykładowy story `Design Tokens/Brand` w Storybooku (import z paczki tokenów)
- Włączony trigger Chromatic także na `push` do `main` (automatyczna publikacja po merge)
- Usunięty lokalny `tokens.json` z figma2front (źródło prawdy w repo tokenz)
- Zaktualizowane linki Chromatic w README do najnowszego builda
