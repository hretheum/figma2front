# Kanban — figma2front (2025-09-04)

- Cel: stabilny toolchain (Vite, Storybook), zielone checki (build + Chromatic), automatyzacja merge'ów i porządek w zależnościach.

## Todo
- Konfiguracja Renovate/Dependabot pod nowy toolchain (harmonogram, grupowanie bumpów)
- Weryfikacja e2e: uruchomić przykładowe stories i potwierdzić brak regresji UI (Chromatic baseline aktualny)
- Dokumentacja: krótkie How-to w docs/ (dodawanie komponentu + workflow Chromatic)
- Ustalić strategię dla CI na main: czy chcemy publikować Storybook także na main (Vercel/Netlify) jako stable URL

## In progress
- Monitorowanie CI na main po migracji SB9 + Vite7

## Done
- Włączone Allow auto-merge i delete branch on merge (repo settings)
- Włączone Allow update branch (repo settings)
- Skonfigurowany sekret CHROMATIC_PROJECT_TOKEN i naprawione checki Chromatic
- Porządki PR: zamknięte duplikaty/przestarzałe PR-y Dependabot (#3, #5, #6, #7)
- Zbiorczy PR aktualizacyjny (#16) — zmergowany
- Migracja Storybook 9 + Vite 7 (#17) — zmergowany
- Aktualizacja README statusu (#18) — zmergowany
