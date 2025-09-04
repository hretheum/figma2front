# figma2front

Frontend repo consuming @org/design-tokens with auto-rebuild Storybook and MCP integration.

## Status projektu (2025-09-04)
- Toolchain: Storybook 9.1.4 + Vite 7.1.4, Vitest 3.x, @testing-library/react 16.x
- CI (GitHub Actions): zielony na PR i push na main (po migracji SB9 + Vite7)
  - build: OK (app build + statyczny Storybook)
  - chromatic: OK (UI Tests + Storybook Publish)
- Chromatic: zintegrowany przez chromaui/action@v1
  - Uprawnienia w workflow ustawione (checks/pull-requests: write)
  - Pełna historia gita (fetch-depth: 0) dla baseline
- Ochrona gałęzi main (branch protection)
  - Wymagane status checks: build + chromatic
  - Enforce admins: włączone
- Secrets
  - CHROMATIC_PROJECT_TOKEN: ustawiony w repo (Actions secret)

Linki pomocnicze
- Chromatic (ostatni run w Actions): https://github.com/hretheum/figma2front/actions/runs/17469177835
- Chromatic (ostatni build – szczegóły): https://www.chromatic.com/build?appId=68b737f11f2af63c17dc19ff&number=18
- Chromatic (podgląd Storybooka – ostatni build): https://68b737f11f2af63c17dc19ff-uodghjpkcg.chromatic.com/
- Chromatic (bezpośrednie story Design Tokens/Brand): https://68b737f11f2af63c17dc19ff-uodghjpkcg.chromatic.com/iframe.html?id=design-tokens-brand--brand-color
- Panel Chromatic (wszystkie buildy): https://www.chromatic.com/build?appId=68b737f11f2af63c17dc19ff

## Jak uruchomić lokalnie
- Node 20
- Komendy:
  - npm ci
  - npm run lint
  - npm run type-check
  - npm run build
  - npm run storybook:build
  - npm run storybook (podgląd dev)

## Konwencja PR / CI
- Każdy PR musi przejść:
  - build
  - chromatic (wizualne testy + publikacja Storybook)
- PR bez zielonych checków nie może być zmergowany (wymusza branch protection)

## Kanban
- Zobacz aktualną tablicę: docs/KANBAN.md

## Następne sugerowane kroki
1) Auto-merge (opcjonalnie)
   - Włączyć w repo Settings → Pull Requests → Allow auto-merge
   - Reguła: auto-merge PR z samym bumpem tokenów po zielonych checkach
2) Bot do aktualizacji zależności
   - Włączyć Renovate/Dependabot (dla @org/design-tokens i reszty deps)
3) Stabilny link do Storybooka na main
   - Opcja A: wykorzystywać Chromatic (per-commit URL + projekt)
   - Opcja B: dodać deploy na Vercel/Netlify po merge do main
4) Integracja z repo „design-tokens” (Repo A)
   - Pipeline: export z Tokens Studio → build (Style Dictionary/alternatywa) → publish paczki → bump w tym repo
5) Dokumentacja
   - Dodać w docs/ krótkie How-to: dodawanie komponentu z użyciem tokens + aktualizacja snapshotów w Chromatic

## Troubleshooting Chromatic
- Brak checku Chromatic na PR:
  - upewnij się, że workflow uruchamia się na pull_request
  - w actions/checkout ustaw fetch-depth: 0
  - workflow ma permissions: checks: write i pull-requests: write
- Pierwsze uruchomienie
  - onlyChanged: false oraz exitZeroOnChanges: true w opcjach akcji pomagają wstępnie ustalić baseline

## Design tokens – użycie paczki
Szczegóły i przykłady: zobacz docs/tokens-usage.md.

## Licencja
TBD
