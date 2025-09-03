# figma2front

Frontend repo consuming @org/design-tokens with auto-rebuild Storybook and MCP integration.

## Status projektu (2025-09-03)
- CI (GitHub Actions): zielony na PR i push na main
  - Build aplikacji i statyczny build Storybooka
  - Check wymagany: build
- Chromatic: zintegrowany przez chromaui/action@v1
  - Check wymagany: chromatic (UI Tests + Storybook Publish)
  - Uprawnienia w workflow ustawione (checks/pull-requests: write)
  - Pełna historia gita (fetch-depth: 0) dla prawidłowego baseline
- Ochrona gałęzi main (branch protection)
  - Wymagane status checks: build + chromatic
  - Enforce admins: włączone
- Secrets
  - CHROMATIC_PROJECT_TOKEN: ustawiony

Linki pomocnicze
- Ostatni Storybook Publish (z PR): patrz check "Storybook Publish" w zakładce Checks PR
- Panel Chromatic (builds): https://www.chromatic.com/build?appId=68b737f11f2af63c17dc19ff

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

## Licencja
TBD
